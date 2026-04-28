import dataRoute from "@/extra/douban-data";
import imageRoute from "@/extra/douban-image";
import { error, success } from "@/utils/response";
import type { Context } from "hono";
import { Hono, type MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import { verify as jwtVerify, sign } from "hono/jwt";
import { generateSecret, generateURI, verify } from "otplib";
type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  ADMIN_USER: string;
  ADMIN_PASSWORD: string;
  OTP_SECRET: string;
};

type Variables = {
  userKey: string;
  jwtPayload: Record<string, any>;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();
const generateKey = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length: 8 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
};

const userKeyAuth: MiddlewareHandler<{
  Bindings: Bindings;
  Variables: Variables;
}> = async (c, next) => {
  const key = c.req.query("key");

  if (!key) {
    return c.json({ success: false, error: "Unauthorized: Missing Key" }, 401);
  }
  const user = await c.env.DB.prepare(
    "SELECT user_key FROM users WHERE status = 1AND user_key = ?",
  )
    .bind(key)
    .first<{ user_key: string }>();

  if (!user) {
    return c.json({ success: false, error: "Invalid Key" }, 401);
  }

  c.set("userKey", user.user_key);
  await next();
};

const jwtAuth: MiddlewareHandler<{
  Bindings: Bindings;
  Variables: Variables;
}> = async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // 这里你可以使用你定义的 error 函数，完全掌控错误格式
    return error(c, "Unauthorized: No token provided", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await jwtVerify(token, c.env.JWT_SECRET, "HS256");
    c.set("jwtPayload", payload);

    await next();
  } catch (e) {
    return error(c, "Invalid or expired token", 401);
  }
};

app.use("/*", cors());
app.route("/api/image-proxy", imageRoute);
app.route("/api/data-proxy", dataRoute);
const jwtSign = async (userName: string, secret: string) => {
  const payload = {
    sub: userName,
    role: "admin",
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // Token expires in 24 hours
  };
  return await sign(payload, secret);
};

app.post("/api/login", async (c) => {
  const { username, password } = await c.req.json();

  if (username !== c.env.ADMIN_USER || password !== c.env.ADMIN_PASSWORD) {
    return error(c, "Invalid credentials", 401);
  }

  const isOtpEnabled = !!c.env.OTP_SECRET;

  if (isOtpEnabled) {
    return success(c, { requireOtp: true });
  }

  const token = await jwtSign(username, c.env.JWT_SECRET);
  return success(c, { token });
});

app.post("/api/otp/verify", async (c) => {
  const { username, otp } = await c.req.json();
  const secret = c.env.OTP_SECRET;

  if (!secret) {
    return error(c, "OTP not configured", 500);
  }
  const isValid = verify({ token: otp, secret });

  if (!isValid) {
    return error(c, "Invalid OTP code", 401);
  }

  const token = await jwtSign(username, c.env.JWT_SECRET);
  return success(c, { token });
});

app.get("/api/auth/me", jwtAuth, (c) => {
  const payload = c.get("jwtPayload");
  return success(c, payload);
});

app.get("/api/subscriptions", jwtAuth, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM subscriptions",
  ).all();
  return success(c, results);
});

app.post("/api/subscriptions", jwtAuth, async (c) => {
  const { name, url, path } = await c.req.json();
  const res = await c.env.DB.prepare(
    "INSERT INTO subscriptions (name, url, path) VALUES (?, ?, ?)",
  )
    .bind(name, url, path)
    .run();
  return success(c, { id: res.meta.lastRowId });
});

app.put("/api/subscriptions/:id", jwtAuth, async (c) => {
  const id = c.req.param("id");
  const { name, url, path } = await c.req.json();
  await c.env.DB.prepare(
    "UPDATE subscriptions SET name = ?, url = ?, path = ? WHERE id = ?",
  )
    .bind(name, url, path, id)
    .run();
  return success(c, true);
});

app.delete("/api/subscriptions/:id", jwtAuth, async (c) => {
  await c.env.DB.prepare("DELETE FROM subscriptions WHERE id = ?")
    .bind(c.req.param("id"))
    .run();
  await c.env.DB.prepare(
    "DELETE FROM user_subscriptions WHERE subscription_id = ?",
  )
    .bind(c.req.param("id"))
    .run();
  return success(c, true);
});

