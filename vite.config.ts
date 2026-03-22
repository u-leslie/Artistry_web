import path from "node:path";
import type { NextFunction, Request, Response } from "express";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import type { Plugin } from "vite";
import { defineConfig, loadEnv } from "vite";

/**
 * Mount the Express API in dev so `npm run dev` (Vite only) still serves /api/*
 * without a separate process on :8787 (avoids ECONNREFUSED on /api/subscribe).
 */
function artistryApiPlugin(): Plugin {
  return {
    name: "artistry-api",
    async configureServer(server) {
      const { createApp } = await import("./server/app.ts");
      const hasProject = Boolean(
        process.env.SANITY_PROJECT_ID ?? process.env.VITE_SANITY_PROJECT_ID,
      );
      const hasToken = Boolean(process.env.SANITY_API_TOKEN?.trim());
      if (hasProject && !hasToken) {
        console.warn(
          "[artistry-api] SANITY_API_TOKEN is not set — add an Editor token to .env.local (subscribers and digests require Sanity).",
        );
      }
      const app = createApp();
      server.middlewares.use(
        (req, res, next: NextFunction) => {
          const url = req.url ?? "";
          if (url.split("?")[0]?.startsWith("/api")) {
            app(req as Request, res as Response, next);
          } else {
            next();
          }
        },
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  /** Merge .env / .env.local into process.env before the Express API loads (all keys, not only VITE_*). */
  const merged = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, merged);

  return {
    server: {
      host: "0.0.0.0",
      port: 5173,
      allowedHosts: true,
      hmr: {
        overlay: false,
      },
    },
    plugins: [artistryApiPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        "@/convex": path.resolve(__dirname, "./convex"),
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
