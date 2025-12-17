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
        description: "Carnivore • Cost • Community — Lifestyle Intelligence OS",
        theme_color: "#050912",
        background_color: "#050912",
        display: "standalone",
        scope: "/",
        start_url: "/",
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
        // Cache your app shell + assets
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,mp4}"],
        navigateFallback: "/index.html",
        // React Router SPA safety
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
});
