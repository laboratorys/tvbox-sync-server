import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { app } from "./app";

const port = 3000;
serve(
  {
    fetch: app.fetch,
    port: port,
  },
  (info) => {
    console.log(`🚀 Server is running on http://localhost:${info.port}`);
  },
);

if (process.env.NODE_ENV === "production") {
  app.get("*", serveStatic({ root: "./dist" }));
}
