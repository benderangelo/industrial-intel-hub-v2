import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

const rootDir = __dirname;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "apple-touch-icon.png", "mask-icon.svg"],
      devOptions: {
        enabled: true, // Permite testar o PWA no localhost
      },
      manifest: {
        name: "CASE Nexus Intelligence Hub",
        short_name: "CASE Nexus",
        description: "Portfolio Intelligence Hub for CASE Construction",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(rootDir, "./node_modules/react"),
      "react-dom": path.resolve(rootDir, "./node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(rootDir, "./node_modules/react/jsx-runtime.js"),
      "react/jsx-dev-runtime": path.resolve(rootDir, "./node_modules/react/jsx-dev-runtime.js"),
    },
  },
  optimizeDeps: {
    exclude: ["react-leaflet", "react-leaflet-cluster", "@react-leaflet/core"],
  },
}));
