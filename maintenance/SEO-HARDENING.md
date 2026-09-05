# Conservative cleanup and SEO hardening

This pass starts from the already-improved working copy, not the original ZIP or Git HEAD. The pre-pass snapshot is saved beside the project in `../seo-pass-baseline/`. No redesign, new dependency in the project, catalog edit or feature removal was performed.

## Every project file changed in this pass

- **`style.css`** — Consolidated all category-grid geometry and ordering into one documented section. Removed superseded grid declarations and the duplicate mobile ordering block; moved the effective desktop ordering rules out of the late override block into that section. Grid blocks decreased from 9 to 5; keyed ordering selectors from 36 to 24 (one set for each responsive order). Preserved every effective value, the 420/700/701/900px media conditions, and the existing fractional-width behavior between 700 and 701px. No other CSS rules were rewritten. This file is the editable CSS source; there is no separate CSS source or preprocessor in this project.
- **`collection.html`** — Added a static `robots` meta tag with `noindex,follow`. It covers the collection shell and all badge/filter query variants, including crawlers with JavaScript disabled. Links remain followable; robots.txt still permits crawling so crawlers can see the directive.
- **`404.html`** — Removed the `/404.html` canonical link. Kept `noindex,follow`, recovery links and all visible markup unchanged. A missing/error resource does not need a canonical declaring it a preferred content URL.
- **`maintenance/src/category.js`** — Invalid, absent, empty and wrong-case category keys now receive `noindex,follow`; the canonical element, generic description and any stale Open Graph/Twitter tags are removed. Valid categories remain indexable, with the existing title/description/canonical semantics. Added `og:title`, `og:description`, `og:url`, `twitter:title` and `twitter:description`, all derived from the same resolved CATEGORY_SEO title/description and canonical URL. Metadata uses DOM properties/attributes, not HTML interpolation. Also preserves focus on the matching category filter button after re-rendering, falling back to the first filter only if the previously focused option no longer exists.
- **`maintenance/src/collection.js`** — Preserves focus on the matching group/badge filter after rebuilding the filter buttons. Browser reproduction showed that pressing Enter on these controls previously moved focus to body. Filtering semantics, labels, ordering and collection canonical behavior were not changed.
- **`category.bundle.js`** — Regenerated from category source; not hand-edited.
- **`collection.bundle.js`** — Regenerated from collection source; not hand-edited.
- **`service-worker.js`** — Regenerated deployment cache version after CSS/HTML/bundle changes. Cache strategy and worker source are unchanged.
- **`maintenance/tests/seo.test.cjs`** — Added 20 regression cases: all 12 valid categories, five invalid/malicious query cases, future-category metadata fallback, static collection/404 indexing rules, and centralized CSS ordering declarations. Existing tests were retained.
- **`maintenance/SEO-HARDENING.md`** — This change/audit record.

The final production export refreshes exactly these copies under `public/`: `404.html`, `category.bundle.js`, `collection.bundle.js`, `collection.html`, `service-worker.js`, and `style.css`. Other production assets retain their pre-pass bytes. Maintenance code and this report are not exported.

## Appearance and category order

The original DOM/category list ordering in `maintenance/src/script.js` was intentionally left intact. Responsive placement is now defined in one CSS section; preserving the DOM order avoids changing keyboard traversal or the behavior of newly added categories.

Desktop visual order, left to right and then top to bottom:

1. Anime Streaming, Manga Reading, Anime Download, Anime Database
2. TV Streaming, Manhwa Reading, TV Download, TV Database
3. Sports Streaming, Novel Reading, Subtitle Download, Anime Schedule

Mobile visual order, left to right and then top to bottom:

1. Anime Streaming, Anime Download
2. TV Streaming, TV Download
3. Sports Streaming, Subtitle Download
4. Manga Reading, Anime Database
5. Manhwa Reading, Anime Schedule
6. Novel Reading, TV Database

**68 viewport screenshot comparisons had zero differing pixels.** These compare pre-pass and updated CSS in the same rendered document, isolating the CSS change from unrelated image-rasterization differences between tabs. Category bounding boxes, computed grid properties, CSS order values and visual order also matched exactly.

