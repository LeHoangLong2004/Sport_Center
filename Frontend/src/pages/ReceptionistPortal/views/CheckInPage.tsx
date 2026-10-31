import React, { useState } from 'react';
import { A } from '../shared';
import StatusBadge from '../components/StatusBadge';
import { WalletService } from '../../MemberPortal/services/walletService';

export function CheckInPage() {
  const [scanValue, setScanValue] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [historyRows, setHistoryRows] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [processing, setProcessing] = useState(false)
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/checkin/history", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistoryRows(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/users/members-lookup", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMembers(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMembers();
    fetchHistory();
  }, []);

  const isTopUpTicket = scanValue.trim().toUpperCase().startsWith("TOPUP-");
  const foundMember = members.find(m => m.memberCode === scanValue || m.phoneNumber === scanValue);
  const openCheckIn = foundMember
    ? historyRows.find(row => row.memberId === foundMember.id && !row.checkOutTime)
    : null;

  const handleConfirmTopUp = async () => {
    setProcessing(true);
    try {
      const ticketId = scanValue.trim().toUpperCase();
      const res = await WalletService.confirmPendingTopUp(ticketId);
      if (res.success) {
        setNotice({
          type: "success",
          text: `Thu ngân đã xác nhận thu tiền thành công cho phiếu ${ticketId}! Số dư đã được cộng vào ví hội viên.`
        });
        setScanValue("");
      } else {
        setNotice({ type: "error", text: "Không tìm thấy phiếu nạp hoặc phiếu đã được xử lý trước đó." });
      }
    } catch {
      setNotice({ type: "error", text: "Lỗi kết nối khi xác nhận phiếu nạp." });
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckIn = async () => {
    if (!foundMember) return;
    setProcessing(true)
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ memberId: foundMember.id })
      });
      if (res.ok) {
        setConfirmed(true);
        setNotice({ type: "success", text: "Check-in thành công. Chào mừng bạn đến SmartGym." });
        fetchHistory();
      } else {
        const err = await res.json();
        setNotice({ type: "error", text: err.message || err.reason || "Check-in thất bại" });
      }
    } catch (e) {
      console.error(e);
      setNotice({ type: "error", text: "Không thể kết nối đến máy chủ." });
    } finally {
      setProcessing(false)
    }
  }

  const handleCheckOut = async () => {
    if (!foundMember || !openCheckIn) return;
    setProcessing(true)
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/checkin/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ memberId: foundMember.id })
      });
      if (res.ok) {
        setConfirmed(false);
        setNotice({ type: "success", text: "Check-out thành công. Hẹn gặp lại bạn!" });
        await fetchHistory();
      } else {
        const err = await res.json();
        setNotice({ type: "error", text: err.message || "Check-out thất bại" });
      }
    } catch (e) {
      console.error(e);
      setNotice({ type: "error", text: "Không thể kết nối đến máy chủ." });
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="flex flex-col gap-[24px] items-start p-[32px] w-full">
      {notice ? (
        <div className={`flex items-center justify-between gap-4 px-4 py-3 rounded-lg border w-full ${notice.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          <span className="font-['Manrope:Bold'] font-bold text-[14px]">{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} className="font-bold text-[18px] leading-none" aria-label="Đóng thông báo">×</button>
        </div>
      ) : null}
      {/* Stats */}
      <div className="flex gap-[16px] items-start shrink-0 w-full">
        {[
          { label: "Tổng check-in hôm nay", value: historyRows.length.toString(), sub: "lượt vào cổng ca trực" },
          { label: "Đang tập tại trung tâm", value: historyRows.filter(row => !row.checkOutTime).length.toString(), sub: "hội viên trong phòng tập", highlight: true },
          { label: "Lớp học sắp bắt đầu", value: "3 lớp", sub: "trong 60 phút tới" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-1 flex-col justify-between min-w-0 p-[20px] rounded-[16px] shadow-xs hover:border-purple-400 dark:hover:border-purple-600 transition-all group"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-500 dark:text-slate-400 text-[12px] uppercase tracking-wider">{stat.label}</span>
              <span className={`size-2 rounded-full ${stat.highlight ? "bg-purple-600 animate-pulse" : "bg-purple-400"}`} />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-extrabold text-slate-900 dark:text-white text-[26px] tracking-tight">{stat.value}</span>
              <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Scan + Result */}
      <div className="flex gap-[20px] items-start shrink-0 w-full">
        {/* Scanner */}
        <div className="bg-white border border-[#e2e8f0] flex flex-1 flex-col gap-[16px] items-start min-w-0 p-[24px] rounded-[12px]">
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[16px]">Nhập mã hoặc quét thẻ hội viên / phiếu nạp ví</span>
          <div className="bg-[#f1f5f9] flex gap-[12px] items-center p-[16px] rounded-[8px] shrink-0 w-full">
            <img src={`${A}/f6f1f.svg`} alt="" className="size-[20px] shrink-0 opacity-60" />
            <input
              className="flex-1 bg-transparent font-['Manrope:Regular'] text-[#0f172a] text-[15px] outline-none min-w-0"
              value={scanValue}
              onChange={(e) => { setScanValue(e.target.value); setConfirmed(false) }}
              placeholder="Nhập mã thẻ, SĐT hoặc mã phiếu nạp (TOPUP-...)"
            />
            <span className={`font-['Manrope:Bold'] font-bold px-[10px] py-[4px] rounded-[6px] text-[11px] text-white whitespace-nowrap shrink-0 shadow-xs ${isTopUpTicket ? "bg-amber-500" : "bg-purple-600"}`}>
              {isTopUpTicket ? "PHIẾU NẠP VÍ" : foundMember ? "ĐÃ NHẬN DIỆN" : "ĐANG CHỜ QUÉT"}
            </span>
          </div>
          <span className="font-['Manrope:Regular'] font-normal text-[#64748b] text-[13px]">
            Gợi ý: Quét mã QR phiếu nạp tiền hoặc mã thẻ hội viên để thực hiện nghiệp vụ tức thì.
          </span>
        </div>

        {/* Member / Ticket result */}
        <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[20px] items-start p-[24px] rounded-[12px] shrink-0 w-[480px]">
          {isTopUpTicket ? (
            <>
              <div className="flex items-center justify-between shrink-0 w-full">
                <span className="font-['Manrope:Bold'] font-bold text-[#94a3b8] text-[13px]">PHIẾU NẠP TIỀN TẠI QUẦY</span>
                <span className="bg-amber-100 font-['Manrope:Bold'] font-bold px-[10px] py-[4px] rounded-[99px] text-amber-800 text-[12px]">CHỜ THU TIỀN</span>
              </div>
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl w-full space-y-2">
                <span className="text-xs text-amber-700 font-bold block">MÃ PHIẾU NẠP HỘI VIÊN:</span>
                <span className="text-xl font-mono font-black text-amber-900 block">{scanValue.trim().toUpperCase()}</span>
                <p className="text-xs text-amber-800">
                  Hội viên xuất trình phiếu này để nộp tiền mặt/quẹt thẻ nạp tiền vào ví SportCenter.
                </p>
              </div>
              <button
                type="button"
                onClick={handleConfirmTopUp}
                disabled={processing}
                className="flex gap-[8px] items-center justify-center p-[14px] rounded-[8px] shrink-0 w-full bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition-colors cursor-pointer"
              >
                <span>{processing ? "Đang xử lý..." : "XÁC NHẬN ĐÃ THU TIỀN & NẠP VÀO VÍ"}</span>
              </button>
            </>
          ) : foundMember ? (
            <>
              <div className="flex gap-[16px] items-center shrink-0 w-full">
                <img src={foundMember.avatarUrl || `${A}/87fb4.png`} alt="" className="shrink-0 size-[64px] rounded-full object-cover" />
                <div className="flex flex-col gap-[4px] items-start shrink-0">
                  <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[18px]">{foundMember.fullName}</span>
                  <div className="flex gap-[8px] items-center shrink-0">
                    <span className="font-['Manrope:SemiBold'] font-semibold text-[#64748b] text-[13px]">Mã: {foundMember.memberCode}</span>
                    <span className="bg-[#eef2ff] border border-[#c7d2fe] font-['Manrope:Bold'] font-bold px-[6px] py-px rounded-[4px] text-[#4f46e5] text-[9px] uppercase">{foundMember.packageName || "KHÔNG GÓI"}</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#f1f5f9] h-px shrink-0 w-full" />
              <div className="flex items-start justify-between shrink-0 text-[13px] w-full">
                <span className="font-['Manrope:Regular'] font-normal text-[#64748b]">Ngày hết hạn gói:</span>
                <span className="font-['Manrope:Bold'] font-bold text-[#0f172a]">{foundMember.expiryDate ? new Date(foundMember.expiryDate).toLocaleDateString('vi-VN') : "N/A"}</span>
              </div>
              <button
                type="button"
                 onClick={openCheckIn ? handleCheckOut : handleCheckIn}
                 disabled={processing}
                className={`flex gap-[8px] items-center justify-center p-[14px] rounded-[8px] shrink-0 w-full transition-colors ${confirmed ? "bg-[#16a34a]" : "bg-[#22c55e]"}`}
              >
                <img src={`${A}/b6b07.svg`} alt="" className="size-[18px]" />
                <span className="font-['Manrope:Bold'] font-bold text-[15px] text-white">
                  {openCheckIn ? "XÁC NHẬN CHECK-OUT" : confirmed ? "✓ ĐÃ CHECK-IN THÀNH CÔNG" : "XÁC NHẬN CHECK-IN"}
                </span>
              </button>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center py-6">
               <span className="font-['Manrope:Regular'] font-normal text-[#64748b] text-[13px]">Chưa tìm thấy hội viên</span>
            </div>
          )}
        </div>
      </div>

      {/* History table */}
      <div className="bg-white border border-[#e2e8f0] flex flex-col items-start overflow-hidden rounded-[12px] shrink-0 w-full">
        <div className="bg-white flex items-start p-[20px] shrink-0 w-full">
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[16px]">Lịch sử check-in hôm nay</span>
        </div>
        <div className="bg-[#f1f5f9] flex font-['Manrope:Bold'] font-bold h-[44px] items-center px-[24px] shrink-0 text-[#64748b] text-[12px] w-full">
          <span className="w-[120px] shrink-0">THỜI GIAN</span>
          <span className="flex-1 min-w-0">HỘI VIÊN</span>
          <span className="w-[150px] shrink-0">MÃ SỐ</span>
          <span className="w-[180px] shrink-0">GÓI ĐĂNG KÝ</span>
          <span className="w-[150px] shrink-0">TRẠNG THÁI</span>
          <span className="w-[100px] shrink-0 text-right">ĐIỂM DANH</span>
        </div>
        {historyRows.map((row) => (
          <div key={row.id} className="border border-[#f1f5f9] border-solid flex h-[54px] items-center px-[24px] shrink-0 w-full">
            <span className="font-['Manrope:Regular'] font-normal text-[#0f172a] text-[13px] w-[120px] shrink-0">
              {new Date(row.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
            <div className="flex flex-1 gap-[10px] items-center min-w-0">
              <img src={`${A}/12161.png`} alt="" className="shrink-0 size-[28px] rounded-full object-cover" />
              <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-[13px] whitespace-nowrap">{row.memberName}</span>
            </div>
            <span className="font-['Manrope:Regular'] font-normal text-[#64748b] text-[13px] w-[150px] shrink-0">{"..."}</span>
            <span className="font-['Manrope:Regular'] font-normal text-[#0f172a] text-[13px] w-[180px] shrink-0">{"..."}</span>
            <div className="flex items-start w-[150px] shrink-0">
              <StatusBadge text={row.result === "APPROVED" || row.result === "CHECKED_OUT" ? "Hợp lệ" : "Từ chối"} color={row.result === "APPROVED" || row.result === "CHECKED_OUT" ? "green" : "red"} />
            </div>
             <span className="font-['Manrope:Regular'] font-normal text-right w-[100px] shrink-0 text-[13px]" style={{ color: row.checkOutTime ? "#64748b" : "#22c55e" }}>
               {row.checkOutTime ? `${row.durationMinutes ?? 0} phút` : "Đang tập"}
             </span>
          </div>
        ))}
      </div>
    </div>
  )
}
