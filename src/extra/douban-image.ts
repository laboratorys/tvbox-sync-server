import { Hono } from "hono";

const image = new Hono();

// 这里定义路径：因为稍后在 index.ts 中会挂载到 /image，所以这里可以直接用 '/'
image.get("/", async (c) => {
  const imageUrl = c.req.query("url");

  if (!imageUrl) {
    return c.json({ error: "Missing image URL" }, 400);
  }

  try {
    const imageResponse = await fetch(imageUrl, {
      headers: {
        Referer: "https://movie.douban.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      },
      // @ts-ignore
      cf: { cacheEverything: true, cacheTtl: 15720000 },
    });

    if (!imageResponse.ok) {
      return c.json({ error: "Failed to fetch" }, 502);
    }

    const headers = new Headers(imageResponse.headers);
    headers.set("Cache-Control", "public, max-age=15720000, s-maxage=15720000");
    headers.set("CDN-Cache-Control", "public, s-maxage=15720000");

    return new Response(imageResponse.body, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    return c.json({ error: "Internal Error" }, 500);
  }
});

export default image;
