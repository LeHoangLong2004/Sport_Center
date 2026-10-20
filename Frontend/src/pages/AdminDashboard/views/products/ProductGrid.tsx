import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { ProductItem } from './types';
import { ProductCard } from './ProductCard';

interface Props {
  loading: boolean;
  products: ProductItem[];
  onOpenCreateModal: () => void;
  onEdit: (product: ProductItem) => void;
  onDelete: (product: ProductItem) => void;
  onToggleStatus: (product: ProductItem) => void;
}

export function ProductGrid({
  loading,
  products,
  onOpenCreateModal,
  onEdit,
  onDelete,
  onToggleStatus,
}: Props) {
  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mb-3"></div>
        <p className="text-xs">Đang tải danh sách sản phẩm...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
        <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Chưa có sản phẩm nào</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Không tìm thấy sản phẩm phù hợp với bộ lọc. Hãy bấm &quot;Thêm sản phẩm mới&quot; để bổ sung vào kho hàng.
        </p>
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="mt-4 px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition cursor-pointer"
        >
          + Thêm sản phẩm ngay
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
}
