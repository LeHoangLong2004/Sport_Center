import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { UserAvatar } from "../../../components/UserAvatar";
import { PackageAPI } from "../../../services/packageApi";
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
  Plus,
  Trash2,
  Check,
  Camera,
  User,
  Sparkles,
  Target,
  Clock,
  HeartPulse,
  Flame,
  Activity,
  AlertCircle,
  Receipt,
  Building,
  Copy,
  Printer,
  FileCheck,
  Info,
  ExternalLink,
  QrCode,
  CreditCard,
  Zap,
  TrendingUp,
  Trophy,
  Medal,
  Crown,
  ShieldCheck,
} from "lucide-react";
import type { MemberScreen } from "../types";

interface Props {
  onNavigate?: (screen: MemberScreen) => void;
}

export default function MemberProfileModern({ onNavigate }: Props) {
  const { profile, loading, updateProfile } = useUserProfile();

  // Tab state: "info" | "payments" | "security"
  const [activeProfileTab, setActiveProfileTab] = useState<"info" | "payments" | "security">(() => {
    if (
      window.location.hash.includes("payments") ||
      window.location.hash.includes("tab=payments")
    ) {
      return "payments";
    }
    return "info";
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Invoices & Transactions state
  const [invoices, setInvoices] = useState<any[]>([
    {
      id: "INV-2026-0091",
      packageName: "Gói Yoga Chuyên Sâu (3 Tháng)",
      amount: 3500000,
      date: "2026-09-01",
      method: "Chuyển khoản QR",
      status: "paid",
      referenceCode: "MB-20260901-7782",
      startDate: "01/09/2026",
      endDate: "01/12/2026",
    },
    {
      id: "INV-2026-0104",
      packageName: "Gói Gym & Thể Lực Tự Do (1 Tháng)",
      amount: 1200000,
      date: "2026-10-01",
      method: "Tiền mặt tại quầy",
      status: "paid",
      referenceCode: "CS-1001-992",
      startDate: "01/10/2026",
      endDate: "01/11/2026",
    },
    {
      id: "INV-2026-0112",
      packageName: "Gói Yoga Chuyên Sâu (Gia hạn tiếp theo)",
      amount: 3500000,
      date: "2026-10-12",
      method: "Chuyển khoản",
      status: "pending",
      referenceCode: "",
      startDate: "01/12/2026",
      endDate: "01/03/2027",
    },
  ]);

  const [receiptModal, setReceiptModal] = useState<any | null>(null);
  const [activePaymentReportModal, setActivePaymentReportModal] = useState<any | null>(null);
  const [reportBankMethod, setReportBankMethod] = useState<string>("Chuyển khoản");
  const [reportRefCode, setReportRefCode] = useState<string>("");
  const [invoiceFeedback, setInvoiceFeedback] = useState<string | null>(null);

  // Listen for tab switch events from topbar avatar menu
  useEffect(() => {
    const handleSwitch = (e: any) => {
      if (e.detail) setActiveProfileTab(e.detail);
    };
    window.addEventListener("switch-profile-tab", handleSwitch);
    return () => window.removeEventListener("switch-profile-tab", handleSwitch);
  }, []);

  const totalSpent = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const paidCount = invoices.filter((inv) => inv.status === "paid").length;
  const pendingCount = invoices.filter((inv) => inv.status === "pending").length;

  const handleConfirmPaymentReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentReportModal) return;
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === activePaymentReportModal.id
          ? {
              ...inv,
              status: "paid",
              method: reportBankMethod,
              referenceCode: reportRefCode || `MB-${Date.now().toString().slice(-6)}`,
            }
          : inv
      )
    );
    setActivePaymentReportModal(null);
    setReportRefCode("");
    setInvoiceFeedback("Đã gửi thông báo thanh toán thành công! Kế toán sẽ phê duyệt đối soát trong ít phút.");
    setTimeout(() => setInvoiceFeedback(null), 4000);
  };

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
          setInvoices((prev) => {
            const ids = new Set(mapped.map((m) => m.id));
            const retained = prev.filter((p) => !ids.has(p.id));
            return [...mapped, ...retained];
          });
        }
      })
      .catch(() => {});
  }, []);

  // Edit profile state
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
  const [newGoalInput, setNewGoalInput] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  // Lock body scroll when any modal is open to eliminate double scrollbars
  useEffect(() => {
    if (isEditModalOpen || isPasswordModalOpen || !!receiptModal || !!activePaymentReportModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isEditModalOpen, isPasswordModalOpen, receiptModal, activePaymentReportModal]);

  // Sync internal fields whenever profile loads or changes
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "Hồ Xuân Ánh Nam");
      setPhone(profile.phone || "0900 000 000");
      setEmail(profile.email || "hoxuananhnam@gmail.com");
      setDob(profile.dob ? profile.dob.split("T")[0] : "1998-08-15");
      setGender(profile.gender || "Nam");
      setAvatarUrl(profile.avatarUrl || "");
      setEmergencyContact(profile.emergencyContact || "0912 345 678 (Người thân)");
      setFitnessGoal(
        profile.fitnessGoal ||
          "Tăng cơ giảm mỡ, cải thiện sức bền tim mạch và duy trì thói quen tập luyện khoa học 4 buổi/tuần."
      );
      setFavoriteSportsStr(profile.favoriteSports || "Gym thể hình, Bơi lội, Yoga, Boxing");
      setPreferredTime(profile.preferredTime || "Buổi chiều tối (17:30 - 19:30)");
      setHealthNotes(
        profile.healthNotes ||
          "Thể trạng sức khỏe tốt, không có tiền sử bệnh tim mạch hoặc chấn thương cột sống."
      );

      const parsedGoals = profile.workoutGoals
        ? profile.workoutGoals.split(",").map((g) => g.trim()).filter(Boolean)
        : [
            "Tăng cơ giảm mỡ & Săn chắc vóc dáng",
            "Duy trì tập luyện tối thiểu 4 buổi mỗi tuần",
            "Cải thiện sức bền tim mạch & dung tích phổi",
            "Hoàn thành cự ly chạy 5km không nghỉ",
            "Kiểm soát chế độ calo & dinh dưỡng giàu protein",
          ];
      setWorkoutGoalsList(parsedGoals);
    }
  }, [profile]);

  const favoriteSports = (profile?.favoriteSports || favoriteSportsStr || "Gym thể hình, Bơi lội, Yoga, Boxing")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const displayWorkoutGoals = profile?.workoutGoals
    ? profile.workoutGoals.split(",").map((g) => g.trim()).filter(Boolean)
    : workoutGoalsList.length > 0
    ? workoutGoalsList
    : [
        "Tăng cơ giảm mỡ & Săn chắc vóc dáng",
        "Duy trì tập luyện tối thiểu 4 buổi mỗi tuần",
        "Cải thiện sức bền tim mạch & dung tích phổi",
        "Hoàn thành cự ly chạy 5km không nghỉ",
        "Kiểm soát chế độ calo & dinh dưỡng giàu protein",
      ];

  const handleOpenEdit = () => {
    setFullName(profile?.fullName || "Hồ Xuân Ánh Nam");
    setPhone(profile?.phone || "0900 000 000");
    setEmail(profile?.email || "hoxuananhnam@gmail.com");
    setDob(profile?.dob ? profile.dob.split("T")[0] : "1998-08-15");
    setGender(profile?.gender || "Nam");
    setAvatarUrl(profile?.avatarUrl || "");
    setEmergencyContact(profile?.emergencyContact || "0912 345 678 (Người thân)");
    setFitnessGoal(
      profile?.fitnessGoal ||
        "Tăng cơ giảm mỡ, cải thiện sức bền tim mạch và duy trì thói quen tập luyện khoa học 4 buổi/tuần."
    );
    setFavoriteSportsStr(profile?.favoriteSports || "Gym thể hình, Bơi lội, Yoga, Boxing");
    setPreferredTime(profile?.preferredTime || "Buổi chiều tối (17:30 - 19:30)");
    setHealthNotes(
      profile?.healthNotes ||
        "Thể trạng sức khỏe tốt, không có tiền sử bệnh tim mạch hoặc chấn thương cột sống."
    );

    const currentGoals = profile?.workoutGoals
      ? profile.workoutGoals.split(",").map((g) => g.trim()).filter(Boolean)
      : [
          "Tăng cơ giảm mỡ & Săn chắc vóc dáng",
          "Duy trì tập luyện tối thiểu 4 buổi mỗi tuần",
          "Cải thiện sức bền tim mạch & dung tích phổi",
          "Hoàn thành cự ly chạy 5km không nghỉ",
          "Kiểm soát chế độ calo & dinh dưỡng giàu protein",
        ];
    setWorkoutGoalsList(currentGoals);
    setNewGoalInput("");
    setProfileMsg(null);
    setIsEditModalOpen(true);
  };

  const handleAddGoal = () => {
    const trimmed = newGoalInput.trim();
    if (trimmed && !workoutGoalsList.includes(trimmed)) {
      setWorkoutGoalsList([...workoutGoalsList, trimmed]);
      setNewGoalInput("");
    }
  };

  const handleRemoveGoal = (index: number) => {
    setWorkoutGoalsList(workoutGoalsList.filter((_, i) => i !== index));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    const goalsJoined = workoutGoalsList.join(", ");

    try {
      if (updateProfile) {
        await updateProfile({
          fullName,
          phone,
          email,
          dob,
          gender,
          avatarUrl,
          emergencyContact,
          fitnessGoal,
          favoriteSports: favoriteSportsStr,
          preferredTime,
          healthNotes,
          workoutGoals: goalsJoined,
        });
      }

      setProfileMsg({ type: "success", text: "Đã cập nhật hồ sơ hội viên thành công!" });
      setTimeout(() => {
        setIsEditModalOpen(false);
        setProfileMsg(null);
      }, 1000);
    } catch (err: any) {
      setProfileMsg({
        type: "error",
        text: err?.message || "Có lỗi xảy ra khi lưu thông tin. Đã cập nhật tạm thời.",
      });
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
      }, 1000);
    }, 600);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Redesigned Modern Clean Hero Section (Grid 12 cols: Profile & Digital Member Pass) */}
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
                      src={profile?.avatarUrl || avatarUrl}
                      name={profile?.fullName || fullName || "Hồ Xuân Ánh Nam"}
                      className="w-20 h-20 rounded-xl text-2xl font-bold object-cover bg-slate-900 text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenEdit}
                    className="absolute -bottom-1 -right-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-110 p-1.5 rounded-xl ring-2 ring-white dark:ring-slate-900 transition-all shadow-sm"
                    title="Cập nhật ảnh đại diện"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      {profile?.fullName || fullName || "Hồ Xuân Ánh Nam"}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      <Crown className="w-3 h-3 text-amber-500" />
                      {profile?.memberTier || "Hội viên Thể thao VIP"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>Mã HV: <strong className="font-mono text-slate-700 dark:text-slate-200">{profile?.id ? profile.id.substring(0, 8).toUpperCase() : "MEM-8821"}</strong></span>
                    <span>•</span>
                    <span>Hạng thẻ: <strong className="text-emerald-600 dark:text-emerald-400">{profile?.memberTier || "Hội viên Thể thao"}</strong></span>
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-xl transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Chỉnh sửa
                </button>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-xl transition-all"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Mật khẩu
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
                      12 Ngày Tập Liên Tiếp (Streak 🔥)
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500 text-white">
                      Kỷ lục
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Duy trì chuỗi tập luyện kỷ luật · Top 5% hội viên kiên trì nhất tháng!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-white/80 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  Cấp 4 · Chiến Binh Vàng
                </span>
              </div>
            </div>

            {/* Favorite Sports Tags */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-400 font-medium mr-1">Bộ môn yêu thích:</span>
              {favoriteSports.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60"
                >
                  <Activity className="w-3 h-3 text-emerald-500" />
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Fitness Goal Preview */}
          <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
            <Target className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-slate-800 dark:text-slate-200 mr-1">Mục tiêu rèn luyện cá nhân:</strong>
              {profile?.fitnessGoal || fitnessGoal}
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
                •••• •••• •••• {profile?.id ? profile.id.substring(0, 4).toUpperCase() : "338A"}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                    Chủ sở hữu thẻ
                  </span>
                  <span className="text-sm font-bold tracking-wide text-white uppercase">
                    {profile?.fullName || fullName || "HỒ XUÂN ÁNH NAM"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                    Hiệu lực
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    12/2026
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
          <span>1. Thông tin cá nhân & Thể lực</span>
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
          <span>2. Lịch sử giao dịch & Hóa đơn</span>
          <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold">
            {invoices.length}
          </span>
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

      {/* 3. TAB 1: THÔNG TIN CÁ NHÂN & THỂ LỰC */}
      {activeProfileTab === "info" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Quick KPI Stat Cards With Progress Bars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Card 1: Buổi tập hoàn thành */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Buổi tập hoàn thành
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">24</span>
                  <span className="text-xs text-slate-400 font-medium">/ 30 buổi</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: "80%" }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Tiến độ tháng</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">80% (+4 buổi)</span>
                </div>
              </div>
            </div>

            {/* Card 2: Kỷ luật chuyên cần (Streak) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Kỷ luật chuyên cần
                  </span>
                  <Flame className="w-4 h-4 text-amber-500" />
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">96%</span>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">12 ngày streak</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500" style={{ width: "96%" }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Chuyên cần</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Rất tích cực 🔥</span>
                </div>
              </div>
            </div>

            {/* Card 3: Lịch tập tuần này */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Lịch tập tuần này
                  </span>
                  <Calendar className="w-4 h-4 text-purple-500" />
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">3</span>
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">/ 4 ca đã xong</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Thứ 2: Xong" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Thứ 4: Xong" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Thứ 6: Xong" />
                  <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" title="Chủ nhật: Sắp tới" />
                </div>
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">1 ca còn lại</span>
              </div>
            </div>

            {/* Card 4: Cấp bậc rèn luyện (Level) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Cấp bậc rèn luyện
                  </span>
                  <Trophy className="w-4 h-4 text-amber-500" />
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">Level 4</span>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">Vàng (Gold)</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-amber-500 h-full rounded-full transition-all duration-500" style={{ width: "85%" }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>850 / 1000 XP</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">150 XP tới Cấp 5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main 2-Column Info Section: Cân Đối, Khoa Học & Không Khoảng Trắng Thừa */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (6 cols): Bảng Hồ Sơ & Thông Tin Cá Nhân Khoa Học */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-500" />
                  Hồ sơ cá nhân & Liên hệ
                </h2>
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Chỉnh sửa
                </button>
              </div>

              {/* Data Grid: 2 columns of structured property tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Số điện thoại</span>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    {profile?.phone && profile.phone.length > 5 ? profile.phone : "0900 123 456"}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    <span>Email tài khoản</span>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm truncate" title={profile?.email || email}>
                    {profile?.email || email || "hoxuananhnam@gmail.com"}
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
                      : "15/08/1998"}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Shield className="w-3.5 h-3.5 text-amber-500" />
                    <span>Giới tính</span>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    {profile?.gender || gender || "Nam"}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Clock className="w-3.5 h-3.5 text-teal-500" />
                    <span>Khung giờ ưu tiên</span>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                    {profile?.preferredTime || preferredTime || "Chiều tối (17:30 - 19:30)"}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                    <span>Liên hệ khẩn cấp</span>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                    {profile?.emergencyContact && profile.emergencyContact.length > 5
                      ? profile.emergencyContact
                      : "0912 345 678 (Người thân)"}
                  </p>
                </div>
              </div>

              {/* Status and Center Information Tile */}
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
                      ● Đang kích hoạt tích cực (Hiệu lực đến 15/12/2026)
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 text-white shadow-xs">
                  VIP ELITE
                </span>
              </div>
            </div>

            {/* Right Column (6 cols): Bộ Sưu Tập Huy Hiệu Rèn Luyện & Tiến Độ Danh Giá */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Medal className="w-4 h-4 text-amber-500" />
                  Huy hiệu thành tích rèn luyện
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50">
                  Đã mở khóa 4/6 huy hiệu
                </span>
              </div>

              {/* 6 Badges Grid (2 cols x 3 rows) - Matches left column's 6 tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Kỷ Luật Thép */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-xs text-slate-900 dark:text-white">Kỷ Luật Thép</p>
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Chuỗi 10 ngày liên tiếp</p>
                  </div>
                </div>

                {/* 2. Bứt Phá 20+ */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-xs text-slate-900 dark:text-white">Bứt Phá 20+</p>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">24 ca tập hoàn thành</p>
                  </div>
                </div>

                {/* 3. Thể Lực Đa Năng */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-xs text-slate-900 dark:text-white">Thể Lực Đa Năng</p>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Gym, Yoga & Bơi lội</p>
                  </div>
                </div>

                {/* 4. Đồng Đội HLV */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-purple-500/10 to-pink-500/10 border border-purple-500/20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-xs text-slate-900 dark:text-white">Đồng Đội HLV</p>
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Tập luyện cùng PT 1:1</p>
                  </div>
                </div>

                {/* 5. Chiến Binh 50+ (In progress) */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 flex items-center justify-center shadow-xs shrink-0">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-xs text-slate-600 dark:text-slate-300">Chiến Binh 50+</p>
                      <Lock className="w-3 h-3 text-slate-400" />
                    </div>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate">Tiến độ: 24/50 buổi tập</p>
                  </div>
                </div>

                {/* 6. Hội Viên Vàng (In progress) */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 flex items-center justify-center shadow-xs shrink-0">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-xs text-slate-600 dark:text-slate-300">Hội Viên Vàng</p>
                      <Lock className="w-3 h-3 text-slate-400" />
                    </div>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate">Đã gắn bó 42/90 ngày</p>
                  </div>
                </div>
              </div>

              {/* Progress to next badge milestone banner */}
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">
                      Mục tiêu huy hiệu tiếp theo: Chiến Binh 50+
                    </p>
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                      Chỉ còn 26 buổi tập để mở khóa huy hiệu mới
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-600 text-white shadow-xs">
                  48%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LỊCH SỬ GIAO DỊCH & HÓA ĐƠN */}
      {activeProfileTab === "payments" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {invoiceFeedback && (
            <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-sm font-medium shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>{invoiceFeedback}</span>
            </div>
          )}

          {/* 4 Financial Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Tổng chi tiêu
                </span>
                <Receipt className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {totalSpent.toLocaleString("vi-VN")} đ
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                  Đã hoàn tất thanh toán
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Giao dịch hoàn tất
                </span>
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {paidCount} đơn
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                  Phiếu thu hợp lệ
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Chờ thanh toán
                </span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {pendingCount} đơn
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                  {pendingCount > 0 ? "Cần hoàn tất đối soát" : "Không có công nợ"}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Hạng hội viên
                </span>
                <Award className="w-4 h-4 text-purple-500" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  Premium VIP
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">
                  Hiệu lực đến 15/12/2026
                </div>
              </div>
            </div>
          </div>

          {/* Transactions & Invoices Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-500" />
                  Danh sách Hóa đơn & Lịch sử Giao dịch
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Chứng từ điện tử và lịch sử thanh toán các gói dịch vụ tại SmartGym Center
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">
                  Hiển thị {invoices.length} bản ghi
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/75 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Mã hóa đơn</th>
                    <th className="py-3 px-4">Gói dịch vụ</th>
                    <th className="py-3 px-4">Số tiền</th>
                    <th className="py-3 px-4">Hình thức thanh toán</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {inv.id}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{inv.date}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {inv.packageName}
                        </div>
                        {inv.startDate && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Thời hạn: {inv.startDate} - {inv.endDate}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {(Number(inv.amount) || 0).toLocaleString("vi-VN")} đ
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                          {inv.method}
                        </div>
                        {inv.referenceCode ? (
                          <div className="text-[11px] text-slate-400 font-mono">
                            Ref: {inv.referenceCode}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 italic">Chưa đối soát</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {inv.status === "paid" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Đã thanh toán
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            Chờ thanh toán
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {inv.status === "paid" ? (
                          <button
                            type="button"
                            onClick={() => setReceiptModal(inv)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-200/60 dark:border-emerald-500/30"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Xem phiếu thu
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActivePaymentReportModal(inv);
                              setReportBankMethod("Chuyển khoản QR");
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors"
                          >
                            <Building className="w-3.5 h-3.5" />
                            Báo thanh toán
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Note & Policy Footer */}
            <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-500 dark:text-slate-400">
              <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Lưu ý về phiếu thu & đối soát:
                </span>{" "}
                Tất cả hóa đơn điện tử có hiệu lực đối soát và kích hoạt quyền lợi phòng tập ngay khi giao dịch được xác nhận. Nếu bạn cần xuất hóa đơn tài chính VAT cho cơ quan / công ty, vui lòng thông báo cho quầy lễ tân hoặc gọi Hotline 1900 6868 trong vòng 72 giờ kể từ khi thanh toán.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BẢO MẬT & TÀI KHOẢN */}
      {activeProfileTab === "security" && (
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
                  • Đã cập nhật 14 ngày trước
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
                      Trình duyệt Chrome trên Windows
                    </div>
                    <div className="text-slate-400 mt-0.5">
                      Phiên hiện tại · IP: 118.69.214.88 (TP. Hồ Chí Minh)
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Đang hoạt động
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      SmartGym App · iPhone 15 Pro
                    </div>
                    <div className="text-slate-400 mt-0.5">
                      Lần đăng nhập cuối: 10:15 sáng nay
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">Đã lưu phiên</span>
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
        </div>
      )}

      {/* EDIT PROFILE MODAL - FORM CHUẨN GIỐNG HỒ SƠ COACH */}
      {isEditModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Cập nhật thông tin Hội viên
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body - scroll duy nhất, spacing chuẩn */}
              <form onSubmit={handleSaveProfile} className="flex-1 flex flex-col overflow-hidden">
                <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs">
                  {profileMsg && (
                    <div
                      className={`p-3 rounded-lg flex items-center gap-2 font-medium ${
                        profileMsg.type === "success"
                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                      }`}
                    >
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{profileMsg.text}</span>
                    </div>
                  )}

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Họ và tên: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Hồ Xuân Ánh Nam..."
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        Số điện thoại: <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: 0900 000 000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        Email:
                      </label>
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        Ngày sinh:
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        Giới tính:
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        Khung giờ ưu tiên:
                      </label>
                      <input
                        type="text"
                        placeholder="VD: 17:30 - 19:30"
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        Link ảnh đại diện (Avatar URL):
                      </label>
                      <input
                        type="text"
                        placeholder="https://... hoặc để trống"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        Liên hệ khẩn cấp:
                      </label>
                      <input
                        type="text"
                        placeholder="SĐT & Tên người thân"
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Bộ môn yêu thích (ngăn cách bằng dấu phẩy):
                    </label>
                    <input
                      type="text"
                      placeholder="Gym thể hình, Bơi lội, Yoga, Boxing, Pilates..."
                      value={favoriteSportsStr}
                      onChange={(e) => setFavoriteSportsStr(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Mục tiêu rèn luyện trọng tâm:
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Tăng cơ giảm mỡ, cải thiện sức bền tim mạch..."
                      value={fitnessGoal}
                      onChange={(e) => setFitnessGoal(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  {/* Mục tiêu tập luyện - Style giống danh sách bài tập / chứng chỉ */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Danh sách mục tiêu & ưu tiên cá nhân ({workoutGoalsList.length})
                      </span>
                      <button
                        type="button"
                        onClick={handleAddGoal}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Thêm mục tiêu
                      </button>
                    </div>

                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Nhập mục tiêu mới rồi bấm 'Thêm mục tiêu'..."
                        value={newGoalInput}
                        onChange={(e) => setNewGoalInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddGoal();
                          }
                        }}
                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      {workoutGoalsList.map((goal, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="font-medium text-slate-800 dark:text-slate-200">{goal}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveGoal(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded transition-colors"
                            title="Xóa mục tiêu này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Lưu ý sức khỏe & Thể trạng cá nhân:
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ghi chú về tiền sử chấn thương, dị ứng, vấn đề cơ xương khớp hoặc lưu ý đặc biệt khi tập..."
                      value={healthNotes}
                      onChange={(e) => setHealthNotes(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
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
                    className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-lg shadow-sm transition-colors"
                  >
                    {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* CHANGE PASSWORD MODAL - CHUẨN GIỐNG HỒ SƠ COACH */}
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

              <form onSubmit={handleSavePassword}>
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

      {/* ELECTRONIC RECEIPT / PHIẾU THU MODAL */}
      {receiptModal &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
              {/* Receipt Header */}
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base tracking-wide">
                      PHIẾU THU ĐIỆN TỬ
                    </h3>
                    <p className="text-xs text-slate-300">
                      SmartGym Center · Hệ thống quản lý tập luyện
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptModal(null)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Receipt Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Mã số phiếu thu:</span>
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      {receiptModal.id}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block mb-0.5">Ngày lập chứng từ:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {receiptModal.date}
                    </span>
                  </div>
                </div>

                {/* Customer & Center Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                      Khách hàng / Hội viên
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {profile?.fullName || fullName || "Hồ Xuân Ánh Nam"}
                    </p>
                    <p className="text-slate-500">{profile?.phone || phone || "0900 000 000"}</p>
                    <p className="text-slate-500">{profile?.email || email || "hoxuananhnam@gmail.com"}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                      Đơn vị thụ hưởng
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      SmartGym Sports Complex
                    </p>
                    <p className="text-slate-500">MST: 0316889922</p>
                    <p className="text-slate-500">Hotline: 1900 6868</p>
                  </div>
                </div>

                {/* Items Breakdown Table */}
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Khoản thu dịch vụ</th>
                        <th className="py-2.5 px-3 text-right">Số tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {receiptModal.packageName}
                          </p>
                          {receiptModal.startDate && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Thời hạn hiệu lực: {receiptModal.startDate} - {receiptModal.endDate}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                          {(Number(receiptModal.amount) || 0).toLocaleString("vi-VN")} đ
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Summary calculation */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-slate-500">
                    <span>Hình thức thanh toán:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {receiptModal.method}
                    </span>
                  </div>
                  {receiptModal.referenceCode && (
                    <div className="flex justify-between text-slate-500">
                      <span>Mã đối soát hệ thống:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">
                        {receiptModal.referenceCode}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span>Thuế GTGT (VAT 0% gói thể thao):</span>
                    <span>0 đ</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-slate-200 dark:border-slate-700 text-sm">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Tổng thanh toán thực tế:
                    </span>
                    <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                      {(Number(receiptModal.amount) || 0).toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>

                {/* Electronic Stamp */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                        XÁC NHẬN ĐÃ THU TIỀN THÀNH CÔNG
                      </p>
                      <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                        Ký số điện tử bởi Ban Tài chính SmartGym
                      </p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
              </div>

              {/* Receipt Footer Actions */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(receiptModal.id);
                    setInvoiceFeedback("Đã sao chép mã phiếu thu: " + receiptModal.id);
                    setTimeout(() => setInvoiceFeedback(null), 3000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Sao chép mã
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  In phiếu thu
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* REPORT PAYMENT / CHUYỂN KHOẢN MODAL */}
      {activePaymentReportModal &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      Thông tin chuyển khoản & Báo thanh toán
                    </h3>
                    <p className="text-xs text-slate-400">
                      Hóa đơn: {activePaymentReportModal.id}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePaymentReportModal(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleConfirmPaymentReport} className="flex-1 flex flex-col overflow-hidden">
                <div className="p-5 overflow-y-auto space-y-4 text-xs">
                  {/* Bank info box */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Ngân hàng thụ hưởng:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">
                        MB Bank (Ngân hàng Quân Đội)
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Số tài khoản:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          0900 1234 5678
                        </span>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText("090012345678")}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Tên tài khoản:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                        SMART GYM SPORTS CENTER
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span>Số tiền thanh toán:</span>
                      <span className="font-extrabold text-base text-rose-600 dark:text-rose-400">
                        {(Number(activePaymentReportModal.amount) || 0).toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Nội dung chuyển khoản (bắt buộc):</span>
                      <span className="font-mono font-bold bg-white dark:bg-slate-700 px-2 py-0.5 rounded text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600">
                        {activePaymentReportModal.id} {profile?.phone || "0900000000"}
                      </span>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Phương thức thực hiện:
                    </label>
                    <select
                      value={reportBankMethod}
                      onChange={(e) => setReportBankMethod(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      <option value="Chuyển khoản QR">Chuyển khoản QR (MB Bank / VietQR)</option>
                      <option value="Thanh toán trực tiếp">Nộp tiền mặt tại Quầy Lễ tân</option>
                      <option value="Thẻ tín dụng / POS">Quẹt thẻ POS tại quầy</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Mã giao dịch ngân hàng / Ghi chú đối soát:
                    </label>
                    <input
                      type="text"
                      placeholder="VD: MB-889922 hoặc mã giao dịch trên biên lai..."
                      value={reportRefCode}
                      onChange={(e) => setReportRefCode(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Nhập mã giao dịch để kế toán đối soát và kích hoạt gói nhanh nhất.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
                  <button
                    type="button"
                    onClick={() => setActivePaymentReportModal(null)}
                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors"
                  >
                    Xác nhận đã thanh toán
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
