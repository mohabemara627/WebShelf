# WebShelf maintenance

Use **Node.js 22 or newer**. One-time setup from the project root:

```sh
npm ci --prefix maintenance --ignore-scripts
```

On Windows, double-click **WebShelf-Maintenance.bat** in this folder. It installs the maintenance dependencies on first use and offers the commands below.

| Task | Command from project root |
|---|---|
| Add one website | `node maintenance/add-site.cjs` |
| Edit, change category, or reorder | `node maintenance/edit-site.cjs` |
| Update/replace a favicon | `node maintenance/update-icon.cjs` |
| Remove a website (confirmation required) | `node maintenance/remove-site.cjs` |
| Bulk import | `node maintenance/import-sites.cjs` |
| Preview import without writes/network | `node maintenance/import-sites.cjs --dry-run` |
| Validate without changing files | `node maintenance/validate.cjs` |
| Rebuild production files | `node maintenance/build.cjs` |
| Run maintenance regression tests | `npm test --prefix maintenance` |

**Only `maintenance/catalog.json` is the editable catalog source.** The old standalone Catalog Manager is not included: it writes generated data.js and would create a competing workflow. Use these commands or edit catalog.json then build and validate.

`maintenance/src/` contains the individual production JS sources. `data.js`, `common.js`, the six `*.bundle.js` files, and `service-worker.js` are generated. Edit `maintenance/service-worker.source.js` and `core.json` for intentional worker changes. HTML/CSS remain ordinary production files and are not rewritten by the build. Sitemap category URLs regenerate only when category keys change; external destination sites are never added to the sitemap.

Icons live in **`images/icons/`**, with lowercase `images/icons` in both the filesystem and Git. New filenames are lowercase, collision-safe, and use the detected image format. Existing mixed-case filenames (such as WS-Logo-192.png) are valid when every reference matches exactly. Do not edit a downloaded SVG to bypass a safety rejection; use a raster alternative. Missing optional icons use the existing letter fallback.

## Imports

Fill in `maintenance/import-sites.csv` (header supplied), or create `maintenance/import-sites.json` containing an array like `import-sites.example.json`. JSON takes precedence when both defaults exist. An explicit path is also supported:

```sh
node maintenance/import-sites.cjs path/to/sites.csv --dry-run
node maintenance/import-sites.cjs path/to/sites.json
```

Fields: `name`, `url`, `category` (exact key or displayed title), optional `description`, `badges` (JSON array or comma/semicolon/pipe-separated text), `position`/`rank` (1-based; omitted appends), and `iconUrl` (manual favicon URL). Quote CSV fields containing commas or newlines. Invalid/duplicate rows are reported and skipped. Valid rows commit together, with at most 3 icon resolutions at once. A favicon failure keeps the addition with letter fallback and is listed separately. Reports go to `maintenance/import-report.json`; dry-run writes nothing and performs no favicon requests.

URLs gain https:// if missing, use URL normalization, and are checked for duplicates ignoring fragments, trailing slashes and query-parameter order. Query values and path case stay meaningful. Duplicate names in one category are rejected; a shared brand in different categories is allowed when URLs differ. Never overwrite existing sites/icons silently.

Add/edit can choose an optional 1-based position; editing with Enter keeps the current position in the same category. Removing and replacing icons deletes the old file only if no remaining production reference uses it. Otherwise it is kept. Automatic favicon attempts have per-request and overall deadlines; manual URLs or keeping/no icon are available on failure.

## Safe changes and recovery

Commands validate a proposed catalog, stage generated files and images, and validate the staged project before applying changes. The commit uses temporary-file renames, an exclusive lock, and a rollback journal; generation/validation failures restore previous files. Concurrent catalog changes are rejected. An interrupted process/power failure may leave a journal or lock. After confirming no maintenance process is running:

```sh
node maintenance/recover.cjs
node maintenance/validate.cjs
```

Do not manually delete the transaction folder before recovery. Direct `build.cjs` rolls back ordinary write errors; use the catalog commands for fully journaled catalog changes. Keep backups/version control as usual.

## Dependencies and deployment

Two small maintenance-only parsers are pinned: **parse5** handles real-world HTML/icon links and entities; **saxes** validates XML and lets us reject active SVG content. Node built-ins handle networking, CSV, filesystem, hashing and transactions. There are no production npm dependencies.

This ZIP is the maintainable master. For a static deployment publish the root HTML/CSS/JS, images, manifest, robots and sitemap; keep maintenance local. A Vercel deployment can use **Other**, no install command, build command `node maintenance/export.cjs`, and output directory `public`. This copies only production assets without changing them and excludes maintenance, reports and dependencies. Run the maintenance build/validator before deployment. Never point a production build at an old Catalog Manager export.
