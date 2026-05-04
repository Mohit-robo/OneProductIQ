import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      // Forward any request that starts with /upload to the backend server
      "/upload": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      // Forward /prompts endpoint as well
      "/prompts": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/batch-process": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/batch-results": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/batch-status": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/batch-process/pause": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/batch-process/resume": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});