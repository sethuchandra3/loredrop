import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { handleGeneration, handleVoice } from "./server/generation";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "loredrop-generation-api",
      configureServer(server) {
        server.middlewares.use("/api/generations", (request, response, next) => {
          if (request.method !== "POST") return next();
          void handleGeneration(request, response);
        });
        server.middlewares.use("/api/voice", (request, response, next) => {
          if (request.method !== "POST") return next();
          void handleVoice(request, response);
        });
      },
    },
  ],
});
