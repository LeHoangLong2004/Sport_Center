import React from 'react';
import { createPortal } from 'react-dom';
import { LockKeyhole, UnlockKeyhole, X, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';
import { UserAvatar } from '../../../../components/UserAvatar';
import type { MemberItem } from './MembersTypes';

interface UserStatusConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isProcessing: boolean;
  targetStatus: boolean; // false = Khóa tài khoản, true = Mở khóa
  member?: MemberItem | null;
  bulkCount?: number;
}

export function UserStatusConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
  targetStatus,
  member,
  bulkCount,
}: UserStatusConfirmModalProps) {
  if (!isOpen) return null;

  const isLocking = !targetStatus;
  const isBulk = typeof bulkCount === 'number' && bulkCount > 0;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop click to dismiss */}
      <div 
        className="fixed inset-0 -z-10" 
        onClick={() => {
          if (!isProcessing) onClose();
        }} 
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <X className="size-5" />
        </button>

        {/* Header Icon + Title */}
        <div className="flex items-start gap-4">
          <div
            className={`flex size-12 shrink-0 items-center justify-center rounded-2xl transition-all ${
              isLocking
                ? 'bg-rose-100 text-rose-600 ring-8 ring-rose-50/80'
                : 'bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50/80'
            }`}
          >
            {isLocking ? (
              <ShieldAlert className="size-6" strokeWidth={2.2} />
            ) : (
              <CheckCircle2 className="size-6" strokeWidth={2.2} />
            )}
          </div>

          <div className="flex-1 pr-6">
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {isBulk
                ? `${isLocking ? 'Khóa' : 'Mở khóa'} ${bulkCount} tài khoản đã chọn`
                : `${isLocking ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa tài khoản'}`}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {isLocking
                ? 'Thao tác này sẽ giới hạn quyền truy cập của người dùng trên hệ thống.'
                : 'Kích hoạt lại tài khoản để người dùng sử dụng đầy đủ dịch vụ.'}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-3">
          {/* Member preview card (if single) */}
          {!isBulk && member && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
              <UserAvatar
                src={member.avatar}
                name={member.name}
                className="size-11 rounded-full object-cover shrink-0 ring-2 ring-white shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold text-slate-900">{member.name}</p>
                  <span className="shrink-0 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                    {member.id}
                  </span>
                </div>
                <p className="truncate text-xs text-slate-500 mt-0.5">{member.email}</p>
                <p className="text-[11px] text-slate-400">SĐT: {member.phone}</p>
              </div>
            </div>
          )}

          {/* Bulk Warning Badge (if bulk) */}
          {isBulk && (
            <div className={`rounded-xl p-3 text-xs leading-relaxed border ${
              isLocking 
                ? 'bg-rose-50/70 border-rose-200/80 text-rose-800' 
                : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-800'
            }`}>
              <span className="font-semibold">Lưu ý thao tác hàng loạt:</span> Hệ thống sẽ chuyển trạng thái của{' '}
              <strong className="underline">{bulkCount} người dùng</strong> sang{' '}
              <strong>{isLocking ? 'Tạm khóa' : 'Đang hoạt động'}</strong>.
            </div>
          )}

          {/* Action Impact Description */}
          <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 leading-relaxed border border-slate-100">
            {isLocking ? (
              <span>
                ⚠️ Sau khi khóa, tài khoản sẽ <strong>ngay lập tức không thể đăng nhập</strong>, không thể đặt chỗ lớp học hoặc sử dụng các tiện ích thành viên cho đến khi được mở khóa trở lại.
              </span>
            ) : (
              <span>
                ✅ Sau khi mở khóa, tài khoản sẽ <strong>có thể đăng nhập bình thường</strong> và tiếp tục các hoạt động thành viên.
              </span>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={onConfirm}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
              isLocking
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                {isLocking ? <LockKeyhole className="size-4" /> : <UnlockKeyhole className="size-4" />}
                <span>{isLocking ? 'Đồng ý Khóa' : 'Đồng ý Mở khóa'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
