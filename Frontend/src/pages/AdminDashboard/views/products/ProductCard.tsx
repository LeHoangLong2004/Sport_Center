import React from 'react';
import { ShoppingBag, Edit2, Trash2 } from 'lucide-react';
import { ProductItem } from './types';

interface Props {
  product: ProductItem;
  onEdit: (product: ProductItem) => void;
  onDelete: (product: ProductItem) => void;
  onToggleStatus: (product: ProductItem) => void;
}

export function ProductCard({ product, onEdit, onDelete, onToggleStatus }: Props) {
  const isLowStock = product.stockQuantity <= 5;
  const isOutOfStock = product.stockQuantity === 0;

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden group ${
        !product.status
          ? 'border-slate-200/60 dark:border-slate-800/60 opacity-60'
          : 'border-slate-200/90 dark:border-slate-800 hover:border-rose-500/50'
      }`}
    >
      <div>
        {/* Product Image Area */}
        <div className="h-44 w-full bg-slate-100 dark:bg-slate-800/80 relative flex items-center justify-center p-3 overflow-hidden border-b border-slate-100 dark:border-slate-800">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as any).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
              <ShoppingBag className="w-10 h-10 mb-1" />
              <span className="text-[10px] font-medium">Chưa có ảnh</span>
            </div>
          )}

          {/* Category badge */}
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs text-slate-700 dark:text-slate-300 shadow-xs border border-slate-200/60 dark:border-slate-700">
            {product.category || 'Khác'}
          </span>

          {/* Status badge */}
          <span
            className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              product.status
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-slate-500 text-white'
            }`}
          >
            {product.status ? 'Đang bán' : 'Tạm dừng'}
          </span>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-2">
          <h3
            className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-rose-600 transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-[10px] font-medium text-slate-400 block">Đơn giá bán:</span>
              <strong className="text-base font-black text-rose-600 dark:text-rose-400">
                {product.price.toLocaleString('vi-VN')} đ
              </strong>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-medium text-slate-400 block">Tồn kho:</span>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  isOutOfStock
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200'
                    : isLowStock
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                }`}
              >
                {isOutOfStock ? 'Hết hàng' : `${product.stockQuantity} món`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 pt-0 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-850/40 flex items-center justify-between gap-2 mt-2">
        {/* Quick Toggle Status */}
        <button
          type="button"
          onClick={() => onToggleStatus(product)}
          className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          title={product.status ? 'Bấm để tạm dừng bán' : 'Bấm để kích hoạt bán'}
        >
          {product.status ? 'Tắt bán' : 'Bật bán'}
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 transition cursor-pointer"
            title="Sửa sản phẩm"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(product)}
            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition cursor-pointer"
            title="Xóa sản phẩm"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
