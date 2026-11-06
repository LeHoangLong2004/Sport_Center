import React, { useState, useEffect } from "react";
import { toast } from "sonner";

interface PaymentMemberProfileCardProps {
  formData: any;
  setFormData?: (fnOrVal: any) => void;
  isProduct: boolean;
}

export function PaymentMemberProfileCard({
  formData,
  setFormData,
  isProduct,
}: PaymentMemberProfileCardProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: formData?.fullName || "",
    phone: formData?.phone || "",
    email: formData?.email || "",
    branch: formData?.branch || "Chi nhánh Quận 1 - Flagship Center",
    startDate: formData?.startDate || new Date().toISOString().slice(0, 10),
  });

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
      toast.error("Vui lòng điền đầy đủ Họ tên, Số điện thoại và Email.");
      return;
    }

    if (setFormData) {
      setFormData((prev: any) => ({
        ...prev,
        ...editForm,
      }));
    }

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

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl p-3 px-4 w-full shadow-2xs transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-xs">
            👤
          </div>
          <h2 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-xs md:text-sm">
            {isProduct ? "Thông tin người nhận đơn hàng" : "Thông tin hội viên nhận gói"}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-[10px]">
            <span className="size-1 rounded-full bg-emerald-500"></span>
            Tài khoản chính chủ
          </span>
          {!isEditingProfile && (
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition-all cursor-pointer"
            >
              <span>✏️</span>
              <span>Chỉnh sửa</span>
            </button>
          )}
        </div>
      </div>

      {/* View Mode (Compact 1-row layout) */}
      {!isEditingProfile ? (
        <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-slate-400 text-[11px] shrink-0">Hội viên:</span>
            <span className="text-slate-900 font-bold truncate">
              {formData?.fullName || "Chưa cập nhật"}
            </span>
            <span className="text-slate-400 text-[10px] truncate max-w-[90px]">({formData?.email})</span>
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-slate-400 text-[11px] shrink-0">SĐT:</span>
            <span className="text-slate-900 font-bold">
              {formData?.phone || "Chưa cập nhật"}
            </span>
            <span className="text-[10px] text-teal-700 bg-teal-50 px-1 py-0.5 rounded font-medium">Nhận SMS</span>
          </div>

          {!isProduct && (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-slate-400 text-[11px] shrink-0">Cơ sở:</span>
              <span className="text-slate-900 font-bold truncate text-[11px]">
                {formData?.branch ? formData.branch.replace("Chi nhánh ", "") : "Q1 Flagship"}
              </span>
              <span className="text-slate-400 text-[10px] shrink-0">
                ({formData?.startDate ? formData.startDate.split("-").reverse().slice(0, 2).join("/") : "Hôm nay"})
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Edit Mode Form */
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-col gap-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-700">Họ và tên *</label>
              <input
                type="text"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-teal-500 outline-none text-xs text-slate-900 font-medium"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-700">Số điện thoại *</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-teal-500 outline-none text-xs text-slate-900 font-medium"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-700">Email *</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-teal-500 outline-none text-xs text-slate-900 font-medium"
              />
            </div>

            {!isProduct && (
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-700">Cơ sở chính</label>
                <select
                  value={editForm.branch}
                  onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-teal-500 outline-none text-xs text-slate-900 font-medium bg-white"
                >
                  <option value="Chi nhánh Quận 1 - Flagship Center">Q1 - Flagship</option>
                  <option value="Chi nhánh Quận 7 - Riverside Club">Q7 - Riverside</option>
                  <option value="Chi nhánh Bình Thạnh - Pearl Plaza">Bình Thạnh</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1.5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px] font-semibold cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              className="px-3.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shadow-2xs cursor-pointer"
            >
              Lưu thông tin
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
