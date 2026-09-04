// ==================================================
// WEBSHELF DATA — EDIT THIS FILE ONLY
// ==================================================
//
// Add a SITE: copy one site object inside the category you want.
// Add a CATEGORY: copy one category object and change key/group/title/icon/accent/sites.
//
// Optional preview fields for any site:
// description: "A short, factual description of what makes this site useful.",
// links: [{ label: "Mirror 1", url: "https://mirror.example.com" }],
// screenshots: ["./images/screenshots/example-1.jpg"],
// highlights: [
//   { type: "good", text: "Fast" },
//   { type: "bad", text: "Heavy ads" }
// ],
// badges: ["Ar", "Dub", "Low Ads"],
// collections: ["Curated Collection"],
// addedAt: "2026-09-04T10:00:00.000Z",
// updatedAt: "2026-09-04T10:00:00.000Z",
// ==================================================

const WebShelfCategories = [
  {
    "key": "anime-streaming",
    "group": "Streaming",
    "title": "Anime Streaming",
    "icon": "play",
    "accent": "var(--anime-streaming)",
    "sites": [
      {
        "name": "Anime Nexus",
        "url": "https://anime.nexus/",
        "icon": "./images/icons/animenexus.png"
      },
      {
        "name": "AniKoto",
        "url": "https://anikototv.to/home",
        "icon": "./images/icons/anikoto.png"
      },
      {
        "name": "Re:Anime",
        "url": "https://reanime.to/home",
        "icon": "./images/icons/reanime.png"
      },
      {
        "name": "Miruro",
        "url": "https://www.miruro.to/",
        "icon": "./images/icons/miruro.png"
      },
      {
        "name": "AnimeX",
        "url": "https://animex.one/home",
        "icon": "./images/icons/animex.png"
      },
      {
        "name": "Animepahe",
        "url": "https://animepahe.ch/",
        "icon": "./images/icons/animepahe.png"
      },
      {
        "name": "MKissa",
        "url": "https://mkissa.to/anime",
        "icon": "./images/icons/mkissa.png"
      },
      {
        "name": "AniZone",
        "url": "https://anizone.to/",
        "icon": "./images/icons/anizone.ico"
      },
      {
        "name": "123anime",
        "url": "https://123animehub.cc/home",
        "icon": "./images/icons/123anime.png"
      },
      {
        "name": "2Dhive",
        "url": "https://2dhive.com/",
        "icon": "./images/icons/2dhive.png"
      }
    ]
  },
  {
    "key": "TV-streaming",
    "group": "Streaming",
    "title": "TV Streaming",
    "icon": "play",
    "accent": "var(--TV-streaming)",
    "sites": [
      {
        "name": "Movy",
        "url": "https://www.movy.bz/",
        "icon": "./images/icons/movy.png"
      },
      {
        "name": "HuraWatch",
        "url": "https://hurawatch.cz/home",
        "icon": "./images/icons/hurawatch.png",
        "badges": [
          "Ar"
        ]
      },
      {
        "name": "FLIXER",
        "url": "https://flixer.gd/?tv=&id=202555",
        "icon": "./images/icons/flixer.png"
      },
      {
        "name": "REELIX",
        "url": "https://reelix.ac/",
        "icon": "./images/icons/reelix.png"
      },
      {
        "name": "HEXA",
        "url": "https://hexa.su/",
        "icon": "./images/icons/hexa.png"
      },
      {
        "name": "Cinejoy",
        "url": "https://cinejoy.to/",
        "icon": "./images/icons/cinejoy.png"
      },
      {
        "name": "CinemaOS",
        "url": "https://cinemaos.live/",
        "icon": "./images/icons/cinemaos.png"
      },
      {
        "name": "WatchLuna",
        "url": "https://watchluna.com/",
        "icon": "./images/icons/watchluna.png"
      },
      {
        "name": "HDToday",
        "url": "https://hdtoday.one/",
        "icon": "./images/icons/hdtoday.png"
      },
      {
        "name": "PopcornMovies",
        "url": "https://popcornmovies.ac/",
        "icon": "./images/icons/popcornmovies.png"
      }
    ]
  },
  {
    "key": "sports-streaming",
    "group": "Streaming",
    "title": "Sports Streaming",
    "icon": "play",
    "accent": "var(--sports-streaming)",
    "sites": [
      {
        "name": "Streamed",
        "url": "https://streamed.pk/",
        "icon": "./images/icons/streamed.png"
      },
      {
        "name": "WatchFooty",
        "url": "https://watchfooty.st/en",
        "icon": "./images/icons/watchfooty.png"
      },
      {
        "name": "SportsBite",
        "url": "https://sportsbite.org/",
        "icon": "./images/icons/sportsbite.png"
      },
      {
        "name": "BinTV",
        "url": "https://www.bintv.cc/",
        "icon": "./images/icons/bintv.png"
      },
      {
        "name": "NTV",
        "url": "https://ntv.cx/matches/kobra",
        "icon": "./images/icons/ntv.png"
      },
      {
        "name": "PPV",
        "url": "https://ppv.st/#34",
        "icon": "./images/icons/ppv.ico"
      },
      {
        "name": "TIMST",
        "url": "https://timst.cfd/live-tv",
        "icon": "./images/icons/timst.ico"
      },
      {
        "name": "LiveTV",
        "url": "https://livetv.sx/enx/",
        "icon": "./images/icons/livetv.png"
      },
      {
        "name": "DLive",
        "url": "https://dlive.sx/",
        "icon": "./images/icons/dlive.png"
      },
      {
        "name": "RoxieStreams",
        "url": "https://roxiestreams.su/",
        "icon": "./images/icons/roxiestreams.png"
      }
    ]
  },
  {
    "key": "manga-reading",
    "group": "Reading",
    "title": "Manga Reading",
    "icon": "book-open",
    "accent": "var(--manga-reading)",
    "sites": [
      {
        "name": "MangaDotNet",
        "url": "https://mangadot.net/",
        "icon": "./images/icons/mangadotnet.png"
      },
      {
        "name": "Atsumaru",
        "url": "https://atsu.moe/",
        "icon": "./images/icons/atsumaru.png"
      },
      {
        "name": "Weeb Central",
        "url": "https://weebcentral.com/",
        "icon": "./images/icons/weeb-central.ico"
      },
      {
        "name": "MKissa",
        "url": "https://mkissa.to/manga",
        "icon": "./images/icons/mkissa.png"
      },
      {
        "name": "MangaBall",
        "url": "https://mangaball.net/",
        "icon": "./images/icons/mangaball.ico"
      },
      {
        "name": "Chikari",
        "url": "https://chikari.moe/",
        "icon": "./images/icons/chikari.svg"
      },
      {
        "name": "Comix",
        "url": "https://comix.to/",
        "icon": "./images/icons/comix.png"
      },
      {
        "name": "OniSaga",
        "url": "https://onisaga.com/",
        "icon": "./images/icons/onisaga.png"
      },
      {
        "name": "MangaGo",
        "url": "https://www.mangago.me/",
        "icon": "./images/icons/mangago.ico"
      },
      {
        "name": "MangaFire",
        "url": "https://mangafire.to/",
        "icon": "./images/icons/mangafire.svg"
      }
    ]
  },
  {
    "key": "manhwa-reading",
    "group": "Reading",
    "title": "Manhwa Reading",
    "icon": "book-open",
    "accent": "var(--manhwa-reading)",
    "sites": [
      {
        "name": "WEBTOON",
        "url": "https://www.webtoons.com/",
        "icon": "./images/icons/webtoon.ico"
      },
      {
        "name": "Asura Scans",
        "url": "https://asuracomic.net/",
        "icon": "./images/icons/asura-scans.png"
      },
      {
        "name": "ManhwaTop",
        "url": "https://manhwatop.com/",
        "icon": "./images/icons/manhwatop.png"
      },
      {
        "name": "ProjectSuki",
        "url": "https://projectsuki.com/",
        "icon": "./images/icons/projectsuki.png"
      },
      {
        "name": "Diva Scans",
        "url": "https://divatoon.com/",
        "icon": "./images/icons/diva-scans.png"
      },
      {
        "name": "KuraManga",
        "url": "https://kuramanga.com/",
        "icon": "./images/icons/kuramanga.png"
      },
      {
        "name": "MangaGG",
        "url": "https://mangagg.com/",
        "icon": "./images/icons/mangagg.png"
      },
      {
        "name": "Cocomics",
        "url": "https://cocomic.co/",
        "icon": "./images/icons/cocomics.png"
      },
      {
        "name": "Galaxy Manga",
        "url": "https://galaxymanga.io/",
        "icon": "./images/icons/galaxy-manga.png"
      },
      {
        "name": "Flame Comics",
        "url": "https://flamecomics.xyz/",
        "icon": "./images/icons/flame-comics.ico"
      }
    ]
  },
  {
    "key": "novel-reading",
    "group": "Reading",
    "title": "Novel Reading",
    "icon": "book-open",
    "accent": "var(--novel-reading)",
    "sites": [
      {
        "name": "NovelBuddy",
        "url": "https://novelbuddy.me/home",
        "icon": "./images/icons/novelbuddy.ico"
      },
      {
        "name": "NovelArchive",
        "url": "https://novelarchive.cc/",
        "icon": "./images/icons/novelarchive.png"
      },
      {
        "name": "NovelFire",
        "url": "https://novelfire.net/home",
        "icon": "./images/icons/novelfire.png"
      },
      {
        "name": "FreeWebNovel",
        "url": "https://freewebnovel.com/",
        "icon": "./images/icons/freewebnovel.ico"
      },
      {
        "name": "Chikari Novel",
        "url": "https://chikari.moe/novels",
        "icon": "./images/icons/chikari-novel.png"
      },
      {
        "name": "NovelCool",
        "url": "https://www.novelcool.com/",
        "icon": "./images/icons/novelcool.ico"
      },
      {
        "name": "Royal Road",
        "url": "https://www.royalroad.com/",
        "icon": "./images/icons/royal-road.png"
      },
      {
        "name": "WuxiaBox",
        "url": "https://www.wuxiabox.com/",
        "icon": "./images/icons/wuxiabox.ico"
      },
      {
        "name": "XNovel",
        "url": "https://xnovel.me/",
        "icon": "./images/icons/xnovel.png"
      },
      {
        "name": "MVLEMPYR",
        "url": "https://www.mvlempyr.com/",
        "icon": "./images/icons/mvlempyr.png"
      }
    ]
  },
  {
    "key": "anime-download",
    "group": "Download",
    "title": "Anime Download",
    "icon": "download",
    "accent": "var(--anime-download)",
    "sites": [
      {
        "name": "Nyaa",
        "url": "https://nyaa.si/",
        "icon": "./images/icons/nyaa.png"
      },
      {
        "name": "TsukiHime",
        "url": "https://tsukihime.org/",
        "icon": "./images/icons/tsukihime.png"
      },
      {
        "name": "Anime Tosho",
        "url": "https://animetosho.org/",
        "icon": "./images/icons/tosho.png"
      },
      {
        "name": "SubsPlease",
        "url": "https://subsplease.org/",
        "icon": "./images/icons/subsplease.png"
      },
      {
        "name": "Tokyo Toshokan",
        "url": "https://www.tokyotosho.info/",
        "icon": "./images/icons/toshokan.png"
      },
      {
        "name": "SeaDex",
        "url": "https://releases.moe/",
        "icon": "./images/icons/seadex.png"
      },
      {
        "name": "NekoBT",
        "url": "https://nekobt.to/",
        "icon": "./images/icons/nekobt.webp"
      },
      {
        "name": "AniRena",
        "url": "https://www.anirena.com/",
        "icon": "./images/icons/anirena.png"
      },
      {
        "name": "AnimeWatch",
        "url": "https://animewat.ch/",
        "icon": "./images/icons/animewatch.ico"
      },
      {
        "name": "Tokyo Insider",
        "url": "https://tokyoinsider.com/",
        "icon": "./images/icons/tokyo-insider.png"
      }
    ]
  },
  {
    "key": "TV-download",
    "group": "Download",
    "title": "TV Download",
    "icon": "download",
    "accent": "var(--TV-download)",
    "sites": [
      {
        "name": "EXT Torrents",
        "url": "https://ext.to/",
        "icon": "./images/icons/ext-torrents.png"
      },
      {
        "name": "1337x",
        "url": "https://1337x.to/home/",
        "icon": "./images/icons/1337x.png"
      },
      {
        "name": "The Pirate Bay",
        "url": "https://thepiratebay.org/index.html",
        "icon": "./images/icons/the-pirate-bay.ico"
      },
      {
        "name": "TorrentGalaxy",
        "url": "https://torrentgalaxy.info/",
        "icon": "./images/icons/torrentgalaxy.ico"
      },
      {
        "name": "EZTV",
        "url": "https://eztv.tf/home",
        "icon": "./images/icons/eztv.ico"
      },
      {
        "name": "RARBG Dump",
        "url": "https://rarbgdump.com/?q=daredevil",
        "icon": "./images/icons/rarbg-dump.ico"
      },
      {
        "name": "LimeTorrents",
        "url": "https://www.limetorrents.fun/search/all/daredevil/date/1/",
        "icon": "./images/icons/limetorrents.ico"
      },
      {
        "name": "YTS",
        "url": "https://yts.rs/",
        "icon": "./images/icons/yts.png"
      },
      {
        "name": "IPTorrents",
        "url": "https://ipt.cool/login.php",
        "icon": "./images/icons/iptorrents.ico"
      },
      {
        "name": "Rutor",
        "url": "https://rutor.is/",
        "icon": "./images/icons/rutor.ico"
      }
    ]
  },
  {
    "key": "subtitle-download",
    "group": "Download",
    "title": "Subtitle Download",
    "icon": "download",
    "accent": "var(--subtitle-download)",
    "sites": [
      {
        "name": "OpenSubtitles",
        "url": "https://www.opensubtitles.com/",
        "icon": "./images/icons/opensubtitles.png",
        "badges": [
          "Ar"
        ]
      },
      {
        "name": "SubDL",
        "url": "https://subdl.com/",
        "icon": "./images/icons/subdl.png",
        "badges": [
          "Ar"
        ]
      },
      {
        "name": "Subtitle Cat",
        "url": "https://subtitlecat.com/",
        "icon": "./images/icons/subtitle-cat.png",
        "badges": [
          "Ar"
        ]
      },
      {
        "name": "TVSubs",
        "url": "https://www.tvsubs.net/",
        "icon": "./images/icons/tvsubs.ico",
        "badges": [
          "Ar"
        ]
      },
      {
        "name": "Addic7ed",
        "url": "https://www.addic7ed.com/",
        "icon": "./images/icons/addic7ed.ico",
        "badges": [
          "Ar"
        ]
      },
      {
        "name": "TVSubtitles",
        "url": "https://www.tvsubtitles.net/",
        "icon": "./images/icons/tvsubtitles.ico",
        "badges": [
          "Ar"
        ]
      },
      {
        "name": "YIFY Subtitles",
        "url": "https://yifysubtitles.ch/",
        "icon": "./images/icons/yify-subtitles.ico"
      },
      {
        "name": "MySubs",
        "url": "https://my-subs.co/",
        "icon": "./images/icons/mysubs.png",
        "badges": [
          "Ar"
        ]
      },
      {
        "name": "SubSource",
        "url": "https://subsource.net/",
        "icon": "./images/icons/subsource.png",
        "badges": [
          "Ar"
        ]
      },
      {
        "name": "SubF2M",
        "url": "https://subf2m.co/",
        "icon": "./images/icons/subf2m.ico",
        "badges": [
          "Ar"
        ]
      }
    ]
  },
  {
    "key": "anime-database",
    "group": "Databases & Schedules",
    "title": "Anime Database",
    "icon": "database",
    "accent": "var(--anime-database)",
    "sites": [
      {
        "name": "MyAnimeList",
        "url": "https://myanimelist.net/",
        "icon": "./images/icons/myanimelist.svg"
      },
      {
        "name": "AniList",
        "url": "https://anilist.co/",
        "icon": "./images/icons/anilist.png"
      },
      {
        "name": "MangaBaka",
        "url": "https://mangabaka.org/",
        "icon": "./images/icons/mangabaka.png"
      },
      {
        "name": "Comick",
        "url": "https://comick.dev/",
        "icon": "./images/icons/comick.ico"
      },
      {
        "name": "Anime-Planet",
        "url": "https://www.anime-planet.com/",
        "icon": "./images/icons/anime-planet.jpg"
      },
      {
        "name": "Kitsu",
        "url": "https://kitsu.app/",
        "icon": "./images/icons/kitsu.ico"
      },
      {
        "name": "AniSearch",
        "url": "https://www.anisearch.com/",
        "icon": "./images/icons/anisearch.png"
      },
      {
        "name": "AniDB",
        "url": "https://anidb.net/",
        "icon": "./images/icons/anidb.png"
      },
      {
        "name": "Anime News Network",
        "url": "https://www.animenewsnetwork.com/",
        "icon": "./images/icons/anime-news-network.ico"
      },
      {
        "name": "Kuroiru",
        "url": "https://kuroiru.co/app",
        "icon": "./images/icons/kuroiru.png"
      }
    ]
  },
  {
    "key": "anime-schedule",
    "group": "Databases & Schedules",
    "title": "Anime Schedule",
    "icon": "database",
    "accent": "var(--anime-schedule)",
    "sites": [
      {
        "name": "LiveChart",
        "url": "https://www.livechart.me/",
        "icon": "./images/icons/livechart.png"
      },
      {
        "name": "AniChart",
        "url": "https://anichart.net/",
        "icon": "./images/icons/anichart.ico"
      },
      {
        "name": "English Dubbed",
        "url": "https://english-dubbed.com/",
        "icon": "./images/icons/english-dubbed.png"
      },
      {
        "name": "AnimeSchedule",
        "url": "https://animeschedule.net/",
        "icon": "./images/icons/animeschedule.png"
      },
      {
        "name": "Otaku Calendar",
        "url": "https://otakucalendar.com/",
        "icon": "./images/icons/otaku-calendar.png"
      },
      {
        "name": "AnimeAiring",
        "url": "https://animeairing.com/",
        "icon": "./images/icons/animeairing.png"
      },
      {
        "name": "AnimeCountdown",
        "url": "https://animecountdown.com/",
        "icon": "./images/icons/animecountdown.ico"
      },
      {
        "name": "Senpai.moe",
        "url": "https://senpai.moe/",
        "icon": "./images/icons/senpai-moe.ico"
      },
      {
        "name": "anica.jp",
        "url": "https://anica.jp/",
        "icon": "./images/icons/anica-jp.png"
      },
      {
        "name": "SubsPlease Schedule",
        "url": "https://subsplease.org/schedule/",
        "icon": "./images/icons/subsplease-schedule.ico"
      }
    ]
  },
  {
    "key": "TV-database",
    "group": "Databases & Schedules",
    "title": "TV Database",
    "icon": "database",
    "accent": "var(--TV-database)",
    "sites": [
      {
        "name": "IMDb",
        "url": "https://www.imdb.com/",
        "icon": "./images/icons/imdb.png"
      },
      {
        "name": "TMDB",
        "url": "https://www.themoviedb.org/",
        "icon": "./images/icons/tmdb.png"
      },
      {
        "name": "TVmaze",
        "url": "https://www.tvmaze.com/",
        "icon": "./images/icons/tvmaze.png"
      },
      {
        "name": "TheTVDB",
        "url": "https://thetvdb.com/",
        "icon": "./images/icons/thetvdb.png"
      },
      {
        "name": "Trakt",
        "url": "https://trakt.tv/",
        "icon": "./images/icons/trakt.png"
      },
      {
        "name": "Letterboxd",
        "url": "https://letterboxd.com/",
        "icon": "./images/icons/letterboxd.ico"
      },
      {
        "name": "Rotten Tomatoes",
        "url": "https://www.rottentomatoes.com/",
        "icon": "./images/icons/rotten-tomatoes.jpg"
      },
      {
        "name": "Metacritic",
        "url": "https://www.metacritic.com/",
        "icon": "./images/icons/metacritic.svg"
      },
      {
        "name": "JustWatch",
        "url": "https://www.justwatch.com/",
        "icon": "./images/icons/justwatch.png"
      },
      {
        "name": "Simkl",
        "url": "https://simkl.com/",
        "icon": "./images/icons/simkl.ico"
      }
    ]
  }
];

