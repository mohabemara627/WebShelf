# Release browser smoke test

Tested over local HTTP with the actual service worker, using the Codex in-app Chromium browser. Production files remained static; the local test server injected frame/error observation only and prevented external destination clicks from leaving the test, while allowing the existing visit-recording handlers to run. No real form submission was sent.

- Desktop 1440×1000: Directory, all 12 exact-case category URLs, Activity, Support, Suggest, and Collection/Ar.
- Mobile 430×932: the same pages in dark and light mode. All categories rendered 10 rows. Collection rendered 10 Ar sites; its Streaming filter showed 1 and All restored 10.
- Saved dark and light reloads passed. Observed navigation frames retained the saved theme. Light form fields stayed white; page and logo backgrounds remained stable. Browser theme-color changed on initial load, toggle, and a real cross-tab change.
- Mobile category order remained the existing order. CSS and HTML body bytes also match the stable baseline, independently confirming no layout/order edits.
- F opened search; searching Anime Nexus returned the correct result; Escape closed search. Favorites add, individual removal, clear confirmation, and clear completion passed.
- Quick preview open/Escape-close passed. Hide, immediate Undo, persistent Hidden Sites, and Show/unhide passed.
- A catalog-link test click recorded Recently Viewed. Activity displayed it; All time, Last 7 days, Last 30 days, and Most Visited passed.
- A real Ar badge opened collection.html?badge=Ar. Mobile navigation menu exposed the existing links.
- Empty Suggest/Support submissions were blocked by native client-side validation. No external form requests were sent.
- All **119 distinct catalog icons** (used by **120 entries**) decoded successfully in the browser. No broken icons or uncaught JavaScript errors were observed.
- The case-sensitive HTTP fixture served every production asset requested. A test-only image audit document caused one browser default /favicon.ico probe; production HTML uses its declared, existing favicon and had no missing production references.
- With the origin returning 503, the service worker served the correct cached TV Streaming category and Support page, including their scripts and light theme. It did not substitute the home page. Unit tests additionally cover network failure, immediate cached-image responses with delayed refresh, failed refresh preservation, and scoped old-cache cleanup.

These are release observations, not a claim that arbitrary third-party sites or future catalog edits have been browser-tested. No Vercel deployment or Linux VM was run; exact filesystem paths, Git index casing fixtures, and a case-sensitive HTTP server validate the static deployment paths.
