-- MedTrace business rules: triggers and views.
-- Loaded AFTER medtrace_script.sql (which creates the schema and data).
-- The project script itself has no triggers/views; these add the enforcement
-- the website demonstrates: block bad sales, keep an audit trail, auto-recall,
-- and the two views used by the trace feature.
USE medicine_traceability;

DROP TRIGGER IF EXISTS trg_block_bad_sale;
DROP TRIGGER IF EXISTS trg_audit_batch_status;
DROP TRIGGER IF EXISTS trg_recall_sets_status;
DROP VIEW IF EXISTS v_batch_flow;
DROP VIEW IF EXISTS v_batch_customers;

DELIMITER $$

-- Business rule: a batch that is recalled, suspected fake or expired cannot be sold.
CREATE TRIGGER trg_block_bad_sale
BEFORE INSERT ON sale_items
FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(20);
    DECLARE v_expiry DATE;
    SELECT status, expiry_date INTO v_status, v_expiry
      FROM batches WHERE batch_id = NEW.batch_id;

    IF v_status = 'recalled' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Sale blocked: batch is recalled.';
    ELSEIF v_status = 'suspected_fake' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Sale blocked: batch is suspected fake.';
    ELSEIF v_status = 'expired' OR v_expiry < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Sale blocked: batch is expired.';
    END IF;
END$$

-- Audit trail: record every batch status change automatically.
CREATE TRIGGER trg_audit_batch_status
AFTER UPDATE ON batches
FOR EACH ROW
BEGIN
    IF NEW.status <> OLD.status THEN
        INSERT INTO audit_log (batch_id, old_status, new_status, changed_by_org_id, reason)
        VALUES (NEW.batch_id, OLD.status, NEW.status, NULL, 'Status changed automatically');
    END IF;
END$$

-- Issuing an active recall flips the batch status to 'recalled'.
CREATE TRIGGER trg_recall_sets_status
AFTER INSERT ON recalls
FOR EACH ROW
BEGIN
    IF NEW.status = 'active' THEN
        UPDATE batches SET status = 'recalled' WHERE batch_id = NEW.batch_id;
    END IF;
END$$

DELIMITER ;

-- Full forward trace: batch -> shipment -> organizations.
CREATE VIEW v_batch_flow AS
SELECT b.batch_id, b.batch_code, m.name AS medicine, b.status,
       s.shipment_id, o1.name AS from_org, o2.name AS to_org,
       si.quantity, s.shipped_at, s.received_at, s.status AS shipment_status
FROM batches b
JOIN medicines m   ON m.medicine_id = b.medicine_id
JOIN shipment_items si ON si.batch_id = b.batch_id
JOIN shipments s   ON s.shipment_id = si.shipment_id
JOIN organizations o1 ON o1.org_id = s.from_org_id
JOIN organizations o2 ON o2.org_id = s.to_org_id;

-- Who bought a batch: batch -> sale -> customer.
CREATE VIEW v_batch_customers AS
SELECT b.batch_id, b.batch_code, c.customer_id, c.name AS customer,
       c.phone, si.quantity, si.unit_price, s.sale_date, o.name AS pharmacy
FROM batches b
JOIN sale_items si ON si.batch_id = b.batch_id
JOIN sales s       ON s.sale_id = si.sale_id
JOIN customers c   ON c.customer_id = s.customer_id
JOIN organizations o ON o.org_id = s.pharmacy_id;
