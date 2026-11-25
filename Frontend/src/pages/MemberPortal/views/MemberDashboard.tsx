import { useState, useEffect, useMemo } from "react";
import type { MemberScreen, MemberSessionItem, MemberTaskItem } from "../types";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { getSavedMemberData, saveMemberData, MemberBackendAPI } from "../services/memberData";
import { MemberAPI } from "../services/api";
import { PackageAPI, type PackageOrder } from "../../../services/packageApi";
import {
  CreditCard,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { WalletService, MEMBER_WALLET_UPDATED_EVENT } from "../services/walletService";
import { APPOINTMENT_UPDATED_EVENT } from "../../../services/appointmentService";
import { DashboardWelcomeBanner } from "./dashboard/DashboardWelcomeBanner";
import { DashboardSessionsTasks } from "./dashboard/DashboardSessionsTasks";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
}

/**
 * Màn hình Tổng quan cá nhân Hội viên (Member Dashboard View).
 * Hiển thị lời chào cá nhân hóa, gói tập hiện tại, số dư ví, ca tập sắp diễn ra và danh sách nhiệm vụ bài tập hàng ngày.
 * 
 * @param onNavigate Hàm điều hướng nhanh sang các màn hình chức năng khác
 */
export default function MemberDashboard({ onNavigate }: Props) {
  const { profile } = useUserProfile("member");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id || profile?.id || "";
  const userName = user?.fullName || user?.name || profile?.fullName || "Hội viên";

  const [orders, setOrders] = useState<PackageOrder[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
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
    const loadSessions = () => {
      MemberBackendAPI.getBookings()
        .then((data) => {
          if (!cancelled && Array.isArray(data)) {
            setSessions(data);
            if (userId) saveMemberData(`member_sessions_${userId}`, data);
          }
        })
        .catch(() => {});
    };
    loadSessions();
    window.addEventListener(APPOINTMENT_UPDATED_EVENT, loadSessions);
    return () => {
      cancelled = true;
      window.removeEventListener(APPOINTMENT_UPDATED_EVENT, loadSessions);
    };
  }, [userId]);

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

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([PackageAPI.getMyOrders(), MemberAPI.getMySubscriptions()]).then(([ordersResult, subscriptionsResult]) => {
      if (cancelled) return;
      if (ordersResult.status === "fulfilled" && Array.isArray(ordersResult.value)) {
        setOrders(ordersResult.value);
      }
      if (subscriptionsResult.status === "fulfilled" && Array.isArray(subscriptionsResult.value)) {
        setSubscriptions(subscriptionsResult.value);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const activePackages = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const activeSubscriptions = subscriptions
      .filter((subscription) => {
        const paymentStatus = subscription.paymentStatus;
        const isPaid = paymentStatus === 1 || String(paymentStatus).toLowerCase() === "completed";
        const packageType = String(subscription.packageType || "").toLowerCase();
        if (!isPaid || packageType !== "membership") return false;
        const start = subscription.startDate ? new Date(subscription.startDate) : null;
        const end = subscription.endDate ? new Date(subscription.endDate) : null;
        if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return start <= today && end >= today;
      })
      .map((subscription) => {
        const end = new Date(subscription.endDate);
        const endOfDay = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);
        const daysRemaining = Math.max(0, Math.ceil((endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        return {
          id: `subscription-${subscription.id}`,
          packageId: subscription.packageId,
          packageType: String(subscription.packageType || "").toLowerCase(),
          name: subscription.packageName || "Gói tập",
          sport: "Thành viên",
          endDate: end.toLocaleDateString("sv-SE"),
          daysRemaining,
        };
      });

    const activeSubscriptionKeys = new Set(activeSubscriptions.map((item) =>
      `${item.packageType}:${item.packageId || item.name.trim().toLowerCase()}`
    ));
    const activeOrderPackages = orders
      .filter((order) => {
        if (order.status !== "paid" || !order.packageSnapshot || order.packageSnapshot.category !== "membership") return false;
        const end = order.endDate ? new Date(order.endDate) : null;
        if (end && (Number.isNaN(end.getTime()) || end < today)) return false;
        const category = order.packageSnapshot.category;
        const key = `${category}:${order.packageSnapshot.id || order.packageSnapshot.name.trim().toLowerCase()}`;
        return !activeSubscriptionKeys.has(key);
      })
      .map((order) => {
        const end = order.endDate ? new Date(order.endDate) : now;
        const daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        return {
          id: order.id,
          name: order.packageSnapshot.name,
          sport: "Thành viên",
          endDate: order.endDate ? order.endDate.split("T")[0] : "--",
          daysRemaining,
        };
      });

    return [...activeSubscriptions, ...activeOrderPackages];
  }, [orders, subscriptions]);

  const upcomingSessions = useMemo(
    () => sessions.filter((s) => s.status === "sắp diễn ra" || s.status === "đang diễn ra"),
    [sessions]
  );
  const pendingTasks = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);
  const completedSessions = useMemo(() => sessions.filter((s) => s.status === "hoàn thành"), [sessions]);
  const attendanceRate = completedSessions.length > 0
    ? `${Math.round((completedSessions.filter((s) => s.attendanceStatus === "có mặt").length / completedSessions.length) * 100)}%`
    : "0%";

  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    setTasks(updated);
    saveMemberData(`member_tasks_${userId || "default"}`, updated);
  };

  const [realAttendanceRate, setRealAttendanceRate] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    fetch("/api/member/attendance", {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) {
          const rate = data?.summary?.attendanceRate;
          if (typeof rate === "number" && !isNaN(rate)) {
            setRealAttendanceRate(`${rate}%`);
          } else {
            setRealAttendanceRate("0%");
          }
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = [
    {
      label: "Gói còn hiệu lực",
      val: `${activePackages.length} gói`,
      sub: activePackages.length > 0 ? "Đang hoạt động" : "Chưa kích hoạt gói",
      onClick: () => onNavigate("packages"),
    },
    {
      label: "Buổi đã đặt sắp tới",
      val: `${upcomingSessions.length} buổi`,
      sub: upcomingSessions.length > 0 ? "Đã xác nhận giữ chỗ" : "Chưa có lịch đặt",
      onClick: () => onNavigate("schedule"),
    },
    {
      label: "Bài tập cần làm",
      val: `${pendingTasks.length} nhiệm vụ`,
      sub: pendingTasks.length > 0 ? "Coach đã giao riêng" : "Chưa có bài tập",
      onClick: () => onNavigate("workouts"),
    },
    {
      label: "Tỷ lệ tham dự",
      val: (realAttendanceRate && realAttendanceRate !== "null%" && realAttendanceRate !== "--%")
        ? realAttendanceRate
        : (attendanceRate && attendanceRate !== "null%" && attendanceRate !== "--%" ? attendanceRate : "0%"),
      sub: "Xem chi tiết điểm danh →",
      onClick: () => onNavigate("attendance"),
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardWelcomeBanner
        userName={userName}
        balance={balance}
        upcomingSessionsCount={upcomingSessions.length}
        hasActivePackages={activePackages.length > 0}
        onNavigate={onNavigate}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, idx) => (
          <div
            key={idx}
            onClick={k.onClick}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-emerald-500/60 hover:shadow-md transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{k.label}</span>
              <span className="size-2 rounded-full bg-emerald-500 shrink-0 group-hover:scale-125 transition-transform" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{k.val}</div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <DashboardSessionsTasks
            upcomingSessions={upcomingSessions}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onNavigate={onNavigate}
          />
        </div>

        {/* Right Column: Packages + Shortcut */}
        <div className="lg:col-span-4 space-y-6">
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

          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-slate-950 shadow-md">
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

