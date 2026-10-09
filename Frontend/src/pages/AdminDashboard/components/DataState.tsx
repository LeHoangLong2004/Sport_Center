import type { ReactNode } from "react";

interface DataStateProps {
  loading: boolean;
  error: string | null;
  forbidden: boolean;
  /** Số bản ghi đã tải được — dùng để hiển thị trạng thái rỗng. */
  count?: number;
  emptyText?: string;
  onRetry?: () => void;
}

/**
 * Trạng thái tải / lỗi / không có dữ liệu dùng chung cho các trang Flow 3.
 * Trả về `null` khi dữ liệu đã sẵn sàng để bảng tự render.
 */
export function DataState({ loading, error, forbidden, count, emptyText, onRetry }: DataStateProps) {
  if (loading) {
    return <p className="px-6 py-6 text-[#64748b] text-sm">Đang tải dữ liệu...</p>;
  }

  if (forbidden) {
    return (
      <p className="px-6 py-6 text-[#b45309] text-sm">
        Tài khoản hiện tại không có quyền xem dữ liệu này (chỉ Center Manager hoặc Admin).
      </p>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 px-6 py-6">
        <span className="text-[#b91c1c] text-sm">{error}</span>
        {onRetry && (
          <button onClick={onRetry} className="border border-[#cbd5e1] font-semibold px-3 py-1.5 rounded-md text-[#0f172a] text-[12px]">
            Thử lại
          </button>
        )}
      </div>
    );
  }

  if (count === 0) {
    return <p className="px-6 py-6 text-[#64748b] text-sm">{emptyText ?? "Chưa có dữ liệu."}</p>;
  }

  return null;
}

/** Khối tải/lỗi nhỏ dùng trong các thẻ KPI hoặc panel. */
export function InlineValue({
  loading,
  error,
  forbidden,
  children,
}: {
  loading: boolean;
  error: string | null;
  forbidden: boolean;
  children: ReactNode;
}) {
  if (loading) return <span className="text-[#94a3b8]">Đang tải...</span>;
  if (forbidden) return <span className="text-[#94a3b8]">Không đủ quyền</span>;
  if (error) return <span className="text-[#b91c1c] text-[13px]">{error}</span>;
  return <>{children}</>;
}