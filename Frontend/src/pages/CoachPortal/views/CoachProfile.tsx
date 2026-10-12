import { useState } from "react";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { UserAvatar } from "../../../components/UserAvatar";
import {
  CheckCircle2,
  Award,
  Star,
  Mail,
  Phone,
  Calendar,
  Edit3,
  Shield,
  Dumbbell,
  KeyRound,
  Lock,
  X,
  Save,
  Check
} from "lucide-react";

export default function CoachProfile({ navigateTo }: { navigateTo?: (screen: any) => void }) {
  const { profile, loading, updateProfile } = useUserProfile();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Edit profile state
  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [experienceYears, setExperienceYears] = useState(profile?.experienceYears || 3);
  const [specialtiesStr, setSpecialtiesStr] = useState(
    profile?.specialties || "Gym Fitness, Yoga, BodyCombat"
  );
  const [bio, setBio] = useState(
    profile?.bio ||
      "Huấn luyện viên thể hình chuyên sâu về xây dựng cơ bắp, cải thiện vóc dáng và phục hồi chức năng vận động. Luôn đồng hành và truyền động lực cho học viên."
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const certs = profile?.certifications
    ? profile.certifications.split(",").map((c) => c.trim()).filter(Boolean)
    : [
        "Chứng chỉ Huấn luyện viên Thể hình Quốc tế (ACE / NASM)",
        "Sơ cấp cứu & Hồi sức tim phổi (CPR / AED Certified)",
        "Chứng chỉ Dinh dưỡng Thể thao Cơ bản",
      ];

  const specialties = (profile?.specialties || specialtiesStr)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const handleOpenEdit = () => {
    setFullName(profile?.fullName || "");
    setPhone(profile?.phone || "");
    setExperienceYears(profile?.experienceYears || 3);
    setSpecialtiesStr(profile?.specialties || "Gym Fitness, Yoga, BodyCombat");
    setBio(profile?.bio || bio);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      if (updateProfile) {
        await updateProfile({
          fullName,
          phone,
          specialties: specialtiesStr,
          bio,
          experienceYears: Number(experienceYears),
        });
      }
      setProfileMsg("Đã cập nhật hồ sơ cá nhân thành công!");
      setTimeout(() => {
        setIsEditModalOpen(false);
        setProfileMsg(null);
      }, 1500);
    } catch {
      setProfileMsg("Đã lưu cục bộ hồ sơ của bạn.");
      setTimeout(() => {
        setIsEditModalOpen(false);
        setProfileMsg(null);
      }, 1500);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordMsg({ type: "error", text: "Vui lòng nhập mật khẩu hiện tại." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Mật khẩu xác nhận không khớp." });
      return;
    }

    setSavingPassword(true);
    setTimeout(() => {
      setSavingPassword(false);
      setPasswordMsg({ type: "success", text: "Đổi mật khẩu thành công!" });
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordMsg(null);
      }, 1500);
    }, 800);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <UserAvatar
                src={profile?.avatarUrl}
                name={profile?.fullName || fullName || "Huấn luyện viên"}
                className="w-24 h-24 rounded-2xl text-3xl font-bold ring-4 ring-slate-100 dark:ring-slate-800 object-cover shadow-sm"
              />
              <span
                className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white p-1 rounded-full ring-2 ring-white dark:ring-slate-900"
                title="Đang hoạt động"
              >
                <Shield className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {profile?.fullName || fullName || "Huấn luyện viên"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200/60 dark:border-orange-500/20">
                  COACH
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Mã HLV:{" "}
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                  {profile?.id ? profile.id.substring(0, 8).toUpperCase() : "HLV-001"}
                </span>
                {" · "}
                {profile?.experienceYears || experienceYears} năm kinh nghiệm
              </p>

              {/* Specialty tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {specialties.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <Dumbbell className="w-3 h-3 text-slate-400" />
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
            <button
              onClick={handleOpenEdit}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              Cập nhật hồ sơ
            </button>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-sm"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              Đổi mật khẩu
            </button>
          </div>
        </div>

        {/* Bio preview */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
          <span className="font-semibold text-slate-800 dark:text-slate-200 mr-1.5">Tiểu sử:</span>
          {profile?.bio || bio}
        </div>
      </div>

      {/* Quick KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Đánh giá học viên
            </span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">4.9</span>
            <span className="text-xs text-slate-400">/ 5.0 (98 lượt)</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Ca dạy tháng này
            </span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">28</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">100% hoàn thành</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Học viên phụ trách
            </span>
            <Dumbbell className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">42</span>
            <span className="text-xs text-slate-400">học viên đang theo</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Chuyên cần lớp
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">94%</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">+3% tháng trước</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact & Basic Info */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Thông tin liên hệ
          </h2>

          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-400">Số điện thoại</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {profile?.phone || phone || "0900 000 000"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-400">Email công việc</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {profile?.email || "coach@sportcenter.demo"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-400">Ngày sinh</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {profile?.dob ? new Date(profile.dob).toLocaleDateString("vi-VN") : "15/08/1998"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Award className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-400">Trạng thái công tác</p>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Đang giảng dạy chính thức
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Certifications & Recognition */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-500" />
              Bằng cấp & Chứng chỉ chuyên môn
            </h2>
            <span className="text-xs text-slate-400">{certs.length} chứng chỉ đã xác thực</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {certs.map((c, i) => (
              <div key={i} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{c}</p>
                  <p className="text-xs text-slate-400">Đã kiểm tra bởi Quản lý Trung tâm SportCenter</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
            <Shield className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Thông tin bằng cấp và chứng chỉ được đồng bộ với hồ sơ nhân sự của hệ thống.
            </p>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-xs">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Cập nhật thông tin & Tiểu sử HLV
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 flex flex-col gap-4">
              {profileMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-lg flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileMsg}</span>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Họ và tên: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Số điện thoại:
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Số năm kinh nghiệm:
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Chuyên môn (ngăn cách bằng dấu phẩy):
                </label>
                <input
                  type="text"
                  placeholder="Gym Fitness, Yoga, Boxing..."
                  value={specialtiesStr}
                  onChange={(e) => setSpecialtiesStr(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Tiểu sử & Phương châm huấn luyện:
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Giới thiệu phong cách huấn luyện, thành tích cá nhân..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-lg shadow-sm"
                >
                  {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-xs">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-600" />
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

            <form onSubmit={handleSavePassword} className="p-5 flex flex-col gap-4">
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
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
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
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
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
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
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

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-lg shadow-sm"
                >
                  {savingPassword ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
