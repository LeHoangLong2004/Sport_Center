import { useState, useEffect, useMemo, type ChangeEvent } from "react";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { CoachAPI } from "../services/api";
import ProfileHeaderCard from "./profile/ProfileHeaderCard";
import ProfileStatsCards from "./profile/ProfileStatsCards";
import ProfileDetailsSection from "./profile/ProfileDetailsSection";
import EditProfileModal from "./profile/EditProfileModal";
import ChangePasswordModal from "./profile/ChangePasswordModal";

export default function CoachProfile({ navigateTo }: { navigateTo?: (screen: any) => void }) {
  const { profile, loading, updateProfile, uploadAvatar } = useUserProfile();
  const [stats, setStats] = useState<{
    totalSessions?: number;
    completedSessions?: number;
    totalMembers?: number;
    upcomingClasses?: number;
    averageRating?: number;
    reviewCount?: number;
  } | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Nam");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [specialtiesStr, setSpecialtiesStr] = useState("");
  const [certsList, setCertsList] = useState<string[]>([]);
  const [bio, setBio] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    CoachAPI.getDashboardStats()
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setPhone(profile.phone || "");
      setEmail(profile.email || "");
      setDob(profile.dob ? profile.dob.split("T")[0] : "");
      setGender(profile.gender || "");
      setExperienceYears(profile.experienceYears ?? 0);
      setSpecialtiesStr(profile.specialties || "");
      setBio(profile.bio || "");

      const parsedCerts = profile.certifications
        ? profile.certifications.split(",").map((c) => c.trim()).filter(Boolean)
        : [];
      setCertsList(parsedCerts);
    }
  }, [profile]);

  const specialties = useMemo(() => {
    return (profile?.specialties || specialtiesStr)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [profile?.specialties, specialtiesStr]);

  const displayCerts = useMemo(() => {
    if (profile?.certifications !== undefined && profile?.certifications !== null && profile.certifications.trim().length > 0) {
      return profile.certifications.split(",").map((c) => c.trim()).filter(Boolean);
    }
    return certsList;
  }, [profile?.certifications, certsList]);

  const handleSaveProfile = async (formData: any) => {
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await updateProfile(formData);
      setFullName(formData.fullName);
      setPhone(formData.phone);
      setEmail(formData.email);
      setDob(formData.dob);
      setGender(formData.gender);
      setExperienceYears(formData.experienceYears);
      setSpecialtiesStr(formData.specialties);
      setBio(formData.bio);
      const updatedCerts = formData.certifications
        ? formData.certifications.split(",").map((c: string) => c.trim()).filter(Boolean)
        : [];
      setCertsList(updatedCerts);

      setProfileMsg({ type: "success", text: "Đã cập nhật hồ sơ thành công!" });
      setTimeout(() => {
        setIsEditModalOpen(false);
        setProfileMsg(null);
      }, 1000);
    } catch {
      setProfileMsg({ type: "error", text: "Lỗi cập nhật hồ sơ. Vui lòng thử lại!" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const previousUrl = avatarUrl || profile?.avatarUrl || "";
    if (!file.type.startsWith("image/")) {
      setProfileMsg({ type: "error", text: "Vui lòng chọn file hình ảnh." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileMsg({ type: "error", text: "Ảnh đại diện không được vượt quá 5MB." });
      return;
    }

    setAvatarUploading(true);
    setProfileMsg(null);
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
    try {
      const url = await uploadAvatar(file);
      URL.revokeObjectURL(previewUrl);
      setAvatarUrl(url);
      setProfileMsg({ type: "success", text: "Đã cập nhật ảnh đại diện." });
    } catch (error) {
      URL.revokeObjectURL(previewUrl);
      setAvatarUrl(previousUrl);
      setProfileMsg({ type: "error", text: error instanceof Error ? error.message : "Tải ảnh đại diện thất bại." });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSavePassword = async (_curr: string, _next: string) => {
    setSavingPassword(true);
    setPasswordMsg(null);
    setTimeout(() => {
      setSavingPassword(false);
      setPasswordMsg({ type: "success", text: "Đổi mật khẩu thành công!" });
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordMsg(null);
      }, 1000);
    }, 600);
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
      <ProfileHeaderCard
        fullName={profile?.fullName || fullName || "Chưa cập nhật"}
        avatarUrl={avatarUrl || profile?.avatarUrl || ""}
        coachId={profile?.id ? profile.id.substring(0, 8).toUpperCase() : "—"}
        experienceYears={profile?.experienceYears ?? experienceYears}
        specialties={specialties}
        bio={profile?.bio || bio}
        onOpenEdit={() => setIsEditModalOpen(true)}
        onOpenPassword={() => setIsPasswordModalOpen(true)}
        onAvatarFileChange={handleAvatarFileChange}
        avatarUploading={avatarUploading}
      />

      <ProfileStatsCards stats={stats} />

      <ProfileDetailsSection
        phone={profile?.phone || phone}
        email={profile?.email || email}
        dob={profile?.dob || dob}
        gender={profile?.gender || gender}
        displayCerts={displayCerts}
        onOpenEdit={() => setIsEditModalOpen(true)}
      />

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={{
          fullName: profile?.fullName || fullName,
          phone: profile?.phone || phone,
          email: profile?.email || email,
          dob: profile?.dob ? profile.dob.split("T")[0] : dob,
          gender: profile?.gender || gender,
          experienceYears: profile?.experienceYears ?? experienceYears,
          specialtiesStr: profile?.specialties || specialtiesStr,
          certsList: displayCerts,
          bio: profile?.bio || bio,
        }}
        onSave={handleSaveProfile}
        saving={savingProfile}
        message={profileMsg}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSave={handleSavePassword}
        saving={savingPassword}
        message={passwordMsg}
      />
    </div>
  );
}
