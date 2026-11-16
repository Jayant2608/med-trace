import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pool, { authPool } from './db.js';
import { hashPassword, verifyPassword, signToken, verifyToken, passwordProblem } from './auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

// ---------------------------------------------------------------------------
// Dataset definitions. Each one is a real SQL query against the MySQL schema.
// ---------------------------------------------------------------------------
const DATASETS = {
  organizations: {
    title: 'Organizations',
    desc: 'Everyone who handles medicine: manufacturers, distributors, pharmacies and regulators.',
    sql: `SELECT o.org_id, o.name, o.org_type, o.license_no, o.address, o.city, o.country
          FROM organizations o ORDER BY o.org_id`,
    columns: [
      { key: 'org_id', label: 'Org ID', kind: 'id' },
      { key: 'name', label: 'Name' },
      { key: 'org_type', label: 'Type', kind: 'badge' },
      { key: 'license_no', label: 'License No', kind: 'code' },
      { key: 'address', label: 'Address' },
      { key: 'city', label: 'City' },
      { key: 'country', label: 'Country' },
    ],
  },
  medicines: {
    title: 'Medicines',
    desc: 'The product catalogue and who makes each medicine.',
    sql: `SELECT m.medicine_id, m.name, m.composition, m.dosage_form, m.strength,
                 o.name AS manufacturer
          FROM medicines m JOIN organizations o ON o.org_id = m.manufacturer_id
          ORDER BY m.medicine_id`,
    columns: [
      { key: 'medicine_id', label: 'Medicine ID', kind: 'id' },
      { key: 'name', label: 'Name' },
      { key: 'composition', label: 'Composition' },
      { key: 'dosage_form', label: 'Dosage Form' },
      { key: 'strength', label: 'Strength' },
      { key: 'manufacturer', label: 'Manufacturer', kind: 'org' },
    ],
  },
  batches: {
    title: 'Batches',
    desc: 'Each production run, with its printed batch code and current status.',
    sql: `SELECT b.batch_id, b.batch_code, m.name AS medicine, o.name AS manufacturer,
                 b.mfg_date, b.expiry_date, b.quantity, b.status
          FROM batches b
          JOIN medicines m ON m.medicine_id = b.medicine_id
          JOIN organizations o ON o.org_id = b.manufacturer_id
          ORDER BY b.batch_id`,
    columns: [
      { key: 'batch_id', label: 'Batch ID', kind: 'id' },
      { key: 'batch_code', label: 'Batch Code', kind: 'code' },
      { key: 'medicine', label: 'Medicine', kind: 'medicine' },
      { key: 'manufacturer', label: 'Manufacturer', kind: 'org' },
      { key: 'mfg_date', label: 'Mfg Date', kind: 'date' },
      { key: 'expiry_date', label: 'Expiry Date', kind: 'date' },
      { key: 'quantity', label: 'Quantity', kind: 'number' },
      { key: 'status', label: 'Status', kind: 'badge' },
    ],
  },
  shipments: {
    title: 'Shipments',
    desc: 'Stock moving from one organization to another.',
    sql: `SELECT s.shipment_id, o1.name AS from_org, o2.name AS to_org,
                 s.shipped_at, s.received_at, s.status
          FROM shipments s
          JOIN organizations o1 ON o1.org_id = s.from_org_id
          JOIN organizations o2 ON o2.org_id = s.to_org_id
          ORDER BY s.shipment_id`,
    columns: [
      { key: 'shipment_id', label: 'Shipment ID', kind: 'id' },
      { key: 'from_org', label: 'From', kind: 'org' },
      { key: 'to_org', label: 'To', kind: 'org' },
      { key: 'shipped_at', label: 'Shipped', kind: 'date' },
      { key: 'received_at', label: 'Received', kind: 'date' },
      { key: 'status', label: 'Status', kind: 'badge' },
    ],
  },
  shipment_items: {
    title: 'Shipment items',
    desc: 'Which batches, and how many, travel in each shipment.',
    sql: `SELECT si.shipment_id, b.batch_code, si.quantity
          FROM shipment_items si JOIN batches b ON b.batch_id = si.batch_id
          ORDER BY si.shipment_id, b.batch_code`,
    columns: [
      { key: 'shipment_id', label: 'Shipment ID', kind: 'id' },
      { key: 'batch_code', label: 'Batch Code', kind: 'code' },
      { key: 'quantity', label: 'Quantity', kind: 'number' },
    ],
  },
  inventory: {
    title: 'Inventory',
    desc: 'How much of each batch an organization holds right now.',
    sql: `SELECT o.name AS organization, b.batch_code, i.quantity_on_hand, i.last_updated
          FROM inventory i
          JOIN organizations o ON o.org_id = i.org_id
          JOIN batches b ON b.batch_id = i.batch_id
          ORDER BY o.name, b.batch_code`,
    columns: [
      { key: 'organization', label: 'Organization', kind: 'org' },
      { key: 'batch_code', label: 'Batch Code', kind: 'code' },
      { key: 'quantity_on_hand', label: 'On Hand', kind: 'number' },
      { key: 'last_updated', label: 'Last Updated', kind: 'date' },
    ],
  },
  customers: {
    title: 'Customers',
    desc: 'People who bought medicine from a pharmacy.',
    sql: `SELECT customer_id, name, phone, email FROM customers ORDER BY customer_id`,
    columns: [
      { key: 'customer_id', label: 'Customer ID', kind: 'id' },
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
    ],
  },
  sales: {
    title: 'Sales',
    desc: 'One bill per sale, from a pharmacy to a customer.',
    sql: `SELECT s.sale_id, o.name AS pharmacy, c.name AS customer,
                 s.sale_date, s.total_amount
          FROM sales s
          JOIN organizations o ON o.org_id = s.pharmacy_id
          JOIN customers c ON c.customer_id = s.customer_id
          ORDER BY s.sale_id`,
    columns: [
      { key: 'sale_id', label: 'Sale ID', kind: 'id' },
      { key: 'pharmacy', label: 'Pharmacy', kind: 'org' },
      { key: 'customer', label: 'Customer', kind: 'customer' },
      { key: 'sale_date', label: 'Sale Date', kind: 'date' },
      { key: 'total_amount', label: 'Total', kind: 'money' },
    ],
  },
  sale_items: {
    title: 'Sale items',
    desc: 'The lines on each bill.',
    sql: `SELECT si.sale_id, b.batch_code, si.quantity, si.unit_price
          FROM sale_items si JOIN batches b ON b.batch_id = si.batch_id
          ORDER BY si.sale_id, b.batch_code`,
    columns: [
      { key: 'sale_id', label: 'Sale ID', kind: 'id' },
      { key: 'batch_code', label: 'Batch Code', kind: 'code' },
      { key: 'quantity', label: 'Quantity', kind: 'number' },
      { key: 'unit_price', label: 'Unit Price', kind: 'money' },
    ],
  },
  recalls: {
    title: 'Recalls',
    desc: 'Problems found by a regulator, with severity and reason.',
    sql: `SELECT r.recall_id, b.batch_code, o.name AS regulator, r.reason,
                 r.severity, r.recall_date, r.status
          FROM recalls r
          JOIN batches b ON b.batch_id = r.batch_id
          JOIN organizations o ON o.org_id = r.regulator_id
          ORDER BY r.recall_id`,
    columns: [
      { key: 'recall_id', label: 'Recall ID', kind: 'id' },
      { key: 'batch_code', label: 'Batch Code', kind: 'code' },
      { key: 'regulator', label: 'Regulator', kind: 'org' },
      { key: 'reason', label: 'Reason' },
      { key: 'severity', label: 'Severity', kind: 'badge' },
      { key: 'recall_date', label: 'Recall Date', kind: 'date' },
      { key: 'status', label: 'Status', kind: 'badge' },
    ],
  },
  verification_scans: {
    title: 'Verification scans',
    desc: 'Every time someone checked a batch code. Unknown codes may point to fake medicine.',
    sql: `SELECT v.scan_id, v.batch_code_entered, b.batch_code AS matched_code,
                 v.customer_id, v.scanned_at, v.result
          FROM verification_scans v
          LEFT JOIN batches b ON b.batch_id = v.batch_id
          ORDER BY v.scan_id`,
    columns: [
      { key: 'scan_id', label: 'Scan ID', kind: 'id' },
      { key: 'batch_code_entered', label: 'Code Entered', kind: 'code' },
      { key: 'matched_code', label: 'Matched Batch', kind: 'code' },
      { key: 'customer_id', label: 'Customer ID', kind: 'id' },
      { key: 'scanned_at', label: 'Scanned At', kind: 'date' },
      { key: 'result', label: 'Result', kind: 'badge' },
    ],
  },
  audit_log: {
    title: 'Audit log',
    desc: 'A record of every batch status change: who, when and why.',
    sql: `SELECT a.log_id, b.batch_code, a.old_status, a.new_status,
                 o.name AS changed_by, a.changed_at, a.reason
          FROM audit_log a
          JOIN batches b ON b.batch_id = a.batch_id
          LEFT JOIN organizations o ON o.org_id = a.changed_by_org_id
          ORDER BY a.log_id`,
    columns: [
      { key: 'log_id', label: 'Log ID', kind: 'id' },
      { key: 'batch_code', label: 'Batch Code', kind: 'code' },
      { key: 'old_status', label: 'Old Status', kind: 'badge' },
      { key: 'new_status', label: 'New Status', kind: 'badge' },
      { key: 'changed_by', label: 'Changed By', kind: 'org' },
      { key: 'changed_at', label: 'Changed At', kind: 'date' },
      { key: 'reason', label: 'Reason' },
    ],
  },
};

