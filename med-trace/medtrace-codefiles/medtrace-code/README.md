# MedTrace — Medicine Traceability System

A DBMS project: track every medicine batch from the factory to the customer, block the
sale of recalled, fake or expired batches, and let anyone verify a batch code.

The whole application runs on **MySQL 8**. Every table, count, search and trace on the
website is a live SQL query against the `medicine_traceability` database — nothing is hardcoded in the
frontend.

The site is a **secure, role-based multi-user system**. Accounts live in a separate
`medtrace_auth` database; passwords are salted scrypt hashes, sessions are signed tokens,
and every request is checked server-side. A regulator sees the whole chain, a manufacturer
sees only its own products and shipments, a pharmacy sees only its own stock and customers,
and a customer can only verify a printed code. Row-level scoping is applied in SQL — the
server never trusts a role or organization sent by the browser.

The site also **watches the database in real time**. Change the data with MySQL Workbench,
the `mysql` CLI or any other tool and the open page updates itself within a second or two —
no refresh. The server fingerprints the 12 tables with `CHECKSUM TABLE` on a short interval
and pushes a Server-Sent Event to every connected browser when something moves; the browser
then re-reads what is on screen. A "Live · MySQL" pill in the sidebar shows the connection
state.

## Architecture

```
Browser (public/index.html)
        |  fetch JSON  +  x-auth-token header
        v
Node + Express API (server/server.js, mysql2 pool)
        |  SQL  (row scope applied per role in server/access.js)
        v
MySQL 8  --  medicine_traceability: 12 tables . 4 triggers . 2 views
             medtrace_auth:         users . account_requests
```

The **Overview** dashboard shows live KPI tiles, role-aware quick actions and a
"factory to customer" pipeline, all counted from MySQL and limited to what the signed-in
role may see. The **Database schema** page (regulator only) shows the Entity–Relationship
diagram next to the real DDL for every table, read live from MySQL (`SHOW CREATE TABLE`,
`information_schema`). The **Reports** page (regulator only) runs a curated library of the
project's SQL — joins, grouping, aggregates and views — against the live database.

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
| `db/business_rules.sql` | Adds the 4 triggers, 2 views and the operational tables the website uses (run **after** the script) |
| `db/auth.sql` | The `users` and `account_requests` tables for website logins, in a separate `medtrace_auth` database |

`npm run init-db` runs all three in order, so a single command builds the whole database
(including 6 demo accounts). `npm test` runs the end-to-end suite in `tests/e2e.mjs`
against a running server.

### Tables (12)

Master data: `organizations`, `medicines`, `batches`
Movement: `shipments`, `shipment_items`, `inventory`
Sales: `customers`, `sales`, `sale_items`
Safety: `recalls`, `verification_scans`, `audit_log`

`shipment_items`, `sale_items` and `inventory` are junction tables for many-to-many
relationships and use composite primary keys, e.g. `(shipment_id, batch_id)`.

A thirteenth operational table, `recall_acknowledgements`, lives alongside the 12 and records
which organizations have acknowledged a recall. The core ER diagram stays at 12 tables.

### Triggers (4)

- `trg_block_bad_sale` — rejects a `sale_items` insert when the batch is recalled,
  suspected fake or expired. This is the core business rule.
- `trg_audit_batch_status` — writes an `audit_log` row on every batch status change.
- `trg_recall_sets_status` — an active recall automatically flips the batch to `recalled`.
- `trg_recall_restores_status` — withdrawing a recall returns a genuine batch to `genuine`.

### Views (2)

- `v_batch_flow` — batch -> shipment -> organizations (forward trace).
- `v_batch_customers` — batch -> sale -> customer (who bought it).

## API

Every path below except the two `/api/public/*` routes requires a valid session token in
the `x-auth-token` header. Actions are further restricted to specific roles.

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET  | `/api/meta` | any signed-in | Dataset catalogue (scoped), access map and live stats |
| GET  | `/api/dashboard` | any signed-in | Scoped KPIs, charts and feeds |
| GET  | `/api/datasets/:name?q=` | per dataset | A dataset, with row-level scoping and server-side search |
| GET  | `/api/search?q=` | any signed-in | Global search across the datasets the role may open |
| POST | `/api/public/verify` | **public** | Check a printed batch code; returns only pack fields |
| GET  | `/api/public/organizations` | **public** | Organization names and types, for the staff application form |
| POST | `/api/login` | public | Sign in with email + password; returns a session token |
| POST | `/api/logout` | any signed-in | Sign out (the client discards its token) |
| GET  | `/api/session` | any signed-in | Restore a session from the `x-auth-token` header |
| POST | `/api/signup` | public | Create a **customer** account only |
| POST | `/api/account-requests` | public | Apply for a staff account (manufacturer/distributor/pharmacy) |
| GET  | `/api/account-requests` | regulator | List applications |
| POST | `/api/account-requests/:id/decision` | regulator | Approve or reject an application |
| POST | `/api/verify` | any signed-in | Verify a batch code (writes to `verification_scans`) |
| GET  | `/api/trace/:batchId` | non-customer | Forward trace using the SQL views; customer PII is role-restricted |
| POST | `/api/customer/trace` | customer | Trace a batch by its printed code; no personal data returned |
| POST | `/api/recalls` | regulator | Issue a recall (trigger sets status + audit log) |
| GET  | `/api/recalls` | non-customer | Recall list with acknowledgement counts |
| GET  | `/api/recalls/preview/:batchId` | regulator | Affected stock and customers before a recall |
| POST | `/api/recalls/:id/status` | regulator | Complete or withdraw a recall |
| POST | `/api/recalls/:id/acknowledge` | pharmacy, distributor | Acknowledge a recall the org holds stock for |
| POST | `/api/medicines` | manufacturer | Register a medicine |
| POST | `/api/batches` | manufacturer | Start a production run for an owned medicine |
| GET  | `/api/shipping-destinations` | manufacturer, distributor | Organizations a sender may ship to |
| GET  | `/api/my-stock` | manufacturer, distributor, pharmacy | Stock on hand for the caller's organization |
| POST | `/api/shipments` | manufacturer, distributor | Move stock to another organization |
| POST | `/api/sales` | pharmacy | Record a sale (the trigger may reject the batch) |
| POST | `/api/demo/sales-attempt` | regulator | Demonstrate the sale-blocking trigger without keeping a row |
| GET  | `/api/schema` | regulator | Live schema: tables, columns, keys, foreign keys, DDL |
| GET  | `/api/queries` | regulator | The SQL query library (titles and concepts) |
| GET  | `/api/queries/:id` | regulator | Runs one library query and returns its columns and rows |
| GET  | `/api/changes/status` | any signed-in | Fingerprint of all 12 tables (polling fallback) |
| GET  | `/api/changes/stream` | any signed-in | SSE stream: emits `change` whenever the data moves |

