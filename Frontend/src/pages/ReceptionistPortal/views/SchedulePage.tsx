import React, { useState } from 'react';
import { A } from '../shared';
import StatusBadge from '../components/StatusBadge';

export function SchedulePage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ time: "08:00", title: "", customerName: "", coachName: "" })

  const fetchAppointments = () => {
    fetch("/api/appointments")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setAppointments(data)
      })
      .catch(console.error)
  }

  React.useEffect(() => {
    fetchAppointments()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.customerName) return
    try {
      await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      setShowForm(false)
      setFormData({ time: "08:00", title: "", customerName: "", coachName: "" })
      fetchAppointments()
    } catch (err) {
      console.error(err)
    }
  }

  const getStyleForStatus = (status: string) => {
    switch (status) {
      case "Đã hoàn tất": return { bg: "bg-[#eff6ff]", border: "border-[#bfdbfe]", badgeBg: "bg-[#dbeafe]", badgeText: "text-[#1e40af]" }
      case "Đang chờ khách": return { bg: "bg-[#fffbeb]", border: "border-[#fef08a]", badgeBg: "bg-[#fef3c7]", badgeText: "text-[#b45309]" }
      case "Đã hủy": return { bg: "bg-[#f8fafc]", border: "border-[#e2e8f0]", badgeBg: "bg-[#e2e8f0]", badgeText: "text-[#64748b]" }
      default: return { bg: "bg-[#f8fafc]", border: "border-[#e2e8f0]", badgeBg: "bg-[#e2e8f0]", badgeText: "text-[#64748b]" }
    }
  }

  return (
    <div className="flex flex-col items-start p-[32px] w-full">
      <div className="flex gap-[24px] items-start shrink-0 w-full">
        {/* Timeline */}
        <div className="bg-white border border-[#e2e8f0] flex flex-1 flex-col gap-[20px] items-start min-w-0 p-[24px] rounded-[12px]">
          <div className="flex items-center justify-between shrink-0 w-full">
            <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[18px]">Lịch hẹn hôm nay</span>
            <button onClick={() => setShowForm(!showForm)} type="button" className="bg-[#3b82f6] flex items-center px-[14px] py-[8px] rounded-[6px] shrink-0 hover:bg-blue-600">
              <span className="font-['Manrope:Bold'] font-bold text-[13px] text-white">{showForm ? "Đóng" : "+ Tạo lịch hẹn"}</span>
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleCreate} className="w-full bg-[#f8fafc] p-[16px] rounded-[8px] border border-[#e2e8f0] flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Tên lịch hẹn (VD: Lớp Yoga...)" className="p-2 border rounded text-sm" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                <input required placeholder="Tên khách hàng" className="p-2 border rounded text-sm" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} />
                <input placeholder="Tên Coach/PT" className="p-2 border rounded text-sm" value={formData.coachName} onChange={e => setFormData({ ...formData, coachName: e.target.value })} />
                <input type="time" required className="p-2 border rounded text-sm" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
              </div>
              <button type="submit" className="bg-[#14b8a6] text-white px-4 py-2 rounded font-bold text-sm self-end hover:bg-teal-600">Lưu lịch hẹn</button>
            </form>
          )}

          <div className="flex flex-col gap-[16px] items-start w-full">
            {appointments.map((slot) => {
              const style = getStyleForStatus(slot.status)
              return (
                <div key={slot.id} className="flex gap-[16px] items-center shrink-0 w-full">
                  <span className="font-['Manrope:Bold'] font-bold text-[#64748b] text-[13px] w-[60px] shrink-0">{slot.time}</span>
                  <div className={`${style.bg} border ${style.border} border-solid flex flex-1 items-center justify-between min-w-0 p-[12px] rounded-[8px]`}>
                    <div className="flex flex-col gap-[4px] items-start shrink-0">
                      <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-[14px]">{slot.title}</span>
                      <span className="font-['Manrope:Regular'] font-normal text-[#64748b] text-[12px]">Khách: {slot.customerName} • Coach: {slot.coachName || 'N/A'}</span>
                    </div>
                    <span className={`${style.badgeBg} ${style.badgeText} font-['Manrope:Bold'] font-bold px-[8px] py-[2px] rounded-[4px] text-[11px] whitespace-nowrap shrink-0`}>{slot.status}</span>
                  </div>
                </div>
              )
            })}
            <div className="flex gap-[16px] items-center shrink-0 w-full">
              <span className="font-['Manrope:Bold'] font-bold text-[#64748b] text-[13px] w-[60px] shrink-0">16:00</span>
              <div className="border border-[#e2e8f0] border-dashed flex flex-1 items-center min-w-0 p-[12px] rounded-[8px]">
                <span className="font-['Manrope:Regular'] font-normal text-[#94a3b8] text-[13px]">Không có lịch hẹn</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[20px] items-start p-[24px] rounded-[12px] shrink-0 w-[400px]">
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[16px]">Tổng quan lịch hẹn</span>
          <div className="flex flex-col gap-[12px] items-start w-full">
            {[
              { dot: `${A}/93b20.svg`, label: "Tổng số lịch hẹn", value: appointments.length },
              { dot: `${A}/0d428.svg`, label: "Đã hoàn tất", value: appointments.filter(a => a.status === "Đã hoàn tất").length },
              { dot: `${A}/5a32b.svg`, label: "Đang chờ khách", value: appointments.filter(a => a.status === "Đang chờ khách").length },
              { dot: `${A}/45516.svg`, label: "Đã hủy", value: appointments.filter(a => a.status === "Đã hủy").length },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between shrink-0 w-full">
                <div className="flex gap-[8px] items-center shrink-0">
                  <img src={s.dot} alt="" className="size-[8px] shrink-0" />
                  <span className="font-['Manrope:Regular'] font-normal text-[#64748b] text-[14px]">{s.label}</span>
                </div>
                <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[14px]">{s.value}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#f1f5f9] h-px w-full" />
          <div className="bg-[#eff6ff] flex flex-col gap-[8px] items-start p-[16px] rounded-[8px] w-full">
            <span className="font-['Manrope:Bold'] font-bold text-[#1e40af] text-[13px]">Lưu ý lễ tân</span>
            <span className="font-['Manrope:Regular'] font-normal leading-[1.4] text-[#1e40af] text-[12px]">
              Vui lòng gọi điện nhắc khách trước 30 phút đối với các lịch hẹn có HLV cá nhân tập thử.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