// ==================================================
// CATALOG SNAPSHOT FOR THE LOCAL MANAGER
// ==================================================
/* WEBSHELF_CATALOG_JSON_START
[
  {
    "key": "anime-streaming",
    "group": "Streaming",
    "title": "Anime Streaming",
    "icon": "play",
    "accent": "var(--anime-streaming)",
    "sites": [
      {
        "name": "Anime Nexus",
        "url": "https://anime.nexus/",
        "icon": "./images/icons/animenexus.png"
      },
      {
        "name": "AniKoto",
        "url": "https://anikototv.to/home",
        "icon": "./images/icons/anikoto.png"
      },
      {
        "name": "Re:Anime",
        "url": "https://reanime.to/home",
        "icon": "./images/icons/reanime.png"
      },
      {
        "name": "Miruro",
        "url": "https://www.miruro.to/",
        "icon": "./images/icons/miruro.png"
      },
      {
        "name": "AnimeX",
        "url": "https://animex.one/home",
        "icon": "./images/icons/animex.png"
      },
      {
        "name": "Animepahe",
        "url": "https://animepahe.ch/",
        "icon": "./images/icons/animepahe.png"
      },
      {
        "name": "MKissa",
        "url": "https://mkissa.to/anime",
        "icon": "./images/icons/mkissa.png"
      },
      {
        "name": "AniZone",
        "url": "https://anizone.to/",
        "icon": "./images/icons/anizone.ico"
      },
      {
        "name": "123anime",
        "url": "https://123animehub.cc/home",
        "icon": "./images/icons/123anime.png"
      },
      {
        "name": "2Dhive",
        "url": "https://2dhive.com/",
        "icon": "./images/icons/2dhive.png"
      }
    ]
  },
  {
    "key": "TV-streaming",
    "group": "Streaming",
    "title": "TV Streaming",
    "icon": "play",
    "accent": "var(--TV-streaming)",
    "sites": [
      {
        "name": "Movy",
        "url": "https://www.movy.bz/",
        "icon": "./images/icons/movy.png"
      },
      {
        "name": "HuraWatch",
        "url": "https://hurawatch.cz/home",
        "icon": "./images/icons/hurawatch.png",
        "badges": [
          "Ar"
        ]
      },
      {
        "name": "FLIXER",
        "url": "https://flixer.gd/?tv=&id=202555",
        "icon": "./images/icons/flixer.png"
      },
      {
        "name": "REELIX",
        "url": "https://reelix.ac/",
        "icon": "./images/icons/reelix.png"
      },
      {
        "name": "HEXA",
        "url": "https://hexa.su/",
        "icon": "./images/icons/hexa.png"
      },
      {
        "name": "Cinejoy",
        "url": "https://cinejoy.to/",
        "icon": "./images/icons/cinejoy.png"
      },
      {
        "name": "CinemaOS",
        "url": "https://cinemaos.live/",
        "icon": "./images/icons/cinemaos.png"
      },
      {
        "name": "WatchLuna",
        "url": "https://watchluna.com/",
        "icon": "./images/icons/watchluna.png"
      },
      {
        "name": "HDToday",
        "url": "https://hdtoday.one/",
        "icon": "./images/icons/hdtoday.png"
      },
      {
        "name": "PopcornMovies",
        "url": "https://popcornmovies.ac/",
        "icon": "./images/icons/popcornmovies.png"
      }
    ]
  },
  {
    "key": "sports-streaming",
    "group": "Streaming",
    "title": "Sports Streaming",
    "icon": "play",
    "accent": "var(--sports-streaming)",
    "sites": [
      {
        "name": "Streamed",
        "url": "https://streamed.pk/",
        "icon": "./images/icons/streamed.png"
      },
      {
        "name": "WatchFooty",
        "url": "https://watchfooty.st/en",
        "icon": "./images/icons/watchfooty.png"
      },
      {
        "name": "SportsBite",
        "url": "https://sportsbite.org/",
        "icon": "./images/icons/sportsbite.png"
      },
      {
        "name": "BinTV",
        "url": "https://www.bintv.cc/",
        "icon": "./images/icons/bintv.png"
      },
      {
        "name": "NTV",
        "url": "https://ntv.cx/matches/kobra",
        "icon": "./images/icons/ntv.png"
      },
      {
        "name": "PPV",
        "url": "https://ppv.st/#34",
        "icon": "./images/icons/ppv.ico"
      },
      {
        "name": "TIMST",
        "url": "https://timst.cfd/live-tv",
        "icon": "./images/icons/timst.ico"
      },
      {
        "name": "LiveTV",
        "url": "https://livetv.sx/enx/",
        "icon": "./images/icons/livetv.png"
      },
      {
        "name": "DLive",
        "url": "https://dlive.sx/",
        "icon": "./images/icons/dlive.png"
      },
      {
        "name": "RoxieStreams",
        "url": "https://roxiestreams.su/",
        "icon": "./images/icons/roxiestreams.png"
      }
    ]
  },
  {
    "key": "manga-reading",
    "group": "Reading",
    "title": "Manga Reading",
    "icon": "book-open",
    "accent": "var(--manga-reading)",
    "sites": [
      {
        "name": "MangaDotNet",
        "url": "https://mangadot.net/",
        "icon": "./images/icons/mangadotnet.png"
      },
      {
        "name": "Atsumaru",
        "url": "https://atsu.moe/",
        "icon": "./images/icons/atsumaru.png"
      },
      {
        "name": "Weeb Central",
        "url": "https://weebcentral.com/",
        "icon": "./images/icons/weeb-central.ico"
      },
      {
        "name": "MKissa",
        "url": "https://mkissa.to/manga",
        "icon": "./images/icons/mkissa.png"
      },
      {
        "name": "MangaBall",
        "url": "https://mangaball.net/",
        "icon": "./images/icons/mangaball.ico"
      },
      {
        "name": "Chikari",
        "url": "https://chikari.moe/",
        "icon": "./images/icons/chikari.svg"
      },
      {
        "name": "Comix",
        "url": "https://comix.to/",
        "icon": "./images/icons/comix.png"
      },
      {
        "name": "OniSaga",
        "url": "https://onisaga.com/",
        "icon": "./images/icons/onisaga.png"
      },
      {
        "name": "MangaGo",
        "url": "https://www.mangago.me/",
        "icon": "./images/icons/mangago.ico"
      },
      {
        "name": "MangaFire",
        "url": "https://mangafire.to/",
        "icon": "./images/icons/mangafire.svg"
      }
    ]
  },
  {
    "key": "manhwa-reading",
    "group": "Reading",
    "title": "Manhwa Reading",
    "icon": "book-open",
    "accent": "var(--manhwa-reading)",
    "sites": [
      {
        "name": "WEBTOON",
        "url": "https://www.webtoons.com/",
        "icon": "./images/icons/webtoon.ico"
      },
      {
        "name": "Asura Scans",
        "url": "https://asuracomic.net/",
        "icon": "./images/icons/asura-scans.png"
      },
      {
        "name": "ManhwaTop",
        "url": "https://manhwatop.com/",
        "icon": "./images/icons/manhwatop.png"
      },
      {
        "name": "ProjectSuki",
        "url": "https://projectsuki.com/",
        "icon": "./images/icons/projectsuki.png"
      },
      {
        "name": "Diva Scans",
        "url": "https://divatoon.com/",
        "icon": "./images/icons/diva-scans.png"
      },
      {
        "name": "KuraManga",
        "url": "https://kuramanga.com/",
        "icon": "./images/icons/kuramanga.png"
      },
      {
        "name": "MangaGG",
        "url": "https://mangagg.com/",
        "icon": "./images/icons/mangagg.png"
      },
      {
        "name": "Cocomics",
        "url": "https://cocomic.co/",
        "icon": "./images/icons/cocomics.png"
      },
      {
        "name": "Galaxy Manga",
        "url": "https://galaxymanga.io/",
        "icon": "./images/icons/galaxy-manga.png"
      },
      {
        "name": "Flame Comics",
        "url": "https://flamecomics.xyz/",
        "icon": "./images/icons/flame-comics.ico"
      }
    ]
  },
  {
    "key": "novel-reading",
    "group": "Reading",
    "title": "Novel Reading",
    "icon": "book-open",
    "accent": "var(--novel-reading)",
    "sites": [
      {
        "name": "NovelBuddy",
        "url": "https://novelbuddy.me/home",
        "icon": "./images/icons/novelbuddy.ico"
      },
      {
        "name": "NovelArchive",
        "url": "https://novelarchive.cc/",
        "icon": "./images/icons/novelarchive.png"
      },
      {
        "name": "NovelFire",
        "url": "https://novelfire.net/home",
        "icon": "./images/icons/novelfire.png"
      },
      {
        "name": "FreeWebNovel",
        "url": "https://freewebnovel.com/",
        "icon": "./images/icons/freewebnovel.ico"
      },
      {
        "name": "Chikari Novel",
        "url": "https://chikari.moe/novels",
        "icon": "./images/icons/chikari-novel.png"
      },
      {
        "name": "NovelCool",
        "url": "https://www.novelcool.com/",
        "icon": "./images/icons/novelcool.ico"
      },
      {
        "name": "Royal Road",
        "url": "https://www.royalroad.com/",
        "icon": "./images/icons/royal-road.png"
      },
      {
        "name": "WuxiaBox",
        "url": "https://www.wuxiabox.com/",
        "icon": "./images/icons/wuxiabox.ico"
      },
      {
        "name": "XNovel",
        "url": "https://xnovel.me/",
        "icon": "./images/icons/xnovel.png"
      },
      {
        "name": "MVLEMPYR",
        "url": "https://www.mvlempyr.com/",
        "icon": "./images/icons/mvlempyr.png"
      }
    ]
  },
  {
    "key": "anime-download",
    "group": "Download",
    "title": "Anime Download",
    "icon": "download",
    "accent": "var(--anime-download)",
    "sites": [
      {
        "name": "Nyaa",
        "url": "https://nyaa.si/",
        "icon": "./images/icons/nyaa.png"
      },
      {
        "name": "TsukiHime",
        "url": "https://tsukihime.org/",
        "icon": "./images/icons/tsukihime.png"
      },
      {
        "name": "Anime Tosho",
        "url": "https://animetosho.org/",
        "icon": "./images/icons/tosho.png"
      },
      {
        "name": "SubsPlease",
        "url": "https://subsplease.org/",
        "icon": "./images/icons/subsplease.png"
      },
      {
        "name": "Tokyo Toshokan",
        "url": "https://www.tokyotosho.info/",
        "icon": "./images/icons/toshokan.png"
      },
      {
        "name": "SeaDex",
        "url": "https://releases.moe/",
        "icon": "./images/icons/seadex.png"
      },
      {
        "name": "NekoBT",
        "url": "https://nekobt.to/",
        "icon": "./images/icons/nekobt.webp"
      },
      {
        "name": "AniRena",
        "url": "https://www.anirena.com/",
        "icon": "./images/icons/anirena.png"
      },
      {
        "name": "AnimeWatch",
        "url": "https://animewat.ch/",
        "icon": "./images/icons/animewatch.ico"
      },
      {
        "name": "Tokyo Insider",
        "url": "https://tokyoinsider.com/",
        "icon": "./images/icons/tokyo-insider.png"
      }
    ]
  },
  {
    "key": "TV-download",
    "group": "Download",
    "title": "TV Download",
    "icon": "download",
    "accent": "var(--TV-download)",
    "sites": [
      {
        "name": "EXT Torrents",
        "url": "https://ext.to/",
        "icon": "./images/icons/ext-torrents.png"
      },
      {
        "name": "1337x",
        "url": "https://1337x.to/home/",
        "icon": "./images/icons/1337x.png"
      },
      {
        "name": "The Pirate Bay",
        "url": "https://thepiratebay.org/index.html",
        "icon": "./images/icons/the-pirate-bay.ico"
      },
      {
        "name": "TorrentGalaxy",
        "url": "https://torrentgalaxy.info/",
        "icon": "./images/icons/torrentgalaxy.ico"
      },
      {
        "name": "EZTV",
        "url": "https://eztv.tf/home",
        "icon": "./images/icons/eztv.ico"
      },
      {
        "name": "RARBG Dump",
        "url": "https://rarbgdump.com/?q=daredevil",
        "icon": "./images/icons/rarbg-dump.ico"
      },
      {
        "name": "LimeTorrents",
        "url": "https://www.limetorrents.fun/search/all/daredevil/date/1/",
        "icon": "./images/icons/limetorrents.ico"
      },
      {
        "name": "YTS",
        "url": "https://yts.rs/",
        "icon": "./images/icons/yts.png"
      },
      {
        "name": "IPTorrents",
        "url": "https://ipt.cool/login.php",
        "icon": "./images/icons/iptorrents.ico"
      },
      {
        "name": "Rutor",
        "url": "https://rutor.is/",
        "icon": "./images/icons/rutor.ico"
      }
    ]
  },
  {
    "key": "subtitle-download",
    "group": "Download",
    "title": "Subtitle Download",
    "icon": "download",
    "accent": "var(--subtitle-download)",
    "sites": [
      {
        "name": "OpenSubtitles",
        "url": "https://www.opensubtitles.com/",
        "icon": "./images/icons/opensubtitles.png",
        "badges": [
          "Ar"
        ]
      },
      {
        "name": "SubDL",
        "url": "https://subdl.com/",
        "icon": "./images/icons/subdl.png",
        "badges": [
          "Ar"
        ]
      },
      {
        "name": "Subtitle Cat",
        "url": "https://subtitlecat.com/",
        "icon": "./images/icons/subtitle-cat.png",
        "badges": [
          "Ar"
        ]
      },
      {
        "name": "TVSubs",
        "url": "https://www.tvsubs.net/",
        "icon": "./images/icons/tvsubs.ico",
        "badges": [
          "Ar"
        ]
      },
      {
        "name": "Addic7ed",
        "url": "https://www.addic7ed.com/",
        "icon": "./images/icons/addic7ed.ico",
        "badges": [
          "Ar"
        ]
      },
      {
        "name": "TVSubtitles",
        "url": "https://www.tvsubtitles.net/",
        "icon": "./images/icons/tvsubtitles.ico",
        "badges": [
          "Ar"
        ]
      },
      {
        "name": "YIFY Subtitles",
        "url": "https://yifysubtitles.ch/",
        "icon": "./images/icons/yify-subtitles.ico"
      },
      {
        "name": "MySubs",
        "url": "https://my-subs.co/",
        "icon": "./images/icons/mysubs.png",
        "badges": [
          "Ar"
        ]
      },
      {
        "name": "SubSource",
        "url": "https://subsource.net/",
        "icon": "./images/icons/subsource.png",
        "badges": [
          "Ar"
        ]
      },
      {
        "name": "SubF2M",
        "url": "https://subf2m.co/",
        "icon": "./images/icons/subf2m.ico",
        "badges": [
          "Ar"
        ]
      }
    ]
  },
  {
    "key": "anime-database",
    "group": "Databases & Schedules",
    "title": "Anime Database",
    "icon": "database",
    "accent": "var(--anime-database)",
    "sites": [
      {
        "name": "MyAnimeList",
        "url": "https://myanimelist.net/",
        "icon": "./images/icons/myanimelist.svg"
      },
      {
        "name": "AniList",
        "url": "https://anilist.co/",
        "icon": "./images/icons/anilist.png"
      },
      {
        "name": "MangaBaka",
        "url": "https://mangabaka.org/",
        "icon": "./images/icons/mangabaka.png"
      },
      {
        "name": "Comick",
        "url": "https://comick.dev/",
        "icon": "./images/icons/comick.ico"
      },
      {
        "name": "Anime-Planet",
        "url": "https://www.anime-planet.com/",
        "icon": "./images/icons/anime-planet.jpg"
      },
      {
        "name": "Kitsu",
        "url": "https://kitsu.app/",
        "icon": "./images/icons/kitsu.ico"
      },
      {
        "name": "AniSearch",
        "url": "https://www.anisearch.com/",
        "icon": "./images/icons/anisearch.png"
      },
      {
        "name": "AniDB",
        "url": "https://anidb.net/",
        "icon": "./images/icons/anidb.png"
      },
      {
        "name": "Anime News Network",
        "url": "https://www.animenewsnetwork.com/",
        "icon": "./images/icons/anime-news-network.ico"
      },
      {
        "name": "Kuroiru",
        "url": "https://kuroiru.co/app",
        "icon": "./images/icons/kuroiru.png"
      }
    ]
  },
  {
    "key": "anime-schedule",
    "group": "Databases & Schedules",
    "title": "Anime Schedule",
    "icon": "database",
    "accent": "var(--anime-schedule)",
    "sites": [
      {
        "name": "LiveChart",
        "url": "https://www.livechart.me/",
        "icon": "./images/icons/livechart.png"
      },
      {
        "name": "AniChart",
        "url": "https://anichart.net/",
        "icon": "./images/icons/anichart.ico"
      },
      {
        "name": "English Dubbed",
        "url": "https://english-dubbed.com/",
        "icon": "./images/icons/english-dubbed.png"
      },
      {
        "name": "AnimeSchedule",
        "url": "https://animeschedule.net/",
        "icon": "./images/icons/animeschedule.png"
      },
      {
        "name": "Otaku Calendar",
        "url": "https://otakucalendar.com/",
        "icon": "./images/icons/otaku-calendar.png"
      },
      {
        "name": "AnimeAiring",
        "url": "https://animeairing.com/",
        "icon": "./images/icons/animeairing.png"
      },
      {
        "name": "AnimeCountdown",
        "url": "https://animecountdown.com/",
        "icon": "./images/icons/animecountdown.ico"
      },
      {
        "name": "Senpai.moe",
        "url": "https://senpai.moe/",
        "icon": "./images/icons/senpai-moe.ico"
      },
      {
        "name": "anica.jp",
        "url": "https://anica.jp/",
        "icon": "./images/icons/anica-jp.png"
      },
      {
        "name": "SubsPlease Schedule",
        "url": "https://subsplease.org/schedule/",
        "icon": "./images/icons/subsplease-schedule.ico"
      }
    ]
  },
  {
    "key": "TV-database",
    "group": "Databases & Schedules",
    "title": "TV Database",
    "icon": "database",
    "accent": "var(--TV-database)",
    "sites": [
      {
        "name": "IMDb",
        "url": "https://www.imdb.com/",
        "icon": "./images/icons/imdb.png"
      },
      {
        "name": "TMDB",
        "url": "https://www.themoviedb.org/",
        "icon": "./images/icons/tmdb.png"
      },
      {
        "name": "TVmaze",
        "url": "https://www.tvmaze.com/",
        "icon": "./images/icons/tvmaze.png"
      },
      {
        "name": "TheTVDB",
        "url": "https://thetvdb.com/",
        "icon": "./images/icons/thetvdb.png"
      },
      {
        "name": "Trakt",
        "url": "https://trakt.tv/",
        "icon": "./images/icons/trakt.png"
      },
      {
        "name": "Letterboxd",
        "url": "https://letterboxd.com/",
        "icon": "./images/icons/letterboxd.ico"
      },
      {
        "name": "Rotten Tomatoes",
        "url": "https://www.rottentomatoes.com/",
        "icon": "./images/icons/rotten-tomatoes.jpg"
      },
      {
        "name": "Metacritic",
        "url": "https://www.metacritic.com/",
        "icon": "./images/icons/metacritic.svg"
      },
      {
        "name": "JustWatch",
        "url": "https://www.justwatch.com/",
        "icon": "./images/icons/justwatch.png"
      },
      {
        "name": "Simkl",
        "url": "https://simkl.com/",
        "icon": "./images/icons/simkl.ico"
      }
    ]
  }
]
WEBSHELF_CATALOG_JSON_END */

