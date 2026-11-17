import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pool, { authPool } from './db.js';
import { hashPassword, verifyPassword, signToken, verifyToken, passwordProblem, STAFF_ROLES } from './auth.js';
import { DATASETS, ACCESS, GROUPS, scopedSql, canSee, ALL_DATASETS } from './access.js';
import { subscribe, unsubscribe, snapshot, notify } from './live.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

const ok = (res, data) => res.json({ ok: true, ...data });
const fail = (res, code, message) => res.status(code).json({ ok: false, error: message });

// Render a query for display only (the app always runs parameterised queries).
function showSql(sql, params = []) {
  let i = 0;
  return sql.replace(/\s+/g, ' ').trim().replace(/\?/g, () => {
    const v = params[i++];
    if (v === null || v === undefined) return 'NULL';
    if (typeof v === 'number') return String(v);
    return `'${String(v).replace(/'/g, "''")}'`;
  });
}
const sqlLog = (entries) => entries.filter(Boolean).map((e) => ({ label: e.label, sql: e.sql, rows: e.rows ?? null }));

// ---------------------------------------------------------------------------
// Authentication + authorization. The role and organization ALWAYS come from the
// stored account, never from anything the client sends.
// ---------------------------------------------------------------------------
async function loadUser(req) {
  const userId = verifyToken(req.headers['x-auth-token']);
  if (!userId) return null;
  const [[row]] = await authPool.query('SELECT * FROM users WHERE user_id = ?', [userId]);
  if (!row || row.status !== 'active') return null;
  return { userId: row.user_id, name: row.name, email: row.email, role: row.role, orgId: row.org_id ?? null, org: null };
}
async function attachUser(req, _res, next) {
  try { req.user = await loadUser(req); } catch { req.user = null; }
  next();
}
app.use(attachUser);
function requireAuth(roles) {
  return (req, res, next) => {
    if (!req.user) return fail(res, 401, 'Sign in to continue.');
    if (roles && !roles.includes(req.user.role)) return fail(res, 403, 'Your role is not allowed to do that.');
    next();
  };
}
async function orgNameFor(orgId) {
  if (!orgId) return 'Not listed / individual';
  const [[row]] = await pool.query('SELECT name FROM organizations WHERE org_id = ?', [orgId]);
  return row ? row.name : 'Not listed / individual';
}
async function publicUser(user) {
  return { name: user.name, email: user.email, role: user.role, org: await orgNameFor(user.orgId) };
}

// ---------------------------------------------------------------------------
// Meta: dataset catalogue, access map and live stats (scoped to the caller).
// ---------------------------------------------------------------------------
app.get('/api/meta', requireAuth(), async (req, res) => {
  try {
    const meta = {};
    for (const name of ALL_DATASETS) {
      if (!canSee(req.user.role, name)) continue;
      const d = DATASETS[name];
      const { sql, params } = scopedSql(name, req.user);
      const [[{ n }]] = await pool.query(`SELECT COUNT(*) AS n FROM (${sql}) t`, params);
      meta[name] = { title: d.title, desc: d.desc, columns: d.columns, count: n, pii: !!d.pii };
    }
    const batchScope = scopedSql('batches', req.user);
    const [statusRows] = await pool.query(
      `SELECT status, COUNT(*) AS n FROM (${batchScope.sql}) b GROUP BY status`, batchScope.params);
    const status = Object.fromEntries(statusRows.map((r) => [r.status, r.n]));
    const batchTotal = Object.values(status).reduce((a, b) => a + b, 0);
    const scanScope = scopedSql('verification_scans', req.user);
    const [[{ n: scanTotal }]] = await pool.query(`SELECT COUNT(*) AS n FROM (${scanScope.sql}) v`, scanScope.params);
    const recallScope = scopedSql('recalls', req.user);
    const [[{ n: recallTotal }]] = await pool.query(`SELECT COUNT(*) AS n FROM (${recallScope.sql}) r`, recallScope.params);
    ok(res, {
      database: process.env.DB_NAME || 'medicine_traceability',
      datasets: meta, access: ACCESS, groups: GROUPS, user: await publicUser(req.user),
      stats: { batches: batchTotal, genuine: status.genuine || 0, recalled: status.recalled || 0,
        suspected_fake: status.suspected_fake || 0, expired: status.expired || 0, scans: scanTotal, recalls: recallTotal },
    });
  } catch (e) { fail(res, 500, e.message); }
});

// ---------------------------------------------------------------------------
// Accounts. Public registration is CUSTOMER ONLY. Staff apply and a regulator
// approves; regulators are created only by an administrator.
// ---------------------------------------------------------------------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
async function orgMatchesRole(orgId, role) {
  if (role === 'customer') return orgId == null;
  if (orgId == null) return false;
  const [[row]] = await pool.query('SELECT org_type FROM organizations WHERE org_id = ?', [orgId]);
  return !!row && row.org_type === role;
}

app.post('/api/signup', async (req, res) => {
  try {
    const name = String(req.body?.name ?? '').trim();
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const role = String(req.body?.role ?? '');
    const password = String(req.body?.password ?? '');
    const confirm = String(req.body?.confirm ?? '');
    if (name.length < 2) return fail(res, 400, 'Enter your full name.');
    if (!EMAIL_RE.test(email)) return fail(res, 400, 'Enter a valid email address.');
    if (role !== 'customer')
      return fail(res, 403, 'Public sign-up is for customers only. Staff accounts are issued by a regulator or administrator.');
    const pwErr = passwordProblem(password);
    if (pwErr) return fail(res, 400, pwErr);
    if (password !== confirm) return fail(res, 400, 'The two passwords do not match.');
    const [[dupe]] = await authPool.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (dupe) return fail(res, 409, 'An account with that email already exists. Sign in instead.');
    const [[req2]] = await authPool.query('SELECT request_id FROM account_requests WHERE email = ?', [email]);
    if (req2) return fail(res, 409, 'An application with that email is already awaiting review.');
    const [result] = await authPool.query(
      'INSERT INTO users (name, email, role, org_id, password_hash) VALUES (?, ?, ?, NULL, ?)',
      [name, email, role, hashPassword(password)]);
    ok(res, { token: signToken(result.insertId), user: await publicUser({ name, email, role, orgId: null }) });
  } catch (e) { fail(res, 500, e.message); }
});

