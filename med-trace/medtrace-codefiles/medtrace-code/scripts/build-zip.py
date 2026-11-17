#!/usr/bin/env python3
"""Build medtrace-project.zip from the current working tree.

The zip is what the site's Download link serves, so it must contain every file
needed to run the project (source, SQL, docs) and none of the local-only ones
(.env, node_modules, the zip itself). Run from the repo root:

    python3 scripts/build-zip.py

Writes medtrace-project.zip and a copy at public/medtrace-project.zip.
"""
import os
import shutil
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOP = "med-trace"
OUT = os.path.join(ROOT, "medtrace-project.zip")

# Explicit allow-list so nothing local or secret can slip in.
FILES = [
    "medtrace_script.sql",
    "index (1).html",
    "WhatsApp Image 2026-11-16 at 2.11.55 PM.jpeg",
    ".env.example",
    ".gitignore",
    "package.json",
    "package-lock.json",
    "docker-compose.yml",
    "README.md",
    "AGENTS.md",
    "PROMPTS.md",
    "db/auth.sql",
    "db/business_rules.sql",
    "server/db.js",
    "server/auth.js",
    "server/access.js",
    "server/live.js",
    "server/server.js",
    "server/init-db.js",
    "server/create-regulator.js",
    "public/index.html",
    "public/app.js",
    "public/er-diagram.jpg",
    "public/vendor/chart.umd.min.js",
    "tests/e2e.mjs",
    "scripts/build-zip.py",
    "MedTrace-all-code.md",
]

missing = [f for f in FILES if not os.path.exists(os.path.join(ROOT, f))]
if missing:
    raise SystemExit("Missing files: " + ", ".join(missing))

with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
    for f in FILES:
        z.write(os.path.join(ROOT, f), os.path.join(TOP, f))

# The site serves a copy from public/.
shutil.copyfile(OUT, os.path.join(ROOT, "public", "medtrace-project.zip"))

print(f"Wrote {OUT} ({len(FILES)} files, {os.path.getsize(OUT)} bytes)")
