import React from 'react';
import { Trash2 } from 'lucide-react';
import { ProductItem } from './types';

interface Props {
  deleteTarget: ProductItem | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function ProductDeleteModal({
  deleteTarget,
  isDeleting,
  onClose,
  onConfirm,
}: Props) {
  if (!deleteTarget) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-xs">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Xóa sản phẩm này?
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Bạn có chắc chắn muốn xóa sản phẩm{' '}
            <strong className="text-rose-600">{deleteTarget.name}</strong>? Tiếp tân và hội viên sẽ không thể xem hoặc đặt mua sản phẩm này nữa.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? 'Đang xóa...' : 'Đồng ý xóa'}
          </button>
        </div>
      </div>
    </div>
  );
}