const ACCESS = {
  regulator: Object.keys(DATASETS),
  manufacturer: ['medicines', 'batches', 'shipments', 'shipment_items', 'inventory', 'recalls', 'organizations'],
  distributor: ['organizations', 'medicines', 'batches', 'shipments', 'shipment_items', 'inventory', 'recalls'],
  pharmacy: ['medicines', 'batches', 'inventory', 'customers', 'sales', 'sale_items', 'recalls'],
  customer: ['medicines', 'batches', 'recalls'],
};

const GROUPS = [
  ['Master data', ['organizations', 'medicines', 'batches']],
  ['Movement', ['shipments', 'shipment_items', 'inventory']],
  ['Sales', ['customers', 'sales', 'sale_items']],
  ['Safety', ['recalls', 'verification_scans', 'audit_log']],
];

const ok = (res, data) => res.json({ ok: true, ...data });
const fail = (res, code, message) => res.status(code).json({ ok: false, error: message });

// Render a query for display only (the app always runs parameterised queries).
function showSql(sql, params = []) {
  let i = 0;
  return sql
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\?/g, () => {
      const v = params[i++];
      if (v === null || v === undefined) return 'NULL';
      if (typeof v === 'number') return String(v);
      return `'${String(v).replace(/'/g, "''")}'`;
    });
}

