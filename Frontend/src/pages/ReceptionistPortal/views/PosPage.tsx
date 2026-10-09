import React, { useState } from 'react';
import { A } from '../shared';

type CartItem = { name: string; unitPrice: number; qty: number }

export function PosPage() {
  const [activeTab, setActiveTab] = useState("Tất cả sản phẩm")
  const [cart, setCart] = useState<CartItem[]>([])
  const [paid, setPaid] = useState(false)
  const [allProducts, setAllProducts] = useState<any[]>([])

  React.useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setAllProducts(data)
      })
      .catch(console.error)
  }, [])

  const tabs = ["Tất cả sản phẩm", ...Array.from(new Set(allProducts.map(p => p.category).filter(Boolean)))]
  const products = activeTab === "Tất cả sản phẩm" ? allProducts : allProducts.filter((p) => p.category === activeTab)

  function addToCart(name: string, price: number) {
    setCart((prev) => {
      const existing = prev.find((i) => i.name === name)
      if (existing) return prev.map((i) => i.name === name ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { name, unitPrice: price, qty: 1 }]
    })
    setPaid(false)
  }

  function changeQty(name: string, delta: number) {
    setCart((prev) => {
      const updated = prev.map((i) => i.name === name ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter((i) => i.qty > 0)
      return updated
    })
    setPaid(false)
  }

  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0)
  const discount = 10000
  const total = subtotal - discount

  return (
    <div className="flex flex-1 gap-[24px] items-start min-h-0 p-[32px] w-full">
      {/* Products */}
      <div className="flex flex-1 flex-col gap-[20px] h-full items-start min-w-0">
        {/* Tabs */}
        <div className="flex gap-[8px] items-start shrink-0 w-full flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex items-start px-[16px] py-[10px] rounded-[8px] shrink-0 transition-colors ${activeTab === tab ? "bg-white border-[#3b82f6] border-[1.5px] border-solid text-[#3b82f6] font-['Manrope:Bold'] font-bold" : "bg-white border border-[#e2e8f0] border-solid text-[#64748b] font-['Manrope:Medium'] font-medium"} text-[14px]`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex flex-col gap-[16px] items-start w-full">
          {[0, 3, 6].map((start) => (
            <div key={start} className="flex gap-[16px] items-start w-full">
              {products.slice(start, start + 3).map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => addToCart(p.name, p.price)}
                  className="bg-white border border-[#e2e8f0] flex flex-1 flex-col items-start min-w-0 overflow-hidden rounded-[12px] text-left hover:border-[#3b82f6] transition-colors"
                >
                  <div className="h-[100px] relative shrink-0 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" className="absolute inset-0 max-w-none object-cover size-full" />
                    ) : (
                      <span className="text-gray-400 text-xs">No Image</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-[4px] items-start p-[12px] w-full">
                    <span className="font-['Manrope:SemiBold'] font-semibold text-[#14b8a6] text-[11px] uppercase">{p.category}</span>
                    <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-[13px] w-full overflow-hidden text-ellipsis whitespace-nowrap">{p.name}</span>
                    <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#3b82f6] text-[14px]">{p.price.toLocaleString("vi-VN")}₫</span>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[20px] h-full items-start p-[24px] rounded-[12px] shrink-0 w-[450px]">
        <div className="flex items-center justify-between shrink-0 w-full">
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[16px]">Giỏ hàng đang chọn</span>
          <div className="bg-[#eef2ff] flex items-start px-[8px] py-[2px] rounded-[10px] shrink-0">
            <span className="font-['Manrope:Bold'] font-bold text-[#4f46e5] text-[12px]">{cart.reduce((s, i) => s + i.qty, 0)} món</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-start min-h-0 w-full overflow-y-auto">
          {cart.length === 0 && (
            <div className="flex items-center justify-center w-full py-[40px]">
              <span className="font-['Manrope:Regular'] text-[#94a3b8] text-[14px]">Chưa có sản phẩm trong giỏ</span>
            </div>
          )}
          {cart.map((item) => (
            <div key={item.name} className="border-[#e2e8f0] border-b border-solid flex gap-[12px] items-center py-[12px] shrink-0 w-full">
              <div className="flex flex-1 flex-col gap-[2px] items-start min-w-0">
                <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-[13px] w-full overflow-hidden text-ellipsis whitespace-nowrap">{item.name}</span>
                <span className="font-['Manrope:Regular'] font-normal text-[#64748b] text-[12px]">Đơn giá: {item.unitPrice.toLocaleString("vi-VN")}₫</span>
              </div>
              <div className="flex gap-[8px] items-center shrink-0">
                <button type="button" onClick={() => changeQty(item.name, -1)} className="border border-[#e2e8f0] flex flex-col items-center justify-center rounded-[4px] shrink-0 size-[24px]">
                  <span className="font-['Manrope:Bold'] font-bold text-[#64748b] text-[14px]">-</span>
                </button>
                <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-[13px]">{item.qty}</span>
                <button type="button" onClick={() => changeQty(item.name, +1)} className="border border-[#e2e8f0] flex flex-col items-center justify-center rounded-[4px] shrink-0 size-[24px]">
                  <span className="font-['Manrope:Bold'] font-bold text-[#64748b] text-[14px]">+</span>
                </button>
              </div>
              <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[13px] text-right w-[80px] shrink-0">
                {(item.unitPrice * item.qty).toLocaleString("vi-VN")}₫
              </span>
            </div>
          ))}
        </div>

        <div className="bg-[#e2e8f0] h-px shrink-0 w-full" />
        <div className="flex flex-col gap-[12px] items-start shrink-0 w-full">
          <div className="flex items-start justify-between shrink-0 text-[14px] w-full">
            <span className="font-['Manrope:Regular'] font-normal text-[#64748b]">Tạm tính:</span>
            <span className="font-['Manrope:SemiBold'] font-semibold text-[#0f172a]">{subtotal.toLocaleString("vi-VN")}₫</span>
          </div>
          <div className="flex items-start justify-between shrink-0 text-[14px] w-full">
            <span className="font-['Manrope:Regular'] font-normal text-[#64748b]">Giảm giá:</span>
            <span className="font-['Manrope:SemiBold'] font-semibold text-[#ef4444]">-{discount.toLocaleString("vi-VN")}₫</span>
          </div>
          <div className="border-[#e2e8f0] border-t border-solid flex items-start justify-between pt-[8px] shrink-0 w-full">
            <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-[16px]">Tổng thanh toán:</span>
            <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#22c55e] text-[20px]">{total.toLocaleString("vi-VN")}₫</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPaid(true)}
          className={`flex gap-[8px] items-center justify-center p-[16px] rounded-[8px] shrink-0 w-full transition-colors ${paid ? "bg-[#16a34a]" : "bg-[#22c55e]"}`}
        >
          <img src={`${A}/43093.svg`} alt="" className="size-[18px] shrink-0" />
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-[16px] text-white">
            {paid ? "✓ THANH TOÁN THÀNH CÔNG" : "XÁC NHẬN THANH TOÁN (F8)"}
          </span>
        </button>
      </div>
    </div>
  )
}

