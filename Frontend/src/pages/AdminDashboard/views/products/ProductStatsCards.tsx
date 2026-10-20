import React from 'react';
import { Package, CheckCircle2, AlertTriangle, DollarSign } from 'lucide-react';
import { ProductStats } from './types';

interface Props {
  stats: ProductStats;
}

export function ProductStatsCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng mặt hàng */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng mặt hàng</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats.total}
          </p>
          <span className="text-[11px] text-slate-400">Danh mục sản phẩm</span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
          <Package className="w-5 h-5" />
        </div>
      </div>

      {/* 2. Đang kinh doanh */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Đang kinh doanh</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.active}
          </p>
          <span className="text-[11px] text-emerald-500">Hiển thị cho Tiếp tân & Member</span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* 3. Sắp / Đã hết hàng */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Sắp / Đã hết hàng</p>
          <p className={`text-2xl font-black mt-1 ${stats.lowStock > 0 ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
            {stats.lowStock}
          </p>
          <span className="text-[11px] text-amber-500">Tồn kho ≤ 5 sản phẩm</span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>

      {/* 4. Giá trị kho */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Ước tính giá trị kho</p>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {stats.totalInventoryValue.toLocaleString('vi-VN')} đ
          </p>
          <span className="text-[11px] text-slate-400">Giá trị tồn kho niêm yết</span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <DollarSign className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