// Collect the statements an action ran, so the UI can display them.
const sqlLog = (entries) => entries.filter(Boolean).map((e) => ({ label: e.label, sql: e.sql, rows: e.rows ?? null }));

// ---------------------------------------------------------------------------
// Meta: dataset catalogue, access map and live stats.
// ---------------------------------------------------------------------------
app.get('/api/meta', async (_req, res) => {
  try {
    const meta = {};
    for (const [name, d] of Object.entries(DATASETS)) {
      const [[{ n }]] = await pool.query(`SELECT COUNT(*) AS n FROM (${d.sql}) t`);
      meta[name] = { title: d.title, desc: d.desc, columns: d.columns, count: n };
    }
    const [statusRows] = await pool.query(
      'SELECT status, COUNT(*) AS n FROM batches GROUP BY status'
    );
    const status = Object.fromEntries(statusRows.map((r) => [r.status, r.n]));
    const [[{ n: batchTotal }]] = await pool.query('SELECT COUNT(*) AS n FROM batches');
    const [[{ n: scanTotal }]] = await pool.query('SELECT COUNT(*) AS n FROM verification_scans');
    ok(res, {
      database: process.env.DB_NAME || 'medicine_traceability',
      datasets: meta,
      access: ACCESS,
      groups: GROUPS,
      stats: {
        batches: batchTotal,
        genuine: status.genuine || 0,
        recalled: status.recalled || 0,
        suspected_fake: status.suspected_fake || 0,
        expired: status.expired || 0,
        scans: scanTotal,
      },
    });
  } catch (e) {
    fail(res, 500, e.message);
  }
});

// ---------------------------------------------------------------------------
// Accounts. The login form and the API share the same rules, so the messages a
// user sees match what the server enforces. The role always comes from the
// stored account, never from the request body.
// ---------------------------------------------------------------------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Look up the organization for an account so the UI can show a friendly name.
async function orgNameFor(orgId) {
  if (!orgId) return 'Not listed / individual';
  const [[row]] = await pool.query('SELECT name FROM organizations WHERE org_id = ?', [orgId]);
  return row ? row.name : 'Not listed / individual';
}

function publicUser(row, org) {
  return { name: row.name, email: row.email, role: row.role, org };
}

app.post('/api/signup', async (req, res) => {
  try {
    const name = String(req.body?.name ?? '').trim();
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const role = String(req.body?.role ?? '');
    const orgId = req.body?.org_id ? Number(req.body.org_id) : null;
    const password = String(req.body?.password ?? '');
    const confirm = String(req.body?.confirm ?? '');

    if (name.length < 2) return fail(res, 400, 'Enter your full name.');
    if (!EMAIL_RE.test(email)) return fail(res, 400, 'Enter a valid email address.');
    if (!ACCESS[role]) return fail(res, 400, 'Choose a valid role.');
    const pwErr = passwordProblem(password);
    if (pwErr) return fail(res, 400, pwErr);
    if (password !== confirm) return fail(res, 400, 'The two passwords do not match.');

    const [[dupe]] = await authPool.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (dupe) return fail(res, 409, 'An account with that email already exists. Sign in instead.');

    const [result] = await authPool.query(
      'INSERT INTO users (name, email, role, org_id, password_hash) VALUES (?, ?, ?, ?, ?)',
      [name, email, role, orgId, hashPassword(password)]
    );
    const user = publicUser({ name, email, role }, await orgNameFor(orgId));
    ok(res, { token: signToken(result.insertId), user });
  } catch (e) {
    fail(res, 500, e.message);
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    if (!EMAIL_RE.test(email)) return fail(res, 400, 'Enter a valid email address.');
    if (!password) return fail(res, 400, 'Enter your password.');

    const [[row]] = await authPool.query('SELECT * FROM users WHERE email = ?', [email]);
    // Same message whether the email is unknown or the password is wrong, so the
    // response cannot be used to discover which emails have accounts.
    if (!row || !verifyPassword(password, row.password_hash)) {
      return fail(res, 401, 'Email or password is incorrect.');
    }
    await authPool.query('UPDATE users SET last_login_at = NOW() WHERE user_id = ?', [row.user_id]);
    const user = publicUser(row, await orgNameFor(row.org_id));
    ok(res, { token: signToken(row.user_id), user });
  } catch (e) {
    fail(res, 500, e.message);
  }
});

// Restore a session from a stored token when the page reloads.
app.get('/api/session', async (req, res) => {
  try {
    const userId = verifyToken(req.headers['x-auth-token']);
    if (!userId) return fail(res, 401, 'Not signed in.');
    const [[row]] = await authPool.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    if (!row) return fail(res, 401, 'Not signed in.');
    ok(res, { user: publicUser(row, await orgNameFor(row.org_id)) });
  } catch (e) {
    fail(res, 500, e.message);
  }
});

