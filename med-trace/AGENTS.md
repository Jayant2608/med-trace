# MedTrace — repository notes

DBMS project: a medicine traceability system. Full-stack demo backed by real MySQL 8.

## Layout

- `medtrace_script.sql` — the project's official script (DB `medicine_traceability`,
  12 tables + sample data). Source of truth for schema and data; do not rewrite it.
- `db/business_rules.sql` — the 3 triggers + 2 views the site relies on. Loaded AFTER the
  official script. `server/init-db.js` loads both in order (it understands `DELIMITER`).
- `db/auth.sql` — the `users` table in a separate `medtrace_auth` database, so the
  traceability schema stays exactly the 12 ER-diagram tables. Loaded last by `init-db.js`,
  which also seeds 5 demo accounts (password `demo1234`).
- `server/` — Node + Express + mysql2. `db.js` (pools: `pool` for domain data, `authPool`
  for accounts), `auth.js` (scrypt hashing + signed session tokens), `server.js` (API +
  static hosting), `init-db.js` (`npm run init-db`).
- `public/index.html` — app shell markup + styles (login, sidebar, global header, drawer,
  toasts, help overlay).
- `public/app.js` — all frontend behaviour (vanilla JS, no build step). Dashboard charts,
  tables, report gallery, drawer, search, keyboard shortcuts, Database schema page and the
  report library.
- `public/vendor/chart.umd.min.js` — Chart.js 4, vendored so the demo works offline.
- `public/er-diagram.jpg` — the Entity–Relationship diagram, served to the Database schema
  page (`GET /er-diagram.jpg`). Copied from the source image in the repo root.
- `WhatsApp Image 2026-11-16 at 2.11.55 PM.jpeg` — the original ER diagram image as
  received. The live schema matches it table-for-table and column-for-column.
- `index (1).html` — the original standalone prototype with hardcoded JS data. Kept for
  reference; NOT used by the running app.

## Run it

- Docker path: `docker compose up` (MySQL + app, app on :12000).
- Manual path: start MySQL 8, `cp .env.example .env`, `npm install`,
  `npm run init-db`, `npm start`.
- Tests: `npm test` (end-to-end API suite; the server must be running).

## Key design points

- Data is never hardcoded in the frontend; it is read live from MySQL through the API.
- Core DBMS features to demo: `trg_block_bad_sale` (blocks selling recalled/fake/expired
  batches), `trg_audit_batch_status` (audit trail), `trg_recall_sets_status`,
  and the views `v_batch_flow` / `v_batch_customers` used by the trace feature.
- The app never changes a batch status or writes audit rows itself; the triggers do.
- Roles gate which datasets a user can open (`ACCESS` map in `server/server.js`).
- `POST /api/sales/attempt` runs in a transaction and always rolls back, so it can
  demonstrate the sale-blocking rule without persisting a sale.
- Database schema page (`_schema`): the ER diagram plus live DDL. `GET /api/schema` reads
  `information_schema` (columns, keys, foreign keys, indexes) and `SHOW CREATE
  TABLE/VIEW/TRIGGER` so every table card, relationship and definition shown in the UI is
  the real schema. Each dataset page has a "Table definition" button that jumps to and
  expands the matching card.
- Dashboard (`_home`): KPI tiles, role-aware quick-action tiles (`quickActions`) and a live
  "factory to customer" pipeline (`pipeline`) whose counts come from `META.datasets`. Only
  three charts remain (batch status, scans by result, inventory by org) — keep it that way;
  do not add finance/marketing charts.
- Raw SQL is presented as a GUI affordance, not a console: `sqlBlock` renders a light
  "query inspector" card (collapsed by default, `--code-bg`/`--code-ink` theme vars), the
  page is called **Reports**, and each report card has a **View query** toggle.
- Report library (`_sql`): `GET /api/queries` lists 9 curated read-only statements
  (joins, GROUP BY / HAVING, aggregates, views); `GET /api/queries/:id` runs one and
  returns its columns and rows. Only server-defined queries run — never client SQL.
- Visuals: an ambient background (faint dot grid + soft brand-coloured glows, `body:before`
  / `body:after`) and inline SVG illustrations (`illusTrace`, `illusShield` in `app.js`,
  plus the login hero chain in `index.html`). Everything is CSS/SVG, no image files, so it
  works offline and follows the light/dark theme via the `--bgdot` / `--glow*` vars. All
  motion is gated behind `prefers-reduced-motion` and the backgrounds are hidden on print.

## Conventions

- Plain JS, no framework, no build step. Keep it that way — it must run with just
  `npm install && npm start`.
- Sign-in is real auth: passwords are salted scrypt hashes in `medtrace_auth.users`, and
  `/api/login` verifies them. Never reintroduce a login that trusts the posted role or
  skips the password check. The role always comes from the stored account.
