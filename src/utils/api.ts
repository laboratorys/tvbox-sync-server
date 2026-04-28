import { useAuthStore } from "@/stores/auth";
import type { ApiResponse } from "@/types";
import { useProgress } from "@bprogress/vue";
const API_BASE = "/api";
async function request(endpoint: string, options: RequestInit = {}) {
  const auth = useAuthStore();
  const { start, stop } = useProgress();
  const token = auth.token;
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  start();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  stop();
  if (!response.ok) {
    const resp = (await response.json().catch(() => ({}))) as ApiResponse;
    if (!resp.success) {
      throw new Error(resp.error || "Request failed");
    }
  }
  return response.json();
}

export const api = {
  get: (path: string) => request(path, { method: "GET" }),
  post: (path: string, body: any) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path: string, body: any) =>
    request(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path: string) => request(path, { method: "DELETE" }),
};
