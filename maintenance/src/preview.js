// ==================================================
// INLINE SITE PREVIEW
// ==================================================

(() => {
  const safeText = (value) => typeof escapeWebShelfText === "function"
    ? escapeWebShelfText(value)
    : String(value ?? "");

  function normalizeUrl(url) {
    try {
      const value = new URL(url, window.location.href).href;
      return value.endsWith("/") ? value.slice(0, -1) : value;
    } catch {
      return String(url || "");
    }
  }

  function findSite(url) {
    const wanted = normalizeUrl(url);
    return WebShelfSites.find((site) => normalizeUrl(site.url) === wanted);
  }

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function mainLinkHTML(site) {
    return `
      <a class="site-preview-link site-preview-main-link" href="${safeText(site.url)}" target="_blank" rel="noopener noreferrer" data-preview-open-url="${safeText(site.url)}">
        Main site <span aria-hidden="true">↗</span>
      </a>`;
  }

  function mirrorLinksHTML(site) {
    const mirrors = safeArray(site.links).filter((link) => WebShelfRuntime.safeUrl(link?.url) && normalizeUrl(link.url) !== normalizeUrl(site.url));
    if (!mirrors.length) return "";

    return `
      <div class="site-preview-mirrors">
        <span class="site-preview-subheading">Mirrors & alternate links</span>
        <div class="site-preview-links">
          ${mirrors.map((link, index) => `
            <a class="site-preview-link" href="${safeText(link.url)}" target="_blank" rel="noopener noreferrer" data-preview-open-url="${safeText(site.url)}">
              ${safeText(link.label || `Mirror ${index + 1}`)} <span aria-hidden="true">↗</span>
            </a>`).join("")}
        </div>
      </div>`;
  }

  function descriptionHTML(site) {
    const description = String(site.description || "").trim();
    if (!description) return "";
    return `<p class="site-preview-description">${safeText(description)}</p>`;
  }

  function screenshotsHTML(site) {
    const screenshots = safeArray(site.screenshots).filter(src => WebShelfRuntime.safeUrl(src, true));
    if (!screenshots.length) return "";
    return `
      <section class="site-preview-section">
        <h4>Screenshots</h4>
        <div class="site-preview-screenshots">
          ${screenshots.map((src, index) => `
            <a href="${safeText(src)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${safeText(site.name)} screenshot ${index + 1}">
              <img src="${safeText(src)}" alt="${safeText(site.name)} screenshot ${index + 1}" loading="lazy" decoding="async">
            </a>`).join("")}
        </div>
      </section>`;
  }

  function highlightsHTML(site) {
    const highlights = safeArray(site.highlights).filter((item) => item?.text);
    if (!highlights.length) return "";
    return `
      <section class="site-preview-section site-preview-highlights">
        <h4>Highlights</h4>
        <div class="site-preview-highlights-list">
          ${highlights.map((item) => {
            const type = item.type === "bad" ? "bad" : "good";
            return `<div class="site-preview-highlight ${type}"><span class="site-preview-highlight-symbol">${type === "bad" ? "−" : "+"}</span><span>${safeText(item.text)}</span></div>`;
          }).join("")}
        </div>
      </section>`;
  }

  function secondaryActionsHTML(site) {
    const supportUrl = `./support.html?type=broken-link&site=${encodeURIComponent(site.name)}&url=${encodeURIComponent(site.url)}`;
    const hiddenAction = typeof isSiteHidden === "function"
      ? `<button class="site-preview-action site-preview-hide" type="button" data-preview-hide="${safeText(site.url)}">${isSiteHidden(site.url) ? "Show in directory" : "Hide / Not interested"}</button>`
      : "";

    return `
      <div class="site-preview-personal-actions">
        <a class="site-preview-action site-preview-report" href="${safeText(supportUrl)}">Report this link</a>
        ${hiddenAction}
      </div>`;
  }

  let previewId = 0;
  function buildPreview(site) {
    const panel = document.createElement("div");
    panel.className = "site-inline-preview";
    panel.id = "webshelf-preview-" + (++previewId);
    panel.hidden = true;
    panel.dataset.previewUrl = site.url;

    panel.innerHTML = `
      <div class="site-inline-preview-inner">
        <div class="site-preview-heading">
          <div>
            <span class="site-preview-category">${safeText(site.category)}</span>
            <div class="site-preview-title-line"><h3>${safeText(site.name)}</h3></div>
            ${descriptionHTML(site)}
          </div>
        </div>

        <section class="site-preview-section">
          <h4>Links</h4>
          <div class="site-preview-links">${mainLinkHTML(site)}</div>
          ${mirrorLinksHTML(site)}
        </section>

        ${screenshotsHTML(site)}
        ${highlightsHTML(site)}
        ${secondaryActionsHTML(site)}
      </div>`;
    return panel;
  }

  function closeRow(row) {
    const button = row.querySelector(".site-preview-toggle");
    const panel = row.nextElementSibling;
    if (!button || !panel?.classList.contains("site-inline-preview")) return;
    if (panel.contains(document.activeElement)) button.focus();
    panel.hidden = true;
    button.classList.remove("active");
    button.setAttribute("aria-expanded", "false");
  }

  function closeAll(exceptRow = null) {
    document.querySelectorAll(".site-row, .activity-row").forEach((row) => {
      if (row !== exceptRow) closeRow(row);
    });
  }

  function toggleRow(row) {
    const button = row.querySelector(".site-preview-toggle");
    const panel = row.nextElementSibling;
    if (!button || !panel?.classList.contains("site-inline-preview")) return;
    const willOpen = panel.hidden;
    closeAll(row);
    panel.hidden = !willOpen;
    button.classList.toggle("active", willOpen);
    button.setAttribute("aria-expanded", String(willOpen));
  }

  function prepareRow(row) {
    if (row.dataset.previewReady === "true") return;
    const link = row.querySelector(".site-link, .activity-link");
    if (!link?.href) return;
    const site = findSite(link.href);
    if (!site) return;

    row.dataset.previewReady = "true";
    const button = document.createElement("button");
    button.className = "site-preview-toggle";
    button.type = "button";
    button.dataset.previewUrl = site.url;
    button.setAttribute("aria-label", `Show ${site.name} preview`);
    button.setAttribute("aria-expanded", "false");
    button.innerHTML = `<span aria-hidden="true">›</span>`;

    const remove = row.querySelector(".activity-remove, .activity-unhide");
    if (remove) row.insertBefore(button, remove);
    else row.appendChild(button);
    const panel = buildPreview(site);
    button.setAttribute("aria-controls", panel.id);
    row.insertAdjacentElement("afterend", panel);
  }

  function scan(root = document) {
    root.querySelectorAll(".site-row, .activity-row").forEach(prepareRow);
  }

  function showUndoToast(site) {
    document.querySelector(".webshelf-undo-toast")?.remove();
    const toast = document.createElement("div");
    toast.setAttribute("role", "status");
    toast.className = "webshelf-undo-toast";
    toast.innerHTML = `<span>${safeText(site.name)} hidden.</span><button type="button">Undo</button>`;
    document.body.appendChild(toast);

    const timer = window.setTimeout(() => toast.remove(), 5000);
    toast.querySelector("button")?.addEventListener("click", () => {
      window.clearTimeout(timer);
      if (typeof setSiteHidden === "function") setSiteHidden(site.url, false);
      toast.remove();
    });
  }

  document.addEventListener("click", (event) => {
    const toggle = event.target.closest(".site-preview-toggle");
    if (toggle) {
      event.preventDefault();
      event.stopPropagation();
      const row = toggle.closest(".site-row, .activity-row");
      if (row) toggleRow(row);
      return;
    }

    const previewLink = event.target.closest(".site-preview-link");
    if (previewLink) {
      const site = findSite(previewLink.dataset.previewOpenUrl);
      if (site && typeof addRecentlyViewed === "function") addRecentlyViewed(site);
      return;
    }

    const hide = event.target.closest("[data-preview-hide]");
    if (hide) {
      event.preventDefault();
      const site = findSite(hide.dataset.previewHide);
      if (!site || typeof setSiteHidden !== "function") return;
      const willHide = !isSiteHidden(site.url);
      setSiteHidden(site.url, willHide);
      closeAll();
      if (willHide) showUndoToast(site);
    }
  });

  document.addEventListener("webshelf-sites-rendered", () => scan());
  const observer = new MutationObserver(records => {
    for (const record of records) for (const node of record.addedNodes) {
      if (!(node instanceof Element)) continue;
      if (node.matches(".site-row, .activity-row")) prepareRow(node);
      if (node.querySelector(".site-row, .activity-row")) scan(node);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  scan();

  window.WebShelfPreview = {
    close: () => closeAll(),
    isOpen: () => Boolean(document.querySelector(".site-preview-toggle.active")),
    scan
  };
})();
