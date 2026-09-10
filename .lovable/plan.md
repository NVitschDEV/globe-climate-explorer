# Klimadiagramme — Interactive Globe

A modern rebuild of klimadiagramme.de: a rotating satellite-textured Earth where every
climate station is a glowing point. Click one and its climate data opens in a side panel.

## The main screen

- Full-screen 3D globe with a real satellite Earth texture (no atmosphere glow), slow
  auto-rotation that stops on interaction, drag to spin, scroll to zoom.
- Station points scattered across the globe, colored by climate zone (Köppen), sized
  slightly larger on hover with a name tooltip.
- Thin top bar: title, a search field ("Karlsruhe", "Reykjavík"), a DE/EN language toggle,
  and a filter for continent / climate zone.
- Clicking a point rotates the globe to center it and opens the station panel.
- Zooming in far enough thins out clustering so dense regions (Germany, Alps) stay readable.

## The station panel

Slides in from the right, with two views the user can switch between:

1. **Modern view** (default): monthly temperature line over precipitation bars, plus summary
   figures — annual mean temperature, annual precipitation, warmest/coldest month, elevation,
   coordinates, Köppen climate zone with a plain-language label.
2. **Classic view**: the traditional Walter-Lieth climate diagram — dual axes at the 1:2
   ratio, arid periods dotted, humid periods hatched, months on the x-axis — rendered the way
   the original site draws them.

A share/deep link so any station has its own URL, and a small "compare" option to pin a
second station's curves onto the same chart.

## Where the data comes from

- A curated built-in dataset of roughly 200 well-known stations worldwide (name, country,
  coordinates, elevation, 1991–2020 monthly temperature and precipitation normals). This
  makes the globe load instantly and always work.
- When a station is opened, current-year monthly values are fetched live from Open-Meteo's
  free archive API and shown alongside the normals, so you can see how this year compares to
  the long-term average. If the fetch fails, the panel still shows the normals.

## Language

Full German and English throughout — station panel labels, months, climate-zone names,
navigation. German is the default; the choice is remembered.

## Extra pages

- **/klimazonen** — explainer of the Köppen classification with the color legend used on the globe.
- **/ueber** — about, data sources, credit to the original site by Bernhard Mühr.

## Technical notes

- React Three Fiber (`three`, `@react-three/fiber`, `@react-three/drei`) on a client-only
  route; sphere with an equirectangular Earth colour map, station points as an instanced
  mesh with raycast picking.
- Station normals shipped as a typed TS/JSON module in `src/data/stations`; live current-year
  data fetched through a TanStack server function wrapping Open-Meteo (no key needed) and
  cached with TanStack Query.
- Charts drawn with Recharts for the modern view; the Walter-Lieth diagram as a custom SVG
  component, since its axis coupling and hatching aren't expressible in a chart library.
- URL state: `/?station=karlsruhe` and `?lang=en` via route search params.
- Design: dark space background, warm amber/teal station accents, condensed sans for
  headings — no purple gradients, no glow ring around the planet.
