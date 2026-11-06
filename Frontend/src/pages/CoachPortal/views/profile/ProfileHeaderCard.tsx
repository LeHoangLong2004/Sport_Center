import type { ChangeEvent } from "react";
import { UserAvatar } from "../../../../components/UserAvatar";
import { Camera, Dumbbell, Edit3, KeyRound } from "lucide-react";

interface Props {
  fullName: string;
  avatarUrl: string;
  coachId: string;
  experienceYears: number;
  specialties: string[];
  bio: string;
  onOpenEdit: () => void;
  onOpenPassword: () => void;
  onAvatarFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  avatarUploading: boolean;
}

export default function ProfileHeaderCard({
  fullName,
  avatarUrl,
  coachId,
  experienceYears,
  specialties,
  bio,
  onOpenEdit,
  onOpenPassword,
  onAvatarFileChange,
  avatarUploading,
}: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <label className="relative group cursor-pointer" title="Chọn ảnh đại diện từ thiết bị">
            <UserAvatar
              src={avatarUrl}
              name={fullName || "Chưa cập nhật"}
              className="w-24 h-24 rounded-2xl text-3xl font-bold ring-4 ring-slate-100 dark:ring-slate-800 object-cover shadow-sm bg-orange-500 text-white"
            />
            <span className={`absolute -bottom-1.5 -right-1.5 bg-orange-500 hover:bg-orange-600 text-white p-1.5 rounded-full ring-2 ring-white dark:ring-slate-900 transition-colors shadow-sm shadow-orange-500/20 ${avatarUploading ? "animate-pulse" : ""}`}>
              <Camera className="w-3.5 h-3.5" />
            </span>
            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" disabled={avatarUploading} onChange={onAvatarFileChange} />
          </label>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{fullName || "Chưa cập nhật"}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200/60 dark:border-orange-500/20">COACH</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Mã HLV: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{coachId}</span> · {experienceYears} năm kinh nghiệm</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {specialties.map((specialty, index) => (
                <span key={index} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Dumbbell className="w-3 h-3 text-slate-400" />
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button type="button" onClick={onOpenEdit} className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-sm">
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            Cập nhật hồ sơ
          </button>
          <button type="button" onClick={onOpenPassword} className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-sm">
            <KeyRound className="w-3.5 h-3.5 text-slate-500" />
            Đổi mật khẩu
          </button>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
        <span className="font-semibold text-slate-800 dark:text-slate-200 mr-1.5">Tiểu sử:</span>
        {bio || <span className="text-slate-400 italic">Chưa cập nhật tiểu sử</span>}
      </div>
    </div>
  );
}
