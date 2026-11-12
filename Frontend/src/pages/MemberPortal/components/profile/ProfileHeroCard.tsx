import React from "react";
import { UserAvatar } from "../../../../components/UserAvatar";
import {
  Crown,
  Camera,
  Edit3,
  KeyRound,
  Flame,
  Target,
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
  const currentTier = profile?.memberTier || (hasPaidInvoice ? "Hội viên Hoạt động" : "Thành viên mới");
  const memberCode = profile?.id
    ? profile.id.substring(0, 8).toUpperCase()
    : storedUser?.id
    ? String(storedUser.id).substring(0, 8).toUpperCase()
    : "HV-MEMBER";

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-7 shadow-xs flex flex-col justify-between relative overflow-hidden">
      {/* Subtle decorative glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div>
          {/* Header: Avatar, Name, Tier, Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <div className="p-1 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 shadow-md">
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
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                    <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                    {currentTier}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>
                    Mã HV: <strong className="text-slate-700 dark:text-slate-200">{memberCode}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Hạng thẻ: <strong className="text-emerald-600 dark:text-emerald-400">{profile?.memberTier || (hasPaidInvoice ? "Hội viên Thể thao" : "Thành viên mới")}</strong>
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
          <div className="mt-5 p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Flame className="w-5 h-5 fill-emerald-500/20" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {completedCount > 0 ? `${completedCount} Buổi Tập Đã Hoàn Thành` : "Hành Trình Rèn Luyện Mới"}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
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
            <div className="w-full sm:w-44 space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span>Cấp độ tiếp theo</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {completedCount >= 50 ? "50/50 Max" : `${completedCount}/${completedCount < 10 ? 10 : completedCount < 20 ? 20 : 50}`}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
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
          <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="leading-relaxed">
            <strong className="text-slate-800 dark:text-slate-200 mr-1">Mục tiêu rèn luyện cá nhân:</strong>
            {profile?.fitnessGoal || fitnessGoal || "Duy trì lối sống năng động và cải thiện sức bền"}
          </div>
        </div>
    </div>
  );
};
