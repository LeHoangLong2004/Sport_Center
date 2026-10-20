import React from "react";
import { createPortal } from "react-dom";
import { X, QrCode, Building, Info, RefreshCw, ArrowRight } from "lucide-react";
import type { CatalogPackage, PackagePeriod } from "../../../../services/packageApi";

interface Props {
  selectedPackage: CatalogPackage | null;
  onClose: () => void;
  checkoutDuration: PackagePeriod;
  checkoutMethod: "qr" | "counter";
  onSelectCheckoutMethod: (method: "qr" | "counter") => void;
  calculateDiscount: (pkg: CatalogPackage) => {
    discountPct: number;
    originalPrice: number;
    finalPrice: number;
  };
  isSubmitting: boolean;
  onSubmit: () => void;
}

export default function PackageCheckoutModal({
  selectedPackage,
  onClose,
  checkoutDuration,
  checkoutMethod,
  onSelectCheckoutMethod,
  calculateDiscount,
  isSubmitting,
  onSubmit,
}: Props) {
  if (!selectedPackage) return null;

  const { discountPct, originalPrice, finalPrice } = calculateDiscount(selectedPackage);

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-scaleUp">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              {selectedPackage.category === "membership"
                ? "Đăng Ký Gói Thành Viên"
                : "Đăng Ký Gói Môn Tập"}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              Xác nhận đơn thanh toán
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
          {/* Summary Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/20 dark:from-emerald-950/30 dark:to-slate-850 border border-emerald-200/80 dark:border-emerald-800/80">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {selectedPackage.sport || "Hội viên"}
              </span>
              <span className="font-bold text-slate-500 dark:text-slate-400">
                Kỳ hạn: {checkoutDuration} tháng
              </span>
            </div>

            <h4 className="text-lg font-black text-slate-900 dark:text-white mt-2">
              {selectedPackage.name}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {selectedPackage.description}
            </p>

            <div className="mt-4 pt-3 border-t border-emerald-200/50 dark:border-emerald-800/50 flex items-baseline justify-between">
              <div>
                {discountPct > 0 && (
                  <span className="text-xs text-slate-400 line-through mr-2">
                    {originalPrice.toLocaleString("vi-VN")} đ
                  </span>
                )}
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {finalPrice.toLocaleString("vi-VN")} đ
                </span>
              </div>
              {discountPct > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  Đã giảm {discountPct}%
                </span>
              )}
            </div>
          </div>

          {/* Payment method selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Chọn phương thức thanh toán:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onSelectCheckoutMethod("qr")}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  checkoutMethod === "qr"
                    ? "bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold text-xs">Chuyển khoản QR</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                  Quét mã VietQR nhanh 24/7
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectCheckoutMethod("counter")}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  checkoutMethod === "counter"
                    ? "bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-xs">Tiền mặt tại quầy</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                  Thanh toán với Lễ tân trung tâm
                </span>
              </button>
            </div>
          </div>

          {/* Important notice */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <Info className="w-4 h-4 text-emerald-500" />
              <span>Lưu ý thanh toán:</span>
            </div>
            {checkoutMethod === "counter" ? (
              <>
                <p>• Phiếu đăng ký giữ chỗ có hiệu lực trong <strong>24 giờ</strong> tại quầy lễ tân.</p>
                <p>• Bạn có thể thanh toán bằng tiền mặt hoặc quẹt thẻ POS với lễ tân để kích hoạt gói ngay.</p>
              </>
            ) : (
              <>
                <p>• Quyền lợi gói sẽ được kích hoạt ngay sau khi đối soát chuyển khoản thành công.</p>
                <p>• Nếu bạn đã có gói cùng môn đang hoạt động, hạn sử dụng sẽ được cộng dồn nối tiếp.</p>
              </>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-850">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onSubmit}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 font-extrabold shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : checkoutMethod === "counter" ? (
              <>
                <span>Tạo phiếu hẹn tại quầy</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Tạo đơn thanh toán online</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