app.post('/api/account-requests', async (req, res) => {
  try {
    const name = String(req.body?.name ?? '').trim();
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const role = String(req.body?.role ?? '');
    const orgId = req.body?.org_id ? Number(req.body.org_id) : null;
    const password = String(req.body?.password ?? '');
    const confirm = String(req.body?.confirm ?? '');
    const note = String(req.body?.note ?? '').trim().slice(0, 250) || null;
    if (name.length < 2) return fail(res, 400, 'Enter your full name.');
    if (!EMAIL_RE.test(email)) return fail(res, 400, 'Enter a valid email address.');
    if (!STAFF_ROLES.includes(role))
      return fail(res, 400, 'Choose a valid role. Only manufacturer, distributor and pharmacy apply here.');
    if (!(await orgMatchesRole(orgId, role)))
      return fail(res, 400, 'Choose an organization that matches the role you selected.');
    const pwErr = passwordProblem(password);
    if (pwErr) return fail(res, 400, pwErr);
    if (password !== confirm) return fail(res, 400, 'The two passwords do not match.');
    const [[dupe]] = await authPool.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (dupe) return fail(res, 409, 'An account with that email already exists. Sign in instead.');
    const [[pending]] = await authPool.query('SELECT request_id FROM account_requests WHERE email = ?', [email]);
    if (pending) return fail(res, 409, 'An application with that email is already awaiting review.');
    await authPool.query(
      'INSERT INTO account_requests (name, email, role, org_id, password_hash, note) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, role, orgId, hashPassword(password), note]);
    notify('account_requests');
    ok(res, { pending: true, message: 'Application received. A regulator will review it.' });
  } catch (e) { fail(res, 500, e.message); }
});

app.get('/api/account-requests', requireAuth(['regulator', 'admin']), async (_req, res) => {
  try {
    const db = process.env.DB_NAME || 'medicine_traceability';
    const [rows] = await authPool.query(
      `SELECT r.request_id, r.name, r.email, r.role, r.org_id, o.name AS org, r.note, r.status, r.created_at, r.decided_at, r.decision_note
         FROM account_requests r
         LEFT JOIN \`${db}\`.organizations o ON o.org_id = r.org_id
        ORDER BY r.status = 'pending' DESC, r.created_at DESC`);
    ok(res, { requests: rows });
  } catch (e) { fail(res, 500, e.message); }
});

app.post('/api/account-requests/:id/decision', requireAuth(['regulator', 'admin']), async (req, res) => {
  const id = Number(req.params.id);
  const decision = String(req.body?.decision || '');
  const note = String(req.body?.note ?? '').trim().slice(0, 250) || null;
  if (!Number.isInteger(id)) return fail(res, 400, 'Invalid request id.');
  if (!['approve', 'reject'].includes(decision)) return fail(res, 400, 'Decision must be approve or reject.');
  try {
    const [[r]] = await authPool.query('SELECT * FROM account_requests WHERE request_id = ?', [id]);
    if (!r) return fail(res, 404, 'Application not found.');
    if (r.status !== 'pending') return fail(res, 409, 'That application has already been decided.');
    if (decision === 'approve') {
      const [[dupe]] = await authPool.query('SELECT user_id FROM users WHERE email = ?', [r.email]);
      if (dupe) return fail(res, 409, 'An account with that email already exists.');
      await authPool.query(
        'INSERT INTO users (name, email, role, org_id, password_hash) VALUES (?, ?, ?, ?, ?)',
        [r.name, r.email, r.role, r.org_id, r.password_hash]);
    }
    await authPool.query(
      'UPDATE account_requests SET status = ?, decided_at = NOW(), decided_by = ?, decision_note = ? WHERE request_id = ?',
      [decision === 'approve' ? 'approved' : 'rejected', req.user.userId, note, id]);
    notify('account_requests');
    ok(res, { message: decision === 'approve' ? 'Application approved and account created.' : 'Application rejected.' });
  } catch (e) { fail(res, 500, e.message); }
});

app.post('/api/login', async (req, res) => {
  try {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    if (!EMAIL_RE.test(email)) return fail(res, 400, 'Enter a valid email address.');
    if (!password) return fail(res, 400, 'Enter your password.');
    const [[row]] = await authPool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!row || !verifyPassword(password, row.password_hash)) return fail(res, 401, 'Email or password is incorrect.');
    if (row.status !== 'active') return fail(res, 403, 'This account is disabled. Contact a regulator.');
    await authPool.query('UPDATE users SET last_login_at = NOW() WHERE user_id = ?', [row.user_id]);
    ok(res, { token: signToken(row.user_id), user: await publicUser({ name: row.name, email: row.email, role: row.role, orgId: row.org_id ?? null }) });
  } catch (e) { fail(res, 500, e.message); }
});

app.get('/api/session', async (req, res) => {
  try {
    if (!req.user) return fail(res, 401, 'Not signed in.');
    ok(res, { user: await publicUser(req.user) });
  } catch (e) { fail(res, 500, e.message); }
});

app.post('/api/logout', (_req, res) => ok(res, {}));

// ---------------------------------------------------------------------------
// Generic dataset endpoint with server-side search, always scoped to the caller.
// ---------------------------------------------------------------------------
app.get('/api/datasets/:name', requireAuth(), async (req, res) => {
  const name = req.params.name;
  const d = DATASETS[name];
  if (!d) return fail(res, 404, 'Unknown dataset.');
  if (!canSee(req.user.role, name)) return fail(res, 403, 'Your role cannot open that dataset.');
  const q = String(req.query.q || '').trim();
  try {
    const scoped = scopedSql(name, req.user);
    let sql = scoped.sql;
    let params = scoped.params;
    if (q) {
      const concat = d.columns.map((c) => `COALESCE(t.\`${c.key}\`, '')`).join(", ' ', ");
      sql = `SELECT * FROM (${sql}) t WHERE CONCAT_WS(' ', ${concat}) LIKE ? ORDER BY 1`;
      params = [...params, `%${q}%`];
    }
    const [rows] = await pool.query(sql, params);
    ok(res, { title: d.title, desc: d.desc, columns: d.columns, rows: rows.map((r) => d.columns.map((c) => r[c.key])),
      pii: !!d.pii, sql: sqlLog([{ label: `SELECT from ${name}`, sql: showSql(sql, params), rows: rows.length }]) });
  } catch (e) { fail(res, 500, e.message); }
});

// ---------------------------------------------------------------------------
// PUBLIC verification. No account required, and it never reveals stock,
// shipments, sales or customer data — only what is printed on the pack.
// ---------------------------------------------------------------------------
const PUBLIC_LOOKUP_SQL = `SELECT b.batch_id, b.batch_code, b.expiry_date, b.mfg_date, b.status,
              m.name AS medicine, o.name AS manufacturer
       FROM batches b
       JOIN medicines m ON m.medicine_id = b.medicine_id
       JOIN organizations o ON o.org_id = b.manufacturer_id
       WHERE b.batch_code = ?`;

// Map a batch to the public-facing safety result. suspected_fake is shown as its
// own clear result rather than being folded into "recalled".
function publicResult(batch, today) {
  if (!batch) return 'unknown';
  if (batch.status === 'recalled') return 'recalled';
  if (batch.status === 'suspected_fake') return 'suspected_fake';
  if (batch.status === 'expired' || batch.expiry_date < today) return 'expired';
  return 'genuine';
}

// Public list of organizations, used by the staff-application form so an
// applicant can pick the organization that matches their role. Only the name and
// type are exposed — never licenses, addresses or contact details.
app.get('/api/public/organizations', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT org_id, name, org_type FROM organizations WHERE org_type IN ('manufacturer','distributor','pharmacy') ORDER BY org_type, name");
    ok(res, { organizations: rows });
  } catch (e) { fail(res, 500, e.message); }
});

app.post('/api/public/verify', async (req, res) => {
  const code = String(req.body?.code || '').trim().toUpperCase();
  if (!code) return fail(res, 400, 'Enter a batch code to check.');
  try {
    const [rows] = await pool.query(PUBLIC_LOOKUP_SQL, [code]);
    const today = new Date().toISOString().slice(0, 10);
    const result = publicResult(rows[0] || null, today);
    await pool.query('INSERT INTO verification_scans (batch_code_entered, batch_id, result) VALUES (?, ?, ?)',
      [code, rows[0]?.batch_id ?? null, result]);
    const pack = rows[0]
      ? { batch_code: rows[0].batch_code, medicine: rows[0].medicine, manufacturer: rows[0].manufacturer,
          mfg_date: rows[0].mfg_date, expiry_date: rows[0].expiry_date }
      : null;
    ok(res, { result, pack });
  } catch (e) { fail(res, 500, e.message); }
});

app.post('/api/verify', requireAuth(), async (req, res) => {
  const code = String(req.body?.code || '').trim().toUpperCase();
  if (!code) return fail(res, 400, 'Enter a batch code to check.');
  try {
    const [rows] = await pool.query(PUBLIC_LOOKUP_SQL, [code]);
    const today = new Date().toISOString().slice(0, 10);
    const result = publicResult(rows[0] || null, today);
    const insParams = [code, rows[0]?.batch_id ?? null, result];
    const insSql = 'INSERT INTO verification_scans (batch_code_entered, batch_id, result) VALUES (?, ?, ?)';
    const [ins] = await pool.query(insSql, insParams);
    ok(res, { result, batch: rows[0] || null,
      sql: sqlLog([
        { label: 'Look up the batch code', sql: showSql(PUBLIC_LOOKUP_SQL, [code]), rows: rows.length },
        { label: 'Record the scan', sql: showSql(insSql, insParams), rows: ins.affectedRows },
      ]) });
  } catch (e) { fail(res, 500, e.message); }
});

