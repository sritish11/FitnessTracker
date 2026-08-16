import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// import tailwindcss from 'tailwindcss';

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        app: path.resolve(__dirname, "index.html"),
        companion: path.resolve(__dirname, "companion.html"),
      },
      output: {
        entryFileNames: "js/[name].[hash].js",
        chunkFileNames: "js/[name].[hash].js",
        assetFileNames: ({ name }) => {
          if (/\.(css)$/.test(name ?? "")) return "css/[name].[hash].[ext]";
          return "assets/[name].[hash].[ext]";
        },
      },
    },
    outDir: "../static/frontend",
    emptyOutDir: true,
  },
});
