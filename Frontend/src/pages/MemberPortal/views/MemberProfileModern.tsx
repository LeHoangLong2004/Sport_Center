import React, { useState, useEffect, useMemo } from "react";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { PackageAPI } from "../../../services/packageApi";
import { getSavedMemberData } from "../services/memberData";
import { User, Receipt, KeyRound } from "lucide-react";
import type { MemberScreen } from "../types";

import { ProfileHeroCard } from "../components/profile/ProfileHeroCard";
import { ProfileStatsBadges } from "../components/profile/ProfileStatsBadges";
import { ProfileInfoTab } from "../components/profile/ProfileInfoTab";
import { ProfileInvoicesTab } from "../components/profile/ProfileInvoicesTab";
import { ProfileSecurityTab } from "../components/profile/ProfileSecurityTab";

interface Props {
  onNavigate?: (screen: MemberScreen) => void;
}

export default function MemberProfileModern({ onNavigate }: Props) {
  const { profile, loading, updateProfile, uploadAvatar } = useUserProfile();

  // Tab state: "info" | "payments" | "security"
  const [activeProfileTab, setActiveProfileTab] = useState<"info" | "payments" | "security">(() => {
    if (
      typeof window !== "undefined" &&
      (window.location.hash.includes("payments") || window.location.hash.includes("tab=payments"))
    ) {
      return "payments";
    }
    return "info";
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);

  // Profile Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Nam");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [favoriteSportsStr, setFavoriteSportsStr] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [healthNotes, setHealthNotes] = useState("");
  const [workoutGoalsList, setWorkoutGoalsList] = useState<string[]>([]);

  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const storedUser = userStr ? JSON.parse(userStr) : null;

  // Listen for tab switch events from topbar avatar menu
  useEffect(() => {
    const handleSwitch = (e: any) => {
      if (e.detail) setActiveProfileTab(e.detail);
    };
    window.addEventListener("switch-profile-tab", handleSwitch);
    return () => window.removeEventListener("switch-profile-tab", handleSwitch);
  }, []);

  // Fetch orders from API
  useEffect(() => {
    PackageAPI.getMyOrders()
      .then((orders) => {
        if (orders && orders.length > 0) {
          const mapped = orders.map((o) => ({
            id: `INV-${o.id.substring(0, 8).toUpperCase()}`,
            packageName: o.packageSnapshot?.name || "Gói dịch vụ",
            amount: o.total,
            date: o.createdAt ? new Date(o.createdAt).toLocaleDateString("vi-VN") : "Hôm nay",
            method: o.paidAt ? "Chuyển khoản QR" : "Chờ thanh toán",
            status: o.status === "paid" ? "paid" : "pending",
            referenceCode: o.id.substring(0, 8).toUpperCase(),
            startDate: o.startDate ? new Date(o.startDate).toLocaleDateString("vi-VN") : "",
            endDate: o.endDate ? new Date(o.endDate).toLocaleDateString("vi-VN") : "",
          }));
          setInvoices(mapped);
        } else {
          setInvoices([]);
        }
      })
      .catch(() => {
        setInvoices([]);
      });
  }, []);

  // Sync internal fields whenever profile loads or changes
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || storedUser?.fullName || storedUser?.name || "");
      setPhone(profile.phone || storedUser?.phoneNumber || storedUser?.phone || "");
      setEmail(profile.email || storedUser?.email || "");
      setDob(profile.dob ? profile.dob.split("T")[0] : "");
      setGender(profile.gender || "Chưa cập nhật");
      setEmergencyContact(profile.emergencyContact || "");
      setFitnessGoal(profile.fitnessGoal || "");
      setFavoriteSportsStr(profile.favoriteSports || "");
      setPreferredTime(profile.preferredTime || "");
      setHealthNotes(profile.healthNotes || "");

      const parsedGoals = profile.workoutGoals
        ? profile.workoutGoals.split(",").map((g: string) => g.trim()).filter(Boolean)
        : [];
      setWorkoutGoalsList(parsedGoals);
    }
  }, [profile]);

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      const publicUrl = await uploadAvatar(file);
      setAvatarUrl(publicUrl);
      await updateProfile({ avatarUrl: publicUrl });
      setProfileMsg({ type: "success", text: "Cập nhật ảnh đại diện thành công!" });
    } catch {
      setAvatarUrl(previousUrl);
      setProfileMsg({ type: "error", text: "Tải ảnh lên thất bại. Vui lòng thử lại." });
    } finally {
      setAvatarUploading(false);
      setTimeout(() => setProfileMsg(null), 3000);
    }
  };

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
      setPreferredTime(formData.preferredTime);
      setEmergencyContact(formData.emergencyContact);
      setFitnessGoal(formData.fitnessGoal);
      setFavoriteSportsStr(formData.favoriteSports);
      setHealthNotes(formData.healthNotes);
      setWorkoutGoalsList(
        formData.workoutGoals.split(",").map((g: string) => g.trim()).filter(Boolean)
      );

      setProfileMsg({ type: "success", text: "Lưu thay đổi thành công!" });
      setTimeout(() => {
        setIsEditModalOpen(false);
        setProfileMsg(null);
      }, 1000);
    } catch {
      setProfileMsg({ type: "error", text: "Có lỗi xảy ra khi lưu thông tin." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (
    currentPass: string,
    newPass: string,
    confirmPass: string
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 600);
    });
  };

  // User session stats computation
  const currentUserId = storedUser?.id || "default";
  const userSessions = useMemo(
    () => getSavedMemberData<any[]>(`member_sessions_${currentUserId}`, []),
    [currentUserId]
  );
  const completedSessions = userSessions.filter(
    (s: any) => s.status === "completed" || s.status === "hoàn thành" || s.attended
  );
  const completedCount = completedSessions.length;
  const totalSessionsCount = userSessions.length;

  const hasGym = userSessions.some((s: any) => s.sport === "gym");
  const hasYoga = userSessions.some((s: any) => s.sport === "yoga");
  const hasSwim = userSessions.some((s: any) => s.sport === "swimming" || s.sport === "swim");
  const hasPT = userSessions.some((s: any) => s.isPT || s.format === "coach");
  const hasPaidInvoice = invoices.some((i: any) => i.status === "paid");

  // Dynamic Badges status
  const badgesStatus = {
    streak10: completedCount >= 10,
    breakthrough20: completedCount >= 20,
    multiSport: (hasGym ? 1 : 0) + (hasYoga ? 1 : 0) + (hasSwim ? 1 : 0) >= 2,
    coachBuddy: hasPT,
    warrior50: completedCount >= 50,
    goldMember: hasPaidInvoice,
  };

  const unlockedBadgesCount = Object.values(badgesStatus).filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Redesigned Modern Clean Hero Section */}
      <ProfileHeroCard
        profile={profile}
        fullName={fullName}
        avatarUrl={avatarUrl}
        avatarUploading={avatarUploading}
        storedUser={storedUser}
        hasPaidInvoice={hasPaidInvoice}
        completedCount={completedCount}
        totalSessionsCount={totalSessionsCount}
        fitnessGoal={fitnessGoal}
        handleAvatarFileChange={handleAvatarFileChange}
        onOpenEdit={() => setIsEditModalOpen(true)}
        onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
      />

      {/* 2. Modern Segmented Navigation Tabs */}
      <div className="p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex items-center gap-1.5 max-w-fit overflow-x-auto shadow-inner">
        <button
          type="button"
          onClick={() => setActiveProfileTab("info")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeProfileTab === "info"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <User className="w-4 h-4" />
          <span>1. Hồ sơ cá nhân & Thể lực</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveProfileTab("payments")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeProfileTab === "payments"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>2. Hóa đơn & Giao dịch ({invoices.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveProfileTab("security")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeProfileTab === "security"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>3. Bảo mật & Tài khoản</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      {activeProfileTab === "info" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <ProfileStatsBadges
            completedCount={completedCount}
            totalSessionsCount={totalSessionsCount}
            badgesStatus={badgesStatus}
            unlockedBadgesCount={unlockedBadgesCount}
          />

          <ProfileInfoTab
            profile={profile}
            storedUser={storedUser}
            fullName={fullName}
            phone={phone}
            email={email}
            dob={dob}
            gender={gender}
            preferredTime={preferredTime}
            emergencyContact={emergencyContact}
            fitnessGoal={fitnessGoal}
            favoriteSportsStr={favoriteSportsStr}
            healthNotes={healthNotes}
            workoutGoalsList={workoutGoalsList}
            invoices={invoices}
            isEditModalOpen={isEditModalOpen}
            savingProfile={savingProfile}
            profileMsg={profileMsg}
            onOpenEdit={() => setIsEditModalOpen(true)}
            onCloseEdit={() => setIsEditModalOpen(false)}
            onSaveProfile={handleSaveProfile}
          />
        </div>
      )}

      {activeProfileTab === "payments" && (
        <ProfileInvoicesTab
          invoices={invoices}
          setInvoices={setInvoices}
          profile={profile}
          storedUser={storedUser}
          phone={phone}
          email={email}
          fullName={fullName}
        />
      )}

      {activeProfileTab === "security" && (
        <ProfileSecurityTab
          isPasswordModalOpen={isPasswordModalOpen}
          setIsPasswordModalOpen={setIsPasswordModalOpen}
          onSavePassword={handleSavePassword}
        />
      )}
    </div>
  );
}