// ---------------------------------------------------------------------------
// Forward trace of a batch. Customer names/phones are REGULATOR-ONLY; a
// pharmacy sees only its own customers; manufacturers/distributors see none.
// ---------------------------------------------------------------------------
const BATCH_BY_ID_SQL = `SELECT b.batch_id, b.batch_code, b.status, b.expiry_date, m.name AS medicine,
              o.name AS manufacturer
       FROM batches b
       JOIN medicines m ON m.medicine_id = b.medicine_id
       JOIN organizations o ON o.org_id = b.manufacturer_id
       WHERE b.batch_id = ?`;

const BATCH_BY_CODE_SQL = `SELECT b.batch_id, b.batch_code, b.status, b.mfg_date, b.expiry_date,
              m.name AS medicine, o.name AS manufacturer
       FROM batches b
       JOIN medicines m ON m.medicine_id = b.medicine_id
       JOIN organizations o ON o.org_id = b.manufacturer_id
       WHERE b.batch_code = ?`;

async function canTraceBatch(user, batchId) {
  if (user.role === 'regulator' || user.role === 'admin') return true;
  const scoped = scopedSql('batches', user);
  const [[row]] = await pool.query(`SELECT 1 AS ok FROM (${scoped.sql}) t WHERE t.batch_id = ? LIMIT 1`, [...scoped.params, batchId]);
  return !!row;
}

app.get('/api/trace/:batchId', requireAuth(['regulator', 'admin', 'manufacturer', 'distributor', 'pharmacy']), async (req, res) => {
  const id = Number(req.params.batchId);
  if (!Number.isInteger(id)) return fail(res, 400, 'Invalid batch id.');
  try {
    if (!(await canTraceBatch(req.user, id))) return fail(res, 403, 'You can only trace batches your organization handled.');
    const [[batch]] = await pool.query(BATCH_BY_ID_SQL, [id]);
    if (!batch) return fail(res, 404, 'Batch not found.');
    const FLOW_SQL = 'SELECT * FROM v_batch_flow WHERE batch_id = ? ORDER BY shipment_id';
    const STOCK_SQL = `SELECT o.name AS organization, i.quantity_on_hand, i.last_updated
       FROM inventory i JOIN organizations o ON o.org_id = i.org_id
       WHERE i.batch_id = ? ORDER BY o.name`;
    const RECALL_SQL = `SELECT r.reason, r.severity, r.recall_date, r.status, o.name AS regulator
       FROM recalls r JOIN organizations o ON o.org_id = r.regulator_id
       WHERE r.batch_id = ? ORDER BY r.recall_date`;
    const [flow] = await pool.query(FLOW_SQL, [id]);
    const [stock] = await pool.query(STOCK_SQL, [id]);
    const [recalls] = await pool.query(RECALL_SQL, [id]);
    let customers = [];
    let customersRestricted = false;
    if (req.user.role === 'regulator' || req.user.role === 'admin') {
      const [rows] = await pool.query('SELECT * FROM v_batch_customers WHERE batch_id = ? ORDER BY sale_date', [id]);
      customers = rows;
    } else if (req.user.role === 'pharmacy') {
      const [rows] = await pool.query('SELECT * FROM v_batch_customers WHERE batch_id = ? AND pharmacy = ? ORDER BY sale_date',
        [id, await orgNameFor(req.user.orgId)]);
      customers = rows;
    } else {
      customersRestricted = true;
    }
    ok(res, { batch, flow, stock, recalls, customers, customersRestricted,
      sql: sqlLog([
        { label: 'Batch and its medicine', sql: showSql(BATCH_BY_ID_SQL, [id]), rows: 1 },
        { label: 'Shipment flow (view v_batch_flow)', sql: showSql(FLOW_SQL, [id]), rows: flow.length },
        { label: 'Stock held (inventory)', sql: showSql(STOCK_SQL, [id]), rows: stock.length },
        ...(customersRestricted ? [] : [{ label: 'Customers who bought it (view v_batch_customers)',
          sql: showSql('SELECT * FROM v_batch_customers WHERE batch_id = ? ORDER BY sale_date', [id]), rows: customers.length }]),
        { label: 'Recalls for this batch', sql: showSql(RECALL_SQL, [id]), rows: recalls.length },
      ]) });
  } catch (e) { fail(res, 500, e.message); }
});

// Customer-facing trace. A customer knows the printed batch code, not our
// internal ids, so this looks the batch up by code and returns only the journey
// and safety facts: where the batch travelled, who holds it and any recalls.
// No customer personal data is ever included.
app.post('/api/customer/trace', requireAuth(['customer']), async (req, res) => {
  const code = String(req.body?.code ?? '').trim().toUpperCase();
  if (!code) return fail(res, 400, 'Enter a batch code.');
  try {
    const [[batch]] = await pool.query(BATCH_BY_CODE_SQL, [code]);
    if (!batch) return ok(res, { found: false, code });
    const FLOW_SQL = 'SELECT from_org, to_org, quantity, shipped_at, received_at, shipment_status FROM v_batch_flow WHERE batch_id = ? ORDER BY shipment_id';
    const STOCK_SQL = `SELECT o.name AS organization, o.org_type, i.last_updated
       FROM inventory i JOIN organizations o ON o.org_id = i.org_id
       WHERE i.batch_id = ? ORDER BY o.name`;
    const RECALL_SQL = `SELECT r.reason, r.severity, r.recall_date, r.status, o.name AS regulator
       FROM recalls r JOIN organizations o ON o.org_id = r.regulator_id
       WHERE r.batch_id = ? ORDER BY r.recall_date`;
    const [flow] = await pool.query(FLOW_SQL, [batch.batch_id]);
    const [stock] = await pool.query(STOCK_SQL, [batch.batch_id]);
    const [recalls] = await pool.query(RECALL_SQL, [batch.batch_id]);
    ok(res, { found: true, batch: { batch_code: batch.batch_code, medicine: batch.medicine,
      manufacturer: batch.manufacturer, mfg_date: batch.mfg_date, expiry_date: batch.expiry_date, status: batch.status },
      flow, stock, recalls });
  } catch (e) { fail(res, 500, e.message); }
});

// ---------------------------------------------------------------------------
// Recalls. Only a regulator may issue or change one. The database triggers flip
// the batch status and write the audit log — the app never does that itself.
// ---------------------------------------------------------------------------
const REGULATOR_ROLES = ['regulator', 'admin'];

app.get('/api/recalls', requireAuth(['regulator', 'admin', 'manufacturer', 'distributor', 'pharmacy']), async (req, res) => {
  try {
    const scoped = scopedSql('recalls', req.user);
    const idsSql = scoped.sql.replace(/^SELECT[\s\S]*?FROM recalls r\b/i, 'SELECT r.recall_id FROM recalls r');
    const [rows] = await pool.query(
      `SELECT r.recall_id, r.batch_id, b.batch_code, m.name AS medicine, o.name AS regulator,
              r.reason, r.severity, r.recall_date, r.status, r.decision_note,
              (SELECT COUNT(*) FROM recall_acknowledgements a WHERE a.recall_id = r.recall_id) AS ack_count
         FROM recalls r
         JOIN batches b ON b.batch_id = r.batch_id
         JOIN medicines m ON m.medicine_id = b.medicine_id
         JOIN organizations o ON o.org_id = r.regulator_id
        WHERE r.recall_id IN (${idsSql})
        ORDER BY r.recall_date DESC, r.recall_id DESC`, scoped.params);
    ok(res, { recalls: rows });
  } catch (e) { fail(res, 500, e.message); }
});