## Accounts, roles and onboarding

Signing in is real: accounts live in the `users` table of the `medtrace_auth` database
(kept separate so the traceability schema stays the 12 tables in the ER diagram). Passwords
are stored as salted scrypt hashes and compared in constant time. Sign in with a seeded demo
account (password `demo1234` for all):

| Email | Role | Organization |
|-------|------|--------------|
| admin@medtrace.local | admin | MedTrace Platform |
| asha.mehta@cdsco.gov.in | regulator | Central Drugs Standard Control Organization |
| ravi.kumar@sunpharma.in | manufacturer | Sun Pharmaceutical Industries Ltd |
| neha.sharma@medplus.in | distributor | MedPlus Health Services Ltd |
| imran@apollopharmacy.in | pharmacy | Apollo Pharmacy, Connaught Place |
| priya.nair@example.com | customer | Not listed / individual |

The role always comes from the stored account, never from the request. Onboarding differs by
role:

- **Customers** self-register from the "Customer sign-up" tab.
- **Manufacturers, distributors and pharmacies** apply from the "Staff access" tab; a
  regulator reviews the application and approves or rejects it. Approving creates the account
  with the role and organization the applicant chose.
- **Regulators** are never created through the website. Provision one from the command line:

  ```bash
  npm run create-regulator -- --name "Asha Mehta" --email asha@cdsco.gov.in \
    --org 8 --password "a-strong-password"
  ```

Each role sees a different subset of datasets, and rows are scoped to the caller's
organization:

| Role | Datasets |
|------|----------|
| Admin / Regulator | all 12, every organization (the only roles that see the `organizations` table) |
| Manufacturer | its own medicines, batches and shipments, plus inventory, recalls, scans, audit log |
| Distributor | medicines, batches it handled, its shipments, inventory, recalls, scans |
| Pharmacy | its own inventory, its customers and sales, plus recalls and scans |
| Customer | no operational datasets — public verification and code-based tracing only |

## Demo tips

- Sign in as **Regulator** to see everything, including **Recall management**, **Account
  requests**, the **Database schema** and **Reports**.
- Sign in as **Manufacturer** (Ravi Kumar) and use **New shipment** or **Add medicine or
  batch** to create real rows — the SQL behind each action is shown, collapsed.
- Sign in as **Pharmacy** (Imran) and use **Record a sale**: type a customer name (and an
  optional email/phone), then try a recalled or expired batch and watch the trigger block it.
- **Verify a batch code** with `PCM-2025-A01` (genuine), `PCM-2025-B02` (recalled),
  `SYR-2025-A01` (suspected fake), `CTZ-2024-A01` (expired) or a made-up code (unknown).
- On the login page, use the **public** check box (no account) to verify a code — it returns
  only what is printed on the pack.
- **Trace a batch** and pick `PCM-2025-B02` to show the recalled batch and the customers
  who received it. Sign in as a manufacturer to see the customer names withheld.
- Sign in as **Customer** and use **Trace your medicine**: enter a code to follow the batch
  from factory to pharmacy with no personal data shown.
- Issue a recall from the UI and watch the audit log grow — written by the trigger,
  not by the app.
- Open **Database schema** (regulator) to show the ER diagram beside the live `CREATE TABLE`
  for every table; press **Table definition** on any dataset page to jump straight to it.
- Open **Reports** (regulator) and press **Run report** on a few — for example the 5-table
  join, the `GROUP BY` summary and the two view queries — to show real SQL executing live.
- Show **real-time changes**: leave the site open, then run an `INSERT`, `UPDATE` or
  `DELETE` in MySQL Workbench (or the `mysql` CLI) on `medicine_traceability`. The open
  page refreshes itself within a second or two — the sidebar pill stays "Live · MySQL" and
  a toast names the table that changed. For example:

  ```sql
  INSERT INTO batches (batch_code, medicine_id, manufacturer_id, mfg_date, expiry_date, quantity, status)
  VALUES ('DEMO-LIVE-01', 1, 1, '2026-04-01', '2028-04-01', 500, 'genuine');
  ```

  The **Batches** count and the dashboard KPIs tick up on their own. Set `LIVE_POLL_MS`
  (default `1500`) in `.env` to change how often the server checks.
