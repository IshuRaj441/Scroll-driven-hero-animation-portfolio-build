import type { NextConfig } from "next";

/**
 * GitHub Pages serves a *project* site from `/<repo-name>`, so the app must know its
 * own prefix at build time. We read it from an env var: empty for local dev/preview,
 * and `/scroll-driven-hero` (or whatever the repo is called) in CI.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Emit a fully static site to ./out — no Node server required for GitHub Pages.
  output: "export",
  // The Next image optimizer is a server feature; static export must disable it.
  images: { unoptimized: true },
  // Applied to both internal links and static assets so Pages paths resolve.
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  // Write `/about/index.html` style files so Pages resolves routes without rewrites.
  trailingSlash: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
