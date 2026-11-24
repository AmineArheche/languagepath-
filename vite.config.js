import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: [
        "favicon.svg",
        "apple-touch-icon.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
        "pwa-maskable-512x512.png",
        "audio/*.mp3"
      ],
      manifest: {
        name: "LanguagePath - Universal CEFR Mastery (A1-B2)",
        short_name: "LanguagePath",
        description:
          "Universal language learning platform covering German, English, Spanish, French, Arabic, and Italian from CEFR A1 to B2 with spaced repetition, speech studio, and exams.",
        theme_color: "#f59e0b",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,webmanifest}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            // Pre-recorded & cached vocabulary and listening audio files
            urlPattern: ({ url }) => url.pathname.startsWith("/audio/") || url.pathname.endsWith(".mp3"),
            handler: "CacheFirst",
            options: {
              cacheName: "deutschpath-audio-cache",
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 24 * 60 * 60 // 60 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Google Fonts stylesheets & web fonts
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 365 * 24 * 60 * 60
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Dynamic translations & level data chunks
            urlPattern: /\/translations\/.*\.json$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "deutschpath-translations-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
});
