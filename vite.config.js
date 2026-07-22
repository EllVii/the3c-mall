import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "icons/icon-192.png",
        "icons/icon-512.png",
        "icons/maskable-512.png",
        "icons/apple-touch-icon.png",
      ],
      manifest: {
        name: "3C Mall",
        short_name: "3C Mall",
        description: "Concierge • Cost • Community — plan meals, compare groceries, and shop with clarity.",
        theme_color: "#17364a",
        background_color: "#f7f3e9",
        display: "standalone",
        scope: "/",
        start_url: "/app",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
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
        // Keep the install shell small. Videos load only when a user requests them.
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
});
