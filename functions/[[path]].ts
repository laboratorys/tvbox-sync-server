// functions/[[path]].ts
import { app } from "../src/app";

export const onRequest = async (context: any) => {
  // context.request: 请求对象
  // context.env: 绑定 (如 DB, KV)
  // context: ExecutionContext (用于 waitUntil 等)

  // 打印一下日志，如果依然报错，我们可以看到 URL 是否异常
  console.log("Request URL:", context.request.url);

  return app.fetch(context.request, context.env, context);
};