// Flat list used by search/preview/activity helpers.
const WebShelfSites = WebShelfCategories.flatMap((category) =>
  category.sites.map((site) => ({
    ...site,
    category: category.title,
    categoryKey: category.key,
    group: category.group || "Other"
  }))
);

// ==================================================
// SITE METADATA HELPERS
// ==================================================
// Optional fields supported by every site object:
// description: "Short factual description"
// badges: ["Ar", "Dub", "Sub", "Low Ads", "No Signup", "Mobile"]
// collections: ["Curated Collection"]
// links: [{ label: "Mirror 1", url: "https://..." }]
// screenshots: ["./images/screenshots/example-1.jpg"]
// highlights: [{ type: "good", text: "Fast" }, { type: "bad", text: "Heavy ads" }]
// addedAt: "2026-09-04T10:00:00.000Z"
// updatedAt: "2026-09-04T10:00:00.000Z"
// ==================================================

function getSiteBadges(site) {
  return Array.isArray(site?.badges)
    ? site.badges.filter(Boolean).map(String)
    : [];
}

function siteHasBadge(site, badge) {
  const wanted = String(badge || "").trim().toLowerCase();
  return getSiteBadges(site).some(
    (value) => value.trim().toLowerCase() === wanted
  );
}

function getSiteCollections(site) {
  return Array.isArray(site?.collections)
    ? [...new Set(site.collections.filter(Boolean).map(String))]
    : [];
}

