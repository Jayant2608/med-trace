// Access control: which datasets each role may open, and the SQL that limits
// every read to the rows that role is allowed to see. This is the single source
// of truth for row-level security — the API never trusts a role or org id sent
// by the client, it always derives them from the signed-in account.

export const DATASETS = {
  organizations: {
    title: 'Organizations',
    desc: 'Everyone who handles medicine: manufacturers, distributors, pharmacies and regulators.',
    sql: `SELECT o.org_id, o.name, o.org_type, o.license_no, o.address, o.city, o.country
          FROM organizations o`,
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
          FROM medicines m JOIN organizations o ON o.org_id = m.manufacturer_id`,
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
          JOIN organizations o ON o.org_id = b.manufacturer_id`,
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
          JOIN organizations o2 ON o2.org_id = s.to_org_id`,
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
          FROM shipment_items si JOIN batches b ON b.batch_id = si.batch_id`,
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
          JOIN batches b ON b.batch_id = i.batch_id`,
    columns: [
      { key: 'organization', label: 'Organization', kind: 'org' },
      { key: 'batch_code', label: 'Batch Code', kind: 'code' },
      { key: 'quantity_on_hand', label: 'On Hand', kind: 'number' },
      { key: 'last_updated', label: 'Last Updated', kind: 'date' },
    ],
  },
  customers: {
    title: 'Customers',
    desc: 'People who bought medicine from a pharmacy. Personal data — restricted.',
    sql: `SELECT customer_id, name, phone, email FROM customers`,
    columns: [
      { key: 'customer_id', label: 'Customer ID', kind: 'id' },
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
    ],
    pii: true,
  },
  sales: {
    title: 'Sales',
    desc: 'One bill per sale, from a pharmacy to a customer.',
    sql: `SELECT s.sale_id, o.name AS pharmacy, c.name AS customer,
                 s.sale_date, s.total_amount
          FROM sales s
          JOIN organizations o ON o.org_id = s.pharmacy_id
          JOIN customers c ON c.customer_id = s.customer_id`,
    columns: [
      { key: 'sale_id', label: 'Sale ID', kind: 'id' },
      { key: 'pharmacy', label: 'Pharmacy', kind: 'org' },
      { key: 'customer', label: 'Customer', kind: 'customer' },
      { key: 'sale_date', label: 'Sale Date', kind: 'date' },
      { key: 'total_amount', label: 'Total', kind: 'money' },
    ],
    pii: true,
  },
  sale_items: {
    title: 'Sale items',
    desc: 'The lines on each bill.',
    sql: `SELECT si.sale_id, b.batch_code, si.quantity, si.unit_price
          FROM sale_items si JOIN batches b ON b.batch_id = si.batch_id`,
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
          JOIN organizations o ON o.org_id = r.regulator_id`,
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
                 v.scanned_at, v.result
          FROM verification_scans v
          LEFT JOIN batches b ON b.batch_id = v.batch_id`,
    columns: [
      { key: 'scan_id', label: 'Scan ID', kind: 'id' },
      { key: 'batch_code_entered', label: 'Code Entered', kind: 'code' },
      { key: 'matched_code', label: 'Matched Batch', kind: 'code' },
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
          LEFT JOIN organizations o ON o.org_id = a.changed_by_org_id`,
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

export const ALL_DATASETS = Object.keys(DATASETS);

// Which datasets each role can open at all. Regulator and admin see everything;
// customers have no dataset access (they only get the public verify page).
export const ACCESS = {
  admin: ALL_DATASETS,
  regulator: ALL_DATASETS,
  manufacturer: ['medicines', 'batches', 'shipments', 'shipment_items', 'inventory', 'recalls', 'verification_scans', 'audit_log'],
  distributor: ['medicines', 'batches', 'shipments', 'shipment_items', 'inventory', 'recalls', 'verification_scans'],
  pharmacy: ['medicines', 'batches', 'inventory', 'customers', 'sales', 'sale_items', 'recalls', 'verification_scans'],
  customer: [],
};

export const GROUPS = [
  ['Master data', ['organizations', 'medicines', 'batches']],
  ['Movement', ['shipments', 'shipment_items', 'inventory']],
  ['Sales', ['customers', 'sales', 'sale_items']],
  ['Safety', ['recalls', 'verification_scans', 'audit_log']],
];

// Roles that act on behalf of one organization and therefore only ever see
// that organization's rows.
const isStaff = (role) => ['manufacturer', 'distributor', 'pharmacy'].includes(role);
const isGlobal = (role) => role === 'regulator' || role === 'admin';

// SQL for "the batch ids this user may see", reused by every batch-related
// dataset so the isolation rule is written once.
function visibleBatches(role, orgId) {
  if (isGlobal(role)) return { sql: 'SELECT batch_id FROM batches', params: [] };
  if (role === 'manufacturer') return { sql: 'SELECT batch_id FROM batches WHERE manufacturer_id = ?', params: [orgId] };
  if (role === 'distributor') {
    return {
      sql: `SELECT batch_id FROM batches WHERE batch_id IN (SELECT batch_id FROM inventory WHERE org_id = ?)
            OR batch_id IN (SELECT si.batch_id FROM shipment_items si JOIN shipments s ON s.shipment_id = si.shipment_id
                            WHERE s.from_org_id = ? OR s.to_org_id = ?)`,
      params: [orgId, orgId, orgId],
    };
  }
  if (role === 'pharmacy') {
    return {
      sql: `SELECT batch_id FROM batches WHERE batch_id IN (SELECT batch_id FROM inventory WHERE org_id = ?)
            OR batch_id IN (SELECT si.batch_id FROM sale_items si JOIN sales sa ON sa.sale_id = si.sale_id
                            WHERE sa.pharmacy_id = ?)`,
      params: [orgId, orgId],
    };
  }
  return { sql: 'SELECT batch_id FROM batches WHERE 1 = 0', params: [] }; // customer / unknown: nothing
}

// The WHERE clause (and its parameters) that restrict one dataset to the rows
// this user may see. Returns { where, params } — where may be empty for a role
// that can see everything.
export function scopeFor(dataset, user) {
  const role = user?.role;
  const orgId = user?.orgId ?? null;
  if (isGlobal(role)) return { where: '', params: [] };

  switch (dataset) {
    case 'organizations':
      // Staff see only their own organization; the customer sees none.
      return isStaff(role) ? { where: 'WHERE o.org_id = ?', params: [orgId] } : { where: 'WHERE 1 = 0', params: [] };

    case 'medicines': {
      if (role === 'manufacturer') return { where: 'WHERE m.manufacturer_id = ?', params: [orgId] };
      const vb = visibleBatches(role, orgId);
      return { where: `WHERE m.medicine_id IN (SELECT medicine_id FROM batches WHERE batch_id IN (${vb.sql}))`, params: vb.params };
    }

    case 'batches': {
      if (role === 'manufacturer') return { where: 'WHERE b.manufacturer_id = ?', params: [orgId] };
      const vb = visibleBatches(role, orgId);
      return { where: `WHERE b.batch_id IN (${vb.sql})`, params: vb.params };
    }

    case 'shipments':
      return isStaff(role) ? { where: 'WHERE s.from_org_id = ? OR s.to_org_id = ?', params: [orgId, orgId] } : { where: 'WHERE 1 = 0', params: [] };

    case 'shipment_items':
      return isStaff(role)
        ? { where: 'WHERE si.shipment_id IN (SELECT shipment_id FROM shipments WHERE from_org_id = ? OR to_org_id = ?)', params: [orgId, orgId] }
        : { where: 'WHERE 1 = 0', params: [] };

    case 'inventory':
      return isStaff(role) ? { where: 'WHERE i.org_id = ?', params: [orgId] } : { where: 'WHERE 1 = 0', params: [] };

    case 'customers':
      // Only a pharmacy sees the customers it sold to; nobody else.
      return role === 'pharmacy'
        ? { where: 'WHERE customer_id IN (SELECT customer_id FROM sales WHERE pharmacy_id = ?)', params: [orgId] }
        : { where: 'WHERE 1 = 0', params: [] };

    case 'sales':
      return role === 'pharmacy' ? { where: 'WHERE s.pharmacy_id = ?', params: [orgId] } : { where: 'WHERE 1 = 0', params: [] };

    case 'sale_items':
      return role === 'pharmacy'
        ? { where: 'WHERE si.sale_id IN (SELECT sale_id FROM sales WHERE pharmacy_id = ?)', params: [orgId] }
        : { where: 'WHERE 1 = 0', params: [] };

    case 'recalls': {
      const vb = visibleBatches(role, orgId);
      return { where: `WHERE r.batch_id IN (${vb.sql})`, params: vb.params };
    }

    case 'verification_scans': {
      const vb = visibleBatches(role, orgId);
      return { where: `WHERE v.batch_id IN (${vb.sql})`, params: vb.params };
    }

    case 'audit_log': {
      const vb = visibleBatches(role, orgId);
      return { where: `WHERE a.batch_id IN (${vb.sql})`, params: vb.params };
    }

    default:
      return { where: 'WHERE 1 = 0', params: [] };
  }
}

// The full, scoped SQL for a dataset and a user (dataset.sql has no ORDER BY /
// WHERE of its own, so we append the scope and the ordering).
export function scopedSql(dataset, user) {
  const d = DATASETS[dataset];
  const { where, params } = scopeFor(dataset, user);
  return { sql: `${d.sql} ${where} ORDER BY 1`.trim(), params };
}

export const canSee = (role, dataset) => (ACCESS[role] || []).includes(dataset);
