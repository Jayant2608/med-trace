// Live database watch.
//
// The website must reflect changes made to MySQL by *anyone* — MySQL Workbench,
// the mysql CLI, another app — not just changes made through this site's API.
// So instead of hooking only the API, we watch the tables themselves.
//
// Every POLL_MS we fingerprint all 12 tables with `CHECKSUM TABLE` (one
// round-trip, ~15 ms for this dataset) and compare it with the previous
// fingerprint. When it differs we tell every connected browser which tables
// changed, over Server-Sent Events. The browser then re-reads what it shows.
// External INSERT/UPDATE/DELETE is therefore picked up within one poll.
import pool from './db.js';

export const TABLES = [
  'organizations', 'medicines', 'batches', 'shipments', 'shipment_items', 'inventory',
  'customers', 'sales', 'sale_items', 'recalls', 'verification_scans', 'audit_log',
];

const POLL_MS = Number(process.env.LIVE_POLL_MS || 1500);
const CHECKSUM_SQL = 'CHECKSUM TABLE ' + TABLES.map((t) => `\`${t}\``).join(', ');

let last = null;                 // watcher's own previous fingerprint
const clients = new Set();       // connected SSE responses
let timer = null;

// A fingerprint of every table's contents. Pure: it never touches watcher state,
// so the status endpoint and the watcher cannot race each other.
export async function computeSignature() {
  const [rows] = await pool.query(CHECKSUM_SQL);
  const tables = {};
  for (const r of rows) tables[String(r.Table).split('.').pop()] = r.Checksum;
  const signature = TABLES.map((t) => `${t}:${tables[t]}`).join('|');
  return { at: new Date().toISOString(), tables, signature };
}

export const snapshot = computeSignature;

function send(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function broadcast(event, data) {
  for (const res of clients) {
    try { send(res, event, data); } catch { clients.delete(res); }
  }
}

export function subscribe(res) {
  clients.add(res);
  ensureWatcher();
}

export function unsubscribe(res) {
  clients.delete(res);
}

// Announce a change that is not in a watched domain table — e.g. the account
// queue, which lives in the auth database. The client re-reads what it shows.
export function notify(changed) {
  broadcast('change', { at: new Date().toISOString(), changed, tables: last ? last.tables : {} });
}

// One poll: compare the fresh fingerprint with the previous one and announce the
// tables that moved. Self-scheduling so a slow query can never stack up polls.
async function poll() {
  try {
    const next = await computeSignature();
    if (last && next.signature !== last.signature) {
      const changed = TABLES.filter((t) => last.tables[t] !== next.tables[t]);
      broadcast('change', { at: next.at, changed, tables: next.tables });
    }
    last = next;
  } catch (e) {
    broadcast('error', { message: e.message });
  } finally {
    schedule();
  }
}

function schedule() {
  timer = setTimeout(poll, POLL_MS);
  if (timer.unref) timer.unref();
}

function ensureWatcher() {
  if (timer) return;
  if (!last) { poll(); return; }
  schedule();
}
