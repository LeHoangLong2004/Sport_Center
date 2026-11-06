import React from "react";
import type { PosProduct } from "./PosTypes";

interface PosProductGridProps {
  products: PosProduct[];
  tabs: string[];
  activeTab: string;
  searchQuery: string;
  onSelectTab: (tab: string) => void;
  onSearchChange: (query: string) => void;
  onAddToCart: (product: PosProduct) => void;
}

export function PosProductGrid({
  products,
  tabs,
  activeTab,
  searchQuery,
  onSelectTab,
  onSearchChange,
  onAddToCart,
}: PosProductGridProps) {
  return (
    <div className="flex flex-1 flex-col gap-[16px] h-full items-start min-w-0">
      {/* Search & Category Tabs */}
      <div className="flex flex-col gap-[12px] w-full shrink-0">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm sản phẩm theo tên..."
            className="w-full pl-9 pr-8 py-2 bg-white border border-[#e2e8f0] rounded-xl text-xs font-medium outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] shadow-xs"
          />
          <svg
            className="absolute left-3 top-2.5 size-3.5 text-slate-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex gap-[8px] items-start shrink-0 w-full flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onSelectTab(tab)}
              className={`flex items-start px-[14px] py-[8px] rounded-[8px] shrink-0 transition-colors ${
                activeTab === tab
                  ? "bg-white border-[#3b82f6] border-[1.5px] border-solid text-[#3b82f6] font-['Manrope:Bold'] font-bold shadow-xs"
                  : "bg-white border border-[#e2e8f0] border-solid text-[#64748b] font-['Manrope:Medium'] font-medium hover:border-slate-300"
              } text-[13px]`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="w-full flex-1 overflow-y-auto pr-1">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full py-16 text-slate-400 bg-white border border-dashed border-slate-200 rounded-2xl">
            <span className="text-3xl mb-2">📦</span>
            <p className="text-sm font-semibold text-slate-600">Không tìm thấy sản phẩm nào</p>
            <p className="text-xs text-slate-400 mt-1">Hãy thử chọn danh mục khác hoặc xóa từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px] w-full">
            {products.map((p) => {
              const isOutOfStock = p.stockQuantity <= 0;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onAddToCart(p)}
                  disabled={isOutOfStock}
                  className={`bg-white border flex flex-col items-start min-w-0 overflow-hidden rounded-[12px] text-left transition-all ${
                    isOutOfStock
                      ? "opacity-60 border-slate-200 cursor-not-allowed bg-slate-50"
                      : "border-[#e2e8f0] hover:border-[#3b82f6] hover:shadow-md cursor-pointer active:scale-[0.99]"
                  }`}
                >
                  <div className="h-[110px] relative shrink-0 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="absolute inset-0 max-w-none object-cover size-full"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">Không có ảnh</span>
                    )}
                    {isOutOfStock && (
                      <span className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        Hết hàng
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-[3px] items-start p-[12px] w-full">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-[#14b8a6] text-[11px] uppercase">
                        {p.category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Kho: {p.stockQuantity ?? 0}
                      </span>
                    </div>
                    <span
                      className="font-bold text-[#0f172a] text-[13px] w-full overflow-hidden text-ellipsis whitespace-nowrap"
                      title={p.name}
                    >
                      {p.name}
                    </span>
                    <span className="font-extrabold text-[#3b82f6] text-[14px]">
                      {p.price?.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
