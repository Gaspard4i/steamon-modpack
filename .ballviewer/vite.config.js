import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import path from "node:path";
import fs from "node:fs";

// `.bbmodel` files live in public/. Vite serves them with octet-stream by
// default, so fetch().then(r => r.json()) works. The legacy /balls/* image
// route is kept as a no-op fallback (no longer used by the React app).
const ballsDir = fileURLToPath(new URL("../.blender/assets/balls_icon", import.meta.url));

function ballsMiddleware() {
  return {
    name: "balls-static",
    configureServer(server) {
      server.middlewares.use("/balls", (req, res, next) => {
        const rel = decodeURIComponent((req.url || "/").split("?")[0]).replace(/^\/+/, "");
        const file = path.join(ballsDir, rel);
        if (!file.startsWith(ballsDir)) return next();
        fs.stat(file, (err, st) => {
          if (err || !st.isFile()) return next();
          res.setHeader("Content-Type", "image/png");
          res.setHeader("Cache-Control", "no-cache");
          fs.createReadStream(file).pipe(res);
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), ballsMiddleware()],
  publicDir: "public",
  assetsInclude: ["**/*.bbmodel"],
  server: { port: 5180, strictPort: true },
});
