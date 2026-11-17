// End-to-end checks for MedTrace: the data model, the MySQL rules, and the
// role-based access model. Run with: npm test  (the server must be running).
import { authPool, default as pool } from '../server/db.js';

const B = 'http://localhost:12000';
let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name} ${extra}`); }
};
const get = async (p, tok) => {
  const r = await fetch(B + p, tok ? { headers: { 'x-auth-token': tok } } : {});
  return { status: r.status, body: await r.json().catch(() => null) };
};
const post = async (p, b, tok) => {
  const h = { 'Content-Type': 'application/json' };
  if (tok) h['x-auth-token'] = tok;
  const r = await fetch(B + p, { method: 'POST', headers: h, body: JSON.stringify(b) });
  return { status: r.status, body: await r.json().catch(() => null) };
};
const login = async (email) => (await post('/api/login', { email, password: 'demo1234' })).body?.token;

console.log('--- static assets ---');
for (const f of ['/', '/app.js', '/er-diagram.jpg', '/vendor/chart.umd.min.js']) {
  const r = await fetch(B + f);
  check(`${f} → 200`, r.status === 200, `got ${r.status}`);
}

console.log('--- sign in as each role ---');
const T = {
  regulator: await login('asha.mehta@cdsco.gov.in'),
  manufacturer: await login('ravi.kumar@sunpharma.in'),
  distributor: await login('neha.sharma@medplus.in'),
  pharmacy: await login('imran@apollopharmacy.in'),
  customer: await login('priya.nair@example.com'),
  admin: await login('admin@medtrace.local'),
};
for (const [role, tok] of Object.entries(T)) check(`${role} can sign in`, !!tok);

console.log('--- protected endpoints require a session ---');
for (const p of ['/api/meta', '/api/dashboard', '/api/datasets/batches', '/api/search?q=para', '/api/schema', '/api/queries']) {
  check(`${p} without a token → 401`, (await get(p)).status === 401, String((await get(p)).status));
}
check('tampered token rejected', (await get('/api/session', '1.9999999999999.deadbeef')).status === 401);
check('missing token rejected', (await get('/api/session')).status === 401);

console.log('--- meta is scoped to the role ---');
const metaReg = await get('/api/meta', T.regulator);
check('regulator sees all 12 datasets', Object.keys(metaReg.body?.datasets || {}).length === 12, String(Object.keys(metaReg.body?.datasets || {}).length));
const metaMfr = await get('/api/meta', T.manufacturer);
check('manufacturer sees fewer datasets', Object.keys(metaMfr.body?.datasets || {}).length < 12);
check('manufacturer cannot see customers', !metaMfr.body?.datasets?.customers);
check('manufacturer cannot see sales', !metaMfr.body?.datasets?.sales);
check('customer sees no datasets', Object.keys((await get('/api/meta', T.customer)).body?.datasets || {}).length === 0);
check('regulator batch total >= manufacturer total', metaReg.body.stats.batches >= metaMfr.body.stats.batches);

console.log('--- organization isolation (row-level) ---');
const orgCount = async (tok) => (await get('/api/datasets/organizations', tok)).body?.rows?.length;
check('regulator sees all 8 organizations', (await orgCount(T.regulator)) === 8);
for (const role of ['manufacturer', 'distributor', 'pharmacy']) {
  check(`${role} CANNOT open organizations`, (await get('/api/datasets/organizations', T[role])).status === 403);
}
check('customer CANNOT open organizations', (await get('/api/datasets/organizations', T.customer)).status === 403);
const regBatches = (await get('/api/datasets/batches', T.regulator)).body.rows.length;
const mfrBatches = (await get('/api/datasets/batches', T.manufacturer)).body.rows.length;
check('regulator sees all batches', regBatches >= 8, String(regBatches));
check('manufacturer sees only its own batches', mfrBatches > 0 && mfrBatches < regBatches, String(mfrBatches));
check('manufacturer sees only Sun Pharma batches',
  (await get('/api/datasets/batches', T.manufacturer)).body.rows.every(r => r[3] === 'Sun Pharmaceutical Industries Ltd'));

console.log('--- dataset access matrix ---');
const canOpen = async (tok, d) => (await get('/api/datasets/' + d, tok)).status;
check('pharmacy CAN open customers', (await canOpen(T.pharmacy, 'customers')) === 200);
check('manufacturer CANNOT open customers', (await canOpen(T.manufacturer, 'customers')) === 403);
check('manufacturer CANNOT open sales', (await canOpen(T.manufacturer, 'sales')) === 403);
check('customer CANNOT open batches', (await canOpen(T.customer, 'batches')) === 403);
check('manufacturer CAN open audit_log', (await canOpen(T.manufacturer, 'audit_log')) === 200);
check('distributor CANNOT open audit_log', (await canOpen(T.distributor, 'audit_log')) === 403);
check('unknown dataset → 404', (await canOpen(T.regulator, 'not_a_table')) === 404);

console.log('--- public verification needs no account and hides everything else ---');
const pv1 = await post('/api/public/verify', { code: 'PCM-2025-A01' });
check('public verify genuine', pv1.body?.ok === true && pv1.body?.result === 'genuine', JSON.stringify(pv1.body?.result));
check('public verify shows only pack fields',
  JSON.stringify(Object.keys(pv1.body?.pack || {}).sort()) === JSON.stringify(['batch_code', 'expiry_date', 'manufacturer', 'medicine', 'mfg_date']));
check('public verify never returns ids', !('batch_id' in (pv1.body?.pack || {})));
check('public verify unknown code', (await post('/api/public/verify', { code: 'NOPE-999' })).body?.result === 'unknown');
check('public verify suspected fake', (await post('/api/public/verify', { code: 'SYR-2025-A01' })).body?.result === 'suspected_fake');
check('public organizations lists names + types only',
  (await get('/api/public/organizations')).body.organizations.every(o => Object.keys(o).sort().join() === 'name,org_id,org_type'));

console.log('--- signed-in verify ---');
check('verify genuine (signed in)', (await post('/api/verify', { code: 'PCM-2025-A01' }, T.regulator)).body?.result === 'genuine');
check('verify recalled', (await post('/api/verify', { code: 'PCM-2025-B02' }, T.regulator)).body?.result === 'recalled');
check('verify expired', (await post('/api/verify', { code: 'CTZ-2024-A01' }, T.regulator)).body?.result === 'expired');
check('verify suspected fake (not folded into recalled)', (await post('/api/verify', { code: 'SYR-2025-A01' }, T.regulator)).body?.result === 'suspected_fake');
check('verify needs a session', (await post('/api/verify', { code: 'PCM-2025-A01' })).status === 401);

console.log('--- trace: personal data is restricted by role ---');
const traceReg = await get('/api/trace/1', T.regulator);
check('regulator sees customers on a trace', traceReg.body?.customers?.length > 0 && traceReg.body?.customersRestricted === false);
const tracePha = await get('/api/trace/1', T.pharmacy);
check('pharmacy sees only its own customers', tracePha.body?.customersRestricted === false && tracePha.body.customers.every(c => c.pharmacy === 'Apollo Pharmacy, Connaught Place'));
const traceMfr = await get('/api/trace/1', T.manufacturer);
check('manufacturer cannot see customer data', traceMfr.body?.customersRestricted === true && traceMfr.body?.customers?.length === 0);
check('manufacturer cannot trace another maker batch', (await get('/api/trace/3', T.manufacturer)).status === 403);
check('customer cannot trace at all', (await get('/api/trace/1', T.customer)).status === 403);

console.log('--- business rule: an unsafe sale is blocked by the trigger ---');
const blocked = await post('/api/demo/sales-attempt', { batchId: 2, quantity: 1 }, T.regulator);
check('recalled batch sale blocked', blocked.body?.blocked === true, JSON.stringify(blocked.body).slice(0, 160));
check('block comes from the trigger', blocked.body?.trigger === 'trg_block_bad_sale');
check('demo sale tool is regulator-only', (await post('/api/demo/sales-attempt', { batchId: 2 }, T.pharmacy)).status === 403);

console.log('--- create actions are role-restricted ---');
check('manufacturer CAN add a medicine', (await post('/api/medicines', { name: 'E2E Med' }, T.manufacturer)).status === 200);
check('pharmacy CANNOT add a medicine', (await post('/api/medicines', { name: 'X' }, T.pharmacy)).status === 403);
check('regulator CANNOT add a medicine', (await post('/api/medicines', { name: 'X' }, T.regulator)).status === 403);
check('distributor CANNOT add a batch', (await post('/api/batches', { batch_code: 'ZZ-1' }, T.distributor)).status === 403);
check('distributor CAN create a shipment', (await post('/api/shipments', { to_org_id: 5, batch_id: 1, quantity: 1 }, T.distributor)).status === 200);
check('pharmacy CANNOT create a shipment', (await post('/api/shipments', { to_org_id: 3, batch_id: 1, quantity: 1 }, T.pharmacy)).status === 403);
check('regulator CANNOT create a shipment', (await post('/api/shipments', { to_org_id: 3, batch_id: 1, quantity: 1 }, T.regulator)).status === 403);
check('pharmacy CAN record a sale', (await post('/api/sales', { customer_id: 1, items: [{ batch_id: 1, quantity: 1, unit_price: 10 }] }, T.pharmacy)).status === 200);
check('regulator CANNOT record a sale', (await post('/api/sales', { customer_id: 1, items: [{ batch_id: 1, quantity: 1, unit_price: 10 }] }, T.regulator)).status === 403);

console.log('--- a new batch becomes stock the manufacturer can ship ---');
const newMed = await post('/api/medicines', { name: 'E2E Batch Med' }, T.manufacturer);
const newBatch = await post('/api/batches', {
  batch_code: 'E2E-' + Date.now(), medicine_id: newMed.body.medicine_id,
  mfg_date: '2026-01-01', expiry_date: '2028-01-01', quantity: 500 }, T.manufacturer);
check('manufacturer CAN add a batch', newBatch.status === 200 && !!newBatch.body?.batch_id, JSON.stringify(newBatch.body).slice(0, 160));
const stockAfter = await get('/api/my-stock', T.manufacturer);
check('the new batch is now stock on hand',
  stockAfter.body?.stock?.some(s => s.batch_id === newBatch.body.batch_id && s.quantity_on_hand === 500));
check('my-stock names the medicine', stockAfter.body?.stock?.every(s => typeof s.medicine === 'string' && s.medicine.length > 0));

console.log('--- pharmacy can sell to a new customer with email + phone ---');
const custEmail = 'cust.' + Date.now() + '@gmail.com';
const newCustSale = await post('/api/sales', {
  customer_name: 'Walk-in E2E', customer_email: custEmail, customer_phone: '9810012345',
  items: [{ batch_id: 1, quantity: 1, unit_price: 12 }] }, T.pharmacy);
check('sale to a brand-new customer succeeds', newCustSale.status === 200 && !!newCustSale.body?.sale_id, JSON.stringify(newCustSale.body).slice(0, 160));
const custRows = await get('/api/datasets/customers', T.pharmacy);
const stored = custRows.body?.rows?.find(r => r[3] === custEmail);
check('the new customer is stored with name, phone and email', !!stored && stored[1] === 'Walk-in E2E' && stored[2] === '9810012345');
check('a sale with no customer and no name is refused',
  (await post('/api/sales', { items: [{ batch_id: 1, quantity: 1, unit_price: 1 }] }, T.pharmacy)).status === 400);
check('an invalid customer email is refused',
  (await post('/api/sales', { customer_name: 'Bad Email', customer_email: 'not-an-email', items: [{ batch_id: 1, quantity: 1, unit_price: 1 }] }, T.pharmacy)).status === 400);

console.log('--- customer traces a batch by code (no personal data) ---');
const ctrace = await post('/api/customer/trace', { code: 'PCM-2025-A01' }, T.customer);
check('customer trace finds the batch', ctrace.body?.found === true && ctrace.body?.batch?.batch_code === 'PCM-2025-A01');
check('customer trace shows the journey', Array.isArray(ctrace.body?.flow) && ctrace.body.flow.length > 0);
check('customer trace exposes no personal data', !/phone|email|customer/i.test(JSON.stringify(ctrace.body)));
check('customer trace unknown code is not found', (await post('/api/customer/trace', { code: 'NOPE-1' }, T.customer)).body?.found === false);
check('staff cannot use the customer trace route', (await post('/api/customer/trace', { code: 'PCM-2025-A01' }, T.manufacturer)).status === 403);
check('customer trace needs a session', (await post('/api/customer/trace', { code: 'PCM-2025-A01' })).status === 401);

console.log('--- shipment helpers are scoped to the sender ---');
const dest = await get('/api/shipping-destinations', T.manufacturer);
check('destinations exclude the sender', dest.body?.destinations?.every(d => d.org_id !== 1));
check('destinations cover the whole chain', dest.body?.destinations?.some(d => d.org_type === 'pharmacy'));
check('destinations are sender-only', (await get('/api/shipping-destinations', T.pharmacy)).status === 403);
const myStock = await get('/api/my-stock', T.manufacturer);
check('my-stock returns only own stock', myStock.body?.stock?.every(s => 'batch_code' in s && 'quantity_on_hand' in s));
check('my-stock is not public', (await get('/api/my-stock')).status === 401);

console.log('--- recall lifecycle (regulator only) ---');
const ship = await post('/api/shipments', { to_org_id: 5, batch_id: 7, quantity: 5 }, T.manufacturer);
check('manufacturer ships its own batch', ship.status === 200, JSON.stringify(ship.body).slice(0, 160));
const rec = await post('/api/recalls', { batchId: 7, reason: 'E2E dissolution failure', severity: 'high' }, T.regulator);
check('regulator issues a recall', rec.status === 200 && !!rec.body?.recall_id, JSON.stringify(rec.body).slice(0, 160));
check('issuing a recall flips the batch to recalled', rec.body?.batch?.status === 'recalled');
check('the recall wrote an audit row via the trigger', rec.body?.audit?.length >= 1);
check('manufacturer CANNOT issue a recall', (await post('/api/recalls', { batchId: 1, reason: 'nope' }, T.manufacturer)).status === 403);
check('pharmacy CANNOT issue a recall', (await post('/api/recalls', { batchId: 1, reason: 'nope' }, T.pharmacy)).status === 403);
const preview = await get('/api/recalls/preview/7', T.regulator);
check('recall preview shows affected stock', preview.body?.ok === true && typeof preview.body?.stockUnits === 'number');
check('recall preview is regulator-only', (await get('/api/recalls/preview/7', T.pharmacy)).status === 403);
check('pharmacy can acknowledge a recall it holds stock for', (await post(`/api/recalls/${rec.body.recall_id}/acknowledge`, {}, T.pharmacy)).status === 200);
check('acknowledgement is counted', (await get('/api/recalls', T.regulator)).body.recalls.find(r => r.recall_id === rec.body.recall_id).ack_count >= 1);
const wd = await post(`/api/recalls/${rec.body.recall_id}/status`, { status: 'withdrawn', note: 'retest passed' }, T.regulator);
check('withdrawing a recall returns the batch to genuine', wd.body?.batch?.status === 'genuine', JSON.stringify(wd.body?.batch));
check('manufacturer CANNOT change a recall', (await post(`/api/recalls/${rec.body.recall_id}/status`, { status: 'completed' }, T.manufacturer)).status === 403);

console.log('--- schema + reports are regulator-only ---');
const sch = await get('/api/schema', T.regulator);
check('schema ok', sch.body?.ok === true);
check('schema 12 tables', sch.body?.tables?.length === 12, String(sch.body?.tables?.length));
check('schema 2 views', sch.body?.views?.length === 2);
check('schema 4 triggers', sch.body?.triggers?.length === 4, String(sch.body?.triggers?.length));
check('schema DDL for all tables', Object.keys(sch.body?.ddl || {}).length === 12);
const batches = sch.body?.tables?.find(t => t.name === 'batches');
check('batches PK = batch_id', batches?.primaryKey?.[0] === 'batch_id');
check('batches has 2 FKs', batches?.foreignKeys?.length === 2);
check('batches status is ENUM', batches?.columns?.find(c => c.name === 'status')?.type?.startsWith('enum'));
check('schema blocked for manufacturer', (await get('/api/schema', T.manufacturer)).status === 403);
check('schema blocked for customer', (await get('/api/schema', T.customer)).status === 403);
const ql = await get('/api/queries', T.regulator);
check('9 report queries', ql.body?.queries?.length === 9, String(ql.body?.queries?.length));
for (const q of ql.body?.queries || []) {
  const r = await get('/api/queries/' + q.id, T.regulator);
  check(`query ${q.id} runs`, r.body?.ok === true && Array.isArray(r.body?.rows), r.body?.error || '');
}
check('unknown query → 404', (await get('/api/queries/does_not_exist', T.regulator)).status === 404);
check('reports blocked for pharmacy', (await get('/api/queries', T.pharmacy)).status === 403);

console.log('--- ER diagram matches the live schema ---');
const erExpected = {
  organizations: ['org_id','name','org_type','license_no','address','city','country'],
  medicines: ['medicine_id','name','composition','dosage_form','strength','manufacturer_id'],
  batches: ['batch_id','batch_code','medicine_id','manufacturer_id','mfg_date','expiry_date','quantity','status'],
  shipments: ['shipment_id','from_org_id','to_org_id','shipped_at','received_at','status'],
  shipment_items: ['shipment_id','batch_id','quantity'],
  inventory: ['org_id','batch_id','quantity_on_hand','last_updated'],
  customers: ['customer_id','name','phone','email'],
  sales: ['sale_id','pharmacy_id','customer_id','sale_date','total_amount'],
  sale_items: ['sale_id','batch_id','quantity','unit_price'],
  recalls: ['recall_id','batch_id','regulator_id','reason','severity','recall_date','status','decision_note'],
  verification_scans: ['scan_id','batch_code_entered','batch_id','customer_id','scanned_at','result'],
  audit_log: ['log_id','batch_id','old_status','new_status','changed_by_org_id','changed_at','reason'],
};
for (const [t, cols] of Object.entries(erExpected)) {
  const live = sch.body?.tables?.find(x => x.name === t)?.columns?.map(c => c.name) || [];
  check(`ER ${t} columns match`, JSON.stringify(live) === JSON.stringify(cols), `live=${JSON.stringify(live)}`);
}

console.log('--- search + dashboard are scoped ---');
const sReg = await get('/api/search?q=para', T.regulator);
check('regulator search returns hits', sReg.body?.hits?.length > 0);
check('search labels never lead with a raw row id', sReg.body.hits.every(h => !/^\d+ · /.test(h.label)));
const sMfr = await get('/api/search?q=para', T.manufacturer);
check('manufacturer search never returns sales rows', !sMfr.body?.hits?.some(h => ['sales', 'customers', 'sale_items'].includes(h.dataset)));
const sNum = await get('/api/search?q=1', T.regulator);
check('numeric search does not match every row by id', sNum.body.hits.every(h => !/^\d+ · /.test(h.label)));
const dReg = await get('/api/dashboard', T.regulator);
const dMfr = await get('/api/dashboard', T.manufacturer);
check('regulator dashboard ok', dReg.body?.ok === true);
check('manufacturer dashboard has no sales block', Array.isArray(dMfr.body?.salesByPharmacy) && dMfr.body.salesByPharmacy.length === 0);
check('customer dashboard ok', (await get('/api/dashboard', T.customer)).body?.ok === true);

console.log('--- onboarding: customers self-register, staff apply, regulators are admin-made ---');
const uniq = 'e2e.' + Date.now() + '@example.test';
check('public signup as regulator is REFUSED (403)', (await post('/api/signup', { name: 'Evil Reg', email: uniq, role: 'regulator', password: 'secret123', confirm: 'secret123' })).status === 403);
check('public signup as pharmacy is REFUSED (403)', (await post('/api/signup', { name: 'Evil Pharm', email: uniq, role: 'pharmacy', org_id: 5, password: 'secret123', confirm: 'secret123' })).status === 403);
check('public signup as admin is REFUSED (403)', (await post('/api/signup', { name: 'Evil Admin', email: uniq, role: 'admin', password: 'secret123', confirm: 'secret123' })).status === 403);
const cust = await post('/api/signup', { name: 'E2E Customer', email: uniq, role: 'customer', password: 'secret123', confirm: 'secret123' });
check('customer signup succeeds', cust.body?.ok === true && cust.body?.user?.role === 'customer');
check('customer has no organization', cust.body?.user?.org === 'Not listed / individual');
check('short password rejected', (await post('/api/signup', { name: 'Weak', email: 'w.' + uniq, role: 'customer', password: 'abc', confirm: 'abc' })).status === 400);
check('mismatched confirm rejected', (await post('/api/signup', { name: 'Mismatch', email: 'm.' + uniq, role: 'customer', password: 'secret123', confirm: 'secret124' })).status === 400);
check('duplicate email rejected (409)', (await post('/api/signup', { name: 'Dupe', email: 'asha.mehta@cdsco.gov.in', role: 'customer', password: 'secret123', confirm: 'secret123' })).status === 409);

const applEmail = 'apply.' + Date.now() + '@example.test';
const appl = await post('/api/account-requests', { name: 'Apply Pharm', email: applEmail, role: 'pharmacy', org_id: 5, password: 'secret123', confirm: 'secret123', note: 'license 123' });
check('staff application accepted', appl.body?.ok === true && appl.body?.pending === true);
check('application with a mismatched organization rejected', (await post('/api/account-requests', { name: 'Bad Org', email: 'bo.' + uniq, role: 'pharmacy', org_id: 8, password: 'secret123', confirm: 'secret123' })).status === 400);
check('application cannot sign in before approval', (await post('/api/login', { email: applEmail, password: 'secret123' })).status === 401);
const queue = await get('/api/account-requests', T.regulator);
check('regulator sees the pending application', queue.body?.requests?.some(r => r.email === applEmail && r.status === 'pending'));
check('manufacturer CANNOT see the application queue', (await get('/api/account-requests', T.manufacturer)).status === 403);
const reqId = queue.body.requests.find(r => r.email === applEmail).request_id;
check('regulator approves the application', (await post(`/api/account-requests/${reqId}/decision`, { decision: 'approve' }, T.regulator)).body?.ok === true);
check('approved account can now sign in', (await post('/api/login', { email: applEmail, password: 'secret123' })).body?.ok === true);
check('deciding twice is refused (409)', (await post(`/api/account-requests/${reqId}/decision`, { decision: 'reject' }, T.regulator)).status === 409);

console.log('--- live database watch (real-time changes) ---');
const st1 = await get('/api/changes/status');
check('changes/status ok', st1.body?.ok === true);
check('status fingerprints 12 tables', Object.keys(st1.body?.tables || {}).length === 12, String(Object.keys(st1.body?.tables || {}).length));
const sseEvents = [];
const sseCtrl = new AbortController();
const sseRes = await fetch(B + '/api/changes/stream', { signal: sseCtrl.signal });
check('changes/stream is event-stream', sseRes.headers.get('content-type')?.includes('text/event-stream'));
(async () => {
  const reader = sseRes.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf('\n\n')) >= 0) {
        const chunk = buf.slice(0, i); buf = buf.slice(i + 2);
        const ev = (chunk.match(/^event: (.+)$/m) || [])[1];
        const data = (chunk.match(/^data: (.+)$/m) || [])[1];
        if (ev === 'change') sseEvents.push(JSON.parse(data));
      }
    }
  } catch {}
})();
await new Promise((r) => setTimeout(r, 400));
const extCode = 'E2E-LIVE-' + Date.now();
const [extIns] = await pool.query(
  "INSERT INTO batches (batch_code, medicine_id, manufacturer_id, mfg_date, expiry_date, quantity, status) VALUES (?, 1, 1, '2026-01-01', '2028-01-01', 42, 'genuine')",
  [extCode]
);
await new Promise((r) => setTimeout(r, 3500));
check('external INSERT raises a change event', sseEvents.length >= 1, `events=${sseEvents.length}`);
check('change event names the batches table', sseEvents.some((e) => e.changed.includes('batches')));
const sigAfter = await get('/api/changes/status');
check('fingerprint differs after the INSERT', sigAfter.body?.tables?.batches !== st1.body?.tables?.batches);
await pool.query('DELETE FROM audit_log WHERE batch_id = ?', [extIns.insertId]);
await pool.query('DELETE FROM batches WHERE batch_id = ?', [extIns.insertId]);
sseCtrl.abort();
await new Promise((r) => setTimeout(r, 200));

console.log(`\n==== ${pass} passed, ${fail} failed ====`);
await authPool.query('DELETE FROM account_requests WHERE email LIKE ?', ['apply.%@example.test']);
await authPool.query('DELETE FROM users WHERE email LIKE ? OR email LIKE ? OR email = ?', ['e2e.%@example.test', 'apply.%@example.test', uniq]);
await authPool.end();
process.exit(fail ? 1 : 0);
