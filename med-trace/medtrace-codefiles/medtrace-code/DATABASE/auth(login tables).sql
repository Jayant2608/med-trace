-- MedTrace account store.
-- Kept in its own database so the traceability schema (medicine_traceability)
-- stays exactly the 12 tables shown in the ER diagram. Accounts are a website
-- concern, not part of the medicine-tracking domain model.
--
-- Onboarding policy (enforced here and in server/server.js):
--   * customers self-register
--   * manufacturers / distributors / pharmacies apply and a regulator approves
--   * regulators are created only by a system administrator (npm run create-regulator)
CREATE DATABASE IF NOT EXISTS medtrace_auth
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE medtrace_auth;

DROP TABLE IF EXISTS account_requests;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(160) NOT NULL,
  role          ENUM('admin','regulator','manufacturer','distributor','pharmacy','customer') NOT NULL,
  org_id        INT NULL,                -- organizations.org_id; NULL for individual customers
  password_hash VARCHAR(200) NOT NULL,   -- "scrypt$<salt>$<hash>"; never the raw password
  status        ENUM('active','disabled') NOT NULL DEFAULT 'active',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME NULL,
  UNIQUE KEY uq_users_email (email)
);

-- Applications from staff who want an account. A regulator (or the system
-- administrator) approves or rejects them; only on approval is a `users` row
-- created. The password is hashed at application time so no plaintext is stored.
CREATE TABLE account_requests (
  request_id    INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(160) NOT NULL,
  role          ENUM('manufacturer','distributor','pharmacy') NOT NULL,
  org_id        INT NOT NULL,
  password_hash VARCHAR(200) NOT NULL,
  note          VARCHAR(250) NULL,
  status        ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decided_at    DATETIME NULL,
  decided_by    INT NULL,
  decision_note VARCHAR(250) NULL,
  UNIQUE KEY uq_requests_email (email)
);
