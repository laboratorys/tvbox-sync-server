import type { ApiResponse } from "@/types";
import type { Context } from "hono";

export const success = <T>(c: Context, data: T) => {
  return c.json<ApiResponse<T>>({ success: true, data }, 200);
};

export const error = (
  c: Context,
  message: string,
  status: number = 400,
  code?: number,
) => {
  return c.json<ApiResponse>(
    { success: false, error: message, code },
    status as any,
  );
};
