import type { APIRequestContext, APIResponse } from "@playwright/test";

export type JsonResponse<T = unknown> = {
  status: number;
  headers: Record<string, string>;
  body: T;
  raw: APIResponse;
};

export class HttpClient {
  constructor(private readonly request: APIRequestContext) {}

  get(path: string, options?: { headers?: Record<string, string> }) {
    return this.request.get(path, { headers: options?.headers });
  }

  post(path: string, data?: unknown, options?: { headers?: Record<string, string> }) {
    return this.request.post(path, { data, headers: options?.headers });
  }

  put(path: string, data?: unknown, options?: { headers?: Record<string, string> }) {
    return this.request.put(path, { data, headers: options?.headers });
  }

  patch(path: string, data?: unknown, options?: { headers?: Record<string, string> }) {
    return this.request.patch(path, { data, headers: options?.headers });
  }

  delete(path: string, options?: { headers?: Record<string, string> }) {
    return this.request.delete(path, { headers: options?.headers });
  }

  async json<T = unknown>(response: APIResponse): Promise<JsonResponse<T>> {
    const text = await response.text();
    let body = {} as T;
    if (text.trim().length > 0) {
      body = JSON.parse(text) as T;
    }

    return {
      status: response.status(),
      headers: response.headers(),
      body,
      raw: response,
    };
  }
}

export function withAuth(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}