// Sessions are stateless tokens, so sign-out is the client discarding the token.
app.post('/api/logout', (_req, res) => ok(res, {}));

// ---------------------------------------------------------------------------
// Generic dataset endpoint with optional server-side search.
// ---------------------------------------------------------------------------
app.get('/api/datasets/:name', async (req, res) => {
  const d = DATASETS[req.params.name];
  if (!d) return fail(res, 404, 'Unknown dataset.');
  const q = String(req.query.q || '').trim();
  try {
    let sql = d.sql;
    const params = [];
    if (q) {
      const concat = d.columns.map((c) => `COALESCE(t.\`${c.key}\`, '')`).join(", ' ', ");
      sql = `SELECT * FROM (${d.sql}) t WHERE CONCAT_WS(' ', ${concat}) LIKE ? ORDER BY 1`;
      params.push(`%${q}%`);
    }
    const [rows] = await pool.query(sql, params);
    const out = rows.map((r) => d.columns.map((c) => r[c.key]));
    ok(res, {
      title: d.title,
      desc: d.desc,
      columns: d.columns,
      rows: out,
      sql: sqlLog([{ label: `SELECT from ${req.params.name}`, sql: showSql(sql, params), rows: out.length }]),
    });
  } catch (e) {
    fail(res, 500, e.message);
  }
});

// ---------------------------------------------------------------------------
// Verify a batch code. Writes a row into verification_scans.
// ---------------------------------------------------------------------------
const LOOKUP_BATCH_SQL = `SELECT b.batch_id, b.batch_code, b.expiry_date, b.status, m.name AS medicine,
              o.name AS manufacturer
       FROM batches b
       JOIN medicines m ON m.medicine_id = b.medicine_id
       JOIN organizations o ON o.org_id = b.manufacturer_id
       WHERE b.batch_code = ?`;

app.post('/api/verify', async (req, res) => {
  const code = String(req.body?.code || '').trim().toUpperCase();
  if (!code) return fail(res, 400, 'Enter a batch code to check.');
  try {
    const [rows] = await pool.query(LOOKUP_BATCH_SQL, [code]);
    const today = new Date().toISOString().slice(0, 10);
    let result = 'unknown';
    let batch = null;
    if (rows.length) {
      batch = rows[0];
      if (batch.status === 'recalled') result = 'recalled';
      else if (batch.status === 'suspected_fake') result = 'recalled';
      else if (batch.status === 'expired' || batch.expiry_date < today) result = 'expired';
      else result = 'genuine';
    }
    const insParams = [code, batch ? batch.batch_id : null, result];
    const insSql = 'INSERT INTO verification_scans (batch_code_entered, batch_id, result) VALUES (?, ?, ?)';
    const [ins] = await pool.query(insSql, insParams);
    ok(res, {
      result,
      batch,
      sql: sqlLog([
        { label: 'Look up the batch code', sql: showSql(LOOKUP_BATCH_SQL, [code]), rows: rows.length },
        { label: 'Record the scan', sql: showSql(insSql, insParams), rows: ins.affectedRows },
      ]),
    });
  } catch (e) {
    fail(res, 500, e.message);
  }
});

// ---------------------------------------------------------------------------
// Forward trace of a batch using the SQL views.
// ---------------------------------------------------------------------------
const BATCH_BY_ID_SQL = `SELECT b.batch_id, b.batch_code, b.status, b.expiry_date, m.name AS medicine,
              o.name AS manufacturer
       FROM batches b
       JOIN medicines m ON m.medicine_id = b.medicine_id
       JOIN organizations o ON o.org_id = b.manufacturer_id
       WHERE b.batch_id = ?`;

app.get('/api/trace/:batchId', async (req, res) => {
  const id = Number(req.params.batchId);
  if (!Number.isInteger(id)) return fail(res, 400, 'Invalid batch id.');
  try {
    const [[batch]] = await pool.query(BATCH_BY_ID_SQL, [id]);
    if (!batch) return fail(res, 404, 'Batch not found.');
    const FLOW_SQL = 'SELECT * FROM v_batch_flow WHERE batch_id = ? ORDER BY shipment_id';
    const CUST_SQL = 'SELECT * FROM v_batch_customers WHERE batch_id = ? ORDER BY sale_date';
    const STOCK_SQL = `SELECT o.name AS organization, i.quantity_on_hand, i.last_updated
       FROM inventory i JOIN organizations o ON o.org_id = i.org_id
       WHERE i.batch_id = ? ORDER BY o.name`;
    const RECALL_SQL = `SELECT r.reason, r.severity, r.recall_date, r.status, o.name AS regulator
       FROM recalls r JOIN organizations o ON o.org_id = r.regulator_id
       WHERE r.batch_id = ? ORDER BY r.recall_date`;
    const [flow] = await pool.query(FLOW_SQL, [id]);
    const [customers] = await pool.query(CUST_SQL, [id]);
    const [stock] = await pool.query(STOCK_SQL, [id]);
    const [recalls] = await pool.query(RECALL_SQL, [id]);
    ok(res, {
      batch, flow, customers, stock, recalls,
      sql: sqlLog([
        { label: 'Batch and its medicine', sql: showSql(BATCH_BY_ID_SQL, [id]), rows: 1 },
        { label: 'Shipment flow (view v_batch_flow)', sql: showSql(FLOW_SQL, [id]), rows: flow.length },
        { label: 'Stock held (inventory)', sql: showSql(STOCK_SQL, [id]), rows: stock.length },
        { label: 'Customers who bought it (view v_batch_customers)', sql: showSql(CUST_SQL, [id]), rows: customers.length },
        { label: 'Recalls for this batch', sql: showSql(RECALL_SQL, [id]), rows: recalls.length },
      ]),
    });
  } catch (e) {
    fail(res, 500, e.message);
  }
});

