import React from "react";
import {
  User,
  Edit3,
  Phone,
  Mail,
  Calendar,
  Shield,
  Clock,
  HeartPulse,
  ShieldCheck,
} from "lucide-react";
import { EditProfileModal } from "./EditProfileModal";

interface ProfileInfoTabProps {
  profile: any;
  storedUser: any;
  fullName: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  preferredTime: string;
  emergencyContact: string;
  fitnessGoal: string;
  favoriteSportsStr: string;
  healthNotes: string;
  workoutGoalsList: string[];
  invoices: any[];
  isEditModalOpen: boolean;
  savingProfile: boolean;
  profileMsg: { type: "success" | "error"; text: string } | null;
  onOpenEdit: () => void;
  onCloseEdit: () => void;
  onSaveProfile: (data: any) => Promise<void>;
}

export const ProfileInfoTab: React.FC<ProfileInfoTabProps> = ({
  profile,
  storedUser,
  fullName,
  phone,
  email,
  dob,
  gender,
  preferredTime,
  emergencyContact,
  fitnessGoal,
  favoriteSportsStr,
  healthNotes,
  workoutGoalsList,
  invoices,
  isEditModalOpen,
  savingProfile,
  profileMsg,
  onOpenEdit,
  onCloseEdit,
  onSaveProfile,
}) => {
  const hasPaid = invoices.some((i) => i.status === "paid");

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-500" />
            Hồ sơ cá nhân & Liên hệ
          </h2>
          <button
            type="button"
            onClick={onOpenEdit}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Chỉnh sửa
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              <span>Số điện thoại</span>
            </div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              {profile?.phone && profile.phone.length > 5
                ? profile.phone
                : storedUser?.phoneNumber || storedUser?.phone || "Chưa cập nhật"}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              <span>Email tài khoản</span>
            </div>
            <p
              className="font-bold text-slate-900 dark:text-white text-sm truncate"
              title={profile?.email || email}
            >
              {profile?.email || email || storedUser?.email || "Chưa cập nhật"}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Calendar className="w-3.5 h-3.5 text-purple-500" />
              <span>Ngày sinh</span>
            </div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              {profile?.dob
                ? new Date(profile.dob).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "Chưa cập nhật"}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span>Giới tính</span>
            </div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              {(profile?.gender && profile.gender !== "Chưa cập nhật")
                ? profile.gender
                : (gender && gender !== "Chưa cập nhật")
                ? gender
                : "Chưa cập nhật"}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Clock className="w-3.5 h-3.5 text-teal-500" />
              <span>Khung giờ ưu tiên</span>
            </div>
            <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
              {profile?.preferredTime || preferredTime || "Chưa cập nhật"}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
              <span>Liên hệ khẩn cấp</span>
            </div>
            <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
              {profile?.emergencyContact && profile.emergencyContact.length > 3
                ? profile.emergencyContact
                : "Chưa cập nhật"}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900 dark:text-white">
                Trạng thái thẻ hội viên
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                {hasPaid ? "● Đang kích hoạt tích cực" : "○ Chưa đăng ký gói tập"}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 text-white shadow-xs">
            {profile?.memberTier || (hasPaid ? "Hội viên" : "Thành viên mới")}
          </span>
        </div>
      </div>

      <EditProfileModal
        profile={profile}
        storedUser={storedUser}
        initialFullName={fullName}
        initialPhone={phone}
        initialEmail={email}
        initialDob={dob}
        initialGender={gender}
        initialPreferredTime={preferredTime}
        initialEmergencyContact={emergencyContact}
        initialFitnessGoal={fitnessGoal}
        initialFavoriteSportsStr={favoriteSportsStr}
        initialHealthNotes={healthNotes}
        initialWorkoutGoalsList={workoutGoalsList}
        isOpen={isEditModalOpen}
        saving={savingProfile}
        message={profileMsg}
        onClose={onCloseEdit}
        onSave={onSaveProfile}
      />
    </>
  );
};

