DROP DATABASE IF EXISTS medicine_traceability;

CREATE DATABASE medicine_traceability
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE medicine_traceability;
CREATE TABLE organizations (
  org_id      INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  org_type    ENUM('manufacturer','distributor','pharmacy','regulator') NOT NULL,
  license_no  VARCHAR(40)  NOT NULL UNIQUE,
  address     VARCHAR(200),
  city        VARCHAR(60),
  country     VARCHAR(60)  NOT NULL DEFAULT 'India'
);

CREATE TABLE medicines (
  medicine_id     INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  composition     VARCHAR(200),
  dosage_form     VARCHAR(40),
  strength        VARCHAR(40),
  manufacturer_id INT NOT NULL,
  FOREIGN KEY (manufacturer_id) REFERENCES organizations(org_id)
);

CREATE TABLE customers (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  phone       VARCHAR(15),
  email       VARCHAR(100) UNIQUE
);
CREATE TABLE batches (
  batch_id        INT AUTO_INCREMENT PRIMARY KEY,
  batch_code      VARCHAR(40) NOT NULL UNIQUE,
  medicine_id     INT NOT NULL,
  manufacturer_id INT NOT NULL,
  mfg_date        DATE NOT NULL,
  expiry_date     DATE NOT NULL,
  quantity        INT  NOT NULL,
  status ENUM('genuine','recalled','suspected_fake','expired') NOT NULL DEFAULT 'genuine',
  FOREIGN KEY (medicine_id)     REFERENCES medicines(medicine_id),
  FOREIGN KEY (manufacturer_id) REFERENCES organizations(org_id),
  CHECK (expiry_date > mfg_date),
  CHECK (quantity > 0)
);

CREATE TABLE shipments (
  shipment_id INT AUTO_INCREMENT PRIMARY KEY,
  from_org_id INT NOT NULL,
  to_org_id   INT NOT NULL,
  shipped_at  DATETIME NOT NULL,
  received_at DATETIME NULL,
  status ENUM('in_transit','delivered','cancelled') NOT NULL DEFAULT 'in_transit',
  FOREIGN KEY (from_org_id) REFERENCES organizations(org_id),
  FOREIGN KEY (to_org_id)   REFERENCES organizations(org_id),
  CHECK (from_org_id <> to_org_id)
);

CREATE TABLE shipment_items (
  shipment_id INT NOT NULL,
  batch_id    INT NOT NULL,
  quantity    INT NOT NULL,
  PRIMARY KEY (shipment_id, batch_id),
  FOREIGN KEY (shipment_id) REFERENCES shipments(shipment_id) ON DELETE CASCADE,
  FOREIGN KEY (batch_id)    REFERENCES batches(batch_id),
  CHECK (quantity > 0)
);

