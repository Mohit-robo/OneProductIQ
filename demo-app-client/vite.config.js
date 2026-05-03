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
    },
  },
});