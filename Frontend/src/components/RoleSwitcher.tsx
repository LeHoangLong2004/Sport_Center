import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Shield, Dumbbell, ClipboardList, UserCheck, ChevronDown, Sparkles } from "lucide-react";

export type RoleType = "admin" | "coach" | "receptionist" | "member";

interface RoleConfig {
  id: RoleType;
  label: string;
  badge: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: React.ComponentType<{ className?: string }>;
  hash: string;
  demoUser: {
    id: number | string;
    fullName: string;
    role: string;
    email: string;
    avatarUrl?: string;
  };
}

const ROLES: RoleConfig[] = [
  {
    id: "admin",
    label: "Quản lý / Admin",
    badge: "MANAGER",
    description: "Quản trị toàn diện, tài chính & báo cáo",
    color: "#f43f5e",
    bgColor: "bg-rose-50 dark:bg-rose-950/40",
    borderColor: "border-rose-200 dark:border-rose-800",
    textColor: "text-rose-600 dark:text-rose-400",
    icon: Shield,
    hash: "#dashboard",
    demoUser: {
      id: "admin-01",
      fullName: "Quản lý SportCenter",
      role: "Manager",
      email: "manager@test.com",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    },
  },
  {
    id: "coach",
    label: "Huấn luyện viên",
    badge: "COACH",
    description: "Lịch dạy, học viên & giáo án thể thao",
    color: "#f97316",
    bgColor: "bg-orange-50 dark:bg-orange-950/40",
    borderColor: "border-orange-200 dark:border-orange-800",
    textColor: "text-orange-600 dark:text-orange-400",
    icon: Dumbbell,
    hash: "#coach-portal",
    demoUser: {
      id: "coach-01",
      fullName: "HLV Nam Hồ",
      role: "Coach",
      email: "hoxuananhnam1@gmail.com",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    },
  },
  {
    id: "receptionist",
    label: "Bộ phận Lễ tân",
    badge: "RECEPTIONIST",
    description: "Check-in QR, thu tiền quầy & bán lẻ POS",
    color: "#a855f7",
    bgColor: "bg-purple-50 dark:bg-purple-950/40",
    borderColor: "border-purple-200 dark:border-purple-800",
    textColor: "text-purple-600 dark:text-purple-400",
    icon: ClipboardList,
    hash: "#receptionist",
    demoUser: {
      id: "rec-01",
      fullName: "Lễ tân Mai Anh",
      role: "Receptionist",
      email: "receptionist01@smartgym.com",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80",
    },
  },
  {
    id: "member",
    label: "Hội viên / Member",
    badge: "MEMBER",
    description: "Đặt lớp, lịch tập, ví tiền & mã điểm danh",
    color: "#10b981",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    textColor: "text-emerald-600 dark:text-emerald-400",
    icon: UserCheck,
    hash: "#member-dashboard",
    demoUser: {
      id: "mem-01",
      fullName: "Hội viên Hồ Nam",
      role: "Member",
      email: "hoxuananhnam@gmail.com",
      avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80",
    },
  },
];

export function RoleSwitcher({ currentRole }: { currentRole: RoleType }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeConfig = ROLES.find((r) => r.id === currentRole) || ROLES[0];
  const ActiveIcon = activeConfig.icon;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSwitchRole = (target: RoleConfig) => {
    if (target.id === currentRole) {
      setIsOpen(false);
      return;
    }

    setIsOpen(false);

    // Save demo user in localStorage for target role
    try {
      const existingToken = localStorage.getItem("token") || "mock-valid-token-demo";
      localStorage.setItem("token", existingToken);
      localStorage.setItem("user", JSON.stringify(target.demoUser));
    } catch {}

    toast.success(`Đang chuyển sang giao diện: ${target.label}`, {
      duration: 2000,
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
    });

    // Update hash smoothly without full reload
    window.location.hash = target.hash;
    window.dispatchEvent(new Event("local-storage-update"));
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };

  return (
    <div ref={dropdownRef} className="relative z-40">
      {/* Trigger pill */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-xs hover:shadow-md transition-all duration-200 btn-tactile text-left"
        title="Chuyển đổi nhanh giữa 4 vai trò"
      >
        <span
          className="size-2 rounded-full animate-pulse"
          style={{ backgroundColor: activeConfig.color }}
        />
        <ActiveIcon className={`w-3.5 h-3.5 ${activeConfig.textColor}`} />
        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 hidden sm:inline">
          {activeConfig.badge}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Chuyển nhanh vai trò (4 Roles)
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chọn vai trò để chuyển giao diện ngay lập tức
            </p>
          </div>

          <div className="space-y-1">
            {ROLES.map((r) => {
              const isSelected = r.id === currentRole;
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSwitchRole(r)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all duration-150 btn-tactile ${
                    isSelected
                      ? `${r.bgColor} border ${r.borderColor} font-bold shadow-xs`
                      : "hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-medium"
                  }`}
                >
                  <div
                    className="size-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: `${r.color}20`, color: r.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {r.label}
                      </span>
                      {isSelected && (
                        <span
                          className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${r.color}25`,
                            color: r.color,
                          }}
                        >
                          Đang dùng
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {r.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleSwitcher;
