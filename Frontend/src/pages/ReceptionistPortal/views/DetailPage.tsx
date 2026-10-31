import React from "react"
import { Edit3 } from "lucide-react"

export function DetailPage({
  member,
  onBack,
}: {
  member?: any
  onBack: () => void
}) {
  const m = member || {
    fullName: "Nguyễn Lan Anh",
    memberCode: "MB-2048",
    packageName: "Premium 12 tháng",
    status: "Đang hoạt động",
    statusColor: "green",
    phoneNumber: "0912 345 678",
    email: "lananh@email.com",
    gender: "Nữ",
    dateOfBirth: "1996-08-15",
    address: "Số 15 Ngõ 102, Chùa Bộc, Đống Đa, Hà Nội",
    emergencyContact: "Nguyễn Văn Hùng (Bố) - 0988 123 456",
    startDate: "2026-01-18",
    expiryDate: "2026-12-18",
    totalAmount: 12500000,
  }

  const daysRemaining = m.expiryDate
    ? Math.max(0, Math.ceil((new Date(m.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  const personalInfo = [
    {
      label: "Ngày sinh:",
      value: m.dateOfBirth ? new Date(m.dateOfBirth).toLocaleDateString("vi-VN") : "Chưa cập nhật",
    },
    { label: "Giới tính:", value: m.gender || "Chưa cập nhật" },
    { label: "Số điện thoại:", value: m.phoneNumber || "Chưa cập nhật" },
    { label: "Email:", value: m.email || "Chưa cập nhật" },
    { label: "Địa chỉ:", value: m.address || "Chưa cập nhật" },
    { label: "Liên hệ khẩn cấp:", value: m.emergencyContact || "Chưa cập nhật" },
  ]

  const packageInfo = [
    { label: "Gói đăng ký:", value: m.packageName || "Chưa đăng ký", highlight: true },
    {
      label: "Ngày đăng ký:",
      value: m.startDate ? new Date(m.startDate).toLocaleDateString("vi-VN") : "N/A",
    },
    {
      label: "Hạn sử dụng:",
      value: m.expiryDate ? new Date(m.expiryDate).toLocaleDateString("vi-VN") : "N/A",
    },
    {
      label: "Tổng tiền gói tập:",
      value: m.totalAmount ? Number(m.totalAmount).toLocaleString("vi-VN") + " đ" : "0 đ",
    },
  ]

  const trainingHistory = [
    { date: "15/02/2026", activity: "Yoga Advanced Class", trainer: "HLV Minh Tuyết", duration: "60 phút", checkin: "18:05" },
    { date: "12/02/2026", activity: "Cardio & Fitness Gym", trainer: "Tự do", duration: "90 phút", checkin: "17:30" },
    { date: "09/02/2026", activity: "Swimming pool", trainer: "Tự do", duration: "45 phút", checkin: "07:15" },
  ]

  const paymentHistory = [
    {
      date: m.startDate ? new Date(m.startDate).toLocaleDateString("vi-VN") : "18/01/2026",
      content: `Thanh toán ${m.packageName || "gói tập"}`,
      method: "Chuyển khoản QR",
      amount: m.totalAmount ? Number(m.totalAmount).toLocaleString("vi-VN") + " đ" : "12,500,000 đ",
    },
    {
      date: "15/01/2026",
      content: "Mua nước khoáng Lavie & Khăn tập",
      method: "Tiền mặt",
      amount: "150,000 đ",
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-[24px] items-start min-h-0 overflow-y-auto p-[32px] w-full">
      {/* Header card */}
      <div className="bg-white border border-[#e2e8f0] flex items-center justify-between p-[24px] rounded-[12px] shrink-0 w-full">
        <div className="flex gap-[20px] items-center shrink-0">
          <img
            src={m.avatarUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(m.fullName)}
            alt=""
            className="shrink-0 size-[72px] rounded-full object-cover border border-[#e2e8f0]"
          />
          <div className="flex flex-col gap-[6px] items-start shrink-0">
            <div className="flex gap-[12px] items-center shrink-0">
              <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[22px]">
                {m.fullName}
              </span>
              <span
                className={`font-['Manrope:Bold'] font-bold px-[8px] py-[4px] rounded-[6px] text-[11px] ${
                  m.status === "Đang hoạt động"
                    ? "bg-[#dcfce7] text-[#15803d]"
                    : m.status === "Hết hạn"
                    ? "bg-[#ffedd5] text-[#c2410c]"
                    : "bg-[#fee2e2] text-[#ef4444]"
                }`}
              >
                {m.status}
              </span>
            </div>
            <div className="flex gap-[16px] items-center shrink-0 text-[14px]">
              <span className="font-['Manrope:Bold'] font-bold text-[#3b82f6]">
                Mã thẻ: {m.memberCode}
              </span>
              <span className="text-[#64748b]">•</span>
              <span className="font-['Manrope:SemiBold'] font-semibold text-[#64748b]">
                {m.packageName}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-[12px] items-start shrink-0">
          <button type="button" className="bg-purple-600 text-white px-[18px] py-[10px] rounded-[8px] font-['Manrope:Bold'] font-bold text-[14px] hover:bg-purple-700 shadow-sm shadow-purple-600/20 transition-all">
            Gia hạn gói tập
          </button>
          <button type="button" className="bg-white border border-[#e2e8f0] px-[18px] py-[10px] rounded-[8px] font-['Manrope:Bold'] font-bold text-[#0f172a] text-[14px] hover:bg-slate-50 transition-colors">
            In thẻ thành viên
          </button>
          <button type="button" className="bg-[#fee2e2] text-[#ef4444] px-[18px] py-[10px] rounded-[8px] font-['Manrope:Bold'] font-bold text-[14px] hover:bg-red-200 transition-colors">
            Tạm khóa thẻ
          </button>
          <button type="button" onClick={onBack} className="border border-[#e2e8f0] px-[18px] py-[10px] rounded-[8px] font-['Manrope:Bold'] font-bold text-[#64748b] text-[14px] hover:bg-slate-50 transition-colors">
            ← Quay lại
          </button>
        </div>
      </div>

      {/* Content Split */}
      <div className="flex flex-1 gap-[24px] items-start min-h-0 w-full">
        {/* Left column */}
        <div className="flex flex-col gap-[24px] items-start shrink-0 w-[450px]">
          {/* Thông tin cá nhân */}
          <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] items-start p-[24px] rounded-[12px] w-full">
            <div className="flex items-center justify-between w-full">
              <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[16px]">
                Thông tin cá nhân
              </span>
              <Edit3 className="size-[16px] text-[#64748b] cursor-pointer" />
            </div>
            <div className="bg-[#e2e8f0] h-px w-full" />
            {personalInfo.map((row) => (
              <div key={row.label} className="flex gap-[12px] items-start w-full text-[13px]">
                <span className="font-['Manrope:Regular'] font-normal text-[#64748b] w-[130px] shrink-0">
                  {row.label}
                </span>
                <span className="font-['Manrope:SemiBold'] font-semibold text-[#0f172a] flex-1 min-w-0">
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Thông tin gói tập hiện tại */}
          <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] items-start p-[24px] rounded-[12px] w-full">
            <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[16px]">
              Thông tin gói tập hiện tại
            </span>
            <div className="bg-[#e2e8f0] h-px w-full" />
            {packageInfo.map((row) => (
              <div key={row.label} className="flex gap-[12px] items-start w-full text-[13px]">
                <span className="font-['Manrope:Regular'] font-normal text-[#64748b] w-[140px] shrink-0">
                  {row.label}
                </span>
                <span className={row.highlight ? "font-['Manrope:ExtraBold'] font-extrabold text-[#3b82f6]" : "font-['Manrope:SemiBold'] font-semibold text-[#0f172a]"}>
                  {row.value}
                </span>
              </div>
            ))}
            <div className="flex gap-[12px] items-start w-full text-[13px]">
              <span className="font-['Manrope:Regular'] font-normal text-[#64748b] w-[140px] shrink-0">
                Số ngày còn lại:
              </span>
              <span className="bg-[#eff6ff] font-['Manrope:Bold'] font-bold px-[8px] py-[2px] rounded-[4px] text-[#3b82f6] text-[12px]">
                {daysRemaining} ngày
              </span>
            </div>
            <div className="flex gap-[12px] items-start w-full text-[13px]">
              <span className="font-['Manrope:Regular'] font-normal text-[#64748b] w-[140px] shrink-0">
                Trạng thái thanh toán:
              </span>
              <span className="bg-[#dcfce7] font-['Manrope:Bold'] font-bold px-[8px] py-[2px] rounded-[4px] text-[#15803d] text-[11px]">
                Đã thanh toán 100%
              </span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-1 flex-col gap-[24px] items-start min-w-0">
          {/* Lịch sử tập luyện */}
          <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] items-start px-[24px] py-[20px] rounded-[12px] w-full">
            <div className="flex items-center justify-between shrink-0 w-full">
              <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[16px]">
                Lịch sử tập luyện gần đây
              </span>
              <span className="font-['Manrope:Bold'] font-bold text-[#3b82f6] text-[13px] cursor-pointer">
                Xem tất cả
              </span>
            </div>
            <div className="border border-[#e2e8f0] flex flex-col items-start overflow-hidden rounded-[8px] w-full">
              <div className="bg-[#f1f5f9] flex font-['Manrope:ExtraBold'] font-extrabold items-center px-[16px] py-[10px] text-[#64748b] text-[12px] w-full">
                <span className="w-[110px] shrink-0">NGÀY</span>
                <span className="flex-1 min-w-0">PHÒNG / HOẠT ĐỘNG</span>
                <span className="w-[120px] shrink-0">HLV HƯỚNG DẪN</span>
                <span className="w-[100px] shrink-0">THỜI LƯỢNG</span>
                <span className="w-[100px] shrink-0 text-right">GIỜ CHECK-IN</span>
              </div>
              {trainingHistory.map((r) => (
                <div key={r.date} className="bg-white border-[#e2e8f0] border-b flex items-center px-[16px] py-[12px] text-[13px] w-full last:border-b-0">
                  <span className="font-['Manrope:SemiBold'] font-semibold text-[#0f172a] w-[110px] shrink-0">{r.date}</span>
                  <span className="flex-1 font-['Manrope:SemiBold'] font-semibold min-w-0 text-[#0f172a]">{r.activity}</span>
                  <span className="font-['Manrope:Regular'] font-normal text-[#64748b] w-[120px] shrink-0">{r.trainer}</span>
                  <span className="font-['Manrope:Regular'] font-normal text-[#64748b] w-[100px] shrink-0">{r.duration}</span>
                  <span className="font-['Manrope:Bold'] font-bold text-[#15803d] text-right w-[100px] shrink-0">{r.checkin}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lịch sử giao dịch */}
          <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] items-start px-[24px] py-[20px] rounded-[12px] w-full">
            <div className="flex items-center justify-between shrink-0 w-full">
              <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[16px]">
                Lịch sử giao dịch thanh toán
              </span>
              <span className="font-['Manrope:Bold'] font-bold text-[#3b82f6] text-[13px] cursor-pointer">
                Xem tất cả hóa đơn
              </span>
            </div>
            <div className="border border-[#e2e8f0] flex flex-col items-start overflow-hidden rounded-[8px] w-full">
              <div className="bg-[#f1f5f9] flex font-['Manrope:ExtraBold'] font-extrabold items-center px-[16px] py-[10px] text-[#64748b] text-[12px] w-full">
                <span className="w-[110px] shrink-0">NGÀY GD</span>
                <span className="flex-1 min-w-0">NỘI DUNG THANH TOÁN</span>
                <span className="w-[120px] shrink-0">HÌNH THỨC</span>
                <span className="w-[120px] shrink-0">TRẠNG THÁI</span>
                <span className="w-[110px] shrink-0 text-right">SỐ TIỀN</span>
              </div>
              {paymentHistory.map((r, i) => (
                <div key={i} className="bg-white border-[#e2e8f0] border-b flex items-center px-[16px] py-[12px] w-full last:border-b-0 text-[13px]">
                  <span className="font-['Manrope:SemiBold'] font-semibold text-[#0f172a] w-[110px] shrink-0">{r.date}</span>
                  <span className="flex-1 font-['Manrope:SemiBold'] font-semibold min-w-0 text-[#0f172a] truncate">{r.content}</span>
                  <span className="font-['Manrope:Regular'] font-normal text-[#64748b] w-[120px] shrink-0">{r.method}</span>
                  <div className="w-[120px] shrink-0">
                    <span className="bg-[#dcfce7] font-['Manrope:Bold'] font-bold px-[6px] py-[2px] rounded-[4px] text-[#15803d] text-[11px]">Thành công</span>
                  </div>
                  <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-right w-[110px] shrink-0">{r.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
