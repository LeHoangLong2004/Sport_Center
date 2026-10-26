import React from 'react';
import { DateInput } from '../../../../components/DateInput';

interface CreateMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCreating: boolean;
  createError: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function CreateMemberModal({
  isOpen,
  onClose,
  isCreating,
  createError,
  onSubmit,
}: CreateMemberModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#0f172a]">Thêm hội viên mới</h2>
            <p className="mt-1 text-sm text-[#64748b]">Tài khoản sẽ được tạo với quyền hội viên.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            ×
          </button>
        </div>

        {createError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {createError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <label className="col-span-2 flex flex-col gap-1 text-sm font-semibold text-[#0f172a]">
            Họ và tên *
            <input
              name="fullName"
              required
              className="rounded-lg border border-[#cbd5e1] px-3 py-2.5 font-normal outline-none focus:border-blue-500"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-[#0f172a]">
            Email *
            <input
              name="email"
              type="email"
              required
              className="rounded-lg border border-[#cbd5e1] px-3 py-2.5 font-normal outline-none focus:border-blue-500"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-[#0f172a]">
            Số điện thoại *
            <input
              name="phoneNumber"
              required
              className="rounded-lg border border-[#cbd5e1] px-3 py-2.5 font-normal outline-none focus:border-blue-500"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-[#0f172a]">
            Mật khẩu tạm thời *
            <input
              name="password"
              type="password"
              minLength={6}
              required
              className="rounded-lg border border-[#cbd5e1] px-3 py-2.5 font-normal outline-none focus:border-blue-500"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-[#0f172a]">
            Ngày sinh
            <DateInput
              name="dateOfBirth"
              className="rounded-lg border border-[#cbd5e1] px-3 py-2.5 font-normal outline-none focus:border-blue-500"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-[#0f172a]">
            Giới tính
            <select
              name="gender"
              className="rounded-lg border border-[#cbd5e1] bg-white px-3 py-2.5 font-normal outline-none focus:border-blue-500"
            >
              <option value="">Chưa cập nhật</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </label>
          <label className="col-span-2 flex flex-col gap-1 text-sm font-semibold text-[#0f172a]">
            Liên hệ khẩn cấp
            <input
              name="emergencyContact"
              className="rounded-lg border border-[#cbd5e1] px-3 py-2.5 font-normal outline-none focus:border-blue-500"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#cbd5e1] px-5 py-2.5 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="rounded-lg bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 cursor-pointer hover:bg-blue-700 transition-colors"
          >
            {isCreating ? "Đang tạo..." : "Tạo hội viên"}
          </button>
        </div>
      </form>
    </div>
  );
}
