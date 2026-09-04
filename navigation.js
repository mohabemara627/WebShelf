// ==================================================
// WEBSHELF NAVIGATION
// ==================================================

(() => {

  const navLinks =
    document.querySelector(
      ".nav-links"
    );

  const header =
    document.querySelector(
      ".site-header"
    );

  if (!navLinks || !header) {
    return;
  }

  const currentFile =
    window.location.pathname
      .split("/")
      .pop() ||
    "index.html";

  const activeClass =
    currentFile === "activity.html"
      ? "activity"
      : currentFile === "support.html"
        ? "support"
        : currentFile === "suggest.html"
          ? "suggest"
          : "directory";

  navLinks
    .querySelectorAll("a")
    .forEach((link) => {
      link.classList.toggle(
        "active",
        link.classList.contains(
          activeClass
        )
      );
    });

  const menuToggle =
    document.createElement(
      "button"
    );

  menuToggle.className =
    "nav-menu-toggle";
  menuToggle.type = "button";
  menuToggle.setAttribute(
    "aria-label",
    "Open navigation menu"
  );
  menuToggle.setAttribute(
    "aria-expanded",
    "false"
  );
  menuToggle.textContent = "☰";

  navLinks.appendChild(
    menuToggle
  );

  const mobileMenu =
    document.createElement(
      "div"
    );

  mobileMenu.className =
    "mobile-nav-menu";
  mobileMenu.hidden = true;

  navLinks
    .querySelectorAll(
      ":scope > a"
    )
    .forEach((link) => {

      const clone =
        link.cloneNode(true);

      mobileMenu.appendChild(
        clone
      );

    });

  header.appendChild(
    mobileMenu
  );

  function open() {
    mobileMenu.hidden = false;
    mobileMenu.classList.add("open");
    menuToggle.classList.add("active");
    menuToggle.setAttribute(
      "aria-expanded",
      "true"
    );
  }

  function close() {
    mobileMenu.hidden = true;
    mobileMenu.classList.remove("open");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );
  }

  function isOpen() {
    return !mobileMenu.hidden;
  }

  menuToggle.addEventListener(
    "click",
    () => {
      isOpen()
        ? close()
        : open();
    }
  );

  document.addEventListener(
    "click",
    (event) => {

      if (!isOpen()) {
        return;
      }

      if (
        header.contains(
          event.target
        )
      ) {
        return;
      }

      close();

    }
  );

  window.addEventListener(
    "resize",
    () => {
      if (window.innerWidth > 700) {
        close();
      }
    }
  );

  window.WebShelfNavigation = {
    open,
    close,
    isOpen
  };

})();
