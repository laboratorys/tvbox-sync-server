import { serveStatic } from "hono/cloudflare-workers";
import { app } from "./app";

if (process.env.NODE_ENV === "production") {
  app.get("*", serveStatic({ root: "./dist", manifest: {} }));
}
export default app;
