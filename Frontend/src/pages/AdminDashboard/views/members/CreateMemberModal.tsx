import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  useEffect(() => {
    if (!isOpen) return;
    const origBody = document.body.style.overflow;
    const origHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const scrollContainers = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.manager-page-content, .portal-page-enter, [class*="overflow-y-auto"]'
      )
    );
    const origOverflows = scrollContainers.map((el) => ({ el, overflow: el.style.overflow }));
    scrollContainers.forEach((el) => {
      el.style.overflow = 'hidden';
    });

    return () => {
      document.body.style.overflow = origBody;
      document.documentElement.style.overflow = origHtml;
      origOverflows.forEach(({ el, overflow }) => {
        el.style.overflow = overflow;
      });
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overscroll-contain animate-in fade-in duration-150">
      <div className="fixed inset-0 -z-10" onClick={onClose} />
      <form onSubmit={onSubmit} className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
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
            className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 cursor-pointer hover:bg-rose-700 transition-all shadow-md shadow-rose-600/20"
          >
            {isCreating ? "Đang tạo..." : "Tạo hội viên"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
