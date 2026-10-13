import { useState, useEffect, useMemo } from "react";
import type { CoachScreen } from "../types";
import { CoachAPI } from "../services/api";
import type { MockSession, MockCurriculum, AssessmentRecord, AttendanceRecord, MockMember } from "../services/api";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Dumbbell,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  ShieldCheck,
  Target,
  TrendingUp,
  User,
  Award,
  Activity,
  Heart,
  AlertCircle,
  FileText,
  Save,
  Check,
  ChevronRight
} from "lucide-react";

interface Props {
  memberId: string | null;
  navigateTo: (s: CoachScreen, extra?: { memberId?: string; sessionId?: string }) => void;
}

interface MemberAttendanceHistoryItem {
  id: string;
  className: string;
  sport: string;
  date: string;
  time: string;
  room: string;
  status: "attended" | "late" | "excused" | "no_show";
  note?: string;
}

interface MemberWorkoutItem {
  id: string;
  name: string;
  sport: string;
  level: string;
  duration: number;
  status: "Äang táº­p luyá»‡n" | "HoÃ n thÃ nh" | "ÄÃ£ giao";
  exercises: { name: string; reps: string; rest: string; note?: string }[];
}

export default function CoachMemberProfile({ memberId, navigateTo }: Props) {
  const [member, setMember] = useState<MockMember | null>(null);
  const [loading, setLoading] = useState(true);

  /* Notes state */
  const [notes, setNotes] = useState<string[]>([
    "Há»c viÃªn cÃ³ Ã½ thá»©c tá»± giÃ¡c ráº¥t cao, tiáº¿p thu ká»¹ thuáº­t nhanh vÃ  luÃ´n Ä‘áº¿n Ä‘Ãºng giá».",
    "Äá»™ng tÃ¡c Squat vÃ  Deadlift Ä‘Ã£ chuáº©n form, cá»™t sá»‘ng giá»¯ tháº³ng tá»± nhiÃªn.",
    "KhuyÃªn há»c viÃªn chÃº Ã½ khá»Ÿi Ä‘á»™ng ká»¹ khá»›p cá»• tay vÃ  bá»• sung Ä‘á»§ 2 lÃ­t nÆ°á»›c má»—i ngÃ y."
  ]);
  const [newNote, setNewNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    if (!memberId) return;
    setLoading(true);

    CoachAPI.getMembers()
      .then((membersData) => {
        const m = membersData.find((x: MockMember) => x.id === memberId) || null;
        if (m) {
          setMember(m);
        } else {
          /* Fallback member if id not in list */
          setMember({
            id: memberId,
            name: "Member Two",
            code: "MBCBCE",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            goal: "Sá»©c khá»e & SÄƒn cháº¯c cÆ¡",
            level: "CÆ¡ báº£n",
            sport: "Äa mÃ´n",
            phone: "0901234568",
            email: "member2@test.com",
            classIds: ["s1", "s2"]
          });
        }
      })
      .catch(() => {
        setMember({
          id: memberId,
          name: "Member Two",
          code: "MBCBCE",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          goal: "Sá»©c khá»e & SÄƒn cháº¯c cÆ¡",
          level: "CÆ¡ báº£n",
          sport: "Äa mÃ´n",
          phone: "0901234568",
          email: "member2@test.com",
          classIds: ["s1", "s2"]
        });
      })
      .finally(() => setLoading(false));
  }, [memberId]);

  /* Comprehensive 12 sessions history matching 92% (11/12 attended, 1 excused) */
  const attendanceHistory: MemberAttendanceHistoryItem[] = useMemo(() => {
    return [
      { id: "att-1", className: "Gym Group BodyCombat", sport: "Gym", date: "11/10/2026", time: "09:00 - 10:30", room: "Khu Táº¡ Tá»± Do", status: "attended", note: "HoÃ n thÃ nh 100% giÃ¡o Ã¡n, form táº¡ ráº¥t chuáº©n" },
      { id: "att-2", className: "Yoga CÆ¡ Báº£n â€“ Lá»›p A", sport: "Yoga", date: "09/10/2026", time: "07:00 - 08:00", room: "Studio 2", status: "attended", note: "Thá»Ÿ bá»¥ng sÃ¢u tá»‘t, cÆ¡ hÃ´ng giÃ£n ná»Ÿ tá»± nhiÃªn" },
      { id: "att-3", className: "Gym Group BodyCombat", sport: "Gym", date: "07/10/2026", time: "09:00 - 10:30", room: "Khu Táº¡ Tá»± Do", status: "attended", note: "TÄƒng táº¡ ngá»±c lÃªn 30kg, hoÃ n thÃ nh tá»‘t" },
      { id: "att-4", className: "Yoga Phá»¥c Há»“i Khá»›p", sport: "Yoga", date: "05/10/2026", time: "19:00 - 20:00", room: "Studio 2", status: "attended", note: "Khá»›p gá»‘i linh hoáº¡t hÆ¡n, khÃ´ng cÃ²n má»i lÆ°ng" },
      { id: "att-5", className: "Boxing CÆ¡ Báº£n & Thá»ƒ Lá»±c", sport: "Boxing", date: "02/10/2026", time: "07:00 - 08:30", room: "VÃµ ÄÃ i", status: "excused", note: "Báº­n viá»‡c Ä‘á»™t xuáº¥t cÆ¡ quan (ÄÃ£ bÃ¡o trÆ°á»›c)" },
      { id: "att-6", className: "Gym Group BodyCombat", sport: "Gym", date: "30/09/2026", time: "09:00 - 10:30", room: "Khu Táº¡ Tá»± Do", status: "attended", note: "Thá»ƒ lá»±c bá»n bá»‰, nhá»‹p tim á»•n Ä‘á»‹nh" },
      { id: "att-7", className: "Yoga CÆ¡ Báº£n â€“ Lá»›p A", sport: "Yoga", date: "28/09/2026", time: "07:00 - 08:00", room: "Studio 2", status: "attended", note: "ÄÃºng giá», tinh tháº§n tÃ­ch cá»±c" },
      { id: "att-8", className: "Gym Group BodyCombat", sport: "Gym", date: "25/09/2026", time: "09:00 - 10:30", room: "Khu Táº¡ Tá»± Do", status: "attended", note: "HoÃ n thÃ nh bÃ i táº­p lÆ°ng xÃ´ ráº¥t chuáº©n" },
      { id: "att-9", className: "Yoga CÆ¡ Báº£n â€“ Lá»›p A", sport: "Yoga", date: "23/09/2026", time: "07:00 - 08:00", room: "Studio 2", status: "attended", note: "Giá»¯ thÄƒng báº±ng tá»‘t" },
      { id: "att-10", className: "Gym Group BodyCombat", sport: "Gym", date: "21/09/2026", time: "09:00 - 10:30", room: "Khu Táº¡ Tá»± Do", status: "attended", note: "Táº­p trung cao Ä‘á»™" },
      { id: "att-11", className: "Yoga Phá»¥c Há»“i Khá»›p", sport: "Yoga", date: "18/09/2026", time: "19:00 - 20:00", room: "Studio 2", status: "attended", note: "GiÃ£n cÆ¡ phá»¥c há»“i sau buá»•i táº¡" },
      { id: "att-12", className: "Gym Group BodyCombat", sport: "Gym", date: "15/09/2026", time: "09:00 - 10:30", room: "Khu Táº¡ Tá»± Do", status: "attended", note: "Buá»•i khá»Ÿi Ä‘áº§u ráº¥t hÃ o há»©ng" },
    ];
  }, []);

  /* Assigned workout plans */
  const assignedWorkouts: MemberWorkoutItem[] = useMemo(() => {
    return [
      {
        id: "w-1",
        name: "GiÃ¡o Ã¡n TÄƒng Sá»©c Bá»n & KhÃ¡ng Lá»±c ToÃ n ThÃ¢n",
        sport: "Gym",
        level: "CÆ¡ báº£n",
        duration: 60,
        status: "Äang táº­p luyá»‡n",
        exercises: [
          { name: "Barbell Back Squat", reps: "4 sets Ã— 10 reps", rest: "90s", note: "ChÃº Ã½ gá»“ng core, lÆ°ng tháº³ng" },
          { name: "Dumbbell Bench Press", reps: "3 sets Ã— 12 reps", rest: "60s", note: "Háº¡ táº¡ cháº­m 2 giÃ¢y" },
          { name: "Seated Cable Row", reps: "3 sets Ã— 12 reps", rest: "60s", note: "KÃ©o Ã©p sÃ¡t xÆ°Æ¡ng báº£ vai" },
          { name: "Plank Giá»¯ KhÃ¡ng Lá»±c", reps: "3 sets Ã— 60 giÃ¢y", rest: "45s", note: "KhÃ´ng vÃµng tháº¯t lÆ°ng" }
        ]
      },
      {
        id: "w-2",
        name: "GiÃ¡o Ã¡n Phá»¥c Há»“i Cá»™t Sá»‘ng & Cá»‘t LÃµi",
        sport: "Yoga",
        level: "CÆ¡ báº£n",
        duration: 45,
        status: "HoÃ n thÃ nh",
        exercises: [
          { name: "TÆ° tháº¿ MÃ¨o - BÃ² (Cat-Cow)", reps: "3 sets Ã— 10 nhá»‹p", rest: "30s", note: "Káº¿t há»£p hÃ­t thá»Ÿ sÃ¢u theo nhá»‹p chuyá»ƒn Ä‘á»™ng" },
          { name: "TÆ° tháº¿ Äá»©a Tráº» (Child's Pose)", reps: "Giá»¯ 3 phÃºt", rest: "0s", note: "ThÆ° giÃ£n hoÃ n toÃ n cÆ¡ lÆ°ng dÆ°á»›i" },
          { name: "TÆ° tháº¿ Ráº¯n Há»• Mang (Cobra)", reps: "3 sets Ã— 8 nhá»‹p", rest: "45s", note: "Má»Ÿ rá»™ng lá»“ng ngá»±c" }
        ]
      },
      {
        id: "w-3",
        name: "Cardio Äá»‘t Má»¡ & Thá»ƒ Lá»±c Sá»©c Bá»n",
        sport: "HIIT",
        level: "Trung bÃ¬nh",
        duration: 35,
        status: "Äang táº­p luyá»‡n",
        exercises: [
          { name: "Jumping Jacks Khá»Ÿi Äá»™ng", reps: "3 sets Ã— 45 giÃ¢y", rest: "30s", note: "Duy trÃ¬ nhá»‹p thá»Ÿ Ä‘á»u" },
          { name: "Mountain Climbers", reps: "3 sets Ã— 30 giÃ¢y", rest: "45s", note: "Gá»“ng cháº¯c cÆ¡ bá»¥ng" },
          { name: "Burpees Thá»ƒ Lá»±c", reps: "3 sets Ã— 10 reps", rest: "60s", note: "Báº­t nháº£y tiáº¿p Ä‘áº¥t báº±ng mÅ©i chÃ¢n" }
        ]
      }
    ];
  }, []);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes([newNote.trim(), ...notes]);
    setNewNote("");
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  if (loading) {
    return (       <div className="py-24 text-center text-slate-400 max-w-4xl mx-auto">         <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-orange-500 mb-3"></div>         <p className="text-sm">Äang táº£i há»“ sÆ¡ há»c viÃªn...</p>       </div>     );
  }

  if (!member) {
    return (       <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4 max-w-4xl mx-auto">         <p>KhÃ´ng tÃ¬m tháº¥y há»c viÃªn trong há»‡ thá»‘ng.</p>         <button           type="button"           className="text-orange-600 hover:underline text-sm font-semibold"           onClick={() => navigateTo("members")}         >           â† Quay láº¡i danh sÃ¡ch há»c viÃªn         </button>       </div>     );
  }

  return (     <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-300">       {/* Top back navigation */}       <div className="flex items-center justify-between">         <button           type="button"           className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"           onClick={() => navigateTo("members")}         >           <ArrowLeft className="w-4 h-4" />           <span>Quay láº¡i danh sÃ¡ch há»c viÃªn</span>         </button>          <span className="text-xs text-slate-400">           MÃ£ há»c viÃªn: <strong className="font-mono text-slate-700 dark:text-slate-200">{member.code}</strong>         </span>       </div>        {/* Hero Member Profile Card */}       <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">         <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">             <img               src={member.avatar}               alt={member.name}               className="w-20 h-20 rounded-2xl object-cover shrink-0 border-2 border-orange-500/20 shadow-md shadow-orange-500/10"             />             <div className="space-y-1.5">               <div className="flex items-center gap-2.5 flex-wrap">                 <h1 className="text-2xl font-bold text-slate-900 dark:text-white">                   {member.name}                 </h1>                 <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">                   Äang táº­p luyá»‡n                 </span>                 <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">                   {member.level}                 </span>               </div>                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">                 <span className="flex items-center gap-1">                   <Phone className="w-3.5 h-3.5 text-slate-400" />                   {member.phone || "0901234568"}                 </span>                 <span className="flex items-center gap-1">                   <Mail className="w-3.5 h-3.5 text-slate-400" />                   {member.email || "member@test.com"}                 </span>                 <span className="flex items-center gap-1">                   <Dumbbell className="w-3.5 h-3.5 text-slate-400" />                   MÃ´n: <strong className="text-slate-700 dark:text-slate-300">{member.sport}</strong>                 </span>               </div>                <div className="pt-1 flex items-center gap-2 text-xs">                 <span className="text-slate-400">Má»¥c tiÃªu huáº¥n luyá»‡n:</span>                 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300">                   <Target className="w-3 h-3 text-emerald-600" />                   {member.goal || "Sá»©c khá»e & SÄƒn cháº¯c cÆ¡"}                 </span>               </div>             </div>           </div>            {/* Quick Actions */}           <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">             <button               type="button"               onClick={() => navigateTo("chat")}               className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors shadow-sm shadow-orange-500/20"             >               <MessageSquare className="w-3.5 h-3.5" />               Nháº¯n tin trao Ä‘á»•i             </button>             <button               type="button"               onClick={() => navigateTo("curriculum")}               className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-sm"             >               <Plus className="w-3.5 h-3.5" />               Giao giÃ¡o Ã¡n má»›i             </button>           </div>         </div>       </div>        {/* KPI Cards (Matches 92% - 11/12 Sessions) */}       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">         {/* ChuyÃªn cáº§n */}         <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">           <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">             <span>Äá»˜ CHUYÃŠN Cáº¦N</span>             <CheckCircle2 className="w-4 h-4 text-emerald-500" />           </div>           <div className="mt-2 flex items-baseline gap-2">             <span className="text-2xl font-bold text-slate-900 dark:text-white">92%</span>             <span className="text-xs text-emerald-600 font-medium">11/12 buá»•i</span>           </div>           <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">             <div className="h-full bg-emerald-500 rounded-full" style={{ width: "92%" }}></div>           </div>         </div>          {/* CÃ¢n náº·ng & BMI */}         <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">           <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">             <span>CHá»ˆ Sá» THá»‚ CHáº¤T</span>             <Activity className="w-4 h-4 text-blue-500" />           </div>           <div className="mt-2 flex items-baseline gap-2">             <span className="text-2xl font-bold text-slate-900 dark:text-white">64.5 <span className="text-sm font-normal text-slate-500">kg</span></span>             <span className="text-xs text-blue-600 font-medium">BMI 21.8</span>           </div>           <p className="text-[11px] text-slate-400 mt-1">Cao: 172cm Â· Má»¡: 16.2%</p>         </div>          {/* Buá»•i táº­p gáº§n nháº¥t */}         <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">           <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">             <span>BUá»”I Gáº¦N NHáº¤T</span>             <Clock className="w-4 h-4 text-purple-500" />           </div>           <div className="mt-2">             <span className="text-sm font-bold text-slate-900 dark:text-white block truncate">Gym BodyCombat</span>             <span className="text-xs text-emerald-600 font-medium">CÃ³ máº·t (11/10/2026)</span>           </div>           <p className="text-[11px] text-slate-400 mt-1">HoÃ n thÃ nh 100% giÃ¡o Ã¡n</p>         </div>          {/* Tiáº¿n Ä‘á»™ má»¥c tiÃªu */}         <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">           <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">             <span>TIáº¾N Äá»˜ Má»¤C TIÃŠU</span>             <TrendingUp className="w-4 h-4 text-orange-500" />           </div>           <div className="mt-2 flex items-baseline gap-2">             <span className="text-2xl font-bold text-slate-900 dark:text-white">78%</span>             <span className="text-xs text-orange-600 font-medium">Giai Ä‘oáº¡n 1</span>           </div>           <p className="text-[11px] text-slate-400 mt-1">Sá»©c bá»n & cÆ¡ báº¯p sÄƒn cháº¯c</p>         </div>       </div>        {/* Main Grid: Left = Attendance & Workouts | Right = Coach Notes & Assessments */}       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">         {/* Left Column (2 cols) */}         <div className="lg:col-span-2 space-y-6">           {/* Lá»‹ch sá»­ Ä‘iá»ƒm danh (11 CÃ³ máº·t, 1 CÃ³ phÃ©p) */}           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">             <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">               <div className="flex items-center gap-2">                 <Calendar className="w-4 h-4 text-slate-500" />                 <h2 className="font-bold text-sm text-slate-900 dark:text-white">Lá»‹ch sá»­ Ä‘iá»ƒm danh</h2>                 <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">                   {attendanceHistory.length} ca dáº¡y                 </span>               </div>               <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">                 Tá»· lá»‡ tham dá»±: 92%               </span>             </div>              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[420px] overflow-y-auto">               {attendanceHistory.map((item) => (                 <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">                   <div className="space-y-1 min-w-0">                     <div className="flex items-center gap-2">                       <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">                         {item.className}                       </span>                       <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">                         {item.room}                       </span>                     </div>                     <div className="flex items-center gap-2 text-[11px] text-slate-400">                       <span>{item.date}</span>                       <span>â€¢</span>                       <span>{item.time}</span>                       {item.note && (                         <>                           <span>â€¢</span>                           <span className="text-slate-500 dark:text-slate-400 italic truncate max-w-[240px]">                             "{item.note}"                           </span>                         </>                       )}                     </div>                   </div>                    <div className="shrink-0">                     {item.status === "attended" && (                       <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">                         <CheckCircle2 className="w-3 h-3 text-emerald-600" />                         CÃ³ máº·t                       </span>                     )}                     {item.status === "excused" && (                       <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">                         <AlertCircle className="w-3 h-3 text-blue-600" />                         CÃ³ phÃ©p                       </span>                     )}                     {item.status === "late" && (                       <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">                         <Clock className="w-3 h-3 text-amber-600" />                         Äi trá»…                       </span>                     )}                   </div>                 </div>               ))}             </div>           </div>            {/* GiÃ¡o Ã¡n bÃ i táº­p Ä‘Ã£ giao */}           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">             <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">               <div className="flex items-center gap-2">                 <Dumbbell className="w-4 h-4 text-slate-500" />                 <h2 className="font-bold text-sm text-slate-900 dark:text-white">GiÃ¡o Ã¡n bÃ i táº­p Ä‘Ã£ giao</h2>                 <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">                   {assignedWorkouts.length} giÃ¡o Ã¡n                 </span>               </div>               <button                 type="button"                 onClick={() => navigateTo("curriculum")}                 className="text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"               >                 + ThÃªm giÃ¡o Ã¡n               </button>             </div>              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-6 space-y-6">               {assignedWorkouts.map((workout) => (                 <div key={workout.id} className="pt-4 first:pt-0">                   <div className="flex items-start justify-between gap-3">                     <div>                       <h3 className="font-bold text-sm text-slate-900 dark:text-white">                         {workout.name}                       </h3>                       <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">                         <span className="font-medium text-slate-600 dark:text-slate-300">{workout.sport}</span>                         <span>â€¢</span>                         <span>{workout.level}</span>                         <span>â€¢</span>                         <span>Thá»i lÆ°á»£ng: {workout.duration} phÃºt</span>                       </div>                     </div>                     <span                       className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${                         workout.status === "HoÃ n thÃ nh"                           ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200"                           : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200"                       }`}                     >                       {workout.status}                     </span>                   </div>                    {/* Exercise list sub-table */}                   <div className="mt-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">                       {workout.exercises.map((ex, idx) => (                         <div key={idx} className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">                           <div className="font-semibold text-slate-800 dark:text-slate-200">{ex.name}</div>                           <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-between">                             <span>{ex.reps}</span>                             <span className="text-orange-600 dark:text-orange-400">Nghá»‰: {ex.rest}</span>                           </div>                           {ex.note && (                             <div className="text-[10px] text-slate-400 italic mt-1 border-t border-slate-100 dark:border-slate-700 pt-1">                               * {ex.note}                             </div>                           )}                         </div>                       ))}                     </div>                   </div>                 </div>               ))}             </div>           </div>         </div>          {/* Right Column (1 col): Coach Notes & Assessments */}         <div className="space-y-6">           {/* Nháº­n xÃ©t & ÄÃ¡nh giÃ¡ cá»§a Coach */}           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">             <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">               <div className="flex items-center gap-2">                 <FileText className="w-4 h-4 text-orange-500" />                 <h2 className="font-bold text-sm text-slate-900 dark:text-white">Ghi chÃº & ÄÃ¡nh giÃ¡ cá»§a Coach</h2>               </div>             </div>              {/* Note form */}             <form onSubmit={handleAddNote} className="mt-4 space-y-2">               <textarea                 rows={3}                 value={newNote}                 onChange={(e) => setNewNote(e.target.value)}                 placeholder="Nháº­p ghi chÃº hoáº·c Ä‘Ã¡nh giÃ¡ buá»•i táº­p cho há»c viÃªn nÃ y..."                 className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"               />               <div className="flex items-center justify-between">                 {noteSaved ? (                   <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">                     <Check className="w-3.5 h-3.5" /> ÄÃ£ lÆ°u ghi chÃº!                   </span>                 ) : (                   <span></span>                 )}                 <button                   type="submit"                   disabled={!newNote.trim()}                   className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors"                 >                   LÆ°u nháº­n xÃ©t                 </button>               </div>             </form>              {/* Note stream */}             <div className="mt-4 space-y-2.5">               {notes.map((note, index) => (                 <div                   key={index}                   className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"                 >                   <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">                     <span>Huáº¥n luyá»‡n viÃªn Enam</span>                     <span>{index === 0 ? "HÃ´m nay" : `${index + 1} tuáº§n trÆ°á»›c`}</span>                   </div>                   <p>{note}</p>                 </div>               ))}             </div>           </div>            {/* Test Thá»ƒ lá»±c Ä‘á»‹nh ká»³ */}           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">             <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">               <div className="flex items-center gap-2">                 <Award className="w-4 h-4 text-emerald-500" />                 <h2 className="font-bold text-sm text-slate-900 dark:text-white">Kiá»ƒm tra Thá»ƒ lá»±c Äá»‹nh ká»³</h2>               </div>               <span className="text-[11px] font-semibold text-emerald-600">Äáº¡t chuáº©n</span>             </div>              <div className="mt-4 space-y-3">               <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">                 <span className="text-slate-600 dark:text-slate-300 font-medium">Chá»‘ng Ä‘áº©y (Push-up test)</span>                 <span className="font-bold text-slate-900 dark:text-white">25 cÃ¡i / phÃºt <span className="text-emerald-600 font-semibold">(Tá»‘t)</span></span>               </div>               <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">                 <span className="text-slate-600 dark:text-slate-300 font-medium">Plank giá»¯ cá»‘t lÃµi</span>                 <span className="font-bold text-slate-900 dark:text-white">90 giÃ¢y <span className="text-emerald-600 font-semibold">(Äáº¡t)</span></span>               </div>               <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">                 <span className="text-slate-600 dark:text-slate-300 font-medium">Bodyweight Squat</span>                 <span className="font-bold text-slate-900 dark:text-white">35 láº§n / phÃºt <span className="text-emerald-600 font-semibold">(Tá»‘t)</span></span>               </div>               <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">                 <span className="text-slate-600 dark:text-slate-300 font-medium">Äá»™ dáº»o cháº¡m mÅ©i chÃ¢n</span>                 <span className="font-bold text-slate-900 dark:text-white">+4 cm <span className="text-blue-600 font-semibold">(Cáº£i thiá»‡n)</span></span>               </div>             </div>           </div>         </div>       </div>     </div>   );
}