app.get('/api/recalls/preview/:batchId', requireAuth(REGULATOR_ROLES), async (req, res) => {
  const id = Number(req.params.batchId);
  if (!Number.isInteger(id)) return fail(res, 400, 'Invalid batch id.');
  try {
    const [[batch]] = await pool.query(BATCH_BY_ID_SQL, [id]);
    if (!batch) return fail(res, 404, 'Batch not found.');
    const [stock] = await pool.query(
      `SELECT o.name AS organization, o.org_type, i.quantity_on_hand
         FROM inventory i JOIN organizations o ON o.org_id = i.org_id
        WHERE i.batch_id = ? ORDER BY i.quantity_on_hand DESC`, [id]);
    const [[cust]] = await pool.query('SELECT COUNT(DISTINCT customer_id) AS n FROM v_batch_customers WHERE batch_id = ?', [id]);
    const [[units]] = await pool.query('SELECT COALESCE(SUM(quantity), 0) AS n FROM v_batch_customers WHERE batch_id = ?', [id]);
    ok(res, { batch, stock, stockUnits: stock.reduce((a, s) => a + s.quantity_on_hand, 0),
      customersAffected: cust.n, unitsSold: units.n });
  } catch (e) { fail(res, 500, e.message); }
});

app.post('/api/recalls', requireAuth(REGULATOR_ROLES), async (req, res) => {
  const { batchId, reason } = req.body || {};
  const severity = req.body?.severity || 'high';
  if (!batchId) return fail(res, 400, 'Choose a batch to recall.');
  if (!reason || String(reason).trim().length < 3) return fail(res, 400, 'Give a reason for the recall.');
  if (!['low', 'medium', 'high', 'critical'].includes(severity)) return fail(res, 400, 'Choose a valid severity.');
  const regulatorId = req.user.orgId;
  if (!regulatorId) return fail(res, 400, 'Your account is not linked to a regulator organization.');
  const conn = await pool.getConnection();
  try {
    const [[batchRow]] = await conn.query('SELECT batch_id, status FROM batches WHERE batch_id = ?', [Number(batchId)]);
    if (!batchRow) return fail(res, 404, 'Batch not found.');
    if (batchRow.status === 'recalled') return fail(res, 409, 'That batch already has an active recall.');
    await conn.query('SET @medtrace_actor_org_id = ?', [regulatorId]);
    const recParams = [Number(batchId), regulatorId, String(reason).trim(), severity];
    const recSql = `INSERT INTO recalls (batch_id, regulator_id, reason, severity, recall_date, status)
       VALUES (?, ?, ?, ?, CURDATE(), 'active')`;
    const [rec] = await conn.query(recSql, recParams);
    const batchSql = 'SELECT batch_id, batch_code, status FROM batches WHERE batch_id = ?';
    const [[batch]] = await conn.query(batchSql, [Number(batchId)]);
    const auditSql = `SELECT log_id, old_status, new_status, changed_at, reason
       FROM audit_log WHERE batch_id = ? ORDER BY log_id DESC LIMIT 5`;
    const [audit] = await conn.query(auditSql, [Number(batchId)]);
    ok(res, { batch, audit, recall_id: rec.insertId,
      sql: sqlLog([
        { label: 'Insert the recall', sql: showSql(recSql, recParams), rows: rec.affectedRows },
        { label: 'Batch status after the trigger ran', sql: showSql(batchSql, [Number(batchId)]), rows: 1 },
        { label: 'Audit rows written by the trigger', sql: showSql(auditSql, [Number(batchId)]), rows: audit.length },
      ]), trigger: 'trg_recall_sets_status + trg_audit_batch_status' });
  } catch (e) { fail(res, 500, e.message); }
  finally { conn.release(); }
});

app.post('/api/recalls/:id/status', requireAuth(REGULATOR_ROLES), async (req, res) => {
  const id = Number(req.params.id);
  const status = String(req.body?.status || '');
  const note = String(req.body?.note ?? '').trim().slice(0, 250) || null;
  if (!Number.isInteger(id)) return fail(res, 400, 'Invalid recall id.');
  if (!['active', 'completed', 'withdrawn'].includes(status)) return fail(res, 400, 'Invalid recall status.');
  try {
    const [[r]] = await pool.query('SELECT * FROM recalls WHERE recall_id = ?', [id]);
    if (!r) return fail(res, 404, 'Recall not found.');
    if (r.status === status) return fail(res, 409, `That recall is already ${status}.`);
    const conn = await pool.getConnection();
    try {
      await conn.query('SET @medtrace_actor_org_id = ?', [req.user.orgId]);
      await conn.query('UPDATE recalls SET status = ?, decision_note = ? WHERE recall_id = ?', [status, note, id]);
      const [[batch]] = await conn.query('SELECT batch_id, batch_code, status FROM batches WHERE batch_id = ?', [r.batch_id]);
      const [audit] = await conn.query('SELECT log_id, old_status, new_status, changed_at, reason FROM audit_log WHERE batch_id = ? ORDER BY log_id DESC LIMIT 5', [r.batch_id]);
      ok(res, { batch, audit,
        sql: sqlLog([
          { label: 'Update the recall lifecycle', sql: showSql('UPDATE recalls SET status = ?, decision_note = ? WHERE recall_id = ?', [status, note, id]), rows: 1 },
          { label: 'Batch status after the trigger ran', sql: showSql('SELECT batch_id, batch_code, status FROM batches WHERE batch_id = ?', [r.batch_id]), rows: 1 },
          { label: 'Audit rows written by the trigger', sql: showSql('SELECT log_id, old_status, new_status, changed_at, reason FROM audit_log WHERE batch_id = ? ORDER BY log_id DESC LIMIT 5', [r.batch_id]), rows: audit.length },
        ]), trigger: 'trg_recall_lifecycle + trg_audit_batch_status' });
    } finally { conn.release(); }
  } catch (e) { fail(res, 500, e.message); }
});

app.post('/api/recalls/:id/acknowledge', requireAuth(['pharmacy', 'distributor']), async (req, res) => {
  const id = Number(req.params.id);
  const note = String(req.body?.note ?? '').trim().slice(0, 250) || null;
  if (!Number.isInteger(id)) return fail(res, 400, 'Invalid recall id.');
  try {
    const [[r]] = await pool.query('SELECT * FROM recalls WHERE recall_id = ?', [id]);
    if (!r) return fail(res, 404, 'Recall not found.');
    const orgId = req.user.orgId;
    const [[holds]] = await pool.query('SELECT quantity_on_hand FROM inventory WHERE org_id = ? AND batch_id = ?', [orgId, r.batch_id]);
    if (!holds) return fail(res, 403, 'Your organization does not hold stock of that batch.');
    await pool.query(
      `INSERT INTO recall_acknowledgements (recall_id, org_id, ack_by_user_id, note) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE acknowledged_at = NOW(), ack_by_user_id = VALUES(ack_by_user_id), note = VALUES(note)`,
      [id, orgId, req.user.userId, note]);
    ok(res, { message: 'Recall acknowledged. The regulator can see your organization has acted.' });
  } catch (e) { fail(res, 500, e.message); }
});

// ---------------------------------------------------------------------------
// Create actions, restricted by role. Manufacturers create medicines/batches,
// manufacturers and distributors create shipments, pharmacies create sales.
// ---------------------------------------------------------------------------
app.post('/api/medicines', requireAuth(['manufacturer']), async (req, res) => {
  const name = String(req.body?.name ?? '').trim();
  const composition = String(req.body?.composition ?? '').trim() || null;
  const dosageForm = String(req.body?.dosage_form ?? '').trim() || null;
  const strength = String(req.body?.strength ?? '').trim() || null;
  if (name.length < 2) return fail(res, 400, 'Enter the medicine name.');
  try {
    const params = [name, composition, dosageForm, strength, req.user.orgId];
    const sql = 'INSERT INTO medicines (name, composition, dosage_form, strength, manufacturer_id) VALUES (?, ?, ?, ?, ?)';
    const [r] = await pool.query(sql, params);
    ok(res, { medicine_id: r.insertId, sql: sqlLog([{ label: 'Insert the medicine', sql: showSql(sql, params), rows: r.affectedRows }]) });
  } catch (e) { fail(res, 500, e.message); }
});

