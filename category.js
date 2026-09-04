// ==================================================
// CATEGORY CONFIG
// ==================================================

const CategoryConfig = {

  "anime-streaming": {
    title: "Anime Streaming",
    icon: "play",
    color: "var(--anime-streaming)",
    sites: AnimeStreamingSites
  },

  "TV-streaming": {
    title: "TV Streaming",
    icon: "play",
    color: "var(--TV-streaming)",
    sites: TVStreamingSites
  },

  "sports-streaming": {
    title: "Sports Streaming",
    icon: "play",
    color: "var(--sports-streaming)",
    sites: SportsStreamingSites
  },

  "manga-reading": {
    title: "Manga Reading",
    icon: "book-open",
    color: "var(--manga-reading)",
    sites: MangaReadingSites
  },

  "manhwa-reading": {
    title: "Manhwa Reading",
    icon: "book-open",
    color: "var(--manhwa-reading)",
    sites: ManhwaReadingSites
  },

  "novel-reading": {
    title: "Novel Reading",
    icon: "book-open",
    color: "var(--novel-reading)",
    sites: NovelReadingSites
  },

  "anime-download": {
    title: "Anime Download",
    icon: "download",
    color: "var(--anime-download)",
    sites: AnimeDownloadSites
  },

  "TV-download": {
    title: "TV Download",
    icon: "download",
    color: "var(--TV-download)",
    sites: TVDownloadSites
  },

  "subtitle-download": {
    title: "Subtitle Download",
    icon: "download",
    color: "var(--subtitle-download)",
    sites: SubtitleDownloadSites
  },

  "anime-database": {
    title: "Anime Database",
    icon: "database",
    color: "var(--anime-database)",
    sites: AnimeDatabaseSites
  },

  "TV-database": {
    title: "TV Database",
    icon: "database",
    color: "var(--TV-database)",
    sites: TVDatabaseSites
  },

  "anime-schedule": {
    title: "Anime Schedule",
    icon: "calendar-days",
    color: "var(--anime-schedule)",
    sites: AnimeScheduleSites
  }

};



// ==================================================
// GET CATEGORY FROM URL
// ==================================================

const urlParams =
  new URLSearchParams(
    window.location.search
  );

const categoryType =
  urlParams.get("type");

const currentCategory =
  CategoryConfig[categoryType];



// ==================================================
// GET HTML ELEMENTS
// ==================================================

const pageTitle =
  document.querySelector(
    "#category-page-title"
  );

const pageCount =
  document.querySelector(
    "#category-page-count"
  );

const pageList =
  document.querySelector(
    "#category-page-list"
  );

const pageIcon =
  document.querySelector(
    "#category-page-icon"
  );

const lucideIcon =
  document.querySelector(
    "#category-page-lucide"
  );



// ==================================================
// CHECK PAGE ELEMENTS
// ==================================================

const pageElementsExist =
  pageTitle &&
  pageCount &&
  pageList &&
  pageIcon &&
  lucideIcon;



if (!pageElementsExist) {

  console.error(
    "WebShelf: Category page HTML is incomplete."
  );

}



// ==================================================
// INVALID CATEGORY
// ==================================================

else if (!currentCategory) {

  document.title =
    "Category Not Found - WebShelf";

  pageTitle.textContent =
    "Category not found";

  pageCount.textContent =
    "0 sites";

  pageIcon.style.color =
    "var(--text-muted)";

  lucideIcon.setAttribute(
    "data-lucide",
    "circle-alert"
  );


  pageList.innerHTML = `
    <div class="category-empty">

      <h2>
        Category not found
      </h2>

      <p>
        The category you're looking for doesn't exist
        or the link may be incorrect.
      </p>

      <a
        href="./index.html"
        class="category-empty-link"
      >
        Back to Directory
      </a>

    </div>
  `;

}



// ==================================================
// VALID CATEGORY
// ==================================================

else {

  document.title =
    `${currentCategory.title} - WebShelf`;

  pageTitle.textContent =
    currentCategory.title;

  pageCount.textContent =
    `${currentCategory.sites.length} sites`;

  pageIcon.style.color =
    currentCategory.color;

  lucideIcon.setAttribute(
    "data-lucide",
    currentCategory.icon
  );



  // ==================================================
  // EMPTY CATEGORY
  // ==================================================

  if (currentCategory.sites.length === 0) {

    pageList.innerHTML = `
      <div class="category-empty">

        <h2>
          No sites yet
        </h2>

        <p>
          We're still curating websites
          for this category.
        </p>

        <a
          href="./suggest.html"
          class="category-empty-link"
        >
          Suggest a site
        </a>

      </div>
    `;

  }



  // ==================================================
  // RENDER ALL SITES
  // ==================================================

  else {

    pageList.innerHTML =
      currentCategory.sites
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

}



// ==================================================
// CREATE LUCIDE ICONS
// ==================================================

if (window.lucide) {
  lucide.createIcons();
}