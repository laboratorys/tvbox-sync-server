import { Hono } from "hono";

const douban = new Hono();

douban.get("/*", async (c) => {
  const dataUrl = c.req.query("url");
  if (!dataUrl) {
    return c.json({ error: "Missing data URL" }, 400);
  }
  try {
    const response = await fetch(dataUrl, {
      headers: {
        Referer: "https://m.douban.com/",
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
      },
      // @ts-ignore
      cf: { cacheEverything: true, cacheTtl: 300 },
    });
    const newResponse = new Response(response.body, response);
    newResponse.headers.set(
      "Cache-Control",
      "public, max-age=300, s-maxage=300",
    );
    newResponse.headers.delete("Set-Cookie");

    return newResponse;
  } catch (error) {
    return c.json({ error: "Failed to fetch from Douban" }, 502);
  }
});

export default douban;
