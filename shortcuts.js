// ==================================================
// KEYBOARD SHORTCUTS
// ==================================================

(() => {
  function isTypingTarget(target) {
    return (
      target instanceof HTMLElement &&
      (target.matches("input, textarea, select") || target.isContentEditable)
    );
  }

  document.addEventListener("keydown", (event) => {
    const typing = isTypingTarget(event.target);

    if (event.key === "Escape") {
      window.WebShelfPreview?.close?.();
      window.WebShelfSearch?.close?.();
      window.WebShelfNavigation?.close?.();
      window.WebShelfDialog?.close?.();
      return;
    }

    const searchKey =
      !typing &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      event.key.toLowerCase() === "f";

    if (searchKey) {
      event.preventDefault();
      window.WebShelfSearch?.open?.();
    }
  });
})();
