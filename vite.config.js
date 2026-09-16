import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      manifestFilename: "manifest.webmanifest",
      includeAssets: [
        "favicon.ico",
        "icons/favicon-16.png",
        "icons/favicon-32.png",
        "icons/icon-192.png",
        "icons/icon-512.png",
        "icons/maskable-512.png",
        "icons/apple-touch-icon.png",
        "brand/3c-mall-entrance.jpg",
      ],
      manifest: {
        id: "/app",
        name: "3C Mall: Meal Planning & Grocery Tools",
        short_name: "3C Mall",
        description:
          "Plan meals, compare estimated grocery costs, organize household shopping, and access guided lifestyle tools.",
        lang: "en-US",
        dir: "ltr",
        theme_color: "#17364a",
        background_color: "#f7f3e9",
        display: "standalone",
        display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
        orientation: "any",
        scope: "/",
        start_url: "/app",
        categories: ["food", "health", "shopping", "lifestyle"],
        prefer_related_applications: false,
        shortcuts: [
          {
            name: "Meal Planning",
            short_name: "Meals",
            description: "Open the 3C Mall meal planning workspace.",
            url: "/app/meal-planner",
            icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
          },
          {
            name: "Grocery Lab",
            short_name: "Grocery",
            description: "Open grocery comparison and shopping tools.",
            url: "/app/grocery-lab",
            icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
          },
        ],
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Cache versioned assets, but never cache the HTML navigation response.
        // Security and Permissions-Policy headers must come from Cloudflare on
        // every page load so shoppers receive the current server policy.
        globPatterns: ["**/*.{js,css,ico,png,jpg,jpeg,svg,webp,woff2}"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
