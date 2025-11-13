import preact from "@preact/preset-vite";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [preact()],
  base: "/complexity-graph-viewer",
  build: {
    outDir: 'dist',
  },
  publicDir: 'public',



  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // (i am going to leave these in because i presume they do nothing if the above is to be trusted)
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
