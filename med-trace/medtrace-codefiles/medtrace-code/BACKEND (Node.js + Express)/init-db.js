// Creates the schema, loads sample data and installs the triggers.
// Usage: npm run init-db
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import mysql from 'mysql2/promise';
import { hashPassword } from './auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// medtrace_script.sql is the project's own script: it creates the database, all
// tables and the sample data (the single versioned seed). business_rules.sql
// then adds the triggers, views and operational tables the website needs.
// auth.sql creates the account store.
const files = [
  join(rootDir, 'medtrace_script.sql'),
  join(rootDir, 'db', 'business_rules.sql'),
  join(rootDir, 'db', 'auth.sql'),
];

const conn = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'medtrace',
  multipleStatements: true,
});

// Splits a .sql file into individual statements. Understands the `DELIMITER`
// directive (used for trigger bodies) which the mysql CLI supports but a driver
// does not, so we handle it ourselves.
function splitStatements(sql) {
  const stmts = [];
  let delim = ';';
  let buf = '';
  for (const line of sql.split('\n')) {
    const m = line.match(/^\s*DELIMITER\s+(\S+)\s*$/i);
    if (m) { delim = m[1]; continue; }
    buf += line + '\n';
    if (buf.trimEnd().endsWith(delim)) {
      const stmt = buf.trimEnd().slice(0, -delim.length).trim();
      if (stmt) stmts.push(stmt);
      buf = '';
    }
  }
  if (buf.trim()) stmts.push(buf.trim());
  return stmts;
}

for (const file of files) {
  const name = file.split('/').pop();
  process.stdout.write(`Running ${name}... `);
  const sql = readFileSync(file, 'utf8');
  const statements = name === 'medtrace_script.sql' ? [sql] : splitStatements(sql);
  for (const statement of statements) {
    await conn.query(statement);
  }
  console.log(`done (${statements.length} statement${statements.length > 1 ? 's' : ''})`);
}

const dbName = process.env.DB_NAME || 'medicine_traceability';
const [rows] = await conn.query(
  "SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = ? AND table_type = 'BASE TABLE'", [dbName]);
const [trg] = await conn.query('SELECT COUNT(*) AS n FROM information_schema.triggers WHERE trigger_schema = ?', [dbName]);

// Seed one demo account per role so every dashboard can be shown without
// signing up first. Passwords are hashed exactly like real signups. This is the
// ONE versioned place demo accounts are defined.
//
// The regulator's organization is resolved from the data (a regulator org in
// India) rather than a hardcoded org_id, so the demo regulator always belongs to
// an Indian regulator organization even if the sample data is reordered.
const [[regOrg]] = await conn.query(
  "SELECT org_id, name FROM medicine_traceability.organizations WHERE org_type = 'regulator' AND country = 'India' ORDER BY org_id LIMIT 1");
if (!regOrg) {
  console.error('Seed data has no regulator organization in India — cannot create the demo regulator.');
  process.exit(1);
}
const [[mfgOrg]] = await conn.query("SELECT org_id FROM medicine_traceability.organizations WHERE org_type = 'manufacturer' ORDER BY org_id LIMIT 1");
const [[dstOrg]] = await conn.query("SELECT org_id FROM medicine_traceability.organizations WHERE org_type = 'distributor' ORDER BY org_id LIMIT 1");
const [[phmOrg]] = await conn.query("SELECT org_id FROM medicine_traceability.organizations WHERE org_type = 'pharmacy' ORDER BY org_id LIMIT 1");

const DEMO = [
  ['Asha Mehta',   'asha.mehta@cdsco.gov.in',   'regulator',    regOrg.org_id, 'demo1234'],
  ['Ravi Kumar',   'ravi.kumar@sunpharma.in',   'manufacturer', mfgOrg.org_id, 'demo1234'],
  ['Neha Sharma',  'neha.sharma@medplus.in',    'distributor',  dstOrg.org_id, 'demo1234'],
  ['Imran Qureshi','imran@apollopharmacy.in',   'pharmacy',     phmOrg.org_id, 'demo1234'],
  ['Priya Nair',   'priya.nair@example.com',    'customer',     null,          'demo1234'],
  ['System Admin', 'admin@medtrace.local',      'admin',        null,          'demo1234'],
];
await conn.query('USE medtrace_auth');
await conn.query('DELETE FROM account_requests');
await conn.query('DELETE FROM users');
for (const [name, email, role, orgId, pw] of DEMO) {
  await conn.query(
    'INSERT INTO users (name, email, role, org_id, password_hash) VALUES (?, ?, ?, ?, ?)',
    [name, email, role, orgId, hashPassword(pw)]);
}

console.log(`Database ready: ${rows[0].n} tables, ${trg[0].n} triggers, ${DEMO.length} demo accounts (regulator: ${regOrg.name}).`);
await conn.end();