Coverage: Edge/Chromium on Windows, 1000px viewport height, widths 320, 390, 420, 421, 600, 601, 650, 651, 700, 701, 768, 900, 901, 1180, 1181, 1440 and 1920; dark/light themes; empty and populated favorites sidebar. These are viewport comparisons, not a claim of full-page pixel certification in every browser. Initial cross-tab/full-page trials were discarded because of logo rasterization and offscreen content-visibility timing differences; the isolated stylesheet comparison avoids those unrelated effects.

Separate real-browser checks compared the rendered body markup before and after on all seven HTML pages plus the invalid-category state at 390px and 1440px. All 16 comparisons matched, excluding script elements. Focus outlines follow the existing CSS; the focus repair does not introduce a new focus style.

## Audit findings and deliberate non-changes

- **Other repeated/dead CSS:** Many repeated selectors contribute different properties, or intentionally override theme/sidebar/row states. They were not merged. Legacy `.legal-*` and `.search-toggle` styles appear unused by current pages, but were left in place rather than performing speculative feature/style pruning. Reduced-motion, row-striping and sidebar override rules were retained.
- **Accessibility:** Axe found existing color-contrast issues on the four audited baseline pages (home, category, collection and support), including muted counts, filter labels and footer text. Colors and typography were not changed because visual preservation was explicit. This is not a clean accessibility certification. The concrete category/collection keyboard-focus loss was fixed. Search, confirmation dialogs and mobile navigation passed the tested Escape/focus-return flows.
- **HTML interpolation and URLs:** Existing text escaping, stored-URL boundaries and catalog validation were retained. New metadata is written with DOM setters. Malicious category input was tested without creating HTML or misleading canonicals. The project validator found no missing/case-mismatched internal references. No live third-party destination health/safety audit was performed.
- **Service worker:** No strategy rewrite. Existing scoped cleanup, offline fallback and cache safety regression tests pass. Real-browser offline navigation verified that a cached invalid category shell can subsequently render a valid category with correct indexable metadata, that invalid categories remain noindex offline, and that cached collections retain noindex. This works because the worker caches static shell responses rather than the live DOM's query-specific metadata.
- **Runtime work:** Existing preview observation, render events, storage memoization and small-catalog lookups were not refactored merely to reduce code or speculative work. There was no measured performance problem justifying broader changes in this pass.
- **Metadata limits:** Invalid category exclusion and category-specific Open Graph/Twitter metadata are client-rendered. The static category shell deliberately does NOT have blanket noindex: some crawlers would stop before rendering valid categories. A static host may still return HTTP 200 for an invalid query. Social crawlers that do not execute JavaScript will not see category-specific sharing tags. Server-rendered metadata/true server-side invalid-query status would require a separate hosting or static-generation change; no live Vercel behavior is claimed here.
- **Utility canonical:** Collection canonical behavior was retained; the requested noindex directive controls indexing. No sitemap/robots.txt or route restructuring was introduced.
- **Unchanged content/features:** Catalog, descriptions, badges, site order, HTML body content, colors, spacing, fonts, breakpoints, favorite/history/hidden-site features, forms, navigation, search, previews and installation UI were preserved. The only interaction adjustment is retaining focus after filter activation.

## Verification

- Build and project validation passed after every source-file change.
- **83/83 Node regression tests passed.**
- **68/68 isolated CSS screenshot comparisons passed with zero pixel differences.**
- **50 real-browser functional checks passed**, including 12 category metadata/row checks, invalid inputs, utility indexing, nested 404 recovery, 16 rendered-body comparisons, filter keyboard focus, search, favorites/dialog cancellation, preview dismissal, mobile menu focus, native form validity and real service-worker offline navigation.
- No uncaught browser JavaScript errors were recorded in those checks.
- Repeated builds produce identical production bytes; final export and validation pass.
- No real form submissions, external destination visits or live deployment were performed. GitHub CI was not triggered by this local pass.

## Local audit artifacts (outside the deployable project)

`../seo-browser-tools/` contains the browser comparison runner (`check.cjs`), functional runner (`functional.cjs`) and isolated, pinned test-only npm dependencies/manifests (Playwright, pngjs and axe-core). They do not change the project's dependency files. `../seo-browser-results/` contains the final visual comparison JSON/log, functional JSON/log, baseline accessibility/focus findings, test output and validation logs. Preliminary mismatch images/logs may also be present; the final `visual-comparison.json` is the authoritative completed comparison. `../seo-pass-baseline/` is the pre-pass source/asset snapshot.
