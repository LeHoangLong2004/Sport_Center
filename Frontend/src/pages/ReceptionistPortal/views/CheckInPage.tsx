import React, { useState } from 'react';
import { A } from '../shared';
import StatusBadge from '../components/StatusBadge';

export function CheckInPage() {
  const [scanValue, setScanValue] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [historyRows, setHistoryRows] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])

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

  const foundMember = members.find(m => m.memberCode === scanValue || m.phoneNumber === scanValue)

  const handleCheckIn = async () => {
    if (!foundMember) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ memberId: foundMember.userId })
      });
      if (res.ok) {
        setConfirmed(true);
        fetchHistory();
      } else {
        const err = await res.json();
        alert(err.reason || "Check-in thất bại");
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi kết nối.");
    }
  }

  return (
    <div className="flex flex-col gap-[24px] items-start p-[32px] w-full">
      {/* Stats */}
      <div className="flex gap-[16px] items-start shrink-0 w-full">
        {[
          { icon: `${A}/9e21f.svg`, bg: "bg-[#3b82f6]", label: "Tổng check-in hôm nay", value: historyRows.length.toString() },
          { icon: `${A}/fe113.svg`, bg: "bg-[#22c55e]", label: "Đang tập tại trung tâm", value: "34" },
          { icon: `${A}/53e60.svg`, bg: "bg-[#ea580c]", label: "Lớp học sắp bắt đầu", value: "3 lớp" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-[#e2e8f0] flex flex-1 gap-[16px] items-start min-w-0 p-[20px] rounded-[12px]">
            <div className={`${stat.bg} flex items-center justify-center rounded-[8px] shrink-0 size-[44px]`}>
              <img src={stat.icon} alt="" className="size-[20px]" />
            </div>
            <div className="flex flex-col gap-[4px] items-start shrink-0">
              <span className="font-['Manrope:SemiBold'] font-semibold text-[#64748b] text-[13px]">{stat.label}</span>
              <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[24px]">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Scan + Result */}
      <div className="flex gap-[20px] items-start shrink-0 w-full">
        {/* Scanner */}
        <div className="bg-white border border-[#e2e8f0] flex flex-1 flex-col gap-[16px] items-start min-w-0 p-[24px] rounded-[12px]">
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[16px]">Nhập mã hoặc quét thẻ hội viên</span>
          <div className="bg-[#f1f5f9] flex gap-[12px] items-center p-[16px] rounded-[8px] shrink-0 w-full">
            <img src={`${A}/f6f1f.svg`} alt="" className="size-[20px] shrink-0" />
            <input
              className="flex-1 bg-transparent font-['Manrope:Regular'] text-[#0f172a] text-[15px] outline-none min-w-0"
              value={scanValue}
              onChange={(e) => { setScanValue(e.target.value); setConfirmed(false) }}
              placeholder="Nhập mã hội viên hoặc SĐT..."
            />
            <span className="bg-[#3b82f6] font-['Manrope:Bold'] font-bold px-[8px] py-[2px] rounded-[4px] text-[11px] text-white whitespace-nowrap shrink-0">
              {foundMember ? "ĐÃ NHẬN DIỆN" : "ĐANG CHỜ QUÉT"}
            </span>
          </div>
          <span className="font-['Manrope:Regular'] font-normal text-[#64748b] text-[13px]">
            Gợi ý: Quét vân tay hoặc barcode từ thẻ cứng hội viên của khách để check-in tức thì.
          </span>
        </div>

        {/* Member result */}
        <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[20px] items-start p-[24px] rounded-[12px] shrink-0 w-[480px]">
          <div className="flex items-center justify-between shrink-0 w-full">
            <span className="font-['Manrope:Bold'] font-bold text-[#94a3b8] text-[13px]">HỘI VIÊN TÌM THẤY</span>
            {foundMember ? <span className="bg-[#dcfce7] font-['Manrope:Bold'] font-bold px-[10px] py-[4px] rounded-[99px] text-[#15803d] text-[12px]">{foundMember.status}</span> : null}
          </div>
          {foundMember ? (
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
                onClick={handleCheckIn}
                className={`flex gap-[8px] items-center justify-center p-[14px] rounded-[8px] shrink-0 w-full transition-colors ${confirmed ? "bg-[#16a34a]" : "bg-[#22c55e]"}`}
              >
                <img src={`${A}/b6b07.svg`} alt="" className="size-[18px]" />
                <span className="font-['Manrope:Bold'] font-bold text-[15px] text-white">
                  {confirmed ? "✓ ĐÃ CHECK-IN THÀNH CÔNG" : "XÁC NHẬN CHECK-IN"}
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
              <StatusBadge text={row.status === "APPROVED" ? "Hợp lệ" : "Từ chối"} color={row.status === "APPROVED" ? "green" : "red"} />
            </div>
            <span className="font-['Manrope:Regular'] font-normal text-right w-[100px] shrink-0 text-[13px]" style={{ color: row.status === "APPROVED" ? "#22c55e" : "#ef4444" }}>Cửa chính</span>
          </div>
        ))}
      </div>
    </div>
  )
}
