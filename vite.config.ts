import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [".ngrok-free.app", ".ngrok.io"],
    hmr: { overlay: false },
  },
  plugins: [
    react(),
    nodePolyfills({ include: ["buffer", "process", "stream", "util", "crypto"] }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "globalThis",
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-framer": ["framer-motion"],
          "vendor-near": ["near-api-js"],
          "vendor-blocknote": ["@blocknote/core", "@blocknote/react", "@blocknote/mantine"],
        },
      },
    },
  },
}));
