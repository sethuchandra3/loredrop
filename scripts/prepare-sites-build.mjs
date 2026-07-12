import { copyFile, cp, mkdir } from "node:fs/promises";

await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
await mkdir("dist/client", { recursive: true });
await copyFile("worker/sites-entry.js", "dist/server/index.js");
await copyFile(".openai/hosting.json", "dist/.openai/hosting.json");
await copyFile("dist/index.html", "dist/client/index.html");
await cp("dist/assets", "dist/client/assets", { recursive: true });