CREATE TABLE inventory (
  org_id           INT NOT NULL,
  batch_id         INT NOT NULL,
  quantity_on_hand INT NOT NULL DEFAULT 0,
  last_updated     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                   ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (org_id, batch_id),
  FOREIGN KEY (org_id)   REFERENCES organizations(org_id),
  FOREIGN KEY (batch_id) REFERENCES batches(batch_id),
  CHECK (quantity_on_hand >= 0)
);
CREATE TABLE sales (
  sale_id      INT AUTO_INCREMENT PRIMARY KEY,
  pharmacy_id  INT NOT NULL,
  customer_id  INT NOT NULL,
  sale_date    DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pharmacy_id) REFERENCES organizations(org_id),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE sale_items (
  sale_id    INT NOT NULL,
  batch_id   INT NOT NULL,
  quantity   INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (sale_id, batch_id),
  FOREIGN KEY (sale_id)  REFERENCES sales(sale_id) ON DELETE CASCADE,
  FOREIGN KEY (batch_id) REFERENCES batches(batch_id),
  CHECK (quantity > 0)
);
CREATE TABLE verification_scans (
  scan_id            INT AUTO_INCREMENT PRIMARY KEY,
  batch_code_entered VARCHAR(40) NOT NULL,
  batch_id           INT NULL,
  customer_id        INT NULL,
  scanned_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  result ENUM('genuine','recalled','expired','unknown') NOT NULL,
  FOREIGN KEY (batch_id)    REFERENCES batches(batch_id),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE recalls (
  recall_id    INT AUTO_INCREMENT PRIMARY KEY,
  batch_id     INT NOT NULL,
  regulator_id INT NOT NULL,
  reason       VARCHAR(250) NOT NULL,
  severity     ENUM('low','medium','high','critical') NOT NULL,
  recall_date  DATE NOT NULL,
  status       ENUM('active','completed','withdrawn') NOT NULL DEFAULT 'active',
  FOREIGN KEY (batch_id)     REFERENCES batches(batch_id),
  FOREIGN KEY (regulator_id) REFERENCES organizations(org_id)
);

CREATE TABLE audit_log (
  log_id            INT AUTO_INCREMENT PRIMARY KEY,
  batch_id          INT NOT NULL,
  old_status        ENUM('genuine','recalled','suspected_fake','expired') NOT NULL,
  new_status        ENUM('genuine','recalled','suspected_fake','expired') NOT NULL,
  changed_by_org_id INT NULL,
  changed_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reason            VARCHAR(250),
  FOREIGN KEY (batch_id)          REFERENCES batches(batch_id),
  FOREIGN KEY (changed_by_org_id) REFERENCES organizations(org_id)
);
INSERT INTO organizations (org_id, name, org_type, license_no, address, city, country) VALUES
(1, 'MediCure Pharma',              'manufacturer', 'MFG-GJ-1001', 'Plot 12, GIDC Vatva',      'Ahmedabad', 'India'),
(2, 'HealWell Laboratories',        'manufacturer', 'MFG-TS-2002', 'Genome Valley Phase 2',    'Hyderabad', 'India'),
(3, 'Northern Medico Distributors', 'distributor',  'DST-DL-3001', 'Azadpur Mandi Road',       'Delhi',     'India'),
(4, 'Southern Pharma Supply',       'distributor',  'DST-TN-3002', 'Guindy Industrial Estate', 'Chennai',   'India'),
(5, 'CityCare Pharmacy',            'pharmacy',     'PHM-DL-4001', 'Connaught Place, Block A', 'Delhi',     'India'),
(6, 'LifeLine Chemist',             'pharmacy',     'PHM-DL-4002', 'Lajpat Nagar Market',      'Delhi',     'India'),
(7, 'GreenCross Pharmacy',          'pharmacy',     'PHM-TN-4003', 'T Nagar Main Road',        'Chennai',   'India'),
(8, 'Central Drugs Authority',      'regulator',    'REG-IN-0001', 'FDA Bhawan, Kotla Road',   'New Delhi', 'India');

INSERT INTO medicines (medicine_id, name, composition, dosage_form, strength, manufacturer_id) VALUES
(1, 'Paracetamol',        'Paracetamol IP',          'Tablet',  '500 mg', 1),
(2, 'Amoxicillin',        'Amoxicillin Trihydrate',  'Capsule', '250 mg', 2),
(3, 'Cetirizine',         'Cetirizine Hydrochloride','Tablet',  '10 mg',  1),
(4, 'Azithromycin',       'Azithromycin Dihydrate',  'Tablet',  '500 mg', 2),
(5, 'Cough Relief Syrup', 'Dextromethorphan + CPM',  'Syrup',   '100 ml', 1);

INSERT INTO customers (customer_id, name, phone, email) VALUES
(1, 'Rohan Mehta',  '9810011111', 'rohan.mehta@example.com'),
(2, 'Priya Sharma', '9810022222', 'priya.sharma@example.com'),
(3, 'Amit Verma',   '9810033333', 'amit.verma@example.com'),
(4, 'Sneha Iyer',   '9840044444', 'sneha.iyer@example.com'),
(5, 'Karan Singh',  '9810055555', 'karan.singh@example.com'),
(6, 'Neha Gupta',   '9810066666', 'neha.gupta@example.com');

INSERT INTO batches (batch_id, batch_code, medicine_id, manufacturer_id, mfg_date, expiry_date, quantity, status) VALUES
(1, 'PCM-2025-A01', 1, 1, '2025-06-01', '2027-05-31', 10000, 'genuine'),
(2, 'PCM-2025-B02', 1, 1, '2025-09-01', '2027-08-31',  8000, 'recalled'),
(3, 'AMX-2025-A01', 2, 2, '2025-03-15', '2027-03-14',  5000, 'genuine'),
(4, 'CTZ-2024-A01', 3, 1, '2024-01-10', '2026-01-09',  6000, 'expired'),
(5, 'AZT-2025-C01', 4, 2, '2025-07-20', '2027-07-19',  4000, 'genuine'),
(6, 'SYR-2025-A01', 5, 1, '2025-11-05', '2027-11-04',  3000, 'suspected_fake'),
(7, 'PCM-2026-A01', 1, 1, '2026-02-01', '2028-01-31', 12000, 'genuine'),
(8, 'AMX-2024-Z09', 2, 2, '2024-02-01', '2026-01-31',  2000, 'expired');

INSERT INTO shipments (shipment_id, from_org_id, to_org_id, shipped_at, received_at, status) VALUES
(1,  1, 3, '2025-07-01 10:00:00', '2025-07-03 15:30:00', 'delivered'),
(2,  2, 4, '2025-04-01 09:00:00', '2025-04-04 12:00:00', 'delivered'),
(3,  3, 5, '2025-07-15 11:00:00', '2025-07-16 14:00:00', 'delivered'),
(4,  3, 6, '2025-10-01 10:30:00', '2025-10-02 13:00:00', 'delivered'),
(5,  4, 7, '2025-05-01 09:30:00', '2025-05-03 16:00:00', 'delivered'),
(6,  1, 3, '2026-03-01 08:00:00', NULL,                  'in_transit'),
(7,  2, 4, '2025-08-01 10:00:00', '2025-08-03 11:30:00', 'delivered'),
(8,  4, 7, '2025-08-15 10:00:00', '2025-08-17 12:00:00', 'delivered'),
(9,  1, 3, '2024-03-01 09:00:00', '2024-03-03 10:00:00', 'delivered'),
(10, 2, 4, '2024-03-10 09:00:00', '2024-03-13 10:00:00', 'delivered');

INSERT INTO shipment_items (shipment_id, batch_id, quantity) VALUES
(1, 1, 3000), (1, 2, 2000),
(2, 3, 2000),
(3, 1,  500), (3, 2,  300),
(4, 1,  400), (4, 2,  200),
(5, 3,  800),
(6, 7, 5000),
(7, 5, 1500),
(8, 5,  600),
(9, 4, 1000),
(10, 8, 500);

INSERT INTO inventory (org_id, batch_id, quantity_on_hand, last_updated) VALUES
(1, 7, 7000, '2026-03-01 08:00:00'),
(3, 1, 2100, '2025-10-01 10:30:00'),
(3, 2, 1500, '2025-10-01 10:30:00'),
(3, 4,  600, '2025-06-01 10:00:00'),
(4, 3, 1200, '2025-05-01 09:30:00'),
(4, 5,  900, '2025-08-15 10:00:00'),
(4, 8,  200, '2025-02-01 10:00:00'),
(5, 1,  493, '2025-11-02 18:00:00'),
(5, 2,  296, '2025-09-18 17:00:00'),
(6, 1,  396, '2025-10-20 16:00:00'),
(6, 2,  197, '2026-01-15 12:00:00'),
(7, 3,  798, '2025-10-25 15:00:00'),
(7, 5,  599, '2025-10-25 15:00:00');

INSERT INTO sales (sale_id, pharmacy_id, customer_id, sale_date, total_amount) VALUES
(1, 5, 1, '2025-09-10',  90.00),
(2, 5, 2, '2025-09-18',  90.00),
(3, 6, 3, '2025-10-20', 180.00),
(4, 7, 4, '2025-10-25', 490.00),
(5, 5, 5, '2025-11-02', 150.00),
(6, 6, 1, '2026-01-15',  30.00);

INSERT INTO sale_items (sale_id, batch_id, quantity, unit_price) VALUES
(1, 1, 2,  30.00), (1, 2, 1,  30.00),
(2, 2, 3,  30.00),
(3, 1, 4,  30.00), (3, 2, 2,  30.00),
(4, 3, 2, 120.00), (4, 5, 1, 250.00),
(5, 1, 5,  30.00),
(6, 2, 1,  30.00);

INSERT INTO verification_scans (scan_id, batch_code_entered, batch_id, customer_id, scanned_at, result) VALUES
(1, 'PCM-2025-A01', 1,    1,    '2025-09-11 09:15:00', 'genuine'),
(2, 'PCM-2025-B02', 2,    2,    '2026-01-12 18:40:00', 'recalled'),
(3, 'CTZ-2024-A01', 4,    3,    '2026-02-02 11:05:00', 'expired'),
(4, 'FAKE-XYZ-999', NULL, 4,    '2026-03-05 20:10:00', 'unknown'),
(5, 'SYR-2025-A01', 6,    NULL, '2026-02-10 14:25:00', 'recalled'),
(6, 'AMX-2025-A01', 3,    5,    '2025-10-26 10:00:00', 'genuine'),
(7, 'PCM-2026-A01', 7,    NULL, '2026-03-10 09:00:00', 'genuine'),
(8, 'PCM-2025-A1',  NULL, 2,    '2026-03-11 21:30:00', 'unknown');

INSERT INTO recalls (recall_id, batch_id, regulator_id, reason, severity, recall_date, status) VALUES
(1, 2, 8, 'Failed dissolution test in lab sampling',  'high',     '2026-01-10', 'active'),
(2, 6, 8, 'Counterfeit packaging detected in market', 'critical', '2026-02-05', 'active');

INSERT INTO audit_log (log_id, batch_id, old_status, new_status, changed_by_org_id, changed_at, reason) VALUES
(1, 2, 'genuine', 'recalled',       8, '2026-01-10 10:00:00', 'Recall 1: failed dissolution test'),
(2, 6, 'genuine', 'suspected_fake', 8, '2026-02-05 12:00:00', 'Recall 2: counterfeit packaging'),
(3, 4, 'genuine', 'expired',        8, '2026-01-10 00:00:00', 'Expiry date passed'),
(4, 8, 'genuine', 'expired',        8, '2026-02-01 00:00:00', 'Expiry date passed');

SELECT 'organizations' AS tbl, COUNT(*) AS `rows` FROM organizations UNION ALL
SELECT 'medicines', COUNT(*) FROM medicines UNION ALL
SELECT 'customers', COUNT(*) FROM customers UNION ALL
SELECT 'batches', COUNT(*) FROM batches UNION ALL
SELECT 'shipments', COUNT(*) FROM shipments UNION ALL
SELECT 'shipment_items', COUNT(*) FROM shipment_items UNION ALL
SELECT 'inventory', COUNT(*) FROM inventory UNION ALL
SELECT 'sales', COUNT(*) FROM sales UNION ALL
SELECT 'sale_items', COUNT(*) FROM sale_items UNION ALL
SELECT 'verification_scans', COUNT(*) FROM verification_scans UNION ALL
SELECT 'recalls', COUNT(*) FROM recalls UNION ALL
SELECT 'audit_log', COUNT(*) FROM audit_log;