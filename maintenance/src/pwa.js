// ==================================================
// PWA / INSTALL WEBSHELF
// ==================================================

(() => {
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch(() => {});
    });
  }

  let installPrompt = null;
  const buttons = [];

  function createButton(className = "install-app-button") {
    const button = document.createElement("button");
    button.className = className;
    button.type = "button";
    button.hidden = true;
    button.textContent = "Install app";
    button.setAttribute("aria-label", "Install WebShelf app");
    button.addEventListener("click", async () => {
      if (!installPrompt) return;
      const prompt = installPrompt;
      installPrompt = null;
      buttons.forEach((item) => { item.hidden = true; });
      try {
        await prompt.prompt();
        await prompt.userChoice;
      } catch { /* A dismissed or expired prompt must not reject globally. */ }
    });
    buttons.push(button);
    return button;
  }

  const footerLinks = document.querySelector(".footer-links");
  if (footerLinks) {
    footerLinks.appendChild(createButton("install-app-button footer-install-button"));
  }

  const mobileMenu = document.querySelector(".mobile-nav-menu");
  if (mobileMenu) {
    mobileMenu.appendChild(createButton("install-app-button mobile-install-button"));
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    buttons.forEach((button) => { button.hidden = false; });
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    buttons.forEach((button) => { button.hidden = true; });
  });
})();
