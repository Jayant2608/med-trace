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

// medtrace_script.sql is the project's own script: it creates the database,
// all tables and the sample data. business_rules.sql then adds the triggers
// and views the website needs. auth.sql creates the account store.
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
    if (m) {
      delim = m[1];
      continue;
    }
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

const [rows] = await conn.query(
  "SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = ? AND table_type = 'BASE TABLE'",
  [process.env.DB_NAME || 'medicine_traceability']
);
const [trg] = await conn.query(
  'SELECT COUNT(*) AS n FROM information_schema.triggers WHERE trigger_schema = ?',
  [process.env.DB_NAME || 'medicine_traceability']
);

// Seed demo accounts so the "demo regulator" button and each role can be shown
// without signing up first. Passwords are hashed exactly like real signups.
const DEMO = [
  ['Asha Mehta', 'asha.mehta@cda.gov.in', 'regulator', 8, 'demo1234'],
  ['Ravi Kumar', 'ravi.kumar@medicure.in', 'manufacturer', 1, 'demo1234'],
  ['Neha Sharma', 'neha.sharma@northernmedico.in', 'distributor', 3, 'demo1234'],
  ['Imran Qureshi', 'imran@citycarepharmacy.in', 'pharmacy', 5, 'demo1234'],
  ['Priya Nair', 'priya.nair@example.com', 'customer', null, 'demo1234'],
];
await conn.query('USE medtrace_auth');
await conn.query('DELETE FROM users');
for (const [name, email, role, orgId, pw] of DEMO) {
  await conn.query(
    'INSERT INTO users (name, email, role, org_id, password_hash) VALUES (?, ?, ?, ?, ?)',
    [name, email, role, orgId, hashPassword(pw)]
  );
}

console.log(`Database ready: ${rows[0].n} tables, ${trg[0].n} triggers, ${DEMO.length} demo accounts.`);
await conn.end();
