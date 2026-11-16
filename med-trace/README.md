# MedTrace — Medicine Traceability System

A DBMS project: track every medicine batch from the factory to the customer, block the
sale of recalled, fake or expired batches, and let anyone verify a batch code.

The whole application runs on **MySQL 8**. Every table, count, search and trace on the
website is a live SQL query against the `medicine_traceability` database — nothing is hardcoded in the
frontend.

## Architecture

```
Browser (public/index.html)
        |  fetch JSON
        v
Node + Express API (server/server.js, mysql2 pool)
        |  SQL
        v
MySQL 8  --  12 tables . 3 triggers . 2 views  (db/)
```

The **Overview** dashboard shows live KPI tiles, role-aware quick actions and a
"factory to customer" pipeline, all counted from MySQL. The **Database schema** page in the
app shows the Entity–Relationship diagram next to the
real DDL for every table, read live from MySQL (`SHOW CREATE TABLE`, `information_schema`).
The **Reports** page runs a curated library of the project's SQL — joins, grouping,
aggregates and views — against the live database.

## Quick start

### Option A - Docker Compose (MySQL + app together)

```bash
docker compose up
```

Then open <http://localhost:12000>. The first run creates the schema, loads the sample
data and installs the triggers automatically.

### Option B - run MySQL yourself, then the app

1. Start MySQL 8 and create a database (or use Docker):

   ```bash
   docker run -d --name medtrace-mysql \
     -e MYSQL_ROOT_PASSWORD=medtrace -e MYSQL_DATABASE=medtrace \
     -p 3306:3306 mysql:8.0
   ```

2. Configure the connection:

   ```bash
   cp .env.example .env      # edit DB_* values if needed
   npm install
   npm run init-db           # creates schema + sample data + triggers
   npm start                 # serves the site on http://localhost:12000
   ```

## Database design (`db/`)

| File | Purpose |
|------|---------|
| `medtrace_script.sql` | The project's own script: creates the `medicine_traceability` database, all 12 tables and the sample data |
| `db/business_rules.sql` | Adds the 3 triggers and 2 views the website uses (run **after** the script) |
| `db/auth.sql` | The `users` table for website logins, in a separate `medtrace_auth` database |

`npm run init-db` runs all three in order, so a single command builds the whole database
(including 5 demo accounts). `npm test` runs the end-to-end suite in `tests/e2e.mjs`
against a running server.

### Tables (12)

Master data: `organizations`, `medicines`, `batches`
Movement: `shipments`, `shipment_items`, `inventory`
Sales: `customers`, `sales`, `sale_items`
Safety: `recalls`, `verification_scans`, `audit_log`

`shipment_items`, `sale_items` and `inventory` are junction tables for many-to-many
relationships and use composite primary keys, e.g. `(shipment_id, batch_id)`.

### Triggers (3)

- `trg_block_bad_sale` — rejects a `sale_items` insert when the batch is recalled,
  suspected fake or expired. This is the core business rule.
- `trg_audit_batch_status` — writes an `audit_log` row on every batch status change.
- `trg_recall_sets_status` — an active recall automatically flips the batch to `recalled`.

### Views (2)

- `v_batch_flow` — batch -> shipment -> organizations (forward trace).
- `v_batch_customers` — batch -> sale -> customer (who bought it).

## API

| Method | Path | Description |
|--------|------|-------------|
| GET  | `/api/meta` | Dataset catalogue, access map and live stats |
| POST | `/api/signup` | Create an account (name, email, role, org, password + confirm) |
| POST | `/api/login` | Sign in with email + password; returns a session token |
| GET  | `/api/session` | Restore a session from the `x-auth-token` header |
| POST | `/api/logout` | Sign out (the client discards its token) |
| GET  | `/api/datasets/:name?q=` | Any of the 12 datasets, with server-side search |
| POST | `/api/verify` | Verify a batch code (writes to `verification_scans`) |
| GET  | `/api/trace/:batchId` | Forward trace using the SQL views |
| POST | `/api/recalls` | Issue a recall (trigger sets status + audit log) |
| POST | `/api/sales/attempt` | Demonstrate the sale-blocking trigger without keeping a row |
| GET  | `/api/schema` | Live schema: tables, columns, keys, foreign keys, and `SHOW CREATE` DDL for tables, views and triggers |
| GET  | `/api/queries` | The SQL query library (titles and concepts) |
| GET  | `/api/queries/:id` | Runs one library query and returns its columns and rows |

## Accounts and roles

Signing in is real: accounts live in the `users` table of the `medtrace_auth` database
(kept separate so the traceability schema stays the 12 tables in the ER diagram). Passwords
are stored as salted scrypt hashes and never compared in plain text. Create an account from
the "Create account" tab, or sign in with a seeded demo account (password `demo1234` for all):

| Email | Role |
|-------|------|
| asha.mehta@cda.gov.in | regulator |
| ravi.kumar@medicure.in | manufacturer |
| neha.sharma@northernmedico.in | distributor |
| imran@citycarepharmacy.in | pharmacy |
| priya.nair@example.com | customer |

The role comes from the account, not the form. Each role sees a different subset of datasets:

| Role | Datasets |
|------|----------|
| Regulator | all 12 |
| Manufacturer | medicines, batches, shipments, shipment_items, inventory, recalls, organizations |
| Distributor | organizations, medicines, batches, shipments, shipment_items, inventory, recalls |
| Pharmacy | medicines, batches, inventory, customers, sales, sale_items, recalls |
| Customer | medicines, batches, recalls |

## Demo tips

- Sign in as **Regulator** to see everything, including **Issue a recall**.
- **Verify a batch code** with `PCM-2025-A01` (genuine), `PCM-2025-B02` (recalled),
  `CTZ-2024-A01` (expired) or a made-up code (unknown).
- **Trace a batch** and pick `PCM-2025-B02` to show the recalled batch and the customers
  who received it.
- Issue a recall from the UI and watch the audit log grow — written by the trigger,
  not by the app.
- Open **Database schema** to show the ER diagram beside the live `CREATE TABLE` for every
  table; press **Table definition** on any dataset page to jump straight to that table.
- Open **Reports** and press **Run report** on a few — for example the 5-table join, the
  `GROUP BY` summary and the two view queries — to show real SQL executing live.
