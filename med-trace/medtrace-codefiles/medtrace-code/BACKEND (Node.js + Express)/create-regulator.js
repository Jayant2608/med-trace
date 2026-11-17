// System administrator task: create a regulator (or admin) account.
// Regulators are never self-registered through the website; they are issued
// here, by someone with access to the server.
//
// Usage:
//   npm run create-regulator -- --name "Asha Mehta" --email asha@cdsco.gov.in \
//     --org 8 --password "secret123"
//   npm run create-regulator -- --name "Root" --email root@medtrace.local \
//     --role admin --password "secret123"
import 'dotenv/config';
import pool, { authPool } from './db.js';
import { hashPassword, passwordProblem } from './auth.js';

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const name = (arg('name') || '').trim();
const email = (arg('email') || '').trim().toLowerCase();
const password = arg('password') || '';
const role = (arg('role') || 'regulator').trim();
const orgArg = arg('org');
const orgId = orgArg ? Number(orgArg) : null;

if (!name || !email || !password) {
  console.error('Usage: npm run create-regulator -- --name "Full Name" --email user@example.org --password "secret123" [--org 8] [--role regulator]');
  process.exit(1);
}
if (!['regulator', 'admin'].includes(role)) {
  console.error('Only --role regulator or --role admin is allowed here.');
  process.exit(1);
}
if (role === 'regulator' && !orgId) {
  console.error('A regulator needs --org <organizations.org_id> (a regulator organization).');
  process.exit(1);
}
const pwErr = passwordProblem(password);
if (pwErr) { console.error(pwErr); process.exit(1); }

try {
  if (orgId) {
    const [[org]] = await pool.query('SELECT org_id, org_type FROM organizations WHERE org_id = ?', [orgId]);
    if (!org) { console.error(`No organization with org_id ${orgId}.`); process.exit(1); }
    if (role === 'regulator' && org.org_type !== 'regulator') {
      console.error(`Organization ${orgId} is a ${org.org_type}, not a regulator.`); process.exit(1);
    }
  }
  const [[dupe]] = await authPool.query('SELECT user_id FROM users WHERE email = ?', [email]);
  if (dupe) { console.error('An account with that email already exists.'); process.exit(1); }
  const [r] = await authPool.query(
    'INSERT INTO users (name, email, role, org_id, password_hash) VALUES (?, ?, ?, ?, ?)',
    [name, email, role, orgId, hashPassword(password)]);
  console.log(`Created ${role} account #${r.insertId} for ${email}.`);
} catch (e) {
  console.error('Failed:', e.message);
  process.exitCode = 1;
} finally {
  await pool.end();
  await authPool.end();
}