// ---------------------------------------------------------------------------
// Issue a recall. The database trigger flips the batch status and writes
// the audit log entry - the app does not do that itself.
// ---------------------------------------------------------------------------
app.post('/api/recalls', async (req, res) => {
  const { batchId, reason } = req.body || {};
  const severity = req.body?.severity || 'high';
  const regulatorId = Number(req.body?.regulatorId || 8);
  if (!batchId) return fail(res, 400, 'Choose a batch to recall.');
  if (!reason || String(reason).trim().length < 3) return fail(res, 400, 'Give a reason for the recall.');
  try {
    const recParams = [Number(batchId), regulatorId, String(reason).trim(), severity];
    const recSql = `INSERT INTO recalls (batch_id, regulator_id, reason, severity, recall_date, status)
       VALUES (?, ?, ?, ?, CURDATE(), 'active')`;
    const [rec] = await pool.query(recSql, recParams);
    const batchSql = 'SELECT batch_id, batch_code, status FROM batches WHERE batch_id = ?';
    const [[batch]] = await pool.query(batchSql, [Number(batchId)]);
    const auditSql = `SELECT log_id, old_status, new_status, changed_at, reason
       FROM audit_log WHERE batch_id = ? ORDER BY log_id DESC LIMIT 5`;
    const [audit] = await pool.query(auditSql, [Number(batchId)]);
    ok(res, {
      batch, audit,
      sql: sqlLog([
        { label: 'Insert the recall', sql: showSql(recSql, recParams), rows: rec.affectedRows },
        { label: 'Batch status after the trigger ran', sql: showSql(batchSql, [Number(batchId)]), rows: 1 },
        { label: 'Audit rows written by the trigger', sql: showSql(auditSql, [Number(batchId)]), rows: audit.length },
      ]),
      trigger: 'trg_recall_sets_status + trg_audit_batch_status',
    });
  } catch (e) {
    fail(res, 500, e.message);
  }
});

// ---------------------------------------------------------------------------
// Demonstrate the sale-blocking rule without creating a real sale.
// ---------------------------------------------------------------------------
app.post('/api/sales/attempt', async (req, res) => {
  const batchId = Number(req.body?.batchId);
  const quantity = Number(req.body?.quantity || 1);
  if (!batchId) return fail(res, 400, 'Choose a batch.');
  const conn = await pool.getConnection();
  const saleSql = "INSERT INTO sales (pharmacy_id, customer_id, sale_date, total_amount) VALUES (5, 1, CURDATE(), 0)";
  const itemSql = 'INSERT INTO sale_items (sale_id, batch_id, quantity, unit_price) VALUES (?, ?, ?, 30)';
  let saleId = null;
  try {
    await conn.beginTransaction();
    await conn.query(saleSql);
    const [sale] = await conn.query('SELECT LAST_INSERT_ID() AS id');
    saleId = sale[0].id;
    const itemParams = [saleId, batchId, quantity];
    await conn.query(itemSql, itemParams);
    await conn.rollback(); // demo only - never keep this row
    ok(res, {
      blocked: false,
      message: 'Sale allowed: this batch is safe to sell.',
      sql: sqlLog([
        { label: 'Create the sale row', sql: showSql(saleSql), rows: 1 },
        { label: 'Add the line item (the trigger inspects the batch here)', sql: showSql(itemSql, itemParams), rows: 1 },
      ]),
      trigger: 'trg_block_bad_sale',
      rolledBack: true,
    });
  } catch (e) {
    await conn.rollback();
    if (e.sqlState === '45000') {
      return ok(res, {
        blocked: true,
        message: e.sqlMessage,
        sql: sqlLog([
          { label: 'Create the sale row', sql: showSql(saleSql), rows: 1 },
          { label: 'Add the line item (rejected by the trigger)', sql: showSql(itemSql, [saleId, batchId, quantity]), rows: 0 },
        ]),
        trigger: 'trg_block_bad_sale',
        error: { sqlState: e.sqlState, code: e.code, message: e.sqlMessage },
        rolledBack: true,
      });
    }
    fail(res, 500, e.message);
  } finally {
    conn.release();
  }
});

