// ==================================================
// THEME
// ==================================================

const themeToggle =
  document.querySelector("#theme-toggle");


const savedTheme =
  localStorage.getItem("webshelf-theme");


if (savedTheme) {

  document.documentElement.setAttribute(
    "data-theme",
    savedTheme
  );

}


function updateThemeButton() {

  const currentTheme =
    document.documentElement.getAttribute(
      "data-theme"
    );


  if (currentTheme === "light") {

    themeToggle.textContent = "☾";

    themeToggle.setAttribute(
      "aria-label",
      "Switch to dark mode"
    );

  } else {

    themeToggle.textContent = "☀";

    themeToggle.setAttribute(
      "aria-label",
      "Switch to light mode"
    );

  }

}


if (themeToggle) {

  updateThemeButton();


  themeToggle.addEventListener(
    "click",
    () => {

      const currentTheme =
        document.documentElement.getAttribute(
          "data-theme"
        );


      const newTheme =
        currentTheme === "light"
          ? "dark"
          : "light";


      document.documentElement.setAttribute(
        "data-theme",
        newTheme
      );


      localStorage.setItem(
        "webshelf-theme",
        newTheme
      );


      updateThemeButton();

    }
  );

}