import React from "react";
import {
  CheckCircle2,
  Flame,
  Medal,
  Lock,
  Zap,
  Activity,
  Award,
  Trophy,
  Crown,
} from "lucide-react";

interface BadgesStatus {
  streak10: boolean;
  breakthrough20: boolean;
  multiSport: boolean;
  coachBuddy: boolean;
  warrior50: boolean;
  goldMember: boolean;
}

interface BadgeItemProps {
  unlocked: boolean;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  iconBg: string;
  icon: React.ReactNode;
  name: string;
  description: string;
  checkColor: string;
}

const BadgeItem: React.FC<BadgeItemProps> = ({
  unlocked,
  gradientFrom,
  gradientTo,
  borderColor,
  iconBg,
  icon,
  name,
  description,
  checkColor,
}) => (
  <div
    className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
      unlocked
        ? `bg-gradient-to-tr ${gradientFrom} ${gradientTo} ${borderColor}`
        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800"
    }`}
  >
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${
        unlocked ? `${iconBg} text-white` : "bg-slate-200 dark:bg-slate-700 text-slate-400"
      }`}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <div className="flex items-center gap-1">
        <p className={`font-bold text-xs ${unlocked ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>
          {name}
        </p>
        {unlocked ? (
          <CheckCircle2 className={`w-3.5 h-3.5 ${checkColor} shrink-0`} />
        ) : (
          <Lock className="w-3 h-3 text-slate-400 shrink-0" />
        )}
      </div>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{description}</p>
    </div>
  </div>
);

interface ProfileBadgesGridProps {
  completedCount: number;
  badgesStatus: BadgesStatus;
  unlockedBadgesCount: number;
}

export const ProfileBadgesGrid: React.FC<ProfileBadgesGridProps> = ({
  completedCount,
  badgesStatus,
  unlockedBadgesCount,
}) => {
  const badges: BadgeItemProps[] = [
    {
      unlocked: badgesStatus.streak10,
      gradientFrom: "from-amber-500/10",
      gradientTo: "to-orange-500/10",
      borderColor: "border-amber-500/20",
      iconBg: "bg-amber-500",
      icon: <Flame className="w-5 h-5" />,
      name: "Kỷ Luật Thép",
      description: badgesStatus.streak10 ? "Đã đạt chuỗi 10 ngày" : `Tiến độ: ${Math.min(10, completedCount)}/10 ca tập`,
      checkColor: "text-amber-500",
    },
    {
      unlocked: badgesStatus.breakthrough20,
      gradientFrom: "from-blue-500/10",
      gradientTo: "to-indigo-500/10",
      borderColor: "border-blue-500/20",
      iconBg: "bg-blue-600",
      icon: <Zap className="w-5 h-5" />,
      name: "Bứt Phá 20+",
      description: badgesStatus.breakthrough20 ? "Hoàn thành 20+ ca" : `Tiến độ: ${Math.min(20, completedCount)}/20 ca`,
      checkColor: "text-blue-500",
    },
    {
      unlocked: badgesStatus.multiSport,
      gradientFrom: "from-emerald-500/10",
      gradientTo: "to-teal-500/10",
      borderColor: "border-emerald-500/20",
      iconBg: "bg-emerald-600",
      icon: <Activity className="w-5 h-5" />,
      name: "Thể Lực Đa Năng",
      description: "Tập 2+ bộ môn khác nhau",
      checkColor: "text-emerald-500",
    },
    {
      unlocked: badgesStatus.coachBuddy,
      gradientFrom: "from-purple-500/10",
      gradientTo: "to-pink-500/10",
      borderColor: "border-purple-500/20",
      iconBg: "bg-purple-600",
      icon: <Award className="w-5 h-5" />,
      name: "Đồng Đội HLV",
      description: "Tập luyện cùng PT 1:1",
      checkColor: "text-purple-500",
    },
    {
      unlocked: badgesStatus.warrior50,
      gradientFrom: "from-amber-500/10",
      gradientTo: "to-yellow-500/10",
      borderColor: "border-amber-500/20",
      iconBg: "bg-amber-600",
      icon: <Trophy className="w-5 h-5" />,
      name: "Chiến Binh 50+",
      description: badgesStatus.warrior50 ? "Đã đạt 50+ buổi" : `Tiến độ: ${Math.min(50, completedCount)}/50 buổi`,
      checkColor: "text-amber-500",
    },
    {
      unlocked: badgesStatus.goldMember,
      gradientFrom: "from-amber-500/10",
      gradientTo: "to-orange-500/10",
      borderColor: "border-amber-500/20",
      iconBg: "bg-amber-500",
      icon: <Crown className="w-5 h-5" />,
      name: "Hội Viên Hoạt Động",
      description: badgesStatus.goldMember ? "Gói tập đang hoạt động" : "Chưa kích hoạt gói",
      checkColor: "text-amber-500",
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Medal className="w-4 h-4 text-amber-500" />
          Huy hiệu thành tích rèn luyện
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          Đã mở khóa {unlockedBadgesCount}/6 huy hiệu
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {badges.map((badge) => (
          <BadgeItem key={badge.name} {...badge} />
        ))}
      </div>
    </div>
  );
};
