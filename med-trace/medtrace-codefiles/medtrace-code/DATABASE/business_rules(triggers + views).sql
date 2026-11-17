-- MedTrace business rules: triggers, views and the operational tables the
-- website needs on top of the core 12-table ER model.
-- Loaded AFTER medtrace_script.sql (which creates the schema and sample data).
--
-- The project script itself has no triggers/views; these add the enforcement
-- the website demonstrates: block bad sales, keep an audit trail, drive the
-- recall lifecycle, and the views used by the trace feature.
USE medicine_traceability;

DROP TRIGGER IF EXISTS trg_block_bad_sale;
DROP TRIGGER IF EXISTS trg_audit_batch_status;
DROP TRIGGER IF EXISTS trg_recall_sets_status;
DROP TRIGGER IF EXISTS trg_recall_lifecycle;
DROP VIEW IF EXISTS v_batch_flow;
DROP VIEW IF EXISTS v_batch_customers;
DROP TABLE IF EXISTS recall_acknowledgements;

-- Operational extension (not part of the core ER diagram): a pharmacy or
-- distributor signs off on a recall so the regulator can see who has acted.
CREATE TABLE recall_acknowledgements (
  recall_id       INT NOT NULL,
  org_id          INT NOT NULL,
  acknowledged_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ack_by_user_id  INT NULL,
  note            VARCHAR(250) NULL,
  PRIMARY KEY (recall_id, org_id),
  FOREIGN KEY (recall_id) REFERENCES recalls(recall_id) ON DELETE CASCADE,
  FOREIGN KEY (org_id)    REFERENCES organizations(org_id)
);

-- A scan can end 'suspected_fake' as well, so a counterfeit batch reads
-- differently from a recalled one on the public verify result.
ALTER TABLE verification_scans
  MODIFY result ENUM('genuine','recalled','suspected_fake','expired','unknown') NOT NULL;

-- The regulator's note when a recall is completed or withdrawn.
ALTER TABLE recalls ADD COLUMN decision_note VARCHAR(250) NULL;

DELIMITER $$

-- Business rule: a batch that is recalled, suspected fake or expired cannot be sold.
CREATE TRIGGER trg_block_bad_sale
BEFORE INSERT ON sale_items
FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(20);
    DECLARE v_expiry DATE;
    DECLARE v_stock  INT;
    SELECT status, expiry_date INTO v_status, v_expiry
      FROM batches WHERE batch_id = NEW.batch_id;

    IF v_status = 'recalled' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Sale blocked: batch is recalled.';
    ELSEIF v_status = 'suspected_fake' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Sale blocked: batch is suspected counterfeit.';
    ELSEIF v_status = 'expired' OR v_expiry < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Sale blocked: batch is expired.';
    END IF;

    -- Stock must exist for the selling pharmacy. The actor's organization is
    -- passed in a session variable by the API (the only writer of sales).
    IF @medtrace_actor_org_id IS NOT NULL THEN
        SELECT quantity_on_hand INTO v_stock FROM inventory
          WHERE org_id = @medtrace_actor_org_id AND batch_id = NEW.batch_id;
        IF v_stock IS NULL OR v_stock < NEW.quantity THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Sale blocked: not enough stock on hand.';
        END IF;
    END IF;
END$$

-- Audit trail: record every batch status change automatically, with the
-- organization that caused it (taken from the API's session variable).
CREATE TRIGGER trg_audit_batch_status
AFTER UPDATE ON batches
FOR EACH ROW
BEGIN
    IF NEW.status <> OLD.status THEN
        INSERT INTO audit_log (batch_id, old_status, new_status, changed_by_org_id, reason)
        VALUES (NEW.batch_id, OLD.status, NEW.status, @medtrace_actor_org_id, @medtrace_audit_reason);
    END IF;
END$$

-- Issuing an active recall flips the batch status to 'recalled'.
CREATE TRIGGER trg_recall_sets_status
AFTER INSERT ON recalls
FOR EACH ROW
BEGIN
    IF NEW.status = 'active' THEN
        SET @medtrace_audit_reason = CONCAT('Recall #', NEW.recall_id, ': ', NEW.reason);
        UPDATE batches SET status = 'recalled' WHERE batch_id = NEW.batch_id;
    END IF;
END$$

-- Recall lifecycle: withdrawing a recall returns the batch to genuine, unless
-- it is flagged fake or already expired. Completing a recall keeps it recalled.
CREATE TRIGGER trg_recall_lifecycle
AFTER UPDATE ON recalls
FOR EACH ROW
BEGIN
    IF NEW.status = 'withdrawn' AND OLD.status <> 'withdrawn' THEN
        SET @medtrace_audit_reason = CONCAT('Recall #', NEW.recall_id, ' withdrawn: ',
            COALESCE(NEW.decision_note, 'no reason given'));
        UPDATE batches b
           SET b.status = CASE
                 WHEN b.status = 'suspected_fake' THEN 'suspected_fake'
                 WHEN b.expiry_date < CURDATE()  THEN 'expired'
                 ELSE 'genuine'
               END
         WHERE b.batch_id = NEW.batch_id AND b.status = 'recalled';
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
