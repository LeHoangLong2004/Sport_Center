import React, { useState } from 'react';
import { A, avatarSidebar, avatarTopbar, iDashboard, iUsers, iPackage, iCalendar, iReceipt, iBarChart, iSettings, iSearch, iBell, iSearch2, iDownload, iPlus, iWallet, iCheckCircle, iClock, iRotateCcw, iChevron, iEye, iPrinter, iMore, mAvatar0, mAvatar1, mAvatar2, mAvatar3, mAvatar4, iBell2, iDownload2, iKpiRevenue, iKpiMembers, iKpiClasses, iKpiRetain, iSeg1, iSeg2, iSeg3, iSeg4, iDotBlue, iDotTeal, iDotOrange, iDotPurple, iActivity0, iActivity1, iActivity2, iActivity3, iLineChart, iBarFill, coachAvatar1, coachAvatar2, coachAvatar3, coachAvatar4, hrAvatar1, hrAvatar2, hrAvatar3, hrAvatar4, iBudgetIcon, iExpenseIcon, iBudgetChevron, iPLRevIcon, memberEditAvatar, transactions, reportBarData, reportMonths, members } from '../shared';
import KpiCard from '../components/KpiCard';
import SimpleLineChart from '../components/SimpleLineChart';
import { FinanceTopBar } from '../components/FinanceTopBar';