app.post('/api/batches', requireAuth(['manufacturer']), async (req, res) => {
  const batchCode = String(req.body?.batch_code ?? '').trim().toUpperCase();
  const medicineId = Number(req.body?.medicine_id);
  const mfgDate = String(req.body?.mfg_date ?? '').trim();
  const expiryDate = String(req.body?.expiry_date ?? '').trim();
  const quantity = Number(req.body?.quantity);
  if (batchCode.length < 2) return fail(res, 400, 'Enter a batch code.');
  if (!Number.isInteger(medicineId)) return fail(res, 400, 'Choose a medicine.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(mfgDate) || !/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) return fail(res, 400, 'Enter valid dates (YYYY-MM-DD).');
  if (expiryDate <= mfgDate) return fail(res, 400, 'The expiry date must be after the manufacturing date.');
  if (!Number.isInteger(quantity) || quantity <= 0) return fail(res, 400, 'Enter a quantity greater than zero.');
  try {
    const [[med]] = await pool.query('SELECT manufacturer_id FROM medicines WHERE medicine_id = ?', [medicineId]);
    if (!med) return fail(res, 404, 'Medicine not found.');
    if (med.manufacturer_id !== req.user.orgId) return fail(res, 403, 'You can only add batches for your own medicines.');
    const params = [batchCode, medicineId, req.user.orgId, mfgDate, expiryDate, quantity];
    const sql = "INSERT INTO batches (batch_code, medicine_id, manufacturer_id, mfg_date, expiry_date, quantity, status) VALUES (?, ?, ?, ?, ?, ?, 'genuine')";
    const invSql = `INSERT INTO inventory (org_id, batch_id, quantity_on_hand) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity_on_hand = quantity_on_hand + VALUES(quantity_on_hand)`;
    const conn = await pool.getConnection();
    let batchId;
    try {
      await conn.beginTransaction();
      const [r] = await conn.query(sql, params);
      batchId = r.insertId;
      // A batch the manufacturer has just produced is stock they hold, so it can
      // be shipped right away. Without this the batch exists but has nowhere to go.
      await conn.query(invSql, [req.user.orgId, batchId, quantity]);
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally { conn.release(); }
    ok(res, { batch_id: batchId,
      sql: sqlLog([
        { label: 'Insert the batch', sql: showSql(sql, params), rows: 1 },
        { label: 'Add the produced stock to inventory', sql: showSql(invSql, [req.user.orgId, batchId, quantity]), rows: 1 },
      ]) });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return fail(res, 409, 'That batch code already exists.');
    fail(res, 500, e.message);
  }
});

// Destinations a sender may ship to: every organization except its own.
app.get('/api/shipping-destinations', requireAuth(['manufacturer', 'distributor']), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT org_id, name, org_type FROM organizations WHERE org_id <> ? ORDER BY org_type, name`,
      [req.user.orgId]);
    ok(res, { destinations: rows });
  } catch (e) { fail(res, 500, e.message); }
});

// Stock on hand for the signed-in organization only, with batch codes.
app.get('/api/my-stock', requireAuth(['manufacturer', 'distributor', 'pharmacy']), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.batch_id, b.batch_code, m.name AS medicine, i.quantity_on_hand
         FROM inventory i
         JOIN batches b ON b.batch_id = i.batch_id
         JOIN medicines m ON m.medicine_id = b.medicine_id
        WHERE i.org_id = ? ORDER BY b.batch_code`, [req.user.orgId]);
    ok(res, { stock: rows });
  } catch (e) { fail(res, 500, e.message); }
});

app.post('/api/shipments', requireAuth(['manufacturer', 'distributor']), async (req, res) => {
  const toOrgId = Number(req.body?.to_org_id);
  const batchId = Number(req.body?.batch_id);
  const quantity = Number(req.body?.quantity);
  if (!Number.isInteger(toOrgId) || !Number.isInteger(batchId)) return fail(res, 400, 'Choose a destination and a batch.');
  if (!Number.isInteger(quantity) || quantity <= 0) return fail(res, 400, 'Enter a quantity greater than zero.');
  const fromOrgId = req.user.orgId;
  if (toOrgId === fromOrgId) return fail(res, 400, 'You cannot ship to your own organization.');
  const conn = await pool.getConnection();
  try {
    const [[dest]] = await conn.query('SELECT org_id FROM organizations WHERE org_id = ?', [toOrgId]);
    if (!dest) return fail(res, 404, 'Destination organization not found.');
    const [[stock]] = await conn.query('SELECT quantity_on_hand FROM inventory WHERE org_id = ? AND batch_id = ?', [fromOrgId, batchId]);
    if (!stock || stock.quantity_on_hand < quantity) return fail(res, 400, 'Not enough stock on hand to ship that many units.');
    await conn.beginTransaction();
    const shipSql = `INSERT INTO shipments (from_org_id, to_org_id, shipped_at, status) VALUES (?, ?, NOW(), 'in_transit')`;
    const [ship] = await conn.query(shipSql, [fromOrgId, toOrgId]);
    const shipmentId = ship.insertId;
    const itemSql = 'INSERT INTO shipment_items (shipment_id, batch_id, quantity) VALUES (?, ?, ?)';
    await conn.query(itemSql, [shipmentId, batchId, quantity]);
    await conn.query('UPDATE inventory SET quantity_on_hand = quantity_on_hand - ? WHERE org_id = ? AND batch_id = ?', [quantity, fromOrgId, batchId]);
    await conn.query(
      `INSERT INTO inventory (org_id, batch_id, quantity_on_hand) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity_on_hand = quantity_on_hand + VALUES(quantity_on_hand)`,
      [toOrgId, batchId, quantity]);
    await conn.commit();
    ok(res, { shipment_id: shipmentId,
      sql: sqlLog([
        { label: 'Create the shipment', sql: showSql(shipSql, [fromOrgId, toOrgId]), rows: 1 },
        { label: 'Add the batch to it', sql: showSql(itemSql, [shipmentId, batchId, quantity]), rows: 1 },
        { label: 'Reduce stock at the sender', sql: showSql('UPDATE inventory SET quantity_on_hand = quantity_on_hand - ? WHERE org_id = ? AND batch_id = ?', [quantity, fromOrgId, batchId]), rows: 1 },
        { label: 'Add stock at the receiver', sql: showSql('INSERT INTO inventory (org_id, batch_id, quantity_on_hand) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity_on_hand = quantity_on_hand + VALUES(quantity_on_hand)', [toOrgId, batchId, quantity]), rows: 1 },
      ]) });
  } catch (e) {
    await conn.rollback();
    fail(res, 500, e.message);
  } finally { conn.release(); }
});

