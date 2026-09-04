// ==================================================
// SMALL LOCAL ICON SET
// Replaces the external Lucide CDN for faster/offline-safe rendering.
// ==================================================

(() => {
  const icons = {
    play: '<polygon points="9 6 18 12 9 18 9 6"></polygon>',
    "book-open": '<path d="M4 5.5c2.8 0 5 .7 8 2.5v11c-3-1.8-5.2-2.5-8-2.5z"></path><path d="M20 5.5c-2.8 0-5 .7-8 2.5v11c3-1.8 5.2-2.5 8-2.5z"></path>',
    download: '<path d="M12 4v11"></path><path d="m8 11 4 4 4-4"></path><path d="M5 20h14"></path>',
    database: '<ellipse cx="12" cy="5" rx="7" ry="3"></ellipse><path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5"></path><path d="M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7"></path>',
    "calendar-days": '<rect x="4" y="5" width="16" height="15" rx="2"></rect><path d="M8 3v4M16 3v4M4 10h16"></path><path d="M8 14h2M14 14h2M8 17h2"></path>',
    folder: '<path d="M3 7.5a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>',
    "circle-alert": '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v6M12 17h.01"></path>',
    "layers-3": '<path d="m12 3 8 4-8 4-8-4z"></path><path d="m4 12 8 4 8-4"></path><path d="m4 17 8 4 8-4"></path>'
  };

  function render(root = document) {
    root.querySelectorAll("[data-lucide]").forEach((element) => {
      if (element.dataset.iconRendered === "true") return;
      const name = element.getAttribute("data-lucide") || "folder";
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("width", "24");
      svg.setAttribute("height", "24");
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "1.8");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");
      svg.setAttribute("aria-hidden", "true");
      svg.innerHTML = icons[name] || icons.folder;
      element.replaceWith(svg);
      svg.dataset.iconRendered = "true";
    });
  }

  window.WebShelfIcons = { render };
  // Compatibility with existing calls while removing the external dependency.
  window.lucide = { createIcons: render };
})();
