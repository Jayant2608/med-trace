-- MedTrace account store.
-- Kept in its own database so the traceability schema (medicine_traceability)
-- stays exactly the 12 tables shown in the ER diagram. Accounts are a website
-- concern, not part of the medicine-tracking domain model.
CREATE DATABASE IF NOT EXISTS medtrace_auth
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE medtrace_auth;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(160) NOT NULL,
  role          ENUM('regulator','manufacturer','distributor','pharmacy','customer') NOT NULL,
  org_id        INT NULL,                -- organizations.org_id; NULL for individual customers
  password_hash VARCHAR(200) NOT NULL,   -- "scrypt$<salt>$<hash>"; never the raw password
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME NULL,
  UNIQUE KEY uq_users_email (email)
);
