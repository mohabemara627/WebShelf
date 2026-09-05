# WebShelf maintainable master

The complete static website is in this folder. Its editable catalog and build sources are in `maintenance/`.

**Windows:** install Node.js 22 or newer, then double-click `maintenance/WebShelf-Maintenance.bat`.

The menu adds, edits, reorders and removes sites, replaces icons, imports CSV/JSON, validates and rebuilds. Successful catalog operations automatically build and validate; failed transactions roll back.

- Practical commands and deployment: [maintenance/README.md](maintenance/README.md)
- One-time integrity audit: [maintenance/release-audit.json](maintenance/release-audit.json)
- Browser verification: [maintenance/BROWSER-SMOKE.md](maintenance/BROWSER-SMOKE.md)

Release checks: **12 categories, 120 sites, 55 passing automated tests, zero validator errors.** The 119 distinct catalog icons all decoded in the browser. Existing CSS and HTML bodies are unchanged; only the requested head/theme-color and icon-integrity repairs affect production files.

`maintenance/catalog.json` is the single catalog source of truth. Do not use an older Catalog Manager to overwrite generated `data.js`. Do not upload maintenance tools as public website assets; the maintenance README explains production-only export.
