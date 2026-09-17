import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

// Set BASE_PATH when deploying to a GitHub Pages *project* site, e.g.
// "/globe-climate-explorer/" (the repo name, with leading and trailing slash).
// Leave it unset (defaults to "/") for a user/organization page such as
// <username>.github.io, or for any other host that serves from the domain root.
// The included GitHub Actions workflow sets this automatically.
export default defineConfig({
  base: process.env["BASE_PATH"] || "/",
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    viteTsConfigPaths(),
    tailwindcss(),
    viteReact(),
  ],
  build: {
    outDir: "dist",
  },
});
