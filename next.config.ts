import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export for GitHub Pages (served from the `out/` folder).
  output: "export",
  images: { unoptimized: true },
  // Emit /play/index.html so GitHub Pages serves /play/ without an extension.
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