// ---------------------------------------------------------------------------
// Dashboard: aggregated numbers for the overview charts and activity feed.
// ---------------------------------------------------------------------------
app.get('/api/dashboard', async (_req, res) => {
  try {
    const [batchesByStatus] = await pool.query(
      `SELECT status, COUNT(*) AS n, SUM(quantity) AS units
       FROM batches GROUP BY status ORDER BY n DESC`
    );
    const [inventoryByOrg] = await pool.query(
      `SELECT o.name AS org, o.org_type AS type, SUM(i.quantity_on_hand) AS units
       FROM inventory i JOIN organizations o ON o.org_id = i.org_id
       GROUP BY o.org_id, o.name, o.org_type ORDER BY units DESC`
    );
    const [scansByResult] = await pool.query(
      'SELECT result, COUNT(*) AS n FROM verification_scans GROUP BY result ORDER BY n DESC'
    );
    const [shipmentsByStatus] = await pool.query(
      'SELECT status, COUNT(*) AS n FROM shipments GROUP BY status ORDER BY n DESC'
    );
    const [salesByPharmacy] = await pool.query(
      `SELECT o.name AS pharmacy, COUNT(s.sale_id) AS bills, SUM(s.total_amount) AS revenue
       FROM sales s JOIN organizations o ON o.org_id = s.pharmacy_id
       GROUP BY o.org_id, o.name ORDER BY revenue DESC`
    );
    const [recentActivity] = await pool.query(
      `SELECT a.log_id, b.batch_code, a.old_status, a.new_status, o.name AS changed_by,
              a.changed_at, a.reason
       FROM audit_log a
       JOIN batches b ON b.batch_id = a.batch_id
       LEFT JOIN organizations o ON o.org_id = a.changed_by_org_id
       ORDER BY a.changed_at DESC, a.log_id DESC LIMIT 8`
    );
    const [recentScans] = await pool.query(
      `SELECT batch_code_entered, result, scanned_at FROM verification_scans
       ORDER BY scanned_at DESC LIMIT 6`
    );
    const [scansByMonth] = await pool.query(
      `SELECT DATE_FORMAT(scanned_at, '%Y-%m') AS ym, COUNT(*) AS n
       FROM verification_scans GROUP BY ym ORDER BY ym`
    );
    const [salesByMonth] = await pool.query(
      `SELECT DATE_FORMAT(sale_date, '%Y-%m') AS ym, COUNT(*) AS n, SUM(total_amount) AS revenue
       FROM sales GROUP BY ym ORDER BY ym`
    );
    const [[{ n: totalSales, revenue }]] = await pool.query(
      'SELECT COUNT(*) AS n, COALESCE(SUM(total_amount), 0) AS revenue FROM sales'
    );
    ok(res, {
      batchesByStatus, inventoryByOrg, scansByResult, shipmentsByStatus,
      salesByPharmacy, recentActivity, recentScans, scansByMonth, salesByMonth,
      totals: { sales: totalSales, revenue: Number(revenue) },
    });
  } catch (e) {
    fail(res, 500, e.message);
  }
});

// ---------------------------------------------------------------------------
// Global search across every dataset the current role may see.
// ---------------------------------------------------------------------------
app.get('/api/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  const role = String(req.query.role || '');
  const allowed = ACCESS[role] || Object.keys(DATASETS);
  if (q.length < 2) return ok(res, { q, hits: [] });
  try {
    const hits = [];
    for (const name of allowed) {
      const d = DATASETS[name];
      const concat = d.columns.map((c) => `COALESCE(t.\`${c.key}\`, '')`).join(", ' ', ");
      const sql = `SELECT * FROM (${d.sql}) t WHERE CONCAT_WS(' ', ${concat}) LIKE ? ORDER BY 1 LIMIT 5`;
      const [rows] = await pool.query(sql, [`%${q}%`]);
      for (const r of rows) {
        hits.push({
          dataset: name,
          title: d.title,
          label: d.columns.map((c) => r[c.key]).filter((v) => v !== null && v !== '').slice(0, 3).join(' · '),
          row: d.columns.map((c) => r[c.key]),
        });
      }
      if (hits.length >= 25) break;
    }
    ok(res, { q, hits: hits.slice(0, 25) });
  } catch (e) {
    fail(res, 500, e.message);
  }
});

// ---------------------------------------------------------------------------
// Schema: real DDL read back from MySQL (information_schema + SHOW CREATE).
// Everything the Database schema page shows comes straight from the server.
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
  shipment_items: 'shipment_id → shipments, batch_id → batches (composite PK)',
  inventory: 'org_id → organizations, batch_id → batches (composite PK)',
  customers: 'sales.customer_id, verification_scans.customer_id',
  sales: 'sale_items.sale_id',
  sale_items: 'sale_id → sales, batch_id → batches (composite PK)',
  recalls: 'batch_id → batches, regulator_id → organizations',
  verification_scans: 'batch_id → batches (nullable), customer_id → customers (nullable)',
  audit_log: 'batch_id → batches, changed_by_org_id → organizations',
};