export function MemberEditPage({ memberData, onBack }: { memberData?: any, onBack: () => void }) {
  const member = memberData || {
    name: "",
    id: "",
    phone: "",
    email: "",
    avatar: memberEditAvatar,
    statusRaw: true,
    vip: false
  };
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(member.avatar);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member.realId) {
      alert("Lỗi: Không tìm thấy ID của hội viên.");
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);
    const payload = {
      fullName: formData.get("name"),
      phoneNumber: formData.get("phone"),
      email: formData.get("email"),
      dateOfBirth: formData.get("dob") || null,
      gender: formData.get("gender"),
      emergencyContact: formData.get("emergencyContact"),
      avatarUrl: avatarUrl !== memberEditAvatar ? avatarUrl : undefined
    };

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/users/${member.realId}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Lưu thông tin thành công!");
        onBack();
      } else {
        alert("Lưu thất bại.");
      }
    } catch {
      alert("Lỗi kết nối.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeAvatar = () => {
    const url = prompt("Nhập URL hình ảnh mới:");
    if (url) setAvatarUrl(url);
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto">
      <div>
        <p className="text-[#64748b] text-sm">Cập nhật thông tin cá nhân và chỉ số của hội viên {member.name} ({member.id})</p>
      </div>
      <div className="flex gap-6">
        {/* main form */}
        <div className="flex flex-col gap-5 flex-1 min-w-0">
          {/* personal info */}
          <div className="bg-white border border-[#e2e8f0] p-6 rounded-xl">
            <p className="font-extrabold text-[#0f172a] text-base mb-5">Thông tin cá nhân</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                {label:"Họ và tên *",       value:member.name,          name:"name", type:"text", required: true},
                {label:"Ngày sinh",         value:member.dob || "",     name:"dob", type:"date", required: false},
                {label:"Giới tính",         value:member.gender || "",  name:"gender", type:"select", required: false},
                {label:"Số điện thoại *",   value:member.phone,         name:"phone", type:"text", required: true},
                {label:"Email *",           value:member.email,         name:"email", type:"email", fullWidth:true, required: true},
                {label:"Liên hệ khẩn cấp",  value:member.emergencyContact || "", name:"emergencyContact", type:"text", fullWidth:true, required: false},
              ].map((f,i)=>(
                <label key={i} className={f.fullWidth ? "col-span-2 flex flex-col gap-1" : "flex flex-col gap-1"}>
                  <span className="font-semibold text-[#0f172a] text-sm">{f.label}</span>
                  {f.type === "select" ? (
                    <div className="relative">
                      <select name={f.name} defaultValue={f.value} required={f.required} className="appearance-none bg-white border border-[#e2e8f0] px-3 py-2.5 rounded-lg text-sm w-full">
                        <option value="">Chọn giới tính</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                      <img src={iChevron} alt="" className="absolute right-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none"/>
                    </div>
                  ) : (
                    <input name={f.name} defaultValue={f.value} type={f.type} required={f.required} className="border border-[#e2e8f0] px-3 py-2.5 rounded-lg text-sm" />
                  )}
                </label>
              ))}
            </div>
          </div>
          {/* body metrics */}
          <div className="bg-white border border-[#e2e8f0] p-6 rounded-xl">
            <p className="font-extrabold text-[#0f172a] text-base mb-5">Chỉ số hình thể & Mục tiêu</p>
            <div className="grid grid-cols-3 gap-4">
              <label className="flex flex-col gap-1">
                <span className="font-semibold text-[#0f172a] text-sm">Chiều cao (cm) *</span>
                <input defaultValue="" className="border border-[#e2e8f0] px-3 py-2.5 rounded-lg text-sm" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-semibold text-[#0f172a] text-sm">Cân nặng (kg) *</span>
                <input defaultValue="" className="border border-[#e2e8f0] px-3 py-2.5 rounded-lg text-sm" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-semibold text-[#0f172a] text-sm">BMI (Tự động tính)</span>
                <input defaultValue="" readOnly className="border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 rounded-lg text-sm text-[#94a3b8]" />
              </label>
            </div>
            <label className="flex flex-col gap-1 mt-4">
              <span className="font-semibold text-[#0f172a] text-sm">Mục tiêu tập luyện</span>
              <textarea defaultValue="" rows={3} className="border border-[#e2e8f0] px-3 py-2.5 rounded-lg text-sm resize-none" />
            </label>
          </div>
        </div>

        {/* sidebar card */}
        <div className="flex flex-col gap-5 shrink-0 w-[280px]">
          <div className="bg-white border border-[#e2e8f0] p-6 rounded-xl">
            <p className="font-extrabold text-[#0f172a] text-base mb-5">Ảnh đại diện hội viên</p>
            <div className="flex flex-col items-center gap-4">
              <img src={avatarUrl} alt="" className="rounded-full size-24 object-cover" />
              <button type="button" onClick={handleChangeAvatar} className="border border-[#e2e8f0] flex gap-2 items-center px-4 py-2 rounded-lg">
                <span className="text-[#0f172a] text-sm">✏ Thay đổi hình ảnh</span>
              </button>
              <p className="text-[#94a3b8] text-[11px] text-center">Hỗ trợ file PNG, JPG tối đa 5MB</p>
            </div>
          </div>
          <div className="bg-white border border-[#e2e8f0] p-6 rounded-xl">
            <p className="font-extrabold text-[#475569] text-[11px] tracking-wider uppercase mb-3">Trạng thái hiện tại</p>
            <div className="flex gap-2 flex-wrap">
              <span className={`font-semibold px-3 py-1 rounded-full text-[12px] ${member.statusRaw ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#fee2e2] text-[#b91c1c]'}`}>
                {member.statusRaw ? "Đang hoạt động" : "Tạm khóa"}
              </span>
              {member.vip && <span className="bg-[#dbeafe] font-semibold px-3 py-1 rounded-full text-[#1d4ed8] text-[12px]">Hội Viên VIP</span>}
            </div>
          </div>
        </div>
      </div>

      {/* actions */}
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onBack} className="bg-white border border-[#e2e8f0] px-6 py-2.5 rounded-lg">
          <span className="font-semibold text-[#0f172a] text-sm">Hủy bỏ</span>
        </button>
        <button type="submit" disabled={isSaving} className="bg-[#2563eb] disabled:bg-blue-300 px-6 py-2.5 rounded-lg">
          <span className="font-semibold text-white text-sm">{isSaving ? "Đang lưu..." : "Lưu thay đổi"}</span>
        </button>
      </div>
    </form>
  )
}