app.post("/api/user/bind", async (c) => {
  const { user_key, subscription_ids } = await c.req.json();
  const db = c.env.DB;

  try {
    const batch = [];

    batch.push(
      db
        .prepare("DELETE FROM user_subscriptions WHERE user_key = ?")
        .bind(user_key),
    );

    // 2. 插入新绑定 (如果数组不为空)
    if (subscription_ids && subscription_ids.length > 0) {
      for (const subId of subscription_ids) {
        batch.push(
          db
            .prepare(
              "INSERT INTO user_subscriptions (user_key, subscription_id) VALUES (?, ?)",
            )
            .bind(user_key, subId),
        );
      }
    }

    await db.batch(batch);
    return success(c, { message: "绑定更新成功" });
  } catch (e: any) {
    return error(c, e.message, 500);
  }
});

app.get("/api/users", jwtAuth, async (c) => {
  const db = c.env.DB;
  const users = await db
    .prepare(
      `
    SELECT u.*, 
           GROUP_CONCAT(s.id) as sub_ids, 
           GROUP_CONCAT(s.name) as sub_names,
           GROUP_CONCAT(s.path) as sub_paths
    FROM users u
    LEFT JOIN user_subscriptions us ON u.user_key = us.user_key
    LEFT JOIN subscriptions s ON us.subscription_id = s.id
    GROUP BY u.id
  `,
    )
    .all();
  const data = users.results.map((u: any) => ({
    ...u,
    subscriptions: u.sub_ids
      ? u.sub_ids.split(",").map((id: string, i: number) => ({
          id: parseInt(id),
          name: u.sub_names.split(",")[i],
          path: u.sub_paths.split(",")[i],
        }))
      : [],
  }));

  return success(c, data);
});

app.post("/api/users", jwtAuth, async (c) => {
  const { name } = await c.req.json();
  const newKey = generateKey();

  await c.env.DB.prepare("INSERT INTO users (name, user_key) VALUES (?, ?)")
    .bind(name || "Unnamed User", newKey)
    .run();

  return success(c, { name, user_key: newKey });
});

app.delete("/api/users/:id", jwtAuth, async (c) => {
  const id = c.req.param("id");

  // 1. 先获取该用户的 user_key，用于清理关联表
  const user = await c.env.DB.prepare("SELECT user_key FROM users WHERE id = ?")
    .bind(id)
    .first<{ user_key: string }>();

  if (!user) {
    return error(c, "User not found", 404);
  }

  const key = user.user_key;

  // 2. 级联删除关联数据 (清理历史、收藏、订阅绑定)
  const batch = [
    c.env.DB.prepare("DELETE FROM user_subscriptions WHERE user_key = ?").bind(
      key,
    ),
    c.env.DB.prepare("DELETE FROM history WHERE user_key = ?").bind(key),
    c.env.DB.prepare("DELETE FROM keep WHERE user_key = ?").bind(key),
    c.env.DB.prepare("DELETE FROM search_history WHERE user_key = ?").bind(key),
    c.env.DB.prepare("DELETE FROM users WHERE id = ?").bind(id),
  ];

  await c.env.DB.batch(batch);

  return success(c, true);
});

app.post("/api/users/:id/toggle", jwtAuth, async (c) => {
  const id = c.req.param("id");
  const result = await c.env.DB.prepare(
    "UPDATE users SET status = 1 - status WHERE id = ?",
  )
    .bind(id)
    .run();
  if (result.meta.changes === 0) {
    return error(c, "User not found", 404);
  }
  return success(c, true);
});

app.get("/api/otp/secret", jwtAuth, (c) => {
  const uri = generateURI({
    issuer: "tvbox-sync-server",
    label: "admin",
    secret: c.env.OTP_SECRET,
  });
  return success(c, { secret: c.env.OTP_SECRET, uri: uri });
});

// 2. 刷新/生成新的 Secret
app.post("/api/otp/generate", jwtAuth, async (c) => {
  const secret = generateSecret(); // Base32-encoded secret
  const uri = generateURI({
    issuer: "tvbox-sync-server",
    label: "admin",
    secret,
  });
  return success(c, { secret: secret, uri: uri });
});

app.post("/api/tvbox/history", userKeyAuth, async (c) => {
  const data = await c.req.json();
  await c.env.DB.prepare(
    `
    INSERT OR REPLACE INTO history (user_key, key, vodPic, vodName, position, duration, cid, createTime) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
  )
    .bind(
      c.get("userKey"),
      data.key,
      data.vodPic,
      data.vodName,
      data.position,
      data.duration,
      data.cid,
      Date.now(),
    )
    .run();
  return success(c, true);
});

app.get("/api/tvbox/history", userKeyAuth, async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT key, vodPic, vodName, vodFlag, vodRemarks, episodeUrl, 
  revSort, revPlay, createTime, opening, ending, 
  position, duration, speed, scale, cid FROM history WHERE user_key = ? ORDER BY createTime DESC`,
  )
    .bind(c.get("userKey"))
    .all();
  const processedResults = results.map((row) => ({
    ...row,
    revSort: !!row.revSort,
    revPlay: !!row.revPlay,
  }));
  return c.json(processedResults);
});