app.get('/api/schema', async (_req, res) => {
  const db = process.env.DB_NAME || 'medicine_traceability';
  try {
    // Tables + their columns, keys and nullability, straight from the catalogue.
    const [cols] = await pool.query(
      `SELECT TABLE_NAME AS tbl, COLUMN_NAME AS col, COLUMN_TYPE AS type,
              IS_NULLABLE AS nullable, COLUMN_KEY AS ckey, COLUMN_DEFAULT AS dflt,
              EXTRA AS extra, ORDINAL_POSITION AS pos
         FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = ?
        ORDER BY TABLE_NAME, ORDINAL_POSITION`,
      [db]
    );
    const [keyRows] = await pool.query(
      `SELECT TABLE_NAME AS tbl, CONSTRAINT_NAME AS name, COLUMN_NAME AS col,
              REFERENCED_TABLE_NAME AS ref_tbl, REFERENCED_COLUMN_NAME AS ref_col
         FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL
        ORDER BY TABLE_NAME, CONSTRAINT_NAME`,
      [db]
    );
    const [indexRows] = await pool.query(
      `SELECT TABLE_NAME AS tbl, INDEX_NAME AS name, COLUMN_NAME AS col,
              NON_UNIQUE AS non_unique
         FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = ?
        ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX`,
      [db]
    );

    // Only the 12 base tables (skip views), in a sensible narrative order.
    const order = Object.keys(TABLE_NOTES);
    const byTable = {};
    for (const r of cols) {
      if (!order.includes(r.tbl)) continue;
      (byTable[r.tbl] ||= []).push(r);
    }

    const fksByTable = {};
    for (const r of keyRows) (fksByTable[r.tbl] ||= []).push(r);
    const idxByTable = {};
    for (const r of indexRows) (idxByTable[r.tbl] ||= []).push(r);

    const tables = order.map((t) => {
      const cs = byTable[t] || [];
      const pkCols = cs.filter((c) => c.ckey === 'PRI').map((c) => c.col);
      const uniqCols = cs.filter((c) => c.ckey === 'UNI').map((c) => c.col);
      const colsOut = cs.map((c) => ({
        name: c.col,
        type: c.type,
        nullable: c.nullable === 'YES',
        key: c.ckey,                       // PRI | UNI | MUL | ''
        default: c.dflt,
        extra: c.extra,
        isPk: c.ckey === 'PRI',
        isFk: (fksByTable[t] || []).some((f) => f.col === c.col),
        isUq: c.ckey === 'UNI',
      }));
      const fks = [...new Map((fksByTable[t] || []).map((f) => [f.name, f])).values()].map((f) => ({
        name: f.name,
        col: f.col,
        refTable: f.ref_tbl,
        refCol: f.ref_col,
      }));
      const idx = [...new Set((idxByTable[t] || []).map((i) => i.name))];
      return {
        name: t,
        note: TABLE_NOTES[t],
        relations: RELATIONS[t],
        columns: colsOut,
        primaryKey: pkCols,
        uniqueKeys: uniqCols,
        foreignKeys: fks,
        indexes: idx,
      };
    });

    // Real DDL: SHOW CREATE TABLE for every table (this is what MySQL stores).
    const ddl = {};
    for (const t of order) {
      const [r] = await pool.query(`SHOW CREATE TABLE \`${t}\``);
      ddl[t] = r[0]['Create Table'];
    }

    // Views + triggers, read from the catalogue.
    const [viewRows] = await pool.query(
      `SELECT TABLE_NAME AS name FROM information_schema.VIEWS WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME`,
      [db]
    );
    const views = [];
    for (const v of viewRows) {
      const [r] = await pool.query(`SHOW CREATE VIEW \`${v.name}\``);
      views.push({ name: v.name, ddl: r[0]['Create View'] });
    }
    const [trigRows] = await pool.query(
      `SELECT TRIGGER_NAME AS name, EVENT_MANIPULATION AS event, EVENT_OBJECT_TABLE AS tbl,
              ACTION_TIMING AS timing
         FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = ? ORDER BY TRIGGER_NAME`,
      [db]
    );
    const triggers = [];
    for (const tr of trigRows) {
      const [r] = await pool.query(`SHOW CREATE TRIGGER \`${tr.name}\``);
      triggers.push({
        name: tr.name,
        event: tr.event,
        table: tr.tbl,
        timing: tr.timing,
        ddl: r[0]['SQL Original Statement'],
      });
    }

    ok(res, { database: db, tables, views, triggers, ddl });
  } catch (e) {
    fail(res, 500, e.message);
  }
});

