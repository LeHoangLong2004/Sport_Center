import { useState, useEffect, useMemo } from "react";
import type { MemberScreen, MemberSessionItem, MemberTaskItem } from "../types";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { getSavedMemberData, saveMemberData } from "../services/memberData";
import { PackageAPI, type PackageOrder } from "../../../services/packageApi";
import {
  Calendar,
  CreditCard,
  CheckCircle2,
  Circle,
  Dumbbell,
  ArrowRight,
  Sparkles,
  ChevronRight,
  CalendarCheck,
  PlusCircle,
  Bot,
  Compass,
  MapPin,
  User,
  Wallet,
} from "lucide-react";
import { WalletService, MEMBER_WALLET_UPDATED_EVENT } from "../services/walletService";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
}

export default function MemberDashboard({ onNavigate }: Props) {
  const { profile } = useUserProfile("member");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id || profile?.id || "";
  const userName = user?.fullName || user?.name || profile?.fullName || "Hội viên";

  // Data states
  const [orders, setOrders] = useState<PackageOrder[]>([]);
  const [sessions, setSessions] = useState<MemberSessionItem[]>(() =>
    getSavedMemberData(`member_sessions_${userId}`, [])
  );
  const [tasks, setTasks] = useState<MemberTaskItem[]>(() =>
    getSavedMemberData(`member_tasks_${userId}`, [])
  );
  const [balance, setBalance] = useState<number>(() => {
    return WalletService.getLocalWallet(userId).balance;
  });

  useEffect(() => {
    let cancelled = false;
    WalletService.getWallet(userId).then((w) => {
      if (!cancelled && typeof w.balance === "number") setBalance(w.balance);
    });

    const handleUpdate = (e: any) => {
      if (e?.detail?.balance !== undefined) {
        setBalance(e.detail.balance);
      } else {
        setBalance(WalletService.getLocalWallet(userId).balance);
      }
    };
    window.addEventListener(MEMBER_WALLET_UPDATED_EVENT, handleUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener(MEMBER_WALLET_UPDATED_EVENT, handleUpdate);
    };
  }, [userId]);

  // Load user package orders
  useEffect(() => {
    let cancelled = false;
    PackageAPI.getMyOrders()
      .then((res) => {
        if (!cancelled && Array.isArray(res)) setOrders(res);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Compute active packages
  const activePackages = useMemo(() => {
    if (orders.length > 0) {
      const now = new Date();
      return orders
        .filter((o) => o.status === "paid" && o.packageSnapshot)
        .map((o) => {
          const end = o.endDate ? new Date(o.endDate) : new Date();
          const daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          return {
            id: o.id,
            name: o.packageSnapshot.name,
            sport: o.packageSnapshot.sport || (o.packageSnapshot.category === "membership" ? "Thành viên" : "Gym"),
            endDate: o.endDate ? o.endDate.split("T")[0] : "--",
            daysRemaining,
          };
        });
    }
    return [];
  }, [orders]);

  const upcomingSessions = useMemo(
    () => sessions.filter((s) => s.status === "sắp diễn ra" || s.status === "đang diễn ra"),
    [sessions]
  );
  const pendingTasks = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);
  const completedSessions = useMemo(() => sessions.filter((s) => s.status === "hoàn thành"), [sessions]);
  const attendanceRate = completedSessions.length > 0
    ? `${Math.round((completedSessions.filter((s) => s.attendanceStatus === "có mặt").length / completedSessions.length) * 100)}%`
    : "--%";

  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    setTasks(updated);
    saveMemberData(`member_tasks_${userId || "default"}`, updated);
  };

  const kpis = [
    {
      label: "Gói còn hiệu lực",
      val: `${activePackages.length} gói`,
      sub: activePackages.length > 0 ? "Đang hoạt động" : "Chưa kích hoạt gói",
      icon: CreditCard,
      color: "emerald",
    },
    {
      label: "Buổi đã đặt sắp tới",
      val: `${upcomingSessions.length} buổi`,
      sub: upcomingSessions.length > 0 ? "Đã xác nhận giữ chỗ" : "Chưa có lịch đặt",
      icon: CalendarCheck,
      color: "blue",
    },
    {
      label: "Bài tập cần làm",
      val: `${pendingTasks.length} nhiệm vụ`,
      sub: pendingTasks.length > 0 ? "Coach đã giao riêng" : "Chưa có bài tập",
      icon: Dumbbell,
      color: "amber",
    },
    {
      label: "Tỷ lệ tham dự",
      val: attendanceRate,
      sub: completedSessions.length > 0 ? "Chuyên cần" : "Chưa có lịch sử",
      icon: CheckCircle2,
      color: "purple",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. WELCOME BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 text-white shadow-lg border border-slate-700/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{activePackages.length > 0 ? "Hội viên Thể thao SportCenter" : "Thành viên Mới SportCenter"}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Xin chào, {userName} 👋</h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              {upcomingSessions.length > 0
                ? `Chào mừng bạn trở lại! Bạn có ${upcomingSessions.length} buổi tập được xếp lịch trong tuần này. Hãy duy trì năng lượng và tập luyện đều đặn nhé!`
                : "Chào mừng bạn đến với SportCenter! Hãy bắt đầu hành trình nâng cao sức khỏe bằng việc khám phá các gói tập và lớp học nhé!"}
            </p>

            {/* Wallet quick balance widget */}
            <div className="pt-2 flex items-center gap-3">
              <div className="inline-flex items-center gap-3 p-2 px-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs text-slate-300 font-medium">Số dư ví:</span>
                  <strong className="text-sm font-extrabold text-white tracking-tight">
                    {balance.toLocaleString("vi-VN")} đ
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent("open-wallet-modal"))}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-all cursor-pointer shadow-xs"
                >
                  + Nạp ví
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate("booking")}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Khám phá & Đặt lịch</span>
            </button>
            <button
              onClick={() => onNavigate("support")}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs backdrop-blur-sm transition-all flex items-center gap-1.5 border border-white/10"
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Hỏi AI Trợ lý</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, idx) => {
          const Icon = k.icon;
          return (
            <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{k.label}</span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{k.val}</div>
                <span className="text-[11px] text-slate-500 font-medium">{k.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. MAIN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: SESSIONS & TASKS */}
        <div className="lg:col-span-8 space-y-6">
          {/* Lịch tập */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Lịch tập tiếp theo</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Các ca học sắp tới bạn đã đặt chỗ</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate("schedule")}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 group"
              >
                <span>Xem tất cả lịch</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {upcomingSessions.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Bạn chưa có buổi tập nào sắp tới</p>
                <button
                  onClick={() => onNavigate("booking")}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Tìm lớp để đặt ngay</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center shrink-0 min-w-[76px]">
                        <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-400">{session.startTime}</span>
                        <span className="block text-[10px] text-slate-500 dark:text-slate-400">{session.date}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {session.type === "pt" ? "Kèm 1-1 PT" : session.sport}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{session.name}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{session.room}</span>
                          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{session.coachName}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate("schedule")}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      Chi tiết
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Bài tập Coach giao */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Bài tập & Lời dặn từ Huấn luyện viên</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Hoàn thành để duy trì tiến độ rèn luyện</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate("workouts")}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Xem giáo án</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-xs">
                Chưa có nhiệm vụ bài tập riêng từ HLV. Khi bạn tập luyện cùng HLV, bài tập sẽ hiển thị tại đây.
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      task.completed
                        ? "bg-slate-50/60 dark:bg-slate-850 border-slate-200 opacity-70"
                        : "bg-white dark:bg-slate-800 border-slate-200 hover:border-emerald-500/50"
                    }`}
                  >
                    <div className="mt-0.5">
                      {task.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${task.completed ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-100"}`}>
                        {task.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{task.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: ACTIVE PACKAGES & SHORTCUT */}
        <div className="lg:col-span-4 space-y-6">
          {/* Gói tập đang dùng */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Gói tập đang dùng</h2>
              <button
                onClick={() => onNavigate("packages")}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {activePackages.length > 0 ? "Gia hạn" : "Khám phá"}
              </button>
            </div>

            {activePackages.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <CreditCard className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Bạn chưa đăng ký gói tập nào</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Đăng ký gói tập môn hoặc thẻ hội viên để bắt đầu luyện tập</p>
                <button
                  onClick={() => onNavigate("packages")}
                  className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors shadow-sm"
                >
                  <span>Xem các gói tập</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activePackages.map((pkg) => (
                  <div key={pkg.id} className="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-800 dark:to-emerald-950/20 border border-slate-200 dark:border-slate-700/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                        {pkg.sport}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Còn {pkg.daysRemaining} ngày</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">{pkg.name}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Hạn đến: {pkg.endDate}</p>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (pkg.daysRemaining / 90) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quick shortcut */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 shadow-md">
            <h3 className="font-extrabold text-sm text-slate-950">Bạn muốn tập luyện hôm nay?</h3>
            <p className="text-xs text-slate-900/80 mt-1">Khám phá hơn 10 bộ môn thể thao và đặt lịch lớp yêu thích ngay.</p>
            <button
              onClick={() => onNavigate("booking")}
              className="mt-3.5 w-full py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Đặt lịch lớp ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
