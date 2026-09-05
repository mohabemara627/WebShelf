// ==================================================
// THEME
// ==================================================

const themeToggle =
  document.querySelector("#theme-toggle");


const savedTheme =
  WebShelfRuntime.storage.getItem("webshelf-theme");


if (savedTheme === "dark" || savedTheme === "light") {

  document.documentElement.setAttribute(
    "data-theme",
    savedTheme
  );

}


function updateThemeButton() {
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.setAttribute("content", document.documentElement.getAttribute("data-theme") === "light" ? "#f5f5f7" : "#000000");

  if (!themeToggle) {
    return;
  }


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


      WebShelfRuntime.storage.setItem(
        "webshelf-theme",
        newTheme
      );


      updateThemeButton();

    }
  );

}
document.addEventListener("webshelf-theme-changed", () => {
  const theme = WebShelfRuntime.storage.getItem("webshelf-theme");
  document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "dark");
  updateThemeButton();
});
