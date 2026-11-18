import React from 'react';
import { createPortal } from 'react-dom';

interface AddStaffFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  roleName: string;
  sportIds: string[];
}

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: AddStaffFormData;
  setFormData: React.Dispatch<React.SetStateAction<AddStaffFormData>>;
  availableSports: { id: string; name: string }[];
}

export function AddStaffModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  availableSports,
}: AddStaffModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overscroll-contain animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 -z-10" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        <h2 className="text-xl font-bold text-[#0f172a] mb-6">Thêm nhân sự mới</h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#475569] mb-1">Họ và tên</label>
            <input
              required
              type="text"
              className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 outline-none focus:border-slate-500"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#475569] mb-1">Email</label>
            <input
              required
              type="email"
              className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 outline-none focus:border-slate-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@smartgym.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#475569] mb-1">Số điện thoại</label>
            <input
              required
              type="text"
              className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 outline-none focus:border-slate-500"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="0987654321"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#475569] mb-1">Mật khẩu</label>
            <input
              required
              type="password"
              minLength={6}
              className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 outline-none focus:border-slate-500"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Ít nhất 6 ký tự"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#475569] mb-1">Vai trò (Role)</label>
            <select
              className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 outline-none focus:border-slate-500"
              value={formData.roleName}
              onChange={(e) => setFormData({ ...formData, roleName: e.target.value, sportIds: [] })}
            >
              <option value="receptionist">Lễ tân (receptionist)</option>
              <option value="coach">Huấn luyện viên (coach)</option>
              <option value="manager">Quản lý trung tâm (manager)</option>
            </select>
          </div>
          {formData.roleName === 'coach' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Bộ môn phụ trách (Bắt buộc)
                </label>
                <span className="text-[11px] text-emerald-600 font-medium">
                  Đã chọn: {formData.sportIds.length}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tick chọn các bộ môn mà HLV này có chứng chỉ và được phép đứng lớp:
              </p>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {availableSports.map((s) => {
                  const checked = formData.sportIds.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        checked
                          ? 'border-emerald-300 bg-emerald-50/70 text-emerald-700 font-semibold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="accent-emerald-600 rounded"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, sportIds: [...formData.sportIds, s.id] });
                          } else {
                            setFormData({
                              ...formData,
                              sportIds: formData.sportIds.filter((id) => id !== s.id),
                            });
                          }
                        }}
                      />
                      <span className="truncate">{s.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border border-[#cbd5e1] font-semibold text-[#475569] py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 bg-emerald-600 font-semibold text-white py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20"
            >
              Lưu nhân sự
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

