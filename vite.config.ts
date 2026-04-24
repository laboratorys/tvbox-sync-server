import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { execSync } from "node:child_process";
import path from "node:path";
import { defineConfig } from "vite";

const getVersion = () => {
  try {
    return execSync("git describe --tags --abbrev=0").toString().trim();
  } catch {
    return "1.0";
  }
};

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  define: {
    __VITE_WEBAPP_VERSION__: JSON.stringify(getVersion()),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
