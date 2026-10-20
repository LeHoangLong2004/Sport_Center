import React, { useState, useEffect, useMemo } from "react";
import { A, BillingPeriod, FlowPackage, getPaymentSummary, PaymentMethodId, Stepper } from "./shared";

export function PaymentMethodScreen({
  pkg,
  period,
  method,
  setMethod,
  formData,
  setFormData,
  onNext,
  onBack,
  availableMethods,
}: {
  pkg: FlowPackage;
  period: BillingPeriod;
  method: PaymentMethodId;
  setMethod: (m: PaymentMethodId) => void;
  formData: any;
  setFormData?: (fnOrVal: any) => void;
  onNext: () => void;
  onBack: () => void;
  availableMethods?: PaymentMethodId[];
}) {
  const { listPrice, discount, total, periodLabel } = getPaymentSummary(pkg, period);
  const fmt = (n: number) => n.toLocaleString("vi-VN") + " đ";

  // Copy to clipboard helper
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField((curr) => (curr === fieldName ? null : curr));
    }, 2000);
  };

  // Inline member profile editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: formData?.fullName || "",
    phone: formData?.phone || "",
    email: formData?.email || "",
    branch: formData?.branch || "Chi nhánh Quận 1 - Flagship Center",
    startDate: formData?.startDate || new Date().toISOString().slice(0, 10),
  });

  // Sync edit form if external formData changes
  useEffect(() => {
    setEditForm({
      fullName: formData?.fullName || "",
      phone: formData?.phone || "",
      email: formData?.email || "",
      branch: formData?.branch || "Chi nhánh Quận 1 - Flagship Center",
      startDate: formData?.startDate || new Date().toISOString().slice(0, 10),
    });
  }, [formData]);

  const handleSaveProfile = async () => {
    if (!editForm.fullName || !editForm.phone || !editForm.email) {
      alert("Vui lòng điền đầy đủ Họ tên, Số điện thoại và Email.");
      return;
    }

    if (setFormData) {
      setFormData((prev: any) => ({
        ...prev,
        ...editForm,
      }));
    }

    // Optionally sync with backend if user is logged in
    try {
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (userStr && token) {
        const u = JSON.parse(userStr);
        if (u.id) {
          fetch(`/api/users/${u.id}/profile`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              fullName: editForm.fullName,
              phoneNumber: editForm.phone,
              email: editForm.email,
            }),
          }).catch(() => {});
        }
      }
    } catch {}

    setIsEditingProfile(false);
  };

  // Promo code feature
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    if (code === "SPORT10" || code === "WELCOME") {
      const disc = Math.round(total * 0.1);
      setPromoDiscount(disc);
      setPromoMessage("✓ Áp dụng mã thành công! Giảm 10%");
    } else {
      setPromoDiscount(0);
      setPromoMessage("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
    }
  };

  const finalTotal = Math.max(0, total - promoDiscount);

  // Countdown timer (15 minutes)
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedCountdown = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Terms agreement
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Bank transfer info
  const phoneDigits = formData?.phone ? formData.phone.replace(/\D/g, "").slice(-4) : "GYM";
  const pkgCode = (pkg.id || "PKG").replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase();
  const transferMemo = `SC ${phoneDigits} ${pkgCode}`.toUpperCase();
  const vietQrUrl = `https://api.vietqr.io/image/970436-1234567890123-compact2.jpg?amount=${finalTotal}&addInfo=${encodeURIComponent(
    transferMemo
  )}&accountName=SPORTCENTER%20VIET%20NAM`;

  const methods: { id: PaymentMethodId; icon: string; label: string; sub: string; badge?: string }[] = [
    {
      id: "qr",
      icon: `${A}/66769.svg`,
      label: "Chuyển khoản QR (Vietcombank)",
      sub: "Quét mã nhận diện tự động — Kích hoạt sau 30s",
      badge: "Khuyên dùng ⚡",
    },
    {
      id: "card",
      icon: `${A}/b41b0.svg`,
      label: "Thẻ tín dụng / Ghi nợ / ATM",
      sub: "Visa, MasterCard, JCB, Napas — Bảo mật 3D Secure",
      badge: "3D Secure",
    },
    {
      id: "wallet",
      icon: `${A}/d8a69.svg`,
      label: "Ví điện tử (MoMo / ZaloPay)",
      sub: "Liên kết ví điện tử — Quét mã thanh toán tức thì",
      badge: "Hoàn 5%",
    },
    {
      id: "counter",
      icon: `${A}/a4eee.svg`,
      label: "Thanh toán trực tiếp tại quầy",
      sub: "Đến quầy lễ tân thanh toán & nhận thẻ trong 24h",
      badge: "Giữ chỗ 24h",
    },
  ];

  const isProduct = pkg.periodLabel === "Đơn hàng" || (!pkg.details && !pkg.terms);

  return (
    <div className="bg-[#f8fafc] flex flex-col items-center w-full min-h-screen">
      {/* Stepper Header */}
      <Stepper active={2} />

      {/* Top Bar with Back Button & Breadcrumb */}
      <div className="w-full max-w-[1240px] px-4 md:px-8 pb-4 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
            >
              <span className="text-base group-hover:-translate-x-1 transition-transform">←</span>
              <span>Quay lại</span>
            </button>
            <div>
              <h1 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-xl md:text-2xl tracking-tight">
                Xác nhận thông tin & Thanh toán
              </h1>
              <p className="font-['Inter:Regular'] text-slate-500 text-xs md:text-sm mt-0.5">
                Kiểm tra thông tin nhận gói và chọn hình thức thanh toán thuận tiện nhất
              </p>
            </div>
          </div>

          {/* Urgency countdown indicator */}
          <div className="inline-flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <span className="inline-block animate-pulse text-amber-600">⏳</span>
            <span>Ưu đãi giữ trong:</span>
            <span className="font-mono font-bold text-amber-700">{formattedCountdown}</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Balanced Layout */}
      <div className="flex items-start justify-center pb-20 pt-2 px-4 md:px-8 w-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start w-full max-w-[1240px]">
          {/* LEFT COLUMN: Member Info + Payment Methods + Details */}
          <div className="flex flex-1 flex-col gap-6 items-start min-w-0 w-full">
            
            {/* 1. MEMBER PROFILE CARD */}
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 w-full shadow-xs transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-full bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-sm">
                    👤
                  </div>
                  <div>
                    <h2 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-base md:text-lg">
                      {isProduct ? "Thông tin người nhận đơn hàng" : "Thông tin hội viên nhận gói"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Gói tập sẽ được kích hoạt trực tiếp theo thông tin này
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-[11px]">
                    <span className="size-1.5 rounded-full bg-emerald-500"></span>
                    Tài khoản chính chủ
                  </span>
                  {!isEditingProfile && (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <span>✏️</span>
                      <span>Chỉnh sửa</span>
                    </button>
                  )}
                </div>
              </div>

              {/* View Mode */}
              {!isEditingProfile ? (
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex flex-col gap-1">
                    <span className="text-slate-500 font-medium">Họ và tên</span>
                    <span className="text-slate-900 font-bold text-sm truncate">
                      {formData?.fullName || "Chưa cập nhật"}
                    </span>
                    <span className="text-slate-400 text-[11px] truncate">{formData?.email}</span>
                  </div>

                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex flex-col gap-1">
                    <span className="text-slate-500 font-medium">Số điện thoại</span>
                    <span className="text-slate-900 font-bold text-sm">
                      {formData?.phone || "Chưa cập nhật"}
                    </span>
                    <span className="text-teal-600 text-[11px] font-medium">Nhận SMS xác nhận</span>
                  </div>

                  {!isProduct && (
                    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex flex-col gap-1 sm:col-span-2 lg:col-span-1">
                      <span className="text-slate-500 font-medium">Cơ sở kích hoạt</span>
                      <span className="text-slate-900 font-bold text-xs truncate">
                        {formData?.branch || "Chi nhánh Quận 1"}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Bắt đầu: {formData?.startDate ? formData.startDate.split("-").reverse().join("/") : "Hôm nay"}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* Edit Mode Form */
                <div className="pt-4 flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">Họ và tên *</label>
                      <input
                        type="text"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        className="px-3.5 py-2 rounded-xl border border-slate-300 focus:border-teal-500 outline-none text-xs text-slate-900 font-medium"
                        placeholder="Nhập họ và tên"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">Số điện thoại *</label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="px-3.5 py-2 rounded-xl border border-slate-300 focus:border-teal-500 outline-none text-xs text-slate-900 font-medium"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">Email *</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="px-3.5 py-2 rounded-xl border border-slate-300 focus:border-teal-500 outline-none text-xs text-slate-900 font-medium"
                        placeholder="Nhập email"
                      />
                    </div>

                    {!isProduct && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-700">Cơ sở chính</label>
                        <select
                          value={editForm.branch}
                          onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                          className="px-3.5 py-2 rounded-xl border border-slate-300 focus:border-teal-500 outline-none text-xs text-slate-900 font-medium bg-white"
                        >
                          <option value="Chi nhánh Quận 1 - Flagship Center">Chi nhánh Quận 1 - Flagship Center</option>
                          <option value="Chi nhánh Quận 7 - Riverside Club">Chi nhánh Quận 7 - Riverside Club</option>
                          <option value="Chi nhánh Bình Thạnh - Pearl Plaza">Chi nhánh Bình Thạnh - Pearl Plaza</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      Lưu & Cập nhật
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. PAYMENT METHODS SELECTOR */}
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 w-full shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-base md:text-lg">
                    Chọn phương thức thanh toán
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hỗ trợ tất cả ngân hàng Việt Nam, thẻ quốc tế và thanh toán tại quầy
                  </p>
                </div>
                <span className="text-xs text-teal-600 font-bold bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                  Miễn phí giao dịch
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4">
                {methods
                  .filter((m) => !availableMethods || availableMethods.includes(m.id))
                  .map((m) => {
                    const isSelected = method === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMethod(m.id)}
                        className={`relative flex items-start gap-3.5 p-4 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-teal-50/70 border-2 border-teal-500 shadow-sm"
                            : "bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        {/* Radio circle */}
                        <div
                          className={`size-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isSelected ? "bg-teal-600 text-white" : "border-2 border-slate-300"
                          }`}
                        >
                          {isSelected && <div className="size-2 rounded-full bg-white" />}
                        </div>

                        {/* Icon */}
                        <img src={m.icon} className="size-8 shrink-0 object-contain" alt="" />

                        {/* Text */}
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-['Inter:Semi_Bold'] font-semibold text-slate-900 text-xs md:text-sm">
                              {m.label}
                            </span>
                            {m.badge && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  isSelected
                                    ? "bg-teal-600 text-white"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {m.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 leading-4">
                            {m.sub}
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* 3. DYNAMIC PAYMENT METHOD DETAILS */}
            {method === "qr" && (
              <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 w-full shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h3 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-base">
                      Quét mã VietQR Chuyển khoản 24/7
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500">Tự động kích hoạt sau khi nhận</span>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start pt-5 w-full">
                  {/* Left: Bank details with 1-click copy */}
                  <div className="flex flex-col gap-3.5 flex-1 min-w-0 w-full">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex flex-col gap-3">
                      
                      {/* Bank Name */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Ngân hàng thụ hưởng</span>
                        <span className="font-bold text-slate-900">Vietcombank (VCB)</span>
                      </div>

                      {/* Account Number */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Số tài khoản</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 text-sm">1234567890123</span>
                          <button
                            type="button"
                            onClick={() => handleCopy("1234567890123", "account")}
                            className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-semibold text-teal-700 transition-all cursor-pointer"
                          >
                            {copiedField === "account" ? "✓ Đã chép!" : "Sao chép"}
                          </button>
                        </div>
                      </div>

                      {/* Account Owner */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Chủ tài khoản</span>
                        <span className="font-bold text-slate-900">SPORTCENTER VIET NAM</span>
                      </div>

                      {/* Transfer Amount */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Số tiền thanh toán</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-teal-700 text-base">{fmt(finalTotal)}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(String(finalTotal), "amount")}
                            className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-semibold text-teal-700 transition-all cursor-pointer"
                          >
                            {copiedField === "amount" ? "✓ Đã chép!" : "Sao chép"}
                          </button>
                        </div>
                      </div>

                      {/* Transfer Memo */}
                      <div className="flex flex-col gap-1 pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-semibold">Nội dung chuyển khoản (bắt buộc)</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(transferMemo, "memo")}
                            className="px-2.5 py-1 rounded-md bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer"
                          >
                            {copiedField === "memo" ? "✓ Đã chép nội dung!" : "Sao chép nội dung"}
                          </button>
                        </div>
                        <div className="bg-teal-50 border border-teal-200 rounded-lg p-2.5 font-mono font-black text-teal-800 text-sm tracking-wider text-center">
                          {transferMemo}
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-4">
                      💡 <strong>Mẹo:</strong> Nhập chính xác mã nội dung <span className="font-mono font-bold text-teal-700">{transferMemo}</span> để hệ thống SportCenter tự động đối soát và kích hoạt trong vòng 30 giây.
                    </p>
                  </div>

                  {/* Right: VietQR Code Box */}
                  <div className="flex flex-col gap-2.5 items-center shrink-0 self-center md:self-start bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <div className="bg-white border border-slate-200 rounded-xl size-[210px] p-2.5 flex items-center justify-center shadow-xs overflow-hidden">
                      <img
                        src={vietQrUrl}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `${A}/cfa8b.svg`;
                        }}
                        className="size-full object-contain rounded-lg"
                        alt="Mã QR Chuyển khoản"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 text-center">
                      <span>📱 Quét bằng app ngân hàng bất kỳ</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {method === "card" && (
              <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 w-full shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-base">
                    Thanh toán thẻ tín dụng & ghi nợ quốc tế
                  </h3>
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    PCI-DSS Level 1
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-4 text-xs text-slate-600 flex flex-col gap-3">
                  <p className="leading-relaxed">
                    SportCenter hỗ trợ thanh toán trực tuyến qua <strong>Visa, MasterCard, JCB</strong> và <strong>thẻ ATM Napas</strong>. Mọi giao dịch được mã hóa và xác thực an toàn qua 3D Secure với mã OTP gửi về số điện thoại đăng ký thẻ.
                  </p>
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-600">Số tiền cần thanh toán:</span>
                    <strong className="text-teal-700 font-bold text-sm">{fmt(finalTotal)}</strong>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Nhấn nút "Xác nhận & Tiến hành thanh toán" để chuyển sang bước nhập mã xác thực OTP bảo mật.
                  </p>
                </div>
              </div>
            )}

            {method === "wallet" && (
              <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 w-full shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-base">
                    Ví điện tử MoMo & ZaloPay
                  </h3>
                  <span className="text-xs text-pink-600 font-bold bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
                    Ưu đãi hoàn tiền 5%
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-4 text-xs text-slate-600 flex flex-col gap-3">
                  <p className="leading-relaxed">
                    Sau khi nhấn xác nhận, bạn sẽ được liên kết trực tiếp tới ứng dụng <strong>MoMo</strong> hoặc <strong>ZaloPay</strong> để hoàn tất thanh toán trong 1 chạm.
                  </p>
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-600">Số tiền giao dịch:</span>
                    <strong className="text-teal-700 font-bold text-sm">{fmt(finalTotal)}</strong>
                  </div>
                </div>
              </div>
            )}

            {method === "counter" && (
              <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 w-full shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-base">
                      Thanh toán trực tiếp tại quầy lễ tân
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Đặt chỗ trước — Giữ nguyên mức giá ưu đãi</p>
                  </div>
                  <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    Giữ chỗ 24 giờ
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-4 text-xs text-slate-700 flex flex-col gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="text-teal-600 font-bold shrink-0">🏢 Cơ sở tiếp nhận:</span>
                    <span className="text-slate-900 font-semibold">{formData?.branch || "Chi nhánh Quận 1 - Flagship Center"}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-teal-600 font-bold shrink-0">💵 Số tiền cần thanh toán:</span>
                    <strong className="text-teal-700 font-extrabold text-sm">{fmt(finalTotal)}</strong>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-teal-600 font-bold shrink-0">💳 Hình thức thu tại quầy:</span>
                    <span>Tiền mặt, Quẹt thẻ POS (Visa/Master/ATM) hoặc Chuyển khoản ngân hàng trực tiếp tại quầy</span>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200/80 text-amber-900 text-[11px] leading-relaxed">
                    💡 <strong>Lưu ý:</strong> Đơn đăng ký giữ chỗ có hiệu lực trong <strong>24 giờ</strong>. Khi đến quầy, bạn chỉ cần đọc Số điện thoại <span className="font-bold">{formData?.phone || "đăng ký"}</span> để Lễ tân xuất hóa đơn và bàn giao thẻ hội viên ngay.
                  </div>
                </div>
              </div>
            )}

            {/* Security Guarantee Banner */}
            <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-4 w-full text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="text-teal-600 text-base">🛡️</span>
                <span>Bảo mật chuẩn quốc tế SSL 256-bit | Đảm bảo an toàn 100% cho mọi giao dịch</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">SportCenter SafeCheckout</span>
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Order Summary Card */}
          <div className="flex flex-col items-start w-full lg:w-[410px] shrink-0 sticky top-6">
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 w-full shadow-lg shadow-slate-200/40 flex flex-col gap-4">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-lg">
                  Tóm tắt đơn hàng
                </h2>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  {periodLabel}
                </span>
              </div>

              {/* Package Details */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-base">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{pkg.tagline}</p>
                  </div>
                </div>

                {pkg.description && (
                  <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-2">
                    {pkg.description}
                  </p>
                )}

                {/* Key features checklist */}
                {pkg.features && pkg.features.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-200/60">
                    {pkg.features.slice(0, 4).map((f: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="text-teal-600 font-bold shrink-0">✓</span>
                        <span className="line-clamp-1">{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activation quick info */}
              {!isProduct && (
                <div className="bg-slate-50/60 border border-slate-200/60 rounded-xl p-3 flex flex-col gap-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Hội viên:</span>
                    <span className="font-semibold text-slate-900 truncate max-w-[180px]">
                      {formData?.fullName || "Khách hàng"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Ngày kích hoạt:</span>
                    <span className="font-semibold text-slate-900">
                      {formData?.startDate ? formData.startDate.split("-").reverse().join("/") : "Hôm nay"}
                    </span>
                  </div>
                </div>
              )}

              {/* Promo code voucher field */}
              <div className="flex flex-col gap-1.5 pt-1">
                <label className="text-xs font-semibold text-slate-700">Mã ưu đãi / Voucher</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Nhập mã (VD: SPORT10)"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 focus:border-teal-500 outline-none text-xs text-slate-800 uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-all cursor-pointer shrink-0"
                  >
                    Áp dụng
                  </button>
                </div>
                {promoMessage && (
                  <p
                    className={`text-[11px] font-medium ${
                      promoDiscount > 0 ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {promoMessage}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-slate-200 pt-3 flex flex-col gap-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Giá niêm yết</span>
                  <span className="font-semibold text-slate-800">{fmt(listPrice)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600">
                    <span>Ưu đãi gói hội viên</span>
                    <span className="font-bold">-{fmt(discount)}</span>
                  </div>
                )}

                {promoDiscount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600">
                    <span>Voucher giảm giá</span>
                    <span className="font-bold">-{fmt(promoDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Phí dịch vụ & Quản lý</span>
                  <span className="font-semibold text-emerald-600">Miễn phí</span>
                </div>
              </div>

              {/* Total Payment */}
              <div className="border-t border-dashed border-slate-200 pt-3 flex items-end justify-between">
                <div>
                  <span className="block text-xs font-semibold text-slate-700">Tổng thanh toán</span>
                  <span className="block text-[10px] text-slate-400">Đã bao gồm tất cả thuế phí</span>
                </div>
                <span className="font-['Inter:Extra_Bold'] font-extrabold text-teal-600 text-2xl tracking-tight">
                  {fmt(finalTotal)}
                </span>
              </div>

              {/* Terms checkbox */}
              <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <span className="text-[11px] text-slate-500 leading-4">
                  Tôi đồng ý với{" "}
                  <a href="#rules" className="text-teal-600 underline font-medium" target="_blank" rel="noreferrer">
                    Điều khoản dịch vụ
                  </a>{" "}
                  và Quy chế hội viên của SportCenter.
                </span>
              </label>

              {/* Big Action CTA Button */}
              <button
                type="button"
                disabled={!agreedTerms}
                onClick={onNext}
                className={`w-full py-3.5 rounded-xl font-['Inter:Bold'] font-bold text-white text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  agreedTerms
                    ? "bg-teal-600 hover:bg-teal-700 active:scale-[0.99] shadow-teal-600/20"
                    : "bg-slate-300 cursor-not-allowed shadow-none"
                }`}
              >
                <span>
                  {method === "counter"
                    ? "Xác nhận đặt lịch tại quầy →"
                    : `Xác nhận & Thanh toán ${fmt(finalTotal)} →`}
                </span>
              </button>

              {/* Trust Footer */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
                <span>🔒 SSL 256-bit</span>
                <span>•</span>
                <span>Kích hoạt tự động</span>
                <span>•</span>
                <span>Hotline: 1900 6868</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
