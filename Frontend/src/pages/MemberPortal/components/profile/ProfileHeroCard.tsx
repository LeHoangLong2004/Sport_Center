import React from "react";
import { UserAvatar } from "../../../../components/UserAvatar";
import {
  Crown,
  Camera,
  Edit3,
  KeyRound,
  Flame,
  Target,
  Zap,
  QrCode,
} from "lucide-react";

interface ProfileHeroCardProps {
  profile: any;
  fullName: string;
  avatarUrl: string;
  avatarUploading: boolean;
  storedUser: any;
  hasPaidInvoice: boolean;
  completedCount: number;
  totalSessionsCount: number;
  fitnessGoal: string;
  handleAvatarFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenEdit: () => void;
  onOpenPasswordModal: () => void;
}

export const ProfileHeroCard: React.FC<ProfileHeroCardProps> = ({
  profile,
  fullName,
  avatarUrl,
  avatarUploading,
  storedUser,
  hasPaidInvoice,
  completedCount,
  totalSessionsCount,
  fitnessGoal,
  handleAvatarFileChange,
  onOpenEdit,
  onOpenPasswordModal,
}) => {
  const currentTier = profile?.memberTier || (hasPaidInvoice ? "Hội viên Hoạt động" : "Hội viên Mới");
  const memberCode = profile?.id
    ? profile.id.substring(0, 8).toUpperCase()
    : storedUser?.id
    ? String(storedUser.id).substring(0, 8).toUpperCase()
    : "HV-MEMBER";

  const cardNumber = profile?.id
    ? profile.id.substring(0, 4).toUpperCase()
    : storedUser?.id
    ? String(storedUser.id).substring(0, 4).toUpperCase()
    : "8888";

  const ownerName = (
    profile?.fullName ||
    fullName ||
    storedUser?.fullName ||
    storedUser?.name ||
    "HỘI VIÊN"
  ).toUpperCase();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Left Column (7 cols): Member Identity, Level & Disciplined Streak */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-7 shadow-xs flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div>
          {/* Header: Avatar, Name, Tier, Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <div className="p-1 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-md">
                  <UserAvatar
                    src={avatarUrl || profile?.avatarUrl || ""}
                    name={profile?.fullName || fullName || storedUser?.fullName || storedUser?.name || "Hội viên"}
                    className="w-20 h-20 rounded-xl text-2xl font-bold object-cover bg-slate-900 text-white"
                  />
                </div>
                <label
                  className="absolute -bottom-1 -right-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-110 p-1.5 rounded-xl ring-2 ring-white dark:ring-slate-900 transition-all shadow-sm cursor-pointer"
                  title="Cập nhật ảnh đại diện"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    disabled={avatarUploading}
                    onChange={handleAvatarFileChange}
                  />
                </label>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {profile?.fullName || fullName || storedUser?.fullName || storedUser?.name || "Hội viên"}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    <Crown className="w-3 h-3 text-amber-500" />
                    {currentTier}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>
                    Mã HV: <strong className="font-mono text-slate-700 dark:text-slate-200">{memberCode}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Hạng thẻ: <strong className="text-emerald-600 dark:text-emerald-400">{profile?.memberTier || (hasPaidInvoice ? "Hội viên Thể thao" : "Hội viên Mới")}</strong>
                  </span>
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={onOpenEdit}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-xl transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Sửa hồ sơ</span>
              </button>
              <button
                type="button"
                onClick={onOpenPasswordModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-xl transition-all"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Đổi mật khẩu</span>
              </button>
            </div>
          </div>

          {/* Streak & Training Level Highlight Bar */}
          <div className="mt-5 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-emerald-500/10 border border-amber-500/20 dark:border-amber-400/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-sm shadow-amber-500/20 shrink-0">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {completedCount > 0 ? `${completedCount} Buổi Tập Đã Hoàn Thành 🔥` : "Hành Trình Rèn Luyện Mới 🌱"}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300">
                    {completedCount >= 50 ? "Bậc Thầy" : completedCount >= 20 ? "Chiến Binh" : completedCount >= 5 ? "Tích Cực" : "Tập Sự"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {completedCount > 0
                    ? `Hoàn thành ${completedCount}/${totalSessionsCount || completedCount} lịch đã đăng ký`
                    : "Đăng ký buổi tập đầu tiên để bắt đầu xây dựng chuỗi kỷ luật!"}
                </p>
              </div>
            </div>

            {/* Progress mini bar towards next milestone */}
            <div className="w-full sm:w-44 space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span>Cấp độ tiếp theo</span>
                <span className="text-amber-600 dark:text-amber-400">
                  {completedCount >= 50 ? "50/50 Max" : `${completedCount}/${completedCount < 10 ? 10 : completedCount < 20 ? 20 : 50}`}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full transition-all duration-700"
                  style={{
                    width: `${
                      completedCount >= 50
                        ? 100
                        : completedCount < 10
                        ? Math.min(100, Math.round((completedCount / 10) * 100))
                        : completedCount < 20
                        ? Math.min(100, Math.round(((completedCount - 10) / 10) * 100))
                        : Math.min(100, Math.round(((completedCount - 20) / 30) * 100))
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Motivation Quote / Target */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Target className="w-4 h-4 text-emerald-500 shrink-0" />
          <div className="leading-relaxed">
            <strong className="text-slate-800 dark:text-slate-200 mr-1">Mục tiêu rèn luyện cá nhân:</strong>
            {profile?.fitnessGoal || fitnessGoal || "Duy trì lối sống năng động và cải thiện sức bền"}
          </div>
        </div>
      </div>

      {/* Right Column (5 cols): Luxury Digital Member Pass (Thẻ Hội Viên Điện Tử Cao Cấp) */}
      <div className="lg:col-span-5 flex flex-col">
        <div className="h-full rounded-3xl p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border border-amber-500/30 dark:border-amber-400/20 shadow-xl relative overflow-hidden flex flex-col justify-between group">
          {/* Holographic metallic background effect */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/15 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Card Top: Gym Branding & Smart Chip */}
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 text-xs shadow-xs">
                  SG
                </div>
                <span className="font-extrabold text-xs tracking-wider text-amber-200/90 uppercase">
                  SmartGym Sports Pass
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                ALL-ACCESS VIP MEMBERSHIP
              </span>
            </div>

            {/* Metallic Chip & Contactless */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-6 rounded-md bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 border border-amber-200/60 shadow-xs flex items-center justify-center">
                <div className="w-5 h-4 border border-amber-700/30 rounded-xs flex flex-col justify-between py-0.5">
                  <div className="h-px bg-amber-800/40 w-full" />
                  <div className="h-px bg-amber-800/40 w-full" />
                </div>
              </div>
              <Zap className="w-4 h-4 text-amber-300" />
            </div>
          </div>

          {/* Card Middle: Embossed Number & Member Name */}
          <div className="relative z-10 my-4 space-y-1.5">
            <div className="font-mono tracking-[0.25em] text-base md:text-lg font-bold text-amber-100/95 drop-shadow-sm">
              •••• •••• •••• {cardNumber}
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                  Chủ sở hữu thẻ
                </span>
                <span className="text-sm font-bold tracking-wide text-white uppercase">
                  {ownerName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                  Hiệu lực
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {hasPaidInvoice ? "Đang hiệu lực" : "Chưa kích hoạt"}
                </span>
              </div>
            </div>
          </div>

          {/* Card Bottom: Mini QR code & Quick checkin button */}
          <div className="relative z-10 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-400">
                Thẻ Đang Hoạt Động
              </span>
            </div>

            {/* Click to open full check-in pass */}
            <button
              type="button"
              onClick={() => {
                const checkinBtn = document.getElementById("btn-quick-checkin");
                if (checkinBtn) checkinBtn.click();
                else window.dispatchEvent(new CustomEvent("open-checkin-modal"));
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-200 text-xs font-bold transition-all"
            >
              <QrCode className="w-3.5 h-3.5" />
              Quét Check-in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
