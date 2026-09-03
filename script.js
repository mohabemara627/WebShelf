// ==================================================
// CATEGORY CONFIG
// ==================================================

const categories = [
  {
    key: "anime-streaming",
    sites: AnimeStreamingSites
  },
  {
    key: "TV-streaming",
    sites: TVStreamingSites
  },
  {
    key: "sports-streaming",
    sites: SportsStreamingSites
  },
  {
    key: "manga-reading",
    sites: MangaReadingSites
  },
  {
    key: "manhwa-reading",
    sites: ManhwaReadingSites
  },
  {
    key: "novel-reading",
    sites: NovelReadingSites
  },
  {
    key: "anime-download",
    sites: AnimeDownloadSites
  },
  {
    key: "TV-download",
    sites: TVDownloadSites
  },
  {
    key: "subtitle-download",
    sites: SubtitleDownloadSites
  },
  {
    key: "anime-database",
    sites: AnimeDatabaseSites
  },
  {
    key: "anime-schedule",
    sites: AnimeScheduleSites
  },
  {
    key: "TV-database",
    sites: TVDatabaseSites
  }
];



// ==================================================
// RENDER CATEGORY
// ==================================================

function renderCategory(category) {

  const { key, sites } = category;


  const categoryCount =
    document.querySelector(
      `#${key}-count`
    );

  const panelCount =
    document.querySelector(
      `#${key}-panel-count`
    );

  const siteList =
    document.querySelector(
      `#${key}-list`
    );

  const viewAll =
    document.querySelector(
      `#${key}-view-all`
    );


  if (
    !categoryCount ||
    !panelCount ||
    !siteList ||
    !viewAll
  ) {

    console.error(
      `WebShelf: Missing HTML element for ${key}`
    );

    return;

  }


  // Total number of sites

  const totalSites =
    sites.length;


  // Update counts

  categoryCount.textContent =
    `${totalSites} sites`;

  panelCount.textContent =
    `${totalSites} sites`;

  viewAll.textContent =
    `View all ${totalSites} sites`;


  // Homepage only shows the first 5

  const visibleSites =
    sites.slice(0, 5);


  // Create site rows

  siteList.innerHTML =
    visibleSites
      .map((site, index) => {

        const rank =
          String(index + 1)
            .padStart(2, "0");


        const logo = site.icon
          ? `
            <img
              src="${site.icon}"
              alt="${site.name} logo"
            >
          `
          : `
            <span>
              ${site.name[0]}
            </span>
          `;


        return `
          <a
            class="site-row"
            href="${site.url}"
            target="_blank"
            rel="noopener noreferrer"
          >

            <span class="rank">
              ${rank}
            </span>

            <div class="site-logo">
              ${logo}
            </div>

            <span class="site-name">
              ${site.name}
            </span>

          </a>
        `;

      })
      .join("");

}



// ==================================================
// RENDER ALL CATEGORIES
// ==================================================

categories.forEach((category) => {
  renderCategory(category);
});



// ==================================================
// CATEGORY SCROLL + HIGHLIGHT
// ==================================================

let highlightStartTimer;
let highlightEndTimer;



function openCategoryPanel(panel) {

  clearTimeout(highlightStartTimer);
  clearTimeout(highlightEndTimer);


  // Remove old highlight

  document
    .querySelectorAll(
      ".directory-panel.highlight"
    )
    .forEach((highlightedPanel) => {

      highlightedPanel.classList.remove(
        "highlight"
      );

    });


  // Scroll to selected panel

  panel.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });


  // Highlight selected panel

  highlightStartTimer =
    setTimeout(() => {

      panel.classList.add(
        "highlight"
      );


      highlightEndTimer =
        setTimeout(() => {

          panel.classList.remove(
            "highlight"
          );

        }, 1500);

    }, 650);

}



// ==================================================
// CATEGORY CARD INTERACTIONS
// ==================================================

categories.forEach((category) => {

  const { key } = category;


  const card =
    document.querySelector(
      `.category.${key}`
    );

  const panel =
    document.querySelector(
      `.${key}-panel`
    );


  if (!card || !panel) {
    return;
  }


  // Make category card keyboard accessible

  card.setAttribute(
    "role",
    "button"
  );

  card.setAttribute(
    "tabindex",
    "0"
  );


  // Mouse

  card.addEventListener(
    "click",
    () => {

      openCategoryPanel(panel);

    }
  );


  // Keyboard

  card.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {

        event.preventDefault();

        openCategoryPanel(panel);

      }

    }
  );

});