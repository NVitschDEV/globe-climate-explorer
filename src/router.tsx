import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Matches the Vite `base` config, so the app works whether it's hosted
    // at the domain root or under a GitHub Pages project subpath.
    basepath: import.meta.env.BASE_URL,
  });

  return router;
};
