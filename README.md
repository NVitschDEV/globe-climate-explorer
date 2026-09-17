# Globe Climate Explorer

An interactive 3D globe for exploring climate data: click a station to see
its monthly temperature and precipitation as a modern chart or a classic
Walter-Lieth climate diagram. Inspired by
[klimadiagramme.de](https://klimadiagramme.de) by Bernhard Mühr.

- **Climate normals (1991–2020):** [Meteostat](https://meteostat.net) (DWD, NOAA, ECCC and others)
- **Current year / reanalysis:** [Open-Meteo](https://open-meteo.com) (ERA5)
- **Earth texture:** NASA Blue Marble

## Development

Requires Node.js 20+.

```sh
npm install
npm run dev
```

## Building

```sh
npm run build
```

This produces a static site in `dist/`, including a `404.html` fallback so
client-side routes (e.g. `/klimazonen`) work correctly when hosted on
GitHub Pages.

## Deploying to GitHub Pages

This repo includes a GitHub Actions workflow
(`.github/workflows/deploy.yml`) that builds and deploys the site to GitHub
Pages automatically on every push to `main`.

To enable it:

1. Push this repository to GitHub.
2. In the repo, go to **Settings → Pages** and set **Source** to
   **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab).

The workflow automatically sets the Vite `base` path to `/<repo-name>/` for
project sites, or `/` if the repository is a user/organization page (named
`<username>.github.io`). No manual configuration is needed.

If you'd rather deploy elsewhere (Netlify, Vercel, Cloudflare Pages, your own
server, etc.), just run `npm run build` and upload the contents of `dist/` —
it's a fully static site.
