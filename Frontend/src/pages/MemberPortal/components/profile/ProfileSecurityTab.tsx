import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  KeyRound,
  Shield,
  AlertCircle,
  X,
} from "lucide-react";

interface ProfileSecurityTabProps {
  isPasswordModalOpen: boolean;
  setIsPasswordModalOpen: (open: boolean) => void;
  onSavePassword: (currentPass: string, newPass: string, confirmPass: string) => Promise<boolean>;
}

export const ProfileSecurityTab: React.FC<ProfileSecurityTabProps> = ({
  isPasswordModalOpen,
  setIsPasswordModalOpen,
  onSavePassword,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Mật khẩu mới phải có tối thiểu 6 ký tự." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Mật khẩu xác nhận không trùng khớp." });
      return;
    }

    setSavingPassword(true);
    const success = await onSavePassword(currentPassword, newPassword, confirmPassword);
    setSavingPassword(false);
    if (success) {
      setPasswordMsg({ type: "success", text: "Đổi mật khẩu thành công!" });
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordMsg(null);
      }, 1000);
    } else {
      setPasswordMsg({ type: "error", text: "Đổi mật khẩu thất bại. Vui lòng thử lại." });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box 1: Đổi mật khẩu */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Mật khẩu tài khoản
              </h3>
              <p className="text-xs text-slate-400">
                Bảo vệ tài khoản hội viên của bạn với mật khẩu mạnh
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p className="font-medium text-slate-800 dark:text-slate-200">
              Trạng thái bảo mật mật khẩu:
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              • Mật khẩu đã được thiết lập bảo vệ tài khoản của bạn
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              • Khuyến nghị thay đổi định kỳ 3 tháng một lần
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-xl shadow-xs transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Đổi mật khẩu ngay
          </button>
        </div>

        {/* Box 2: Phiên đăng nhập & Thiết bị */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Phiên đăng nhập & Thiết bị
              </h3>
              <p className="text-xs text-slate-400">
                Các thiết bị đang duy trì phiên làm việc
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl border border-emerald-200/60 bg-emerald-50/40 dark:border-emerald-500/20 dark:bg-emerald-500/5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Trình duyệt hiện tại
                </div>
                <div className="text-slate-400 mt-0.5">
                  Phiên làm việc bảo mật đang hoạt động
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Đang hoạt động
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Box 3: Quyền riêng tư & Khóa thẻ khẩn cấp */}
      <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 flex items-start gap-4">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">
          <h4 className="font-bold text-xs text-amber-900 dark:text-amber-200">
            Khóa mã QR hoặc Báo mất thiết bị khẩn cấp
          </h4>
          <p className="text-xs text-amber-700/90 dark:text-amber-300/80 leading-relaxed">
            Nếu bạn đánh mất điện thoại hoặc nghi ngờ có người sử dụng trái phép mã Check-in của bạn, vui lòng liên hệ ngay bộ phận Lễ tân tại quầy hoặc gọi Hotline 1900 6868 để nhân viên tạm khóa mã QR và cấp lại mã bảo mật mới ngay lập tức.
          </p>
        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {isPasswordModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Đổi mật khẩu tài khoản
                </h3>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit}>
                <div className="p-5 flex flex-col gap-4 text-xs">
                  {passwordMsg && (
                    <div
                      className={`p-3 rounded-lg flex items-center gap-2 font-medium ${
                        passwordMsg.type === "success"
                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                      }`}
                    >
                      <span>{passwordMsg.text}</span>
                    </div>
                  )}

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Mật khẩu hiện tại: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Nhập mật khẩu hiện tại"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Mật khẩu mới: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Tối thiểu 6 ký tự"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Xác nhận mật khẩu mới: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm text-xs transition-colors"
                  >
                    {savingPassword ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
