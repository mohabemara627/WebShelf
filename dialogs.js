// ==================================================
// WEBSHELF DIALOGS
// ==================================================

(() => {
  let overlay = null;
  let resolver = null;
  let previousFocus = null;

  function ensureDialog() {
    if (overlay) return;

    overlay = document.createElement("div");
    overlay.className = "webshelf-dialog-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="webshelf-dialog" role="dialog" aria-modal="true" aria-labelledby="webshelf-dialog-title" aria-describedby="webshelf-dialog-message">
        <div class="webshelf-dialog-icon" aria-hidden="true">!</div>
        <div class="webshelf-dialog-copy">
          <h2 id="webshelf-dialog-title"></h2>
          <p id="webshelf-dialog-message"></p>
        </div>
        <div class="webshelf-dialog-actions">
          <button class="webshelf-dialog-cancel" type="button">Cancel</button>
          <button class="webshelf-dialog-confirm" type="button">Confirm</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    overlay.querySelector(".webshelf-dialog-cancel").addEventListener("click", () => finish(false));
    overlay.querySelector(".webshelf-dialog-confirm").addEventListener("click", () => finish(true));
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) finish(false);
    });

    document.addEventListener("keydown", (event) => {
      if (overlay.hidden) return;
      if (event.key === "Escape") {
        event.preventDefault();
        finish(false);
      }
    });
  }

  function finish(value) {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove("dialog-open");
    const done = resolver;
    resolver = null;
    const focus = previousFocus;
    previousFocus = null;
    if (focus && typeof focus.focus === "function" && document.contains(focus)) focus.focus();
    done?.(value);
  }

  function confirm(options = {}) {
    ensureDialog();
    if (resolver) finish(false);

    const settings = typeof options === "string" ? { message: options } : options;
    previousFocus = document.activeElement;

    const title = overlay.querySelector("#webshelf-dialog-title");
    const message = overlay.querySelector("#webshelf-dialog-message");
    const confirmButton = overlay.querySelector(".webshelf-dialog-confirm");
    const cancelButton = overlay.querySelector(".webshelf-dialog-cancel");
    const icon = overlay.querySelector(".webshelf-dialog-icon");

    title.textContent = settings.title || "Are you sure?";
    message.textContent = settings.message || "This action cannot be undone.";
    confirmButton.textContent = settings.confirmText || "Confirm";
    cancelButton.textContent = settings.cancelText || "Cancel";
    confirmButton.classList.toggle("danger", Boolean(settings.danger));
    icon.classList.toggle("danger", Boolean(settings.danger));

    overlay.hidden = false;
    document.body.classList.add("dialog-open");
    requestAnimationFrame(() => cancelButton.focus());

    return new Promise((resolve) => {
      resolver = resolve;
    });
  }

  window.WebShelfDialog = { confirm, close: () => finish(false) };
})();
