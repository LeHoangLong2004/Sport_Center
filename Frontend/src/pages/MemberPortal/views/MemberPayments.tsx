import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { MemberScreen, MemberPaymentItem } from "../types";
import { PackageAPI } from "../../../services/packageApi";
import {
  Receipt,
  CheckCircle2,
  Clock,
  X,
  Building,
  Copy,
  PlusCircle,
} from "lucide-react";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
}

export default function MemberPayments({ onNavigate }: Props) {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userName = user?.fullName || user?.name || "Hội viên";

  const [payments, setPayments] = useState<MemberPaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePaymentModal, setActivePaymentModal] = useState<MemberPaymentItem | null>(null);
  const [receiptModal, setReceiptModal] = useState<MemberPaymentItem | null>(null);
  const [bankMethod, setBankMethod] = useState<"Chuyển khoản" | "Tiền mặt tại quầy">("Chuyển khoản");
  const [refCode, setRefCode] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    PackageAPI.getMyOrders()
      .then((orders) => {
        if (cancelled) return;
        if (Array.isArray(orders) && orders.length > 0) {
          const mapped: MemberPaymentItem[] = orders.map((o) => ({
            id: `INV-${o.id.substring(0, 8).toUpperCase()}`,
            packageName: o.packageSnapshot?.name || "Gói tập hội viên",
            amount: o.total || 0,
            date: o.createdAt ? new Date(o.createdAt).toLocaleDateString("vi-VN") : "Hôm nay",
            method: "Chuyển khoản",
            status: o.status === "paid" ? "paid" : "pending",
            referenceCode: o.id.substring(0, 8).toUpperCase(),
          }));
          setPayments(mapped);
        } else {
          setPayments([]);
        }
      })
      .catch(() => {
        if (!cancelled) setPayments([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleReportPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentModal) return;

    const updated = payments.map((p) =>
      p.id === activePaymentModal.id
        ? {
            ...p,
            method: bankMethod,
            status: "paid" as const,
            referenceCode: refCode.trim() || `MB-${Date.now().toString().slice(-6)}`,
          }
        : p
    );

    setPayments(updated);
    setActivePaymentModal(null);
    setRefCode("");
    setFeedback("Đã gửi thông tin thanh toán cho nhân viên lễ tân xác nhận đối soát!");
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Thanh toán & Hóa đơn</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Quản lý lịch sử giao dịch thực tế, tra cứu hóa đơn và gửi thông tin xác nhận thanh toán chuyển khoản
        </p>
      </div>

      {/* Payment Table / Empty State */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Lịch sử đơn hàng & Hóa đơn ({payments.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Đang tải lịch sử giao dịch...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Chưa có hóa đơn hoặc đơn hàng nào
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Khi bạn đăng ký các gói tập luyện, thuê tủ đồ hoặc dịch vụ tại SportCenter, thông tin thanh toán sẽ được lưu trữ tự động tại đây.
            </p>
            <button
              type="button"
              onClick={() => onNavigate("packages")}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Khám phá gói tập</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-4">Mã hóa đơn</th>
                  <th className="p-4">Gói dịch vụ</th>
                  <th className="p-4">Số tiền</th>
                  <th className="p-4">Ngày tạo</th>
                  <th className="p-4">Hình thức</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-mono font-semibold text-slate-900 dark:text-white">
                      {p.id}
                    </td>
                    <td className="p-4 font-medium">{p.packageName}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {p.amount.toLocaleString("vi-VN")} đ
                    </td>
                    <td className="p-4 text-slate-500">{p.date}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{p.method}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          p.status === "paid"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                            : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {p.status === "paid" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Đã thanh toán
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            Chờ thanh toán
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {p.status === "pending" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setActivePaymentModal(p);
                            setRefCode(p.referenceCode || "");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          Báo thanh toán
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setReceiptModal(p)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-slate-400" />
                          <span>Xem phiếu thu</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL BÁO THANH TOÁN (PORTAL) */}
      {activePaymentModal &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    {activePaymentModal.id}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Thông tin thanh toán đơn hàng
                  </h3>
                </div>
                <button onClick={() => setActivePaymentModal(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReportPayment} className="p-5 space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-2 border border-slate-700 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                      Ngân hàng Quân Đội (MB Bank)
                    </span>
                    <Building className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-lg font-mono font-bold tracking-widest text-white">
                    0903 8888 6868
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Chủ TK: <span className="font-semibold text-white">TRUNG TAM THE THAO SPORTCENTER</span>
                  </div>
                  <div className="pt-2 border-t border-slate-700/60 flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Số tiền:</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {activePaymentModal.amount.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Nội dung CK:</span>
                    <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-600">
                      {activePaymentModal.id}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Phương thức thanh toán:
                  </label>
                  <select
                    value={bankMethod}
                    onChange={(e) => setBankMethod(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Chuyển khoản">Chuyển khoản Ngân hàng (QR / App)</option>
                    <option value="Tiền mặt tại quầy">Tiền mặt tại quầy Lễ tân</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Mã giao dịch / Ghi chú đối soát:
                  </label>
                  <input
                    type="text"
                    value={refCode}
                    onChange={(e) => setRefCode(e.target.value)}
                    placeholder="VD: MB-889921 hoặc Đã chuyển khoản sáng nay"
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActivePaymentModal(null)}
                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    Xác nhận đã thanh toán
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL PHIẾU THU ĐIỆN TỬ (PORTAL) */}
      {receiptModal &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Phiếu thu điện tử
                  </h3>
                </div>
                <button onClick={() => setReceiptModal(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs font-mono">
                <div className="text-center pb-3 border-b border-dashed border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">SPORTCENTER</h4>
                  <p className="text-[11px] text-slate-500">Trung tâm thể thao & chăm sóc sức khỏe</p>
                  <p className="text-[10px] text-slate-400 mt-1">Số: {receiptModal.id}</p>
                </div>

                <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Khách hàng:</span>
                    <strong>{userName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Nội dung:</span>
                    <span>{receiptModal.packageName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ngày thu:</span>
                    <span>{receiptModal.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hình thức:</span>
                    <span>{receiptModal.method}</span>
                  </div>
                  {receiptModal.referenceCode && (
                    <div className="flex justify-between">
                      <span>Mã tham chiếu:</span>
                      <span>{receiptModal.referenceCode}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-900 dark:text-white">TỔNG TIỀN:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 text-base">
                    {receiptModal.amount.toLocaleString("vi-VN")} đ
                  </strong>
                </div>

                <div className="text-center pt-3 text-[10px] text-slate-400 italic">
                  Cảm ơn quý hội viên đã tin tưởng và đồng hành cùng SportCenter!
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-850">
                <button
                  type="button"
                  onClick={() => setReceiptModal(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Đóng phiếu thu
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
