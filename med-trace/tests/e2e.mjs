const B = 'http://localhost:12000';
import { authPool } from '../server/db.js';
let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name} ${extra}`); }
};
const get = async (p) => { const r = await fetch(B + p); return { status: r.status, body: await r.json().catch(() => null) }; };
const post = async (p, b) => { const r = await fetch(B + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }); return { status: r.status, body: await r.json().catch(() => null) }; };

console.log('--- static assets ---');
for (const f of ['/', '/app.js', '/er-diagram.jpg', '/vendor/chart.umd.min.js']) {
  const r = await fetch(B + f);
  check(`${f} → 200`, r.status === 200, `got ${r.status}`);
}

console.log('--- meta ---');
const meta = await get('/api/meta');
check('meta ok', meta.body?.ok === true);
check('meta has 12 datasets', Object.keys(meta.body?.datasets || {}).length === 12, JSON.stringify(Object.keys(meta.body?.datasets||{}).length));
check('meta stats batches', typeof meta.body?.stats?.batches === 'number');

console.log('--- schema (new) ---');
const sch = await get('/api/schema');
check('schema ok', sch.body?.ok === true);
check('schema 12 tables', sch.body?.tables?.length === 12, String(sch.body?.tables?.length));
check('schema 2 views', sch.body?.views?.length === 2);
check('schema 3 triggers', sch.body?.triggers?.length === 3);
check('schema DDL for all tables', Object.keys(sch.body?.ddl || {}).length === 12);
const batches = sch.body?.tables?.find(t => t.name === 'batches');
check('batches PK = batch_id', batches?.primaryKey?.[0] === 'batch_id');
check('batches has 2 FKs', batches?.foreignKeys?.length === 2);
check('batches status is ENUM', batches?.columns?.find(c => c.name === 'status')?.type?.startsWith('enum'));
const fkTotal = sch.body?.tables?.reduce((a, t) => a + t.foreignKeys.length, 0);
check('19 foreign keys total', fkTotal === 19, String(fkTotal));

console.log('--- ER diagram matches live schema ---');
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
  recalls: ['recall_id','batch_id','regulator_id','reason','severity','recall_date','status'],
  verification_scans: ['scan_id','batch_code_entered','batch_id','customer_id','scanned_at','result'],
  audit_log: ['log_id','batch_id','old_status','new_status','changed_by_org_id','changed_at','reason'],
};
for (const [t, cols] of Object.entries(erExpected)) {
  const live = sch.body?.tables?.find(x => x.name === t)?.columns?.map(c => c.name) || [];
  check(`ER ${t} columns match`, JSON.stringify(live) === JSON.stringify(cols), `live=${JSON.stringify(live)}`);
}

console.log('--- SQL query library (new) ---');
const ql = await get('/api/queries');
check('queries list ok', ql.body?.ok === true);
check('9 queries', ql.body?.queries?.length === 9, String(ql.body?.queries?.length));
for (const q of ql.body?.queries || []) {
  const r = await get('/api/queries/' + q.id);
  check(`query ${q.id} runs`, r.body?.ok === true && Array.isArray(r.body?.rows), r.body?.error || '');
}
const unknown = await get('/api/queries/does_not_exist');
check('unknown query → 404', unknown.status === 404);

console.log('--- datasets ---');
for (const name of Object.keys(meta.body.datasets)) {
  const r = await get('/api/datasets/' + name);
  check(`dataset ${name}`, r.body?.ok === true && Array.isArray(r.body?.rows), r.body?.error || '');
}

console.log('--- verify (POST) ---');
const v1 = await post('/api/verify', { code: 'PCM-2025-A01' });
check('verify genuine', v1.body?.ok === true && v1.body?.result === 'genuine', JSON.stringify(v1.body?.result));
const v2 = await post('/api/verify', { code: 'PCM-2025-B02' });
check('verify recalled', v2.body?.result === 'recalled', JSON.stringify(v2.body?.result));
const v3 = await post('/api/verify', { code: 'CTZ-2024-A01' });
check('verify expired', v3.body?.result === 'expired', JSON.stringify(v3.body?.result));
const v4 = await post('/api/verify', { code: 'NOPE-999' });
check('verify unknown', v4.body?.result === 'unknown', JSON.stringify(v4.body?.result));

console.log('--- business rule: blocked sale ---');
const blocked = await post('/api/sales/attempt', { pharmacy_id: 5, customer_id: 1, batch_id: 2, quantity: 1 });
check('recalled batch sale blocked', blocked.body?.ok === false || blocked.body?.blocked === true, JSON.stringify(blocked.body).slice(0, 200));

console.log('--- dashboard & search ---');
const dash = await get('/api/dashboard');
check('dashboard ok', dash.body?.ok === true, dash.body?.error || '');
const search = await get('/api/search?q=para');
check('search ok', search.body?.ok === true, search.body?.error || '');

console.log('--- auth: login ---');
const goodLogin = await post('/api/login', { email: 'asha.mehta@cda.gov.in', password: 'demo1234' });
check('correct password signs in', goodLogin.body?.ok === true && !!goodLogin.body?.token, JSON.stringify(goodLogin.body).slice(0, 160));
check('login returns role from account', goodLogin.body?.user?.role === 'regulator');
check('login returns org name', goodLogin.body?.user?.org === 'Central Drugs Authority');

const wrongPw = await post('/api/login', { email: 'asha.mehta@cda.gov.in', password: 'not-the-password' });
check('WRONG password is rejected', wrongPw.status === 401 && wrongPw.body?.ok === false, JSON.stringify(wrongPw.body).slice(0, 160));
check('wrong password gives generic message', /incorrect/i.test(wrongPw.body?.error || ''));

const unknownEmail = await post('/api/login', { email: 'nobody@nowhere.test', password: 'demo1234' });
check('unknown email is rejected', unknownEmail.status === 401 && unknownEmail.body?.ok === false);
check('unknown email uses same message as wrong password', unknownEmail.body?.error === wrongPw.body?.error);

const noPw = await post('/api/login', { email: 'asha.mehta@cda.gov.in', password: '' });
check('empty password is rejected', noPw.status === 400);

console.log('--- auth: signup ---');
const uniq = 'e2e.' + Date.now() + '@example.test';
const dup = await post('/api/signup', { name: 'Dupe', email: 'asha.mehta@cda.gov.in', role: 'pharmacy', org_id: 5, password: 'secret123', confirm: 'secret123' });
check('duplicate email rejected (409)', dup.status === 409, String(dup.status));
const mismatch = await post('/api/signup', { name: 'Mismatch', email: uniq, role: 'pharmacy', org_id: 5, password: 'secret123', confirm: 'secret124' });
check('mismatched confirm rejected', mismatch.status === 400 && /match/i.test(mismatch.body?.error || ''));
const weak = await post('/api/signup', { name: 'Weak', email: uniq, role: 'pharmacy', org_id: 5, password: 'abc', confirm: 'abc' });
check('short password rejected', weak.status === 400);
const noNum = await post('/api/signup', { name: 'NoNum', email: uniq, role: 'pharmacy', org_id: 5, password: 'onlyletters', confirm: 'onlyletters' });
check('password without a number rejected', noNum.status === 400);
const badRole = await post('/api/signup', { name: 'BadRole', email: uniq, role: 'hacker', password: 'secret123', confirm: 'secret123' });
check('invalid role rejected', badRole.status === 400);

const newAcc = await post('/api/signup', { name: 'E2E User', email: uniq, role: 'pharmacy', org_id: 5, password: 'secret123', confirm: 'secret123' });
check('valid signup succeeds', newAcc.body?.ok === true && !!newAcc.body?.token, JSON.stringify(newAcc.body).slice(0, 160));
check('signup assigns chosen role', newAcc.body?.user?.role === 'pharmacy');

const newLogin = await post('/api/login', { email: uniq, password: 'secret123' });
check('new account can sign in', newLogin.body?.ok === true);
const newWrong = await post('/api/login', { email: uniq, password: 'secret124' });
check('new account rejects a different password', newWrong.status === 401);

console.log('--- auth: session ---');
const tok = goodLogin.body?.token;
const sess = await fetch(B + '/api/session', { headers: { 'x-auth-token': tok } });
const sessBody = await sess.json().catch(() => null);
check('session restores a valid token', sessBody?.ok === true && sessBody?.user?.email === 'asha.mehta@cda.gov.in');
const tampered = await fetch(B + '/api/session', { headers: { 'x-auth-token': '1.9999999999999.deadbeef' } });
check('tampered token rejected', tampered.status === 401);
const noTok = await get('/api/session');
check('missing token rejected', noTok.status === 401);

console.log(`\n==== ${pass} passed, ${fail} failed ====`);
// Remove the account this run created so repeated runs stay clean.
await authPool.query('DELETE FROM users WHERE email = ?', [uniq]);
await authPool.end();
process.exit(fail ? 1 : 0);