function getAvailableCollections() {
  const names = new Set();
  WebShelfSites.forEach((site) => {
    getSiteCollections(site).forEach((name) => names.add(name));
  });
  return [...names].sort((a, b) => a.localeCompare(b));
}

function getSitesInCollection(collectionName) {
  const wanted = String(collectionName || "").trim().toLowerCase();
  return WebShelfSites.filter((site) =>
    getSiteCollections(site).some(
      (name) => name.trim().toLowerCase() === wanted
    )
  );
}

function getSiteDomain(site) {
  try {
    return new URL(site?.url || "").hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function escapeWebShelfText(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderSiteBadges(site, options = {}) {
  const badges = getSiteBadges(site);
  const interactive = options.interactive !== false;

  if (badges.length === 0) return "";

  return `
    <span class="site-badges" aria-label="Site badges">
      ${badges.map((badge) => {
        const value = String(badge);
        const safeValue = escapeWebShelfText(value);
        const className = value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const interactiveAttributes = interactive
          ? `data-badge-filter="${safeValue}" role="button" tabindex="0" title="Filter by ${safeValue}"`
          : `aria-label="${safeValue}"`;

        return `<span class="site-badge site-badge--${className}" ${interactiveAttributes}>${safeValue}</span>`;
      }).join("")}
    </span>
  `;
}
