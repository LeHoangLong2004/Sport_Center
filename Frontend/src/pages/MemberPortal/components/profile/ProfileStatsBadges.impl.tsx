import React from "react"; import { CheckCircle2, Flame, Calendar, Trophy,
Medal, Lock, Zap, Activity, Award, Crown,
} from "lucide-react"; interface ProfileStatsBadgesProps { completedCount: number; totalSessionsCount: number; badgesStatus: { streak10: boolean;
breakthrough20: boolean; multiSport: boolean; coachBuddy: boolean; warrior50: boolean; goldMember: boolean; };
unlockedBadgesCount: number; } export const ProfileStatsBadges: React.FC<ProfileStatsBadgesProps> = ({ completedCount, totalSessionsCount, badgesStatus,
unlockedBadgesCount, }) => { return ( <div className="space-y-6"> {/* Quick KPI Stat Cards With Progress Bars */} <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
{/* Card 1: Buổi tập hoàn thành */} <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between"> <div> <div className="flex items-center justify-between text-slate-400"> <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"> Buổi tập hoàn thành
</span> <CheckCircle2 className="w-4 h-4 text-emerald-500" /> </div> <div className="mt-3 flex items-baseline gap-1.5"> <span className="text-2xl font-black text-slate-900 dark:text-white">{completedCount}</span> <span className="text-xs text-slate-400 font-medium">/ {totalSessionsCount || 0} buổi</span>
</div> </div> <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5"> <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden"> <div className="bg-emerald-500 h-full rounded-full transition-all duration-500"
style={{ width: `${ totalSessionsCount > 0 ? Math.min(100, Math.round((completedCount / totalSessionsCount) * 100)) : 0 }%`,
}} /> </div> <div className="flex justify-between text-[11px] text-slate-400"> <span>Tiến độ hoàn thành</span> <span className="font-semibold text-emerald-600 dark:text-emerald-400">
{totalSessionsCount > 0 ? `${Math.round((completedCount / totalSessionsCount) * 100)}%` : "0%"} </span> </div> </div>
</div> {/* Card 2: Kỷ luật chuyên cần (Streak) */} <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between"> <div> <div className="flex items-center justify-between text-slate-400"> <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
Kỷ luật chuyên cần </span> <Flame className="w-4 h-4 text-amber-500" /> </div> <div className="mt-3 flex items-baseline gap-1.5"> <span className="text-2xl font-black text-slate-900 dark:text-white">
{totalSessionsCount > 0 ? `${Math.round((completedCount / totalSessionsCount) * 100)}%` : "0%"} </span> <span className="text-xs text-amber-600 dark:text-amber-400 font-bold"> {completedCount > 0 ? `${completedCount} buổi xong` : "Khởi đầu mới"}
</span> </div> </div> <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5"> <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden"> <div
className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${ totalSessionsCount > 0 ? Math.min(100, Math.round((completedCount / totalSessionsCount) * 100)) : 0
}%`, }} /> </div> <div className="flex justify-between text-[11px] text-slate-400"> <span>Chuyên cần</span>
<span className="font-semibold text-amber-600 dark:text-amber-400"> {completedCount > 0 ? "Rất tích cực 🔥" : "Chưa có dữ liệu"} </span> </div> </div> </div>
{/* Card 3: Lịch tập đã đặt */} <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between"> <div> <div className="flex items-center justify-between text-slate-400"> <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"> Lịch tập đã đặt
</span> <Calendar className="w-4 h-4 text-purple-500" /> </div> <div className="mt-3 flex items-baseline gap-1.5"> <span className="text-2xl font-black text-slate-900 dark:text-white">{totalSessionsCount}</span> <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">ca trong lịch</span>
</div> </div> <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between"> <span className="text-[11px] text-slate-500"> {totalSessionsCount > 0 ? `${totalSessionsCount - completedCount} ca sắp tới`
: "Chưa đăng ký ca tập"} </span> <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold"> {totalSessionsCount > 0 ? "Đang lên lịch" : "Trống"} </span> </div>
</div> {/* Card 4: Cấp bậc rèn luyện (Level) */} <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between"> <div> <div className="flex items-center justify-between text-slate-400"> <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
Cấp bậc rèn luyện </span> <Trophy className="w-4 h-4 text-amber-500" /> </div> <div className="mt-3 flex items-baseline gap-1.5"> <span className="text-2xl font-black text-slate-900 dark:text-white">
Level {Math.max(1, Math.floor(completedCount / 5) + 1)} </span> <span className="text-xs text-amber-600 dark:text-amber-400 font-bold"> {completedCount >= 20 ? "Vàng (Gold)" : completedCount >= 10 ? "Bạc (Silver)" : "Tân Binh"} </span> </div>
</div> <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5"> <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden"> <div className="bg-gradient-to-r from-blue-500 to-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (completedCount % 5) * 20)}%` }}
/> </div> <div className="flex justify-between text-[11px] text-slate-400"> <span>{(completedCount % 5) * 50} / 250 XP</span> <span className="font-semibold text-slate-600 dark:text-slate-300"> {250 - (completedCount % 5) * 50} XP tới Cấp tiếp theo
</span> </div> </div> </div> </div> {/* Badges Collection Card */}
<div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5"> <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800"> <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2"> <Medal className="w-4 h-4 text-amber-500" /> Huy hiệu thành tích rèn luyện </h3>
<span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"> Đã mở khóa {unlockedBadgesCount}/6 huy hiệu </span> </div> {/* 6 Badges Grid */} <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
{/* 1. Kỷ Luật Thép */} <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${ badgesStatus.streak10 ? "bg-gradient-to-tr from-amber-500/10 to-orange-500/10 border-amber-500/20" : "bg-slate-50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800"
}`} > <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${ badgesStatus.streak10 ? "bg-amber-500 text-white"
: "bg-slate-200 dark:bg-slate-700 text-slate-400" }`} > <Flame className="w-5 h-5" /> </div> <div className="min-w-0">
<div className="flex items-center gap-1"> <p className={`font-bold text-xs ${ badgesStatus.streak10 ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"
}`} > Kỷ Luật Thép </p> {badgesStatus.streak10 ? ( <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
) : ( <Lock className="w-3 h-3 text-slate-400 shrink-0" /> )} </div> <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate"> {badgesStatus.streak10
? "Đã đạt chuỗi 10 ngày" : `Tiến độ: ${Math.min(10, completedCount)}/10 ca tập`} </p> </div> </div> {/* 2. Bứt Phá 20+ */}
<div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${ badgesStatus.breakthrough20 ? "bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 border-blue-500/20" : "bg-slate-50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800" }`}
> <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${ badgesStatus.breakthrough20 ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-400"
}`} > <Zap className="w-5 h-5" /> </div> <div className="min-w-0"> <div className="flex items-center gap-1">
<p className={`font-bold text-xs ${ badgesStatus.breakthrough20 ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300" }`}
> Bứt Phá 20+ </p> {badgesStatus.breakthrough20 ? ( <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" /> ) : (
<Lock className="w-3 h-3 text-slate-400 shrink-0" /> )} </div> <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate"> {badgesStatus.breakthrough20 ? "Hoàn thành 20+ ca"
: `Tiến độ: ${Math.min(20, completedCount)}/20 ca`} </p> </div> </div> {/* 3. Thể Lực Đa Năng */} <div
className={`p-3.5 rounded-2xl border flex items-center gap-3 ${ badgesStatus.multiSport ? "bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 border-emerald-500/20" : "bg-slate-50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800" }`} >
<div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${ badgesStatus.multiSport ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-400" }`}
> <Activity className="w-5 h-5" /> </div> <div className="min-w-0"> <div className="flex items-center gap-1"> <p
className={`font-bold text-xs ${ badgesStatus.multiSport ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300" }`} >
Thể Lực Đa Năng </p> {badgesStatus.multiSport ? ( <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> ) : ( <Lock className="w-3 h-3 text-slate-400 shrink-0" />
)} </div> <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Tập 2+ bộ môn khác nhau</p> </div> </div> {/* 4. Đồng Đội HLV */}
<div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${ badgesStatus.coachBuddy ? "bg-gradient-to-tr from-purple-500/10 to-pink-500/10 border-purple-500/20" : "bg-slate-50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800" }`}
> <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${ badgesStatus.coachBuddy ? "bg-purple-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-400"
}`} > <Award className="w-5 h-5" /> </div> <div className="min-w-0"> <div className="flex items-center gap-1">
<p className={`font-bold text-xs ${ badgesStatus.coachBuddy ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300" }`}
> Đồng Đội HLV </p> {badgesStatus.coachBuddy ? ( <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" /> ) : (
<Lock className="w-3 h-3 text-slate-400 shrink-0" /> )} </div> <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Tập luyện cùng PT 1:1</p> </div> </div>
{/* 5. Chiến Binh 50+ */} <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${ badgesStatus.warrior50 ? "bg-gradient-to-tr from-amber-500/10 to-yellow-500/10 border-amber-500/20" : "bg-slate-50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800"
}`} > <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${ badgesStatus.warrior50 ? "bg-amber-600 text-white"
: "bg-slate-200 dark:bg-slate-700 text-slate-400" }`} > <Trophy className="w-5 h-5" /> </div> <div className="min-w-0">
<div className="flex items-center gap-1.5"> <p className={`font-bold text-xs ${ badgesStatus.warrior50 ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"
}`} > Chiến Binh 50+ </p> {badgesStatus.warrior50 ? ( <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
) : ( <Lock className="w-3 h-3 text-slate-400 shrink-0" /> )} </div> <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate"> {badgesStatus.warrior50
? "Đã đạt 50+ buổi" : `Tiến độ: ${Math.min(50, completedCount)}/50 buổi`} </p> </div> </div> {/* 6. Hội Viên Hoạt Động */}
<div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${ badgesStatus.goldMember ? "bg-gradient-to-tr from-amber-500/10 to-orange-500/10 border-amber-500/20" : "bg-slate-50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800" }`}
> <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${ badgesStatus.goldMember ? "bg-amber-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-400"
}`} > <Crown className="w-5 h-5" /> </div> <div className="min-w-0"> <div className="flex items-center gap-1.5">
<p className={`font-bold text-xs ${ badgesStatus.goldMember ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300" }`}
> Hội Viên Hoạt Động </p> {badgesStatus.goldMember ? ( <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" /> ) : (
<Lock className="w-3 h-3 text-slate-400 shrink-0" /> )} </div> <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate"> {badgesStatus.goldMember ? "Gói tập đang hoạt động" : "Chưa kích hoạt gói"} </p>
</div> </div> </div> </div> </div> );
};