// ---------------------------------------------------------------------------
// SQL query library: a curated set of read-only queries that demonstrate the
// DBMS concepts (joins, aggregation, GROUP BY / HAVING, sub-queries, views).
// Only these server-defined queries can be run — never arbitrary client SQL.
// ---------------------------------------------------------------------------
const QUERIES = [
  {
    id: 'joins_full_trace',
    title: 'Full trace: batch → shipment → organizations',
    concept: 'INNER JOIN across 5 tables',
    note: 'Follows one batch through every shipment it travelled in, showing who sent it and who received it.',
    sql: `SELECT b.batch_code, m.name AS medicine,
       s.shipment_id, o1.name AS from_org, o2.name AS to_org,
       si.quantity, s.status AS shipment_status
  FROM batches b
  JOIN medicines m       ON m.medicine_id  = b.medicine_id
  JOIN shipment_items si ON si.batch_id    = b.batch_id
  JOIN shipments s       ON s.shipment_id  = si.shipment_id
  JOIN organizations o1  ON o1.org_id      = s.from_org_id
  JOIN organizations o2  ON o2.org_id      = s.to_org_id
 ORDER BY b.batch_code, s.shipment_id`,
  },
  {
    id: 'group_by_org',
    title: 'Shipments per organization',
    concept: 'GROUP BY with COUNT',
    note: 'Counts how many shipments each organization sent (from) and received (to).',
    sql: `SELECT o.name AS organization, o.org_type,
       COUNT(DISTINCT s_out.shipment_id) AS sent,
       COUNT(DISTINCT s_in.shipment_id)  AS received
  FROM organizations o
  LEFT JOIN shipments s_out ON s_out.from_org_id = o.org_id
  LEFT JOIN shipments s_in  ON s_in.to_org_id    = o.org_id
 GROUP BY o.org_id, o.name, o.org_type
 ORDER BY sent DESC, received DESC`,
  },
  {
    id: 'having_blocked',
    title: 'Batches that cannot be sold',
    concept: 'WHERE + ORDER BY on an ENUM status',
    note: 'Lists every batch a pharmacy must pull from the shelf because it is recalled, fake or expired.',
    sql: `SELECT b.batch_code, m.name AS medicine, b.status, b.expiry_date,
       CASE
         WHEN b.status = 'recalled'       THEN 'Recall in force'
         WHEN b.status = 'suspected_fake' THEN 'Under investigation'
         WHEN b.expiry_date < CURDATE()   THEN 'Past expiry date'
         ELSE 'Safe to sell'
       END AS reason
  FROM batches b
  JOIN medicines m ON m.medicine_id = b.medicine_id
 WHERE b.status <> 'genuine' OR b.expiry_date < CURDATE()
 ORDER BY b.status`,
  },
  {
    id: 'subquery_top_customers',
    title: 'Customers ranked by units bought',
    concept: 'JOIN + GROUP BY + HAVING + SUM',
    note: 'Shows which customers bought the most medicine, counting only customers above 2 units.',
    sql: `SELECT c.name AS customer, c.phone,
       COUNT(si.sale_id) AS line_items,
       SUM(si.quantity)  AS units,
       SUM(si.quantity * si.unit_price) AS spend
  FROM customers c
  JOIN sales s       ON s.customer_id = c.customer_id
  JOIN sale_items si ON si.sale_id    = s.sale_id
 GROUP BY c.customer_id, c.name, c.phone
HAVING units > 2
 ORDER BY units DESC`,
  },
  {
    id: 'view_batch_flow',
    title: 'Forward trace using the view',
    concept: 'SELECT from a VIEW (v_batch_flow)',
    note: 'The same trace as the first query, but reading the saved view the Trace page uses.',
    sql: `SELECT batch_code, medicine, shipment_id, from_org, to_org,
       quantity, shipment_status
  FROM v_batch_flow
 ORDER BY batch_code, shipment_id`,
  },
  {
    id: 'view_batch_customers',
    title: 'Who received a batch',
    concept: 'SELECT from a VIEW (v_batch_customers)',
    note: 'For each batch, the customers who bought it — the list a recall would notify.',
    sql: `SELECT batch_code, customer, phone, quantity, unit_price, sale_date, pharmacy
  FROM v_batch_customers
 ORDER BY batch_code, sale_date`,
  },
  {
    id: 'inventory_low',
    title: 'Stock held per organization',
    concept: 'Multi-table JOIN + SUM',
    note: 'Total stock on hand for every organization and batch, useful for spotting low inventory.',
    sql: `SELECT o.name AS organization, m.name AS medicine, b.batch_code,
       i.quantity_on_hand, i.last_updated
  FROM inventory i
  JOIN organizations o ON o.org_id      = i.org_id
  JOIN batches b       ON b.batch_id    = i.batch_id
  JOIN medicines m     ON m.medicine_id = b.medicine_id
 ORDER BY i.quantity_on_hand ASC`,
  },
  {
    id: 'audit_trail',
    title: 'Audit trail of status changes',
    concept: 'JOIN + ORDER BY on the log table',
    note: 'Every status change of a batch, written automatically by the audit trigger.',
    sql: `SELECT a.log_id, b.batch_code, a.old_status, a.new_status,
       o.name AS changed_by, a.changed_at, a.reason
  FROM audit_log a
  JOIN batches b       ON b.batch_id = a.batch_id
  LEFT JOIN organizations o ON o.org_id = a.changed_by_org_id
 ORDER BY a.changed_at DESC`,
  },
  {
    id: 'scan_summary',
    title: 'Verification scans by result',
    concept: 'GROUP BY on an ENUM with COUNT',
    note: 'How many batch-code checks ended genuine, recalled, expired or unknown (possible fakes).',
    sql: `SELECT result, COUNT(*) AS scans
  FROM verification_scans
 GROUP BY result
 ORDER BY scans DESC`,
  },
];

app.get('/api/queries', (_req, res) => {
  ok(res, { queries: QUERIES.map(({ id, title, concept, note }) => ({ id, title, concept, note })) });
});

app.get('/api/queries/:id', async (req, res) => {
  const qy = QUERIES.find((q) => q.id === req.params.id);
  if (!qy) return fail(res, 404, 'Unknown query.');
  try {
    const [rows] = await pool.query(qy.sql);
    const columns = rows.length ? Object.keys(rows[0]) : [];
    const data = rows.map((r) => columns.map((c) => (r[c] instanceof Date ? r[c].toISOString() : r[c])));
    ok(res, { id: qy.id, title: qy.title, concept: qy.concept, note: qy.note, sql: qy.sql, columns, rows: data });
  } catch (e) {
    fail(res, 500, e.message);
  }
});

// ---------------------------------------------------------------------------
// Static frontend
// ---------------------------------------------------------------------------
const publicDir = join(__dirname, '..', 'public');
app.use(express.static(publicDir));
app.get('*', (_req, res) => res.sendFile(join(publicDir, 'index.html')));

const PORT = Number(process.env.PORT || 12000);
app.listen(PORT, () => console.log(`MedTrace running on http://localhost:${PORT}`));
