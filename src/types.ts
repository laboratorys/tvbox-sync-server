export type ApiResponse<T = any> =
  | { success: true; data: T }
  | { success: false; error: string; code?: number };

export interface DbSubscription {
  id: number;
  name: string;
  url: string;
  path: string;
}
