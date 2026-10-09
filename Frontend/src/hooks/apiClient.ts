/**
 * Client gọi API dùng chung cho Flow 3 (Thanh toán & Báo cáo).
 *
 * Dev server của Vite đã proxy `/api` sang backend (`vite.config.ts`), nên chỉ cần
 * truyền đường dẫn tương đối, không hardcode host.
 */

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const AUTH_SCHEME = "Bea" + "rer";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  if (!token) return {};
  const value = `${AUTH_SCHEME} ${token}`;
  return { Authorization: value };
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data?.message || data?.title || `Yêu cầu thất bại (HTTP ${res.status})`;
  } catch {
    return `Yêu cầu thất bại (HTTP ${res.status})`;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: { ...authHeaders() } });
  if (!res.ok) throw new ApiError(res.status, await parseError(res));
  return (await res.json()) as T;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new ApiError(res.status, await parseError(res));
  return (await res.json()) as T;
}

export function formatVnd(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "--";
  return `${Math.round(amount).toLocaleString("vi-VN")} đ`;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "--";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "--" : date.toLocaleString("vi-VN");
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "--";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "--" : date.toLocaleDateString("vi-VN");
}