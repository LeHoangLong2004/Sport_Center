import React from 'react';
import { ShoppingBag, Plus } from 'lucide-react';

interface Props {
  onAddClick: () => void;
}

export function ProductPageHeader({ onAddClick }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
      <div>
        <div className="text-xs font-semibold text-rose-500 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
          <ShoppingBag className="w-3.5 h-3.5" /> Quản lý kho hàng & Quầy bán
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Sản phẩm & Hàng hóa bán lẻ
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Thêm mới, sửa giá và cập nhật số lượng tồn kho. Sản phẩm mới sẽ được đồng bộ ngay lập tức sang quầy POS của Lễ tân và Cửa hàng trực tuyến của Hội viên.
        </p>
      </div>

      <button
        type="button"
        onClick={onAddClick}
        className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl transition-all shadow-md shadow-rose-600/20 cursor-pointer self-start md:self-auto shrink-0"
      >
        <Plus className="w-4 h-4" />
        Thêm sản phẩm mới
      </button>
    </div>
  );
}
