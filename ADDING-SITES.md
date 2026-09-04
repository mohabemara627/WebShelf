# Adding content to WebShelf

## Recommended: use the local Catalog Manager

Keep `WebShelf-Tools` **outside** the public GitHub/Vercel project. Open the manager with Live Server / localhost, click **Open WebShelf folder**, choose the actual WebShelf project folder, edit your catalog, then click **Save to WebShelf folder**.

That writes `data.js` and `sitemap.xml` directly into your local project, so you do not need to hand-edit code. To update the public Vercel site, the changed files still need to be pushed/uploaded to GitHub so Vercel can deploy them.

The main form only needs Category, Site name, URL and optionally Icon/Badges. Description, mirrors, screenshots and highlights are under **More site details**. Bulk import and category management are collapsed until you need them.

## Minimal site

```js
{
  name: "Example Site",
  url: "https://example.com/",
  icon: "./images/icons/example.png"
}
```

## Optional metadata

```js
{
  name: "Example Site",
  url: "https://example.com/",
  icon: "./images/icons/example.png",
  description: "A short factual description of what makes the site useful.",
  badges: ["Ar", "Dub"],
  links: [
    { label: "Mirror 1", url: "https://mirror.example.com/" }
  ],
  screenshots: [
    "./images/screenshots/example-1.jpg"
  ],
  highlights: [
    { type: "good", text: "Large library" },
    { type: "bad", text: "Heavy ads" }
  ]
}
```

## Category

```js
{
  key: "example-category",
  group: "Data",
  title: "Example Category",
  icon: "folder",
  accent: "var(--brand-purple)",
  sites: []
}
```

New categories automatically appear on the homepage, search and Suggest form. The manager also updates `sitemap.xml` when you save directly to the project folder.