app.post('/api/sales', requireAuth(['pharmacy']), async (req, res) => {
  const customerId = Number(req.body?.customer_id);
  const customerName = String(req.body?.customer_name ?? '').trim();
  const customerEmail = String(req.body?.customer_email ?? '').trim().toLowerCase() || null;
  const customerPhone = String(req.body?.customer_phone ?? '').trim() || null;
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (!Number.isInteger(customerId) && customerName.length < 2) return fail(res, 400, 'Choose a customer, or enter the customer name.');
  if (customerEmail && !EMAIL_RE.test(customerEmail)) return fail(res, 400, 'Enter a valid customer email address.');
  if (customerPhone && !/^[0-9+\-\s()]{6,20}$/.test(customerPhone)) return fail(res, 400, 'Enter a valid customer phone number.');
  if (!items.length) return fail(res, 400, 'Add at least one batch to the sale.');
  const conn = await pool.getConnection();
  try {
    const pharmacyId = req.user.orgId;
    await conn.query('SET @medtrace_actor_org_id = ?', [pharmacyId]);
    await conn.beginTransaction();
    // Either an existing customer was chosen, or a new one is recorded from the
    // name (and optional email/phone) the pharmacy typed in. An email already on
    // file is reused rather than duplicated.
    let resolvedCustomerId = Number.isInteger(customerId) ? customerId : null;
    const logs = [];
    if (!resolvedCustomerId) {
      let existing = null;
      if (customerEmail) {
        const [[row]] = await conn.query('SELECT customer_id FROM customers WHERE email = ?', [customerEmail]);
        existing = row;
      }
      if (existing) {
        resolvedCustomerId = existing.customer_id;
        await conn.query('UPDATE customers SET name = ?, phone = COALESCE(?, phone) WHERE customer_id = ?',
          [customerName, customerPhone, resolvedCustomerId]);
      } else {
        const custSql = 'INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)';
        const [c] = await conn.query(custSql, [customerName, customerPhone, customerEmail]);
        resolvedCustomerId = c.insertId;
        logs.push({ label: 'Record the new customer', sql: showSql(custSql, [customerName, customerPhone, customerEmail]), rows: 1 });
      }
    }
    let total = 0;
    const lines = [];
    for (const it of items) {
      const batchId = Number(it.batch_id);
      const qty = Number(it.quantity);
      const price = Number(it.unit_price ?? 0);
      if (!Number.isInteger(batchId) || !Number.isInteger(qty) || qty <= 0) { await conn.rollback(); return fail(res, 400, 'Each line needs a batch and a positive quantity.'); }
      const [[b]] = await conn.query('SELECT batch_id FROM batches WHERE batch_id = ?', [batchId]);
      if (!b) { await conn.rollback(); return fail(res, 404, `Batch ${batchId} not found.`); }
      lines.push({ batchId, qty, price });
      total += qty * price;
    }
    const saleSql = 'INSERT INTO sales (pharmacy_id, customer_id, sale_date, total_amount) VALUES (?, ?, CURDATE(), ?)';
    const [sale] = await conn.query(saleSql, [pharmacyId, resolvedCustomerId, total.toFixed(2)]);
    const saleId = sale.insertId;
    const itemSql = 'INSERT INTO sale_items (sale_id, batch_id, quantity, unit_price) VALUES (?, ?, ?, ?)';
    logs.push({ label: 'Create the sale', sql: showSql(saleSql, [pharmacyId, resolvedCustomerId, total.toFixed(2)]), rows: 1 });
    for (const l of lines) {
      await conn.query(itemSql, [saleId, l.batchId, l.qty, l.price]);
      await conn.query('UPDATE inventory SET quantity_on_hand = quantity_on_hand - ? WHERE org_id = ? AND batch_id = ?', [l.qty, pharmacyId, l.batchId]);
      logs.push({ label: 'Add a line (the trigger inspects the batch here)', sql: showSql(itemSql, [saleId, l.batchId, l.qty, l.price]), rows: 1 });
      logs.push({ label: 'Reduce pharmacy stock', sql: showSql('UPDATE inventory SET quantity_on_hand = quantity_on_hand - ? WHERE org_id = ? AND batch_id = ?', [l.qty, pharmacyId, l.batchId]), rows: 1 });
    }
    await conn.commit();
    ok(res, { sale_id: saleId, total: Number(total.toFixed(2)), sql: sqlLog(logs), trigger: 'trg_block_bad_sale' });
  } catch (e) {
    await conn.rollback();
    if (e.sqlState === '45000') {
      return ok(res, { blocked: true, message: e.sqlMessage, trigger: 'trg_block_bad_sale',
        error: { sqlState: e.sqlState, code: e.code, message: e.sqlMessage } });
    }
    fail(res, 500, e.message);
  } finally { conn.release(); }
});

// Demo/QA only: prove the sale-blocking rule without persisting a sale.
app.post('/api/demo/sales-attempt', requireAuth(REGULATOR_ROLES), async (req, res) => {
  const batchId = Number(req.body?.batchId);
  const quantity = Number(req.body?.quantity || 1);
  if (!batchId) return fail(res, 400, 'Choose a batch.');
  const conn = await pool.getConnection();
  let saleSql = null, itemSql = null, itemParams = null;
  try {
    const [[ph]] = await conn.query("SELECT org_id FROM organizations WHERE org_type = 'pharmacy' ORDER BY org_id LIMIT 1");
    const [[cu]] = await conn.query('SELECT customer_id FROM customers ORDER BY customer_id LIMIT 1');
    if (!ph || !cu) return fail(res, 400, 'No pharmacy or customer rows exist to run the demo.');
    saleSql = `INSERT INTO sales (pharmacy_id, customer_id, sale_date, total_amount) VALUES (${ph.org_id}, ${cu.customer_id}, CURDATE(), 0)`;
    itemSql = 'INSERT INTO sale_items (sale_id, batch_id, quantity, unit_price) VALUES (?, ?, ?, 30)';
    await conn.query('SET @medtrace_actor_org_id = ?', [ph.org_id]);
    await conn.beginTransaction();
    await conn.query(saleSql);
    const [sale] = await conn.query('SELECT LAST_INSERT_ID() AS id');
    itemParams = [sale[0].id, batchId, quantity];
    await conn.query(itemSql, itemParams);
    await conn.rollback();
    ok(res, { blocked: false, message: 'Sale allowed: this batch is safe to sell.',
      sql: sqlLog([
        { label: 'Create the sale row', sql: showSql(saleSql), rows: 1 },
        { label: 'Add the line item (the trigger inspects the batch here)', sql: showSql(itemSql, itemParams), rows: 1 },
      ]), trigger: 'trg_block_bad_sale', rolledBack: true });
  } catch (e) {
    await conn.rollback();
    if (e.sqlState === '45000') {
      return ok(res, { blocked: true, message: e.sqlMessage,
        sql: sqlLog([
          { label: 'Create the sale row', sql: showSql(saleSql), rows: 1 },
          { label: 'Add the line item (rejected by the trigger)', sql: showSql(itemSql, itemParams), rows: 0 },
        ]), trigger: 'trg_block_bad_sale', error: { sqlState: e.sqlState, code: e.code, message: e.sqlMessage }, rolledBack: true });
    }
    fail(res, 500, e.message);
  } finally { conn.release(); }
});

// ---------------------------------------------------------------------------
// Dashboard. The shape of the data depends on the role, and every query is
// scoped to what that role may see.
// ---------------------------------------------------------------------------
app.get('/api/dashboard', requireAuth(), async (req, res) => {
  const role = req.user.role;
  const u = req.user;
  try {
    const batchScope = scopedSql('batches', u);
    const [batchesByStatus] = await pool.query(
      `SELECT status, COUNT(*) AS n, SUM(quantity) AS units FROM (${batchScope.sql}) b GROUP BY status ORDER BY n DESC`, batchScope.params);
    const invScope = scopedSql('inventory', u);
    const [inventoryByOrg] = await pool.query(
      `SELECT t.organization AS org, SUM(t.quantity_on_hand) AS units
         FROM (${invScope.sql}) t
        GROUP BY t.organization ORDER BY units DESC`, invScope.params);
    const scanScope = scopedSql('verification_scans', u);
    const [scansByResult] = await pool.query(
      `SELECT result, COUNT(*) AS n FROM (${scanScope.sql}) v GROUP BY result ORDER BY n DESC`, scanScope.params);
    const shipScope = scopedSql('shipments', u);
    const [shipmentsByStatus] = await pool.query(
      `SELECT status, COUNT(*) AS n FROM (${shipScope.sql}) s GROUP BY status ORDER BY n DESC`, shipScope.params);
    const [recentScans] = await pool.query(
      `SELECT batch_code_entered, result, scanned_at FROM (${scanScope.sql}) v ORDER BY scanned_at DESC LIMIT 6`, scanScope.params);
    let recentActivity = [];
    if (canSee(role, 'audit_log')) {
      const aScope = scopedSql('audit_log', u);
      [recentActivity] = await pool.query(
        `SELECT a.log_id, a.batch_code, a.old_status, a.new_status, a.changed_by, a.changed_at, a.reason
           FROM (${aScope.sql}) a
          ORDER BY a.changed_at DESC, a.log_id DESC LIMIT 8`, aScope.params);
    }
    let salesByPharmacy = [], salesByMonth = [], totalSales = 0, revenue = 0;
    if (canSee(role, 'sales')) {
      const sScope = scopedSql('sales', u);
      [salesByPharmacy] = await pool.query(
        `SELECT s.pharmacy, COUNT(s.sale_id) AS bills, SUM(s.total_amount) AS revenue
           FROM (${sScope.sql}) s
          GROUP BY s.pharmacy ORDER BY revenue DESC`, sScope.params);
      [salesByMonth] = await pool.query(
        `SELECT DATE_FORMAT(sale_date, '%Y-%m') AS ym, COUNT(*) AS n, SUM(total_amount) AS revenue
           FROM (${sScope.sql}) s GROUP BY ym ORDER BY ym`, sScope.params);
      const [[t]] = await pool.query(`SELECT COUNT(*) AS n, COALESCE(SUM(total_amount),0) AS revenue FROM (${sScope.sql}) s`, sScope.params);
      totalSales = t.n; revenue = Number(t.revenue);
    }
    const recallScope = scopedSql('recalls', u);
    const [recallsByStatus] = await pool.query(
      `SELECT status, COUNT(*) AS n FROM (${recallScope.sql}) r GROUP BY status ORDER BY n DESC`, recallScope.params);
    ok(res, { role, batchesByStatus, inventoryByOrg, scansByResult, shipmentsByStatus, salesByPharmacy,
      recentActivity, recentScans, salesByMonth, recallsByStatus, totals: { sales: totalSales, revenue } });
  } catch (e) { fail(res, 500, e.message); }
});

