// functions/[[path]].ts
import { app } from "../src/app";

export const onRequest = async (context: any) => {
  return app.fetch(context.request, context.env, context);
};
