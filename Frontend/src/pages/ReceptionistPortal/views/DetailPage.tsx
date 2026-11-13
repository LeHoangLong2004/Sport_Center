import React, { useState, useEffect } from "react"
import { Calendar, CreditCard, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { MemberAvatar } from "./LookupPage"

export function DetailPage({
  member,
  onBack,
}: {
  member?: any
  onBack: () => void
}) {
  const [cachedMember] = useState(() => {
    if (member) {
      sessionStorage.setItem("receptionist_selected_member", JSON.stringify(member))
      return member
    }
    const saved = sessionStorage.getItem("receptionist_selected_member")
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {}
    }
    return null
  })

  const m = member || cachedMember

  const [currentStatus, setCurrentStatus] = useState<string>(m?.status || "Đang hoạt động")
  const [activeTab, setActiveTab] = useState<"training" | "payment">("training")

  const [trainingHistory, setTrainingHistory] = useState<any[]>([])
  const [paymentHistory, setPaymentHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    if (m?.status) {
      setCurrentStatus(m.status)
    }
  }, [m?.status])

  useEffect(() => {
    if (!m?.id) {
      setLoadingHistory(false)
      return
    }

    let isMounted = true

    const fetchHistory = async () => {
      setLoadingHistory(true)
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("accessToken")
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }

        const [attRes, checkInRes, payRes] = await Promise.all([
          fetch(`/api/member/attendance?memberId=${m.id}`, { headers }).catch(() => null),
          fetch(`/api/checkin/history?memberId=${m.id}`, { headers }).catch(() => null),
          fetch(`/api/payments/member/${m.id}`, { headers }).catch(() => null),
        ])

        // 1. Process Training & Check-in history
        const trainings: any[] = []

        if (attRes && attRes.ok) {
          const attData = await attRes.json()
          if (Array.isArray(attData.sessions)) {
            attData.sessions.forEach((s: any) => {
              const d = s.scheduleTime ? new Date(s.scheduleTime) : null
              trainings.push({
                rawDate: s.scheduleTime || s.date,
                date: d ? d.toLocaleDateString("vi-VN") : s.date || "N/A",
                activity: s.className || s.sport || "Lớp tập luyện",
                trainer: s.coachName || s.trainer || "HLV Trung tâm",
                duration: s.durationMinutes ? `${s.durationMinutes} phút` : "60 phút",
                checkin: d ? d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : s.time || "--:--",
              })
            })
          }
        }

        if (checkInRes && checkInRes.ok) {
          const checkInData = await checkInRes.json()
          if (Array.isArray(checkInData)) {
            checkInData.forEach((c: any) => {
              const d = c.checkInTime ? new Date(c.checkInTime) : null
              trainings.push({
                rawDate: c.checkInTime,
                date: d ? d.toLocaleDateString("vi-VN") : "N/A",
                activity: "Tập luyện tự do (Check-in cổng)",
                trainer: "Tự do",
                duration: c.durationMinutes ? `${c.durationMinutes} phút` : (c.duration ? `${c.duration} phút` : "Tự do"),
                checkin: d ? d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "--:--",
              })
            })
          }
        }

        trainings.sort((a, b) => new Date(b.rawDate || 0).getTime() - new Date(a.rawDate || 0).getTime())

        // 2. Process Payments / Invoices history
        const payments: any[] = []
        if (payRes && payRes.ok) {
          const payData = await payRes.json()
          if (Array.isArray(payData) && payData.length > 0) {
            payData.forEach((inv: any) => {
              const raw = inv.paidAt || inv.createdAt
              const d = raw ? new Date(raw) : null
              payments.push({
                rawDate: raw,
                date: d ? d.toLocaleDateString("vi-VN") : "N/A",
                content: inv.invoiceNumber ? `Hóa đơn ${inv.invoiceNumber}` : `Thanh toán ${m.packageName || "gói tập"}`,
                method: inv.paymentMethodName || "Chuyển khoản QR",
                status: inv.statusName || (inv.status === "completed" ? "Thành công" : inv.status || "Thành công"),
                amount: inv.totalAmount ? Number(inv.totalAmount).toLocaleString("vi-VN") + " đ" : "0 đ",
              })
            })
          }
        }

        // If no separate invoice rows in database yet, but member has subscription info
        if (payments.length === 0 && m.startDate && m.packageName && m.packageName !== "Chưa đăng ký") {
          payments.push({
            rawDate: m.startDate,
            date: new Date(m.startDate).toLocaleDateString("vi-VN"),
            content: `Thanh toán ${m.packageName}`,
            method: "Chuyển khoản QR",
            status: m.status === "Đang hoạt động" ? "Thành công" : m.status || "Thành công",
            amount: m.totalAmount ? Number(m.totalAmount).toLocaleString("vi-VN") + " đ" : "0 đ",
          })
        }

        payments.sort((a, b) => new Date(b.rawDate || 0).getTime() - new Date(a.rawDate || 0).getTime())

        if (isMounted) {
          setTrainingHistory(trainings)
          setPaymentHistory(payments)
        }
      } catch (err) {
        console.error("Error loading member detail histories:", err)
      } finally {
        if (isMounted) {
          setLoadingHistory(false)
        }
      }
    }

    fetchHistory()

    return () => {
      isMounted = false
    }
  }, [m?.id])

  if (!m) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-[400px] p-[32px] gap-4 w-full">
        <p className="font-['Manrope:SemiBold'] font-semibold text-[#64748b] text-[16px]">
          Chưa có thông tin thành viên nào được chọn.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="border border-[#e2e8f0] px-[20px] py-[10px] rounded-[8px] font-['Manrope:Bold'] font-bold text-[#0f172a] text-[14px] hover:bg-slate-50 transition-colors shadow-sm"
        >
          ← Quay lại danh sách tra cứu
        </button>
      </div>
    )
  }

  const daysRemaining = m.expiryDate
    ? Math.max(0, Math.ceil((new Date(m.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  const totalDays = m.startDate && m.expiryDate
    ? Math.max(1, Math.ceil((new Date(m.expiryDate).getTime() - new Date(m.startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 30
  const progressPercent = Math.min(100, Math.max(0, Math.round((daysRemaining / totalDays) * 100)))

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

  const isLocked = currentStatus === "Tạm khóa"
  const isExpired = currentStatus === "Hết hạn"

  const paymentStatusDisplay =
    isLocked
      ? "Thẻ đang tạm khóa"
      : isExpired
      ? "Gói đã hết hạn"
      : currentStatus === "Đang hoạt động"
      ? "Đã thanh toán 100%"
      : "Chưa kích hoạt"

  const paymentStatusColor =
    isLocked
      ? "bg-[#fee2e2] text-[#ef4444]"
      : isExpired
      ? "bg-[#ffedd5] text-[#c2410c]"
      : currentStatus === "Đang hoạt động"
      ? "bg-[#dcfce7] text-[#15803d]"
      : "bg-slate-100 text-slate-600"

  return (
    <div className="flex flex-1 flex-col gap-[24px] items-start min-h-0 overflow-y-auto p-[32px] w-full">
      {/* Header card */}
      <div className="bg-white border border-[#e2e8f0] flex items-center justify-between p-[24px] rounded-[12px] shrink-0 w-full">
        <div className="flex gap-[20px] items-center shrink-0">
          <MemberAvatar
            url={m.avatarUrl}
            name={m.fullName}
            size={72}
            className="text-[22px] border border-[#e2e8f0]"
          />
          <div className="flex flex-col gap-[6px] items-start shrink-0">
            <div className="flex gap-[12px] items-center shrink-0">
              <span className="font-extrabold text-[#0f172a] text-[22px]">
                {m.fullName}
              </span>
              <span
                className={`font-bold px-[8px] py-[4px] rounded-[6px] text-[11px] ${
                  isLocked
                    ? "bg-[#fee2e2] text-[#ef4444]"
                    : isExpired
                    ? "bg-[#ffedd5] text-[#c2410c]"
                    : "bg-[#dcfce7] text-[#15803d]"
                }`}
              >
                {currentStatus}
              </span>
            </div>
            <div className="flex gap-[16px] items-center shrink-0 text-[14px]">
              <span className="font-bold text-slate-800">
                Mã hội viên: {m.memberCode}
              </span>
              <span className="text-[#64748b]">•</span>
              <span className="font-bold font-semibold text-[#64748b]">
                {m.packageName}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-[12px] items-start shrink-0">
          <button
            type="button"
            className="bg-emerald-600 text-white px-[18px] py-[10px] rounded-[8px] font-bold text-[14px] hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
          >
            Gia hạn gói tập
          </button>
          <button
            type="button"
            onClick={onBack}
            className="border border-[#e2e8f0] px-[18px] py-[10px] rounded-[8px] font-bold text-[#64748b] text-[14px] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            ← Quay lại
          </button>
        </div>
      </div>

      {/* Content Split */}
      <div className="flex flex-1 gap-[24px] items-start min-h-0 w-full">
        {/* Left column - Hồ sơ & Gói tập */}
        <div className="flex flex-col gap-[20px] items-start shrink-0 w-[420px]">
          {/* Thông tin cá nhân */}
          <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] items-start p-[24px] rounded-[12px] w-full shadow-sm">
            <span className="font-extrabold text-[#0f172a] text-[16px]">
              Thông tin cá nhân
            </span>
            <div className="bg-[#e2e8f0] h-px w-full" />
            {personalInfo.map((row) => (
              <div key={row.label} className="flex gap-[12px] items-start w-full text-[13px]">
                <span className="font-normal text-[#64748b] w-[130px] shrink-0">
                  {row.label}
                </span>
                <span className="font-bold font-semibold text-[#0f172a] flex-1 min-w-0">
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Thông tin gói tập hiện tại với Progress Bar */}
          <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] items-start p-[24px] rounded-[12px] w-full shadow-sm">
            <div className="flex items-center justify-between w-full">
              <span className="font-extrabold text-[#0f172a] text-[16px]">
                Gói tập hiện tại
              </span>
              <span className={`${paymentStatusColor} font-bold px-[8px] py-[3px] rounded-[6px] text-[11px]`}>
                {paymentStatusDisplay}
              </span>
            </div>

            <div className="bg-[#e2e8f0] h-px w-full" />

            <div className="bg-slate-50 border border-slate-100 rounded-[10px] p-[16px] w-full flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Tên gói đăng ký</div>
                  <div className="text-[16px] font-black text-slate-900 mt-0.5">{m.packageName || "Chưa đăng ký"}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Tổng cước phí</div>
                  <div className="text-[15px] font-extrabold text-emerald-700 mt-0.5">
                    {m.totalAmount ? Number(m.totalAmount).toLocaleString("vi-VN") + " đ" : "0 đ"}
                  </div>
                </div>
              </div>

              {/* Progress Bar thời hạn */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-500 font-medium">Thời hạn sử dụng:</span>
                  <span className={`font-bold ${
                    daysRemaining <= 0 ? "text-red-600" : daysRemaining <= 7 ? "text-amber-600" : "text-emerald-700"
                  }`}>
                    {daysRemaining > 0 ? `Còn ${daysRemaining} ngày` : "Đã hết hạn"}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      daysRemaining <= 0
                        ? "bg-red-500"
                        : daysRemaining <= 7
                        ? "bg-amber-500"
                        : "bg-emerald-600"
                    }`}
                    style={{ width: `${daysRemaining <= 0 ? 100 : progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Chi tiết thời gian */}
            <div className="flex flex-col gap-3 w-full text-[13px] pt-1">
              <div className="flex justify-between items-center w-full">
                <span className="text-[#64748b]">Ngày kích hoạt:</span>
                <span className="font-semibold text-[#0f172a]">
                  {m.startDate ? new Date(m.startDate).toLocaleDateString("vi-VN") : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center w-full">
                <span className="text-[#64748b]">Ngày hết hạn:</span>
                <span className="font-semibold text-[#0f172a]">
                  {m.expiryDate ? new Date(m.expiryDate).toLocaleDateString("vi-VN") : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Tabs & Bảng chi tiết */}
        <div className="flex flex-1 flex-col gap-[16px] items-start min-w-0">
          {/* Tabs header card */}
          <div className="bg-white border border-[#e2e8f0] flex items-center justify-between p-[8px] rounded-[12px] w-full shadow-sm">
            <div className="flex gap-[6px] items-center">
              <button
                type="button"
                onClick={() => setActiveTab("training")}
                className={`flex items-center gap-2 px-[18px] py-[10px] rounded-[8px] font-bold text-[13px] transition-all cursor-pointer ${
                  activeTab === "training"
                    ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                }`}
              >
                <Calendar className="size-4" />
                <span>Lịch sử tập luyện & lớp học</span>
                <span
                  className={`text-[11px] px-[7px] py-[1px] rounded-full font-extrabold ${
                    activeTab === "training"
                      ? "bg-emerald-200/80 text-emerald-800"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {trainingHistory.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("payment")}
                className={`flex items-center gap-2 px-[18px] py-[10px] rounded-[8px] font-bold text-[13px] transition-all cursor-pointer ${
                  activeTab === "payment"
                    ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                }`}
              >
                <CreditCard className="size-4" />
                <span>Lịch sử giao dịch & hóa đơn</span>
                <span
                  className={`text-[11px] px-[7px] py-[1px] rounded-full font-extrabold ${
                    activeTab === "payment"
                      ? "bg-emerald-200/80 text-emerald-800"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {paymentHistory.length}
                </span>
              </button>
            </div>
          </div>

          {/* Tab content area */}
          <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] items-start p-[24px] rounded-[12px] w-full min-h-[420px] shadow-sm">
            {activeTab === "training" ? (
              <>
                <div className="flex items-center justify-between shrink-0 w-full">
                  <div>
                    <h3 className="font-extrabold text-[#0f172a] text-[16px]">
                      Lịch sử buổi tập & lớp học đã tham gia
                    </h3>
                    <p className="text-[12px] text-slate-500 mt-0.5">
                      Ghi nhận các buổi tập luyện lớp học và lịch tập có HLV
                    </p>
                  </div>
                  <span className="font-bold text-slate-500 text-[12px]">
                    Tổng số: <strong className="text-emerald-700 font-extrabold">{trainingHistory.length}</strong> buổi
                  </span>
                </div>

                <div className="border border-[#e2e8f0] flex flex-col items-start overflow-hidden rounded-[8px] w-full">
                  <div className="bg-[#f8fafc] flex font-extrabold items-center px-[16px] py-[11px] text-[#64748b] text-[12px] w-full border-b border-[#e2e8f0]">
                    <span className="w-[120px] shrink-0">NGÀY TẬP</span>
                    <span className="flex-1 min-w-0">LỚP HỌC / HOẠT ĐỘNG</span>
                    <span className="w-[160px] shrink-0">HLV PHỤ TRÁCH</span>
                    <span className="w-[110px] shrink-0">THỜI LƯỢNG</span>
                    <span className="w-[130px] shrink-0 text-right">TRẠNG THÁI</span>
                  </div>
                  {loadingHistory ? (
                    <div className="bg-white p-[36px] text-center text-[#64748b] text-[13px] w-full">
                      Đang tải lịch sử tập luyện...
                    </div>
                  ) : trainingHistory.length === 0 ? (
                    <div className="bg-white p-[36px] text-center text-[#64748b] text-[13px] w-full flex flex-col items-center gap-2">
                      <Calendar className="size-8 text-slate-300" />
                      <span>Chưa có lịch sử tập luyện nào được ghi nhận.</span>
                    </div>
                  ) : (
                    trainingHistory.map((r, i) => (
                      <div
                        key={i}
                        className="bg-white border-[#e2e8f0] border-b flex items-center px-[16px] py-[13px] text-[13px] w-full last:border-b-0 hover:bg-slate-50/80 transition-colors"
                      >
                        <span className="font-semibold text-[#0f172a] w-[120px] shrink-0">{r.date}</span>
                        <span className="flex-1 font-semibold min-w-0 text-[#0f172a] truncate">{r.activity}</span>
                        <span className="font-normal text-[#64748b] w-[160px] shrink-0 truncate">{r.trainer}</span>
                        <span className="font-normal text-[#64748b] w-[110px] shrink-0">{r.duration}</span>
                        <div className="w-[130px] shrink-0 text-right">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold px-[8px] py-[3px] rounded-[6px] text-[11px] inline-flex items-center gap-1">
                            <CheckCircle2 className="size-3" />
                            Đã tham gia
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between shrink-0 w-full">
                  <div>
                    <h3 className="font-extrabold text-[#0f172a] text-[16px]">
                      Lịch sử giao dịch & hóa đơn thanh toán
                    </h3>
                    <p className="text-[12px] text-slate-500 mt-0.5">
                      Danh sách các hóa đơn, gia hạn và nạp tiền dịch vụ của hội viên
                    </p>
                  </div>
                  <span className="font-bold text-slate-500 text-[12px]">
                    Tổng số: <strong className="text-emerald-700 font-extrabold">{paymentHistory.length}</strong> giao dịch
                  </span>
                </div>

                <div className="border border-[#e2e8f0] flex flex-col items-start overflow-hidden rounded-[8px] w-full">
                  <div className="bg-[#f8fafc] flex font-extrabold items-center px-[16px] py-[11px] text-[#64748b] text-[12px] w-full border-b border-[#e2e8f0]">
                    <span className="w-[120px] shrink-0">NGÀY GD</span>
                    <span className="flex-1 min-w-0">NỘI DUNG THANH TOÁN</span>
                    <span className="w-[140px] shrink-0">HÌNH THỨC</span>
                    <span className="w-[130px] shrink-0">TRẠNG THÁI</span>
                    <span className="w-[120px] shrink-0 text-right">SỐ TIỀN</span>
                  </div>
                  {loadingHistory ? (
                    <div className="bg-white p-[36px] text-center text-[#64748b] text-[13px] w-full">
                      Đang tải lịch sử giao dịch...
                    </div>
                  ) : paymentHistory.length === 0 ? (
                    <div className="bg-white p-[36px] text-center text-[#64748b] text-[13px] w-full flex flex-col items-center gap-2">
                      <CreditCard className="size-8 text-slate-300" />
                      <span>Chưa có lịch sử giao dịch thanh toán nào.</span>
                    </div>
                  ) : (
                    paymentHistory.map((r, i) => (
                      <div
                        key={i}
                        className="bg-white border-[#e2e8f0] border-b flex items-center px-[16px] py-[13px] w-full last:border-b-0 text-[13px] hover:bg-slate-50/80 transition-colors"
                      >
                        <span className="font-semibold text-[#0f172a] w-[120px] shrink-0">{r.date}</span>
                        <span className="flex-1 font-semibold min-w-0 text-[#0f172a] truncate">{r.content}</span>
                        <span className="font-normal text-[#64748b] w-[140px] shrink-0 truncate">{r.method}</span>
                        <div className="w-[130px] shrink-0">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold px-[8px] py-[3px] rounded-[6px] text-[11px] inline-flex items-center gap-1">
                            <CheckCircle2 className="size-3" />
                            {r.status}
                          </span>
                        </div>
                        <span className="font-black text-slate-900 text-right w-[120px] shrink-0">{r.amount}</span>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
