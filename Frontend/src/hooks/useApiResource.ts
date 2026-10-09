import { useCallback, useEffect, useState } from "react";
import { ApiError, apiGet } from "./apiClient";

export interface ApiResource<T> {
  data: T | null;
  loading: boolean;
  /** `null` khi gọi thành công; 403 khi tài khoản thiếu quyền xem báo cáo. */
  error: string | null;
  forbidden: boolean;
  reload: () => void;
}

/**
 * Nạp dữ liệu từ một endpoint GET. `path = null` để tạm hoãn gọi API
 * (ví dụ khi người dùng chưa đăng nhập hoặc chưa chọn bộ lọc).
 */
export function useApiResource<T>(path: string | null): ApiResource<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(path !== null);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((value) => value + 1), []);

  useEffect(() => {
    if (path === null) {
      setLoading(false);
      setData(null);
      setError(null);
      setForbidden(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setForbidden(false);

    apiGet<T>(path)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const status = err instanceof ApiError ? err.status : 0;
        setForbidden(status === 401 || status === 403);
        setError(err instanceof Error ? err.message : "Không tải được dữ liệu.");
        setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [path, reloadToken]);

  return { data, loading, error, forbidden, reload };
}