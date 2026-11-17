# MedTrace — repository notes

DBMS project: a medicine traceability system. Full-stack demo backed by real MySQL 8.

## Layout

- `medtrace_script.sql` — the project's official script (DB `medicine_traceability`,
  12 tables + sample data). Source of truth for schema and data; do not rewrite it.
- `db/business_rules.sql` — the 4 triggers, 2 views and the operational tables the site
  relies on (incl. `recall_acknowledgements` and the `recalls.decision_note` column). Loaded
  AFTER the official script. `server/init-db.js` loads both in order (it understands
  `DELIMITER`).
- `db/auth.sql` — the `users` and `account_requests` tables in a separate `medtrace_auth`
  database, so the traceability schema stays exactly the 12 ER-diagram tables. Loaded last
  by `init-db.js`, which also seeds 6 demo accounts (password `demo1234`).
- `server/` — Node + Express + mysql2. `db.js` (pools: `pool` for domain data, `authPool`
  for accounts), `auth.js` (scrypt hashing + signed session tokens), `access.js` (the single
  source of truth for role → dataset access and row-level scoping), `live.js` (real-time
  database watch: `CHECKSUM TABLE` fingerprint + SSE), `server.js` (API + static hosting),
  `init-db.js` (`npm run init-db`), `create-regulator.js` (`npm run create-regulator`).
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
  batches), `trg_audit_batch_status` (audit trail), `trg_recall_sets_status` /
  `trg_recall_restores_status` (recall lifecycle), and the views `v_batch_flow` /
  `v_batch_customers` used by the trace feature.
- The app never changes a batch status or writes audit rows itself; the triggers do.
- Security is the backbone, not a layer: `server/access.js` is the single source of truth
  for what a role may open (`ACCESS`) and which rows it may see (`scopeFor` / `scopedSql`).
  `server.js` never trusts a role or organization sent by the client — it always uses
  `req.user` from the verified session. Do not add a route that reads `req.body.role` or
  `req.query.role` to decide access. The `organizations` dataset is **regulator/admin only**;
  other roles never see the organization table (they get the trimmed `/api/public/organizations`
  list where they need to pick an organization).
- Adding a batch also adds its quantity to the manufacturer's inventory in one transaction
  (`POST /api/batches`). Without this a freshly created batch would exist but be unshippable,
  because `POST /api/shipments` only moves stock the sender actually holds. `GET /api/my-stock`
  returns the medicine name alongside the batch code so the shipment dropdown reads as the
  manufacturer's own catalogue.
- Pharmacy sales always record a customer from the name the pharmacy types in
  (`customer_name` + optional `customer_email` / `customer_phone`); the form no longer preloads
  a customer dropdown. A new email is reused if it is already on file, so a walk-in is never
  duplicated. The customer is written inside the same transaction as the sale. The API still
  accepts `customer_id` for a caller that already holds one.
- Customer tracing uses `POST /api/customer/trace` (customer role only). It looks a batch up
  by its printed `batch_code` and returns only the journey, current stock and recalls — never
  customer names, phones or emails. Staff use the id-based `GET /api/trace/:batchId` instead,
  where the PII rules live.
- Onboarding is deliberately asymmetric: customers self-register (`POST /api/signup`);
  staff apply (`POST /api/account-requests`) and a regulator approves; regulators/admins are
  created only from the CLI (`npm run create-regulator`). Never add a public path that
  creates a staff or regulator account.
- `POST /api/demo/sales-attempt` runs in a transaction and always rolls back, so it can
  demonstrate the sale-blocking rule without persisting a sale. The real sale path is
  `POST /api/sales` (pharmacy only).
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
  page is called **Reports**, and each report card has a **View query** toggle. SQL is
  never shown open unless the user opened it (`showQuery` / the schema page's
  "Table definition" buttons are the only places that pass `open:true`).
- Workflow views (`_verify`, `_trace`, `_ctrace`, `_sale`, `_recall`, `_requests`, `_newship`,
  `_newmed`, `_newsale`) are listed in `STATEFUL_VIEWS`. `liveRefresh` never re-renders
  them, because that would wipe a result the user is reading (a verification verdict, a
  trace, a sale outcome) the moment the write they just made comes back over SSE. Only the
  sidebar counts and notifications refresh there.
- Staff applications enforce organization ↔ role: the frontend filters the organization
  dropdown to the chosen role (`fillOrgOptions`), and the server re-checks it so a crafted
  request cannot attach a pharmacy application to a regulator's organization. Regulator
  applications are rejected outright. Customers self-register and must have no organization.
- Report library (`_sql`): `GET /api/queries` lists 9 curated read-only statements
  (joins, GROUP BY / HAVING, aggregates, views); `GET /api/queries/:id` runs one and
  returns its columns and rows. Only server-defined queries run — never client SQL.
- Live database watch (`server/live.js` + the `live database watch` block in `app.js`):
  the site reflects changes made to MySQL by *any* client, not just this app. The server
  fingerprints all 12 tables with one `CHECKSUM TABLE` round-trip every `LIVE_POLL_MS`
  (default 1500 ms) and, when the fingerprint moves, emits a `change` event naming the
  changed tables over SSE (`GET /api/changes/stream`). The browser re-reads only what it is
  showing: a dataset view re-runs its query in place (keeping search/sort/page), a
  workflow/dashboard view re-renders. `GET /api/changes/status` is the polling fallback for
  clients without SSE. Do not move the watch back to API-only hooks — it must catch
  external writes, which is the point.
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
- Every non-public route goes through `requireAuth(roles?)`. Reads go through
  `scopedSql(dataset, req.user)`; writes derive the acting organization from `req.user.orgId`
  and never from the request body. When a write needs the actor for a trigger, set
  `@medtrace_actor_org_id` on the connection first (see `POST /api/sales`).
- The public surface is exactly two routes (`/api/public/verify`, `/api/public/organizations`)
  plus login/signup/application. The public verify returns only pack fields (medicine,
  manufacturer, batch code, dates) and a verdict — never ids or customer data. Keep it that
  way so a pack cannot be used to enumerate the database.
- The batch dropdowns (`batchOptions` in `app.js`) deliberately show only the code and the
  medicine, never the status, so a user cannot read a safety verdict off an option label.
  Status is revealed only by verifying or tracing.
- Roles and organization types come back from MySQL lowercase. Render them through
  `roleLabel` / `typeLabel` in `app.js` so the UI reads "Regulator", "Pharmacy" and so on
  instead of the raw enum. Status badges (`genuine`, `recalled`, `expired`) stay as they are.
- Global search (`GET /api/search`) searches only the human-readable columns of each dataset
  (id columns are skipped, so a numeric query does not match every row) and builds each hit
  label from those columns.
- Tests live in `tests/e2e.mjs` and cover the data model, the MySQL rules and the whole
  access matrix. Run them after any backend change: `npm test` (server must be running).
  Reset first with `npm run init-db` so counts match the seeded expectations.