// ---------------------------------------------------------------------------
// Global search, restricted to the datasets this role may open (and scoped).
// ---------------------------------------------------------------------------
app.get('/api/search', requireAuth(), async (req, res) => {
  const q = String(req.query.q || '').trim();
  const allowed = (ACCESS[req.user.role] || []).filter((n) => canSee(req.user.role, n));
  if (q.length < 2) return ok(res, { q, hits: [] });
  // Role and organization-type enums are stored lowercase; show them as labels.
  const ROLE_LABEL = { admin: 'System administrator', regulator: 'Regulator', manufacturer: 'Manufacturer', distributor: 'Distributor', pharmacy: 'Pharmacy', customer: 'Customer' };
  try {
    const hits = [];
    for (const name of allowed) {
      const d = DATASETS[name];
      const scoped = scopedSql(name, req.user);
      // Search and label the human-readable columns only. Id columns would match
      // every row on a numeric query and read as noise in the result list.
      const shown = d.columns.filter((c) => c.kind !== 'id');
      const concat = shown.map((c) => `COALESCE(t.\`${c.key}\`, '')`).join(", ' ', ");
      const sql = `SELECT * FROM (${scoped.sql}) t WHERE CONCAT_WS(' ', ${concat}) LIKE ? ORDER BY 1 LIMIT 5`;
      const [rows] = await pool.query(sql, [...scoped.params, `%${q}%`]);
      for (const r of rows) {
        hits.push({ dataset: name, title: d.title,
          label: shown.map((c) => ROLE_LABEL[r[c.key]] || r[c.key]).filter((v) => v !== null && v !== '').slice(0, 3).join(' · '),
          row: d.columns.map((c) => r[c.key]) });
      }
      if (hits.length >= 25) break;
    }
    ok(res, { q, hits: hits.slice(0, 25) });
  } catch (e) { fail(res, 500, e.message); }
});

// ---------------------------------------------------------------------------
// Schema: real DDL read back from MySQL. Regulator/admin only.
// ---------------------------------------------------------------------------
const TABLE_NOTES = {
  organizations: 'Everyone who handles medicine: manufacturers, distributors, pharmacies and regulators.',
  medicines: 'The product catalogue: name, composition, dosage form and strength.',
  batches: 'The heart of the system. One production run per row, with the printed batch code and status.',
  shipments: 'One organization sending stock to another.',
  shipment_items: 'Junction table: which batches travel in each shipment (many-to-many).',
  inventory: 'Junction table: how much of each batch an organization holds right now.',
  customers: 'People who buy medicine from a pharmacy.',
  sales: 'One bill per sale, made by a pharmacy to a customer.',
  sale_items: 'Junction table: the lines on a bill — which batches, how many, at what price.',
  recalls: 'Problems a regulator found in a batch, with severity and date.',
  verification_scans: 'Every time someone types a batch code to check it.',
  audit_log: 'A row for each batch status change — who, when and why.',
};
const RELATIONS = {
  organizations: 'medicines.manufacturer_id, batches.manufacturer_id, shipments.from_org_id / to_org_id, inventory.org_id, sales.pharmacy_id, recalls.regulator_id, audit_log.changed_by_org_id',
  medicines: 'batches.medicine_id',
  batches: 'shipment_items.batch_id, inventory.batch_id, sale_items.batch_id, verification_scans.batch_id, recalls.batch_id, audit_log.batch_id',
  shipments: 'shipment_items.shipment_id',
  shipment_items: 'shipment_id to shipments, batch_id to batches (composite PK)',
  inventory: 'org_id to organizations, batch_id to batches (composite PK)',
  customers: 'sales.customer_id, verification_scans.customer_id',
  sales: 'sale_items.sale_id',
  sale_items: 'sale_id to sales, batch_id to batches (composite PK)',
  recalls: 'batch_id to batches, regulator_id to organizations',
  verification_scans: 'batch_id to batches (nullable), customer_id to customers (nullable)',
  audit_log: 'batch_id to batches, changed_by_org_id to organizations',
};

app.get('/api/schema', requireAuth(['regulator', 'admin']), async (_req, res) => {
  const db = process.env.DB_NAME || 'medicine_traceability';
  try {
    const [cols] = await pool.query(
      `SELECT TABLE_NAME AS tbl, COLUMN_NAME AS col, COLUMN_TYPE AS type, IS_NULLABLE AS nullable,
              COLUMN_KEY AS ckey, COLUMN_DEFAULT AS dflt, EXTRA AS extra, ORDINAL_POSITION AS pos
         FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME, ORDINAL_POSITION`, [db]);
    const [keyRows] = await pool.query(
      `SELECT TABLE_NAME AS tbl, CONSTRAINT_NAME AS name, COLUMN_NAME AS col,
              REFERENCED_TABLE_NAME AS ref_tbl, REFERENCED_COLUMN_NAME AS ref_col
         FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL ORDER BY TABLE_NAME, CONSTRAINT_NAME`, [db]);
    const [indexRows] = await pool.query(
      `SELECT TABLE_NAME AS tbl, INDEX_NAME AS name, COLUMN_NAME AS col, NON_UNIQUE AS non_unique
         FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX`, [db]);
    const order = Object.keys(TABLE_NOTES);
    const byTable = {};
    for (const r of cols) { if (!order.includes(r.tbl)) continue; (byTable[r.tbl] ||= []).push(r); }
    const fksByTable = {};
    for (const r of keyRows) (fksByTable[r.tbl] ||= []).push(r);
    const idxByTable = {};
    for (const r of indexRows) (idxByTable[r.tbl] ||= []).push(r);
    const tables = order.map((t) => {
      const cs = byTable[t] || [];
      const colsOut = cs.map((c) => ({
        name: c.col, type: c.type, nullable: c.nullable === 'YES', key: c.ckey, default: c.dflt, extra: c.extra,
        isPk: c.ckey === 'PRI', isFk: (fksByTable[t] || []).some((f) => f.col === c.col), isUq: c.ckey === 'UNI' }));
      const fks = [...new Map((fksByTable[t] || []).map((f) => [f.name, f])).values()].map((f) => ({
        name: f.name, col: f.col, refTable: f.ref_tbl, refCol: f.ref_col }));
      return { name: t, note: TABLE_NOTES[t], relations: RELATIONS[t], columns: colsOut,
        primaryKey: cs.filter((c) => c.ckey === 'PRI').map((c) => c.col),
        uniqueKeys: cs.filter((c) => c.ckey === 'UNI').map((c) => c.col),
        foreignKeys: fks, indexes: [...new Set((idxByTable[t] || []).map((i) => i.name))] };
    });
    const ddl = {};
    for (const t of order) { const [r] = await pool.query(`SHOW CREATE TABLE \`${t}\``); ddl[t] = r[0]['Create Table']; }
    const [viewRows] = await pool.query(
      `SELECT TABLE_NAME AS name FROM information_schema.VIEWS WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME`, [db]);
    const views = [];
    for (const v of viewRows) { const [r] = await pool.query(`SHOW CREATE VIEW \`${v.name}\``); views.push({ name: v.name, ddl: r[0]['Create View'] }); }
    const [trigRows] = await pool.query(
      `SELECT TRIGGER_NAME AS name, EVENT_MANIPULATION AS event, EVENT_OBJECT_TABLE AS tbl, ACTION_TIMING AS timing
         FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = ? ORDER BY TRIGGER_NAME`, [db]);
    const triggers = [];
    for (const tr of trigRows) {
      const [r] = await pool.query(`SHOW CREATE TRIGGER \`${tr.name}\``);
      triggers.push({ name: tr.name, event: tr.event, table: tr.tbl, timing: tr.timing, ddl: r[0]['SQL Original Statement'] });
    }
    ok(res, { database: db, tables, views, triggers, ddl });
  } catch (e) { fail(res, 500, e.message); }
});

