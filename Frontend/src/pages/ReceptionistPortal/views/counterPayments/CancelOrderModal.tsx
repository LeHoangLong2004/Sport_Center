import React from "react";
import type { PackageOrder } from "../../../../services/packageApi";

interface CancelOrderModalProps {
  order: PackageOrder | null;
  processingId: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function CancelOrderModal({
  order,
  processingId,
  onClose,
  onConfirm,
}: CancelOrderModalProps) {
  React.useEffect(() => {
    if (!order) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !processingId) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [order, processingId, onClose]);

  if (!order) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !processingId) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center text-xl shrink-0">
            ⚠️
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Xác nhận hủy đơn giữ chỗ
            </h3>
            <p className="text-xs text-slate-500">
              Mã đơn: #{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300">
          Bạn có chắc chắn muốn hủy đơn của khách hàng{" "}
          <strong>{order.userName}</strong>? Hành động này sẽ hủy yêu cầu giữ chỗ tại quầy.
        </p>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            disabled={Boolean(processingId)}
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={Boolean(processingId)}
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {processingId === order.id ? "Đang hủy..." : "Xác nhận hủy"}
          </button>
        </div>
      </div>
    </div>
  );
}