app.delete("/api/tvbox/history", userKeyAuth, (c) =>
  deleteResource(c, "history", "key", "key"),
);

app.post("/api/tvbox/keep", userKeyAuth, async (c) => {
  const { key, siteName, vodName, vodPic } = await c.req.json();
  await c.env.DB.prepare(
    "INSERT OR REPLACE INTO keep (user_key, key, siteName, vodName, vodPic) VALUES (?, ?, ?, ?, ?)",
  )
    .bind(c.get("userKey"), key, siteName, vodName, vodPic)
    .run();
  return success(c, true);
});

app.get("/api/tvbox/keep", userKeyAuth, async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT key, siteName, vodName, vodPic, createTime, type, cid FROM keep WHERE user_key = ?`,
  )
    .bind(c.get("userKey"))
    .all();
  return c.json(results);
});

app.delete("/api/tvbox/keep", userKeyAuth, (c) =>
  deleteResource(c, "keep", "key", "key"),
);

app.post("/api/tvbox/keyword", userKeyAuth, async (c) => {
  const { keyword } = await c.req.json();
  const userKey = c.get("userKey");

  if (!keyword || keyword.trim() === "") {
    return c.json({ error: "Keyword cannot be empty" }, 400);
  }

  await c.env.DB.batch([
    c.env.DB.prepare(
      "DELETE FROM search_history WHERE user_key = ? AND title = ?",
    ).bind(userKey, keyword),
    c.env.DB.prepare(
      "INSERT INTO search_history (user_key, title, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
    ).bind(userKey, keyword),
    c.env.DB.prepare(
      `
      DELETE FROM search_history 
      WHERE user_key = ? 
      AND rowid NOT IN (
        SELECT rowid FROM search_history 
        WHERE user_key = ? 
        ORDER BY created_at DESC 
        LIMIT 20
      )
    `,
    ).bind(userKey, userKey),
  ]);

  return success(c, true);
});

app.get("/api/tvbox/keyword", userKeyAuth, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT title FROM search_history WHERE user_key = ? ORDER BY created_at DESC LIMIT 20",
  )
    .bind(c.get("userKey"))
    .all();
  const keywords = results.map((row) => row.title);
  return c.json(keywords);
});

app.delete("/api/tvbox/keyword", userKeyAuth, (c) =>
  deleteResource(c, "search_history", "title", "keyword"),
);

const deleteResource = async (
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  tableName: "history" | "keep" | "search_history",
  keyColumn = "key",
  bodyKey = "key",
) => {
  let val;
  try {
    const body = await c.req.json();
    val = body[bodyKey];
  } catch (e) {}

  const userKey = c.get("userKey");

  if (val) {
    await c.env.DB.prepare(
      `DELETE FROM ${tableName} WHERE user_key = ? AND ${keyColumn} = ?`,
    )
      .bind(userKey, val)
      .run();
  } else {
    await c.env.DB.prepare(`DELETE FROM ${tableName} WHERE user_key = ?`)
      .bind(userKey)
      .run();
  }

  return success(c, true);
};

app.get("/api/tvbox/check", userKeyAuth, (c) => {
  const userKey = c.get("userKey");

  return c.json({ OK: true, mode: "tvbox-sync-server" });
});

app.get("/api/sub/:path", userKeyAuth, async (c) => {
  const path = "/" + c.req.param("path");
  const userKey = c.get("userKey");
  const sub: any = await c.env.DB.prepare(
    `
    SELECT s.url FROM subscriptions s
    JOIN user_subscriptions us ON s.id = us.subscription_id
    WHERE s.path = ? AND us.user_key = ?
    LIMIT 1
  `,
  )
    .bind(path, userKey)
    .first();

  if (!sub) {
    return error(c, "Subscription not found or not assigned to this user", 404);
  }

  return c.redirect(sub.url, 302);
});

app.get("/api/sub", userKeyAuth, async (c) => {
  const userKey = c.get("userKey");

  // 查询该用户绑定的所有订阅
  const { results } = await c.env.DB.prepare(
    `
    SELECT s.name, s.path 
    FROM user_subscriptions us
    JOIN subscriptions s ON us.subscription_id = s.id
    WHERE us.user_key = ?
  `,
  )
    .bind(userKey)
    .all();

  const baseUrl = new URL(c.req.url).origin;

  // 转换 URL 为代理地址
  const urls = results.map((sub: any) => ({
    name: sub.name,
    url: `${baseUrl}/api/sub${sub.path}?key=${userKey}`,
  }));

  return c.json({ urls });
});

export { app };