// ---------------------------------------------------------------------------
// SQL report library. Regulator/admin only — the reports read across the whole
// database, which would defeat the per-organization isolation for staff.
// ---------------------------------------------------------------------------
const QUERIES = [
  { id: 'joins_full_trace', title: 'Full trace: batch to shipment to organizations', concept: 'INNER JOIN across 5 tables',
    note: 'Follows one batch through every shipment it travelled in, showing who sent it and who received it.',
    sql: `SELECT b.batch_code, m.name AS medicine, s.shipment_id, o1.name AS from_org, o2.name AS to_org, si.quantity, s.status AS shipment_status
  FROM batches b JOIN medicines m ON m.medicine_id = b.medicine_id
  JOIN shipment_items si ON si.batch_id = b.batch_id JOIN shipments s ON s.shipment_id = si.shipment_id
  JOIN organizations o1 ON o1.org_id = s.from_org_id JOIN organizations o2 ON o2.org_id = s.to_org_id
 ORDER BY b.batch_code, s.shipment_id` },
  { id: 'group_by_org', title: 'Shipments per organization', concept: 'GROUP BY with COUNT',
    note: 'Counts how many shipments each organization sent (from) and received (to).',
    sql: `SELECT o.name AS organization, o.org_type, COUNT(DISTINCT s_out.shipment_id) AS sent, COUNT(DISTINCT s_in.shipment_id) AS received
  FROM organizations o LEFT JOIN shipments s_out ON s_out.from_org_id = o.org_id LEFT JOIN shipments s_in ON s_in.to_org_id = o.org_id
 GROUP BY o.org_id, o.name, o.org_type ORDER BY sent DESC, received DESC` },
  { id: 'having_blocked', title: 'Batches that cannot be sold', concept: 'WHERE + ORDER BY on an ENUM status',
    note: 'Lists every batch a pharmacy must pull from the shelf because it is recalled, fake or expired.',
    sql: `SELECT b.batch_code, m.name AS medicine, b.status, b.expiry_date,
       CASE WHEN b.status='recalled' THEN 'Recall in force' WHEN b.status='suspected_fake' THEN 'Under investigation'
            WHEN b.expiry_date < CURDATE() THEN 'Past expiry date' ELSE 'Safe to sell' END AS reason
  FROM batches b JOIN medicines m ON m.medicine_id = b.medicine_id
 WHERE b.status <> 'genuine' OR b.expiry_date < CURDATE() ORDER BY b.status` },
  { id: 'subquery_top_customers', title: 'Customers ranked by units bought', concept: 'JOIN + GROUP BY + HAVING + SUM',
    note: 'Shows which customers bought the most medicine, counting only customers above 2 units.',
    sql: `SELECT c.name AS customer, c.phone, COUNT(si.sale_id) AS line_items, SUM(si.quantity) AS units, SUM(si.quantity * si.unit_price) AS spend
  FROM customers c JOIN sales s ON s.customer_id = c.customer_id JOIN sale_items si ON si.sale_id = s.sale_id
 GROUP BY c.customer_id, c.name, c.phone HAVING units > 2 ORDER BY units DESC` },
  { id: 'view_batch_flow', title: 'Forward trace using the view', concept: 'SELECT from a VIEW (v_batch_flow)',
    note: 'The same trace as the first query, but reading the saved view the Trace page uses.',
    sql: `SELECT batch_code, medicine, shipment_id, from_org, to_org, quantity, shipment_status FROM v_batch_flow ORDER BY batch_code, shipment_id` },
  { id: 'view_batch_customers', title: 'Who received a batch', concept: 'SELECT from a VIEW (v_batch_customers)',
    note: 'For each batch, the customers who bought it — the list a recall would notify.',
    sql: `SELECT batch_code, customer, phone, quantity, unit_price, sale_date, pharmacy FROM v_batch_customers ORDER BY batch_code, sale_date` },
  { id: 'inventory_low', title: 'Stock held per organization', concept: 'Multi-table JOIN + SUM',
    note: 'Total stock on hand for every organization and batch, useful for spotting low inventory.',
    sql: `SELECT o.name AS organization, m.name AS medicine, b.batch_code, i.quantity_on_hand, i.last_updated
  FROM inventory i JOIN organizations o ON o.org_id = i.org_id JOIN batches b ON b.batch_id = i.batch_id JOIN medicines m ON m.medicine_id = b.medicine_id
 ORDER BY i.quantity_on_hand ASC` },
  { id: 'audit_trail', title: 'Audit trail of status changes', concept: 'JOIN + ORDER BY on the log table',
    note: 'Every status change of a batch, written automatically by the audit trigger.',
    sql: `SELECT a.log_id, b.batch_code, a.old_status, a.new_status, o.name AS changed_by, a.changed_at, a.reason
  FROM audit_log a JOIN batches b ON b.batch_id = a.batch_id LEFT JOIN organizations o ON o.org_id = a.changed_by_org_id
 ORDER BY a.changed_at DESC` },
  { id: 'scan_summary', title: 'Verification scans by result', concept: 'GROUP BY on an ENUM with COUNT',
    note: 'How many batch-code checks ended genuine, recalled, expired, suspected counterfeit or unknown.',
    sql: `SELECT result, COUNT(*) AS scans FROM verification_scans GROUP BY result ORDER BY scans DESC` },
];

app.get('/api/queries', requireAuth(REGULATOR_ROLES), (_req, res) => {
  ok(res, { queries: QUERIES.map(({ id, title, concept, note }) => ({ id, title, concept, note })) });
});

app.get('/api/queries/:id', requireAuth(REGULATOR_ROLES), async (req, res) => {
  const qy = QUERIES.find((q) => q.id === req.params.id);
  if (!qy) return fail(res, 404, 'Unknown query.');
  try {
    const [rows] = await pool.query(qy.sql);
    const columns = rows.length ? Object.keys(rows[0]) : [];
    const data = rows.map((r) => columns.map((c) => (r[c] instanceof Date ? r[c].toISOString() : r[c])));
    ok(res, { id: qy.id, title: qy.title, concept: qy.concept, note: qy.note, sql: qy.sql, columns, rows: data });
  } catch (e) { fail(res, 500, e.message); }
});

// ---------------------------------------------------------------------------
// Live database watch (unchanged): reflect changes made to MySQL by anyone.
// ---------------------------------------------------------------------------
app.get('/api/changes/status', async (_req, res) => {
  try { const s = await snapshot(); ok(res, { at: s.at, tables: s.tables }); }
  catch (e) { fail(res, 500, e.message); }
});

app.get('/api/changes/stream', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
  res.write(': connected\n\n');
  subscribe(res);
  const beat = setInterval(() => { try { res.write(': ping\n\n'); } catch {} }, 20000);
  if (beat.unref) beat.unref();
  req.on('close', () => { clearInterval(beat); unsubscribe(res); });
});

// ---------------------------------------------------------------------------
// Static frontend
// ---------------------------------------------------------------------------
const publicDir = join(__dirname, '..', 'public');
app.use(express.static(publicDir));
app.get('*', (_req, res) => res.sendFile(join(publicDir, 'index.html')));

const PORT = Number(process.env.PORT || 12000);
app.listen(PORT, () => console.log(`MedTrace running on http://localhost:${PORT}`));
