import React from "react";
import { toast } from "sonner";
import { A } from "../../shared";
import type { CartItem } from "./PosTypes";

interface PosCartProps {
  cart: CartItem[];
  paid: boolean;
  onChangeQty: (id: string, delta: number) => void;
  onConfirmPayment: () => void;
}

export function PosCart({
  cart,
  paid,
  onChangeQty,
  onConfirmPayment,
}: PosCartProps) {
  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const discount = subtotal > 0 ? Math.min(10000, subtotal) : 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[20px] h-full items-start p-[24px] rounded-[16px] shrink-0 w-[420px] shadow-sm">
      <div className="flex items-center justify-between shrink-0 w-full">
        <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[16px]">
          Giỏ hàng đang chọn
        </span>
        <div className="bg-[#eef2ff] flex items-start px-[8px] py-[2px] rounded-[10px] shrink-0">
          <span className="font-['Manrope:Bold'] font-bold text-[#4f46e5] text-[12px]">
            {cart.reduce((s, i) => s + i.qty, 0)} món
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-start min-h-0 w-full overflow-y-auto">
        {cart.length === 0 && (
          <div className="flex items-center justify-center w-full py-[40px]">
            <span className="font-['Manrope:Regular'] text-[#94a3b8] text-[14px]">
              Chưa có sản phẩm trong giỏ
            </span>
          </div>
        )}
        {cart.map((item) => (
          <div
            key={item.id}
            className="border-[#e2e8f0] border-b border-solid flex gap-[12px] items-center py-[12px] shrink-0 w-full"
          >
            <div className="flex flex-1 flex-col gap-[2px] items-start min-w-0">
              <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-[13px] w-full overflow-hidden text-ellipsis whitespace-nowrap">
                {item.name}
              </span>
              <span className="font-['Manrope:Regular'] font-normal text-[#64748b] text-[12px]">
                Đơn giá: {item.unitPrice.toLocaleString("vi-VN")}₫
              </span>
            </div>
            <div className="flex gap-[8px] items-center shrink-0">
              <button
                type="button"
                onClick={() => onChangeQty(item.id, -1)}
                className="border border-[#e2e8f0] flex flex-col items-center justify-center rounded-[4px] shrink-0 size-[24px] hover:bg-slate-50 cursor-pointer"
              >
                <span className="font-['Manrope:Bold'] font-bold text-[#64748b] text-[14px]">
                  -
                </span>
              </button>
              <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-[13px]">
                {item.qty}
              </span>
              <button
                type="button"
                onClick={() => onChangeQty(item.id, +1)}
                className="border border-[#e2e8f0] flex flex-col items-center justify-center rounded-[4px] shrink-0 size-[24px] hover:bg-slate-50 cursor-pointer"
              >
                <span className="font-['Manrope:Bold'] font-bold text-[#64748b] text-[14px]">
                  +
                </span>
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
          <span className="font-['Manrope:Regular'] font-normal text-[#64748b]">
            Tạm tính:
          </span>
          <span className="font-['Manrope:SemiBold'] font-semibold text-[#0f172a]">
            {subtotal.toLocaleString("vi-VN")}₫
          </span>
        </div>
        <div className="flex items-start justify-between shrink-0 text-[14px] w-full">
          <span className="font-['Manrope:Regular'] font-normal text-[#64748b]">
            Giảm giá:
          </span>
          <span className="font-['Manrope:SemiBold'] font-semibold text-[#ef4444]">
            -{discount.toLocaleString("vi-VN")}₫
          </span>
        </div>
        <div className="border-[#e2e8f0] border-t border-solid flex items-start justify-between pt-[8px] shrink-0 w-full">
          <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-[16px]">
            Tổng thanh toán:
          </span>
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#22c55e] text-[20px]">
            {total.toLocaleString("vi-VN")}₫
          </span>
        </div>
      </div>
      <button
        type="button"
        disabled={cart.length === 0 || paid}
        onClick={onConfirmPayment}
        className={`flex gap-[8px] items-center justify-center p-[16px] rounded-[10px] shrink-0 w-full transition-all cursor-pointer ${
          paid ? "bg-[#16a34a] scale-[0.99]" : "bg-[#22c55e] hover:bg-[#16a34a] active:scale-95 shadow-md shadow-emerald-500/20"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <img src={`${A}/43093.svg`} alt="" className="size-[18px] shrink-0" />
        <span className="font-['Manrope:ExtraBold'] font-extrabold text-[16px] text-white">
          {paid ? "✓ THANH TOÁN THÀNH CÔNG" : "XÁC NHẬN THANH TOÁN (F8)"}
        </span>
      </button>
    </div>
  );
}
