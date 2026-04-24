import { app } from "@/app";
import { d1Adapter } from "@/db-adapter";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import "dotenv/config";

if (process.env.NODE_ENV === "production") {
  app.get(
    "*",
    serveStatic({
      root: "./dist",
      rewriteRequestPath: (path) => {
        return path.includes(".") ? path : "/index.html";
      },
    }),
  );
}
const env = {
  JWT_SECRET: process.env.JWT_SECRET || "default_secret",
  ADMIN_USER: process.env.ADMIN_USER || "admin",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "password",
  OTP_SECRET: process.env.OTP_SECRET || "",
  DB: d1Adapter,
};
const port = Number(process.env.PORT) || 3000;
serve(
  {
    fetch: (req) => app.fetch(req, env),
    port: port,
  },
  (info) => {
    console.log(`🚀 Server is running on http://localhost:${info.port}`);
  },
);
