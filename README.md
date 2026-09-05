# WebShelf maintainable master

The complete static website is in this folder. Its editable catalog and build sources are in `maintenance/`.

**Windows:** install Node.js 22 or newer, then double-click `maintenance/WebShelf-Maintenance.bat`.

The menu adds, edits, reorders and removes sites, replaces icons, imports CSV/JSON, validates and rebuilds. Successful catalog operations automatically build and validate; failed transactions roll back.

- Practical commands and deployment: [maintenance/README.md](maintenance/README.md)
- Historical integrity audit: [maintenance/release-audit.json](maintenance/release-audit.json)
- Historical browser verification: [maintenance/BROWSER-SMOKE.md](maintenance/BROWSER-SMOKE.md)

For current catalog counts and integrity checks, run `node maintenance/validate.cjs`. Run `npm test --prefix maintenance` for the current regression results. Historical release reports describe their original snapshots, not later catalog changes.

GitHub Actions checks Node.js 22 and 24 on Windows and Linux: pinned dependency installation, validation, regression tests, reproducible generation and production export. The reliability improvements do not change CSS or visible page content.

`maintenance/catalog.json` is the single catalog source of truth. Do not use an older Catalog Manager to overwrite generated `data.js`. Do not upload maintenance tools as public website assets; the maintenance README explains production-only export.
