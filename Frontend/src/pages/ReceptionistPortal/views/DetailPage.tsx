import React, { useState, useEffect } from "react"
import { Edit3, AlertTriangle, X } from "lucide-react"
import { toast } from "sonner"
import { MemberCardModal } from "../components/MemberCardModal"
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
  const [showCardModal, setShowCardModal] = useState(false)
  const [showLockModal, setShowLockModal] = useState(false)
  const [isLocking, setIsLocking] = useState(false)

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

  const handleToggleLock = async (newActiveState: boolean) => {
    if (!m?.id) return
    setIsLocking(true)
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken")
      const res = await fetch(`/api/users/${m.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newActiveState }),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || "Không thể cập nhật trạng thái thẻ.")
      }

      const newStatusStr = newActiveState ? "Đang hoạt động" : "Tạm khóa"
      setCurrentStatus(newStatusStr)

      // Update cached member in sessionStorage
      const updated = { ...m, status: newStatusStr }
      sessionStorage.setItem("receptionist_selected_member", JSON.stringify(updated))

      toast.success(
        newActiveState
          ? `Đã mở khóa thẻ thành viên cho ${m.fullName} thành công!`
          : `Đã tạm khóa thẻ thành viên của ${m.fullName}.`
      )
      setShowLockModal(false)
    } catch (err: any) {
      toast.error(err?.message || "Đã xảy ra lỗi khi đổi trạng thái thẻ.")
    } finally {
      setIsLocking(false)
    }
  }

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
                Mã thẻ: {m.memberCode}
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
            onClick={() => setShowCardModal(true)}
            className="bg-white border border-[#e2e8f0] px-[18px] py-[10px] rounded-[8px] font-bold text-[#0f172a] text-[14px] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            In thẻ thành viên
          </button>
          {isLocked ? (
            <button
              type="button"
              disabled={isLocking}
              onClick={() => handleToggleLock(true)}
              className="bg-[#dcfce7] text-[#15803d] border border-emerald-300 px-[18px] py-[10px] rounded-[8px] font-bold text-[14px] hover:bg-emerald-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLocking ? "Đang xử lý..." : "Mở khóa thẻ"}
            </button>
          ) : (
            <button
              type="button"
              disabled={isLocking}
              onClick={() => setShowLockModal(true)}
              className="bg-[#fee2e2] text-[#ef4444] px-[18px] py-[10px] rounded-[8px] font-bold text-[14px] hover:bg-red-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Tạm khóa thẻ
            </button>
          )}
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
        {/* Left column */}
        <div className="flex flex-col gap-[24px] items-start shrink-0 w-[450px]">
          {/* Thông tin cá nhân */}
          <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] items-start p-[24px] rounded-[12px] w-full">
            <div className="flex items-center justify-between w-full">
              <span className="font-extrabold text-[#0f172a] text-[16px]">
                Thông tin cá nhân
              </span>
              <Edit3 className="size-[16px] text-[#64748b] cursor-pointer" />
            </div>
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

          {/* Thông tin gói tập hiện tại */}
          <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] items-start p-[24px] rounded-[12px] w-full">
            <span className="font-extrabold text-[#0f172a] text-[16px]">
              Thông tin gói tập hiện tại
            </span>
            <div className="bg-[#e2e8f0] h-px w-full" />
            {packageInfo.map((row) => (
              <div key={row.label} className="flex gap-[12px] items-start w-full text-[13px]">
                <span className="font-normal text-[#64748b] w-[140px] shrink-0">
                  {row.label}
                </span>
                <span className={row.highlight ? "font-extrabold text-slate-800" : "font-bold font-semibold text-[#0f172a]"}>
                  {row.value}
                </span>
              </div>
            ))}
            <div className="flex gap-[12px] items-start w-full text-[13px]">
              <span className="font-normal text-[#64748b] w-[140px] shrink-0">
                Số ngày còn lại:
              </span>
              <span className="bg-emerald-50 font-bold px-[8px] py-[2px] rounded-[4px] text-emerald-700 text-[12px]">
                {daysRemaining > 0 ? `${daysRemaining} ngày` : "0 ngày (Hết hạn)"}
              </span>
            </div>
            <div className="flex gap-[12px] items-start w-full text-[13px]">
              <span className="font-normal text-[#64748b] w-[140px] shrink-0">
                Trạng thái thanh toán:
              </span>
              <span className={`${paymentStatusColor} font-bold px-[8px] py-[2px] rounded-[4px] text-[11px]`}>
                {paymentStatusDisplay}
              </span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-1 flex-col gap-[24px] items-start min-w-0">
          {/* Lịch sử tập luyện */}
          <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] items-start px-[24px] py-[20px] rounded-[12px] w-full">
            <div className="flex items-center justify-between shrink-0 w-full">
              <span className="font-extrabold text-[#0f172a] text-[16px]">
                Lịch sử tập luyện gần đây
              </span>
              <span className="font-bold text-emerald-600 text-[13px] cursor-pointer">
                Xem tất cả ({trainingHistory.length})
              </span>
            </div>
            <div className="border border-[#e2e8f0] flex flex-col items-start overflow-hidden rounded-[8px] w-full">
              <div className="bg-[#f1f5f9] flex font-extrabold items-center px-[16px] py-[10px] text-[#64748b] text-[12px] w-full">
                <span className="w-[110px] shrink-0">NGÀY</span>
                <span className="flex-1 min-w-0">PHÒNG / HOẠT ĐỘNG</span>
                <span className="w-[120px] shrink-0">HLV HƯỚNG DẪN</span>
                <span className="w-[100px] shrink-0">THỜI LƯỢNG</span>
                <span className="w-[100px] shrink-0 text-right">GIỜ CHECK-IN</span>
              </div>
              {loadingHistory ? (
                <div className="bg-white p-[24px] text-center text-[#64748b] text-[13px] w-full">
                  Đang tải lịch sử tập luyện...
                </div>
              ) : trainingHistory.length === 0 ? (
                <div className="bg-white p-[24px] text-center text-[#64748b] text-[13px] w-full">
                  Chưa có lịch sử tập luyện nào được ghi nhận.
                </div>
              ) : (
                trainingHistory.slice(0, 10).map((r, i) => (
                  <div key={i} className="bg-white border-[#e2e8f0] border-b flex items-center px-[16px] py-[12px] text-[13px] w-full last:border-b-0">
                    <span className="font-semibold text-[#0f172a] w-[110px] shrink-0">{r.date}</span>
                    <span className="flex-1 font-semibold min-w-0 text-[#0f172a] truncate">{r.activity}</span>
                    <span className="font-normal text-[#64748b] w-[120px] shrink-0 truncate">{r.trainer}</span>
                    <span className="font-normal text-[#64748b] w-[100px] shrink-0">{r.duration}</span>
                    <span className="font-bold text-emerald-700 text-right w-[100px] shrink-0">{r.checkin}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Lịch sử giao dịch */}
          <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] items-start px-[24px] py-[20px] rounded-[12px] w-full">
            <div className="flex items-center justify-between shrink-0 w-full">
              <span className="font-extrabold text-[#0f172a] text-[16px]">
                Lịch sử giao dịch thanh toán
              </span>
              <span className="font-bold text-emerald-600 text-[13px] cursor-pointer">
                Xem tất cả hóa đơn ({paymentHistory.length})
              </span>
            </div>
            <div className="border border-[#e2e8f0] flex flex-col items-start overflow-hidden rounded-[8px] w-full">
              <div className="bg-[#f1f5f9] flex font-extrabold items-center px-[16px] py-[10px] text-[#64748b] text-[12px] w-full">
                <span className="w-[110px] shrink-0">NGÀY GD</span>
                <span className="flex-1 min-w-0">NỘI DUNG THANH TOÁN</span>
                <span className="w-[120px] shrink-0">HÌNH THỨC</span>
                <span className="w-[120px] shrink-0">TRẠNG THÁI</span>
                <span className="w-[110px] shrink-0 text-right">SỐ TIỀN</span>
              </div>
              {loadingHistory ? (
                <div className="bg-white p-[24px] text-center text-[#64748b] text-[13px] w-full">
                  Đang tải lịch sử giao dịch...
                </div>
              ) : paymentHistory.length === 0 ? (
                <div className="bg-white p-[24px] text-center text-[#64748b] text-[13px] w-full">
                  Chưa có lịch sử giao dịch thanh toán nào.
                </div>
              ) : (
                paymentHistory.slice(0, 10).map((r, i) => (
                  <div key={i} className="bg-white border-[#e2e8f0] border-b flex items-center px-[16px] py-[12px] w-full last:border-b-0 text-[13px]">
                    <span className="font-semibold text-[#0f172a] w-[110px] shrink-0">{r.date}</span>
                    <span className="flex-1 font-semibold min-w-0 text-[#0f172a] truncate">{r.content}</span>
                    <span className="font-normal text-[#64748b] w-[120px] shrink-0 truncate">{r.method}</span>
                    <div className="w-[120px] shrink-0">
                      <span className="bg-emerald-50 font-bold px-[6px] py-[2px] rounded-[4px] text-emerald-700 text-[11px] truncate">
                        {r.status}
                      </span>
                    </div>
                    <span className="font-bold text-[#0f172a] text-right w-[110px] shrink-0">{r.amount}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Member Card Modal */}
      <MemberCardModal
        member={{ ...m, status: currentStatus }}
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
      />

      {/* Lock Confirmation Modal */}
      {showLockModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowLockModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="size-5 shrink-0" />
                <span className="font-extrabold text-[15px] font-['Manrope:ExtraBold']">
                  Xác nhận tạm khóa thẻ
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowLockModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-['Manrope:Regular']">
              Bạn có chắc chắn muốn tạm khóa thẻ thành viên của{" "}
              <strong className="text-slate-900 dark:text-white font-bold">{m.fullName}</strong> (Mã thẻ:{" "}
              <strong className="text-blue-600 font-bold">{m.memberCode}</strong>)?
              <br />
              <br />
              Hội viên sẽ không thể check-in vào phòng tập hoặc sử dụng dịch vụ cho đến khi thẻ được mở khóa lại.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={isLocking}
                onClick={() => setShowLockModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isLocking}
                onClick={() => handleToggleLock(false)}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition cursor-pointer disabled:opacity-50"
              >
                {isLocking ? "Đang xử lý..." : "Xác nhận khóa thẻ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
