// GitHub Pages serves a static 404.html for any URL it doesn't recognize on
// disk (e.g. a deep link like /klimazonen loaded directly, or refreshed).
// Since routing here happens client-side, the fix is to make 404.html an
// exact copy of index.html: GitHub serves the same app shell, the URL in the
// address bar is left untouched, and the router then renders whatever route
// matches that URL. No redirect or query-string trick needed.
import { copyFileSync } from "node:fs";
import { join } from "node:path";

const dist = join(import.meta.dirname, "..", "dist");
copyFileSync(join(dist, "index.html"), join(dist, "404.html"));
console.log("Copied dist/index.html -> dist/404.html (GitHub Pages SPA fallback)");
