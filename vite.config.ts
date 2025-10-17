import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  preview: {
    // Allow Render preview domain
    allowedHosts: ["taskflow-9mmn.onrender.com"],
    host: true,
  },
  plugins: [
    react(), 
    VitePWA({
      registerType: 'autoUpdate',
      selfDestroying: true,
      devOptions: {
        enabled: false,
      },
      includeAssets: ['favicon.ico', 'favicon.svg', 'logo.svg'],
      manifest: {
        name: 'TaskFlow Calendar',
        short_name: 'TaskFlow',
        description: 'Modern calendar and task management application',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
          { src: 'favicon.ico', sizes: '48x48 72x72 96x96 144x144 192x192', type: 'image/x-icon' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
