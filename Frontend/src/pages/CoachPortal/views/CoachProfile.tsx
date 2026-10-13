import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  Plus,
  Trash2,
  Check,
  Camera,
  User,
  Sparkles
} from "lucide-react";

export default function CoachProfile({ navigateTo }: { navigateTo?: (screen: any) => void }) {
  const { profile, loading, updateProfile } = useUserProfile();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  /* Edit profile state */
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Nam");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [specialtiesStr, setSpecialtiesStr] = useState("");
  const [certsList, setCertsList] = useState<string[]>([]);
  const [newCertInput, setNewCertInput] = useState("");
  const [bio, setBio] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  /* Password state */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  /* Lock body scroll when any modal is open to eliminate double scrollbars */
  useEffect(() => {
    if (isEditModalOpen || isPasswordModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {       document.body.style.overflow = "unset";     };
  }, [isEditModalOpen, isPasswordModalOpen]);

  /* Sync internal fields whenever profile loads or changes */
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "Enam");
      setPhone(profile.phone || "0900 000 000");
      setEmail(profile.email || "hoxuananhnam1@gmail.com");
      setDob(profile.dob ? profile.dob.split("T")[0] : "1998-08-15");
      setGender(profile.gender || "Nam");
      setAvatarUrl(profile.avatarUrl || "");
      setExperienceYears(profile.experienceYears ?? 3);
      setSpecialtiesStr(profile.specialties || "Gym Fitness, Yoga, BodyCombat");
      setBio(
        profile.bio ||
          "Huáº¥n luyá»‡n viÃªn thá»ƒ hÃ¬nh chuyÃªn sÃ¢u vá» xÃ¢y dá»±ng cÆ¡ báº¯p, cáº£i thiá»‡n vÃ³c dÃ¡ng vÃ  phá»¥c há»“i chá»©c nÄƒng váº­n Ä‘á»™ng. LuÃ´n Ä‘á»“ng hÃ nh vÃ  truyá»n Ä‘á»™ng lá»±c cho há»c viÃªn."
      );

      const parsedCerts = profile.certifications
        ? profile.certifications.split(",").map((c) => c.trim()).filter(Boolean)
        : [
            "Chá»©ng chá»‰ Huáº¥n luyá»‡n viÃªn Thá»ƒ hÃ¬nh Quá»‘c táº¿ (ACE / NASM)",
            "SÆ¡ cáº¥p cá»©u & Há»“i sá»©c tim phá»•i (CPR / AED Certified)",
            "Chá»©ng chá»‰ Dinh dÆ°á»¡ng Thá»ƒ thao CÆ¡ báº£n",
          ];
      setCertsList(parsedCerts);
    }
  }, [profile]);

  const specialties = (profile?.specialties || specialtiesStr || "Gym Fitness, Yoga, BodyCombat")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const displayCerts = profile?.certifications
    ? profile.certifications.split(",").map((c) => c.trim()).filter(Boolean)
    : certsList.length > 0
    ? certsList
    : [
        "Chá»©ng chá»‰ Huáº¥n luyá»‡n viÃªn Thá»ƒ hÃ¬nh Quá»‘c táº¿ (ACE / NASM)",
        "SÆ¡ cáº¥p cá»©u & Há»“i sá»©c tim phá»•i (CPR / AED Certified)",
        "Chá»©ng chá»‰ Dinh dÆ°á»¡ng Thá»ƒ thao CÆ¡ báº£n",
      ];

  const handleOpenEdit = () => {
    setFullName(profile?.fullName || "Enam");
    setPhone(profile?.phone || "0900 000 000");
    setEmail(profile?.email || "hoxuananhnam1@gmail.com");
    setDob(profile?.dob ? profile.dob.split("T")[0] : "1998-08-15");
    setGender(profile?.gender || "Nam");
    setAvatarUrl(profile?.avatarUrl || "");
    setExperienceYears(profile?.experienceYears ?? 3);
    setSpecialtiesStr(profile?.specialties || "Gym Fitness, Yoga, BodyCombat");
    setBio(
      profile?.bio ||
        "Huáº¥n luyá»‡n viÃªn thá»ƒ hÃ¬nh chuyÃªn sÃ¢u vá» xÃ¢y dá»±ng cÆ¡ báº¯p, cáº£i thiá»‡n vÃ³c dÃ¡ng vÃ  phá»¥c há»“i chá»©c nÄƒng váº­n Ä‘á»™ng. LuÃ´n Ä‘á»“ng hÃ nh vÃ  truyá»n Ä‘á»™ng lá»±c cho há»c viÃªn."
    );

    const currentCerts = profile?.certifications
      ? profile.certifications.split(",").map((c) => c.trim()).filter(Boolean)
      : [
          "Chá»©ng chá»‰ Huáº¥n luyá»‡n viÃªn Thá»ƒ hÃ¬nh Quá»‘c táº¿ (ACE / NASM)",
          "SÆ¡ cáº¥p cá»©u & Há»“i sá»©c tim phá»•i (CPR / AED Certified)",
          "Chá»©ng chá»‰ Dinh dÆ°á»¡ng Thá»ƒ thao CÆ¡ báº£n",
        ];
    setCertsList(currentCerts);
    setNewCertInput("");
    setProfileMsg(null);
    setIsEditModalOpen(true);
  };

  const handleAddCert = () => {
    const trimmed = newCertInput.trim();
    if (trimmed && !certsList.includes(trimmed)) {
      setCertsList([...certsList, trimmed]);
      setNewCertInput("");
    }
  };

  const handleRemoveCert = (index: number) => {
    setCertsList(certsList.filter((_, i) => i !== index));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    const certsJoined = certsList.join(", ");

    try {
      if (updateProfile) {
        await updateProfile({
          fullName,
          phone,
          email,
          dob,
          gender,
          avatarUrl,
          specialties: specialtiesStr,
          certifications: certsJoined,
          bio,
          experienceYears: Number(experienceYears),
        });
      }

      setProfileMsg({ type: "success", text: "ÄÃ£ cáº­p nháº­t há»“ sÆ¡ cÃ¡ nhÃ¢n thÃ nh cÃ´ng!" });
      setTimeout(() => {
        setIsEditModalOpen(false);
        setProfileMsg(null);
      }, 1000);
    } catch (err: any) {
      setProfileMsg({
        type: "error",
        text: err?.message || "CÃ³ lá»—i xáº£y ra khi lÆ°u thÃ´ng tin. ÄÃ£ cáº­p nháº­t táº¡m thá»i.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordMsg({ type: "error", text: "Vui lÃ²ng nháº­p máº­t kháº©u hiá»‡n táº¡i." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Máº­t kháº©u má»›i pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Máº­t kháº©u xÃ¡c nháº­n khÃ´ng khá»›p." });
      return;
    }

    setSavingPassword(true);
    setTimeout(() => {
      setSavingPassword(false);
      setPasswordMsg({ type: "success", text: "Äá»•i máº­t kháº©u thÃ nh cÃ´ng!" });
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
    return (       <div className="flex items-center justify-center min-h-[400px]">         <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>       </div>     );
  }

  return (     <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">       {/* Top Banner Card */}       <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm">         <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">             <div className="relative group">               <UserAvatar                 src={profile?.avatarUrl || avatarUrl}                 name={profile?.fullName || fullName || "Enam"}                 className="w-24 h-24 rounded-2xl text-3xl font-bold ring-4 ring-slate-100 dark:ring-slate-800 object-cover shadow-sm bg-orange-500 text-white"               />               <button                 type="button"                 onClick={handleOpenEdit}                 className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded-full ring-2 ring-white dark:ring-slate-900 transition-colors shadow-sm"                 title="Thay Ä‘á»•i thÃ´ng tin & áº£nh Ä‘áº¡i diá»‡n"               >                 <Camera className="w-3.5 h-3.5" />               </button>             </div>              <div className="space-y-1.5">               <div className="flex flex-wrap items-center gap-3">                 <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">                   {profile?.fullName || fullName || "Enam"}                 </h1>                 <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200/60 dark:border-orange-500/20">                   COACH                 </span>               </div>               <p className="text-sm text-slate-500 dark:text-slate-400">                 MÃ£ HLV:{" "}                 <span className="font-mono font-medium text-slate-700 dark:text-slate-300">                   {profile?.id ? profile.id.substring(0, 8).toUpperCase() : "25F50FBA"}                 </span>                 {" Â· "}                 {profile?.experienceYears ?? experienceYears} nÄƒm kinh nghiá»‡m               </p>                {/* Specialty tags */}               <div className="flex flex-wrap gap-1.5 pt-1">                 {specialties.map((s, idx) => (                   <span                     key={idx}                     className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"                   >                     <Dumbbell className="w-3 h-3 text-slate-400" />                     {s}                   </span>                 ))}               </div>             </div>           </div>            <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">             <button               onClick={handleOpenEdit}               className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-sm"             >               <Edit3 className="w-3.5 h-3.5 text-slate-500" />               Cáº­p nháº­t há»“ sÆ¡             </button>             <button               onClick={() => setIsPasswordModalOpen(true)}               className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-sm"             >               <KeyRound className="w-3.5 h-3.5 text-slate-500" />               Äá»•i máº­t kháº©u             </button>           </div>         </div>          {/* Bio preview */}         <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">           <span className="font-semibold text-slate-800 dark:text-slate-200 mr-1.5">Tiá»ƒu sá»­:</span>           {profile?.bio || bio}         </div>       </div>        {/* Quick KPI Stat Cards */}       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">         <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">           <div className="flex items-center justify-between text-slate-400">             <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">               ÄÃ¡nh giÃ¡ há»c viÃªn             </span>             <Star className="w-4 h-4 text-amber-500 fill-amber-500" />           </div>           <div className="mt-3 flex items-baseline gap-1.5">             <span className="text-2xl font-bold text-slate-900 dark:text-white">4.9</span>             <span className="text-xs text-slate-400">/ 5.0 (98 lÆ°á»£t)</span>           </div>         </div>          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">           <div className="flex items-center justify-between text-slate-400">             <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">               Ca dáº¡y thÃ¡ng nÃ y             </span>             <Calendar className="w-4 h-4 text-blue-500" />           </div>           <div className="mt-3 flex items-baseline gap-1.5">             <span className="text-2xl font-bold text-slate-900 dark:text-white">28</span>             <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">100% hoÃ n thÃ nh</span>           </div>         </div>          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">           <div className="flex items-center justify-between text-slate-400">             <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">               Há»c viÃªn phá»¥ trÃ¡ch             </span>             <Dumbbell className="w-4 h-4 text-purple-500" />           </div>           <div className="mt-3 flex items-baseline gap-1.5">             <span className="text-2xl font-bold text-slate-900 dark:text-white">42</span>             <span className="text-xs text-slate-400">há»c viÃªn Ä‘ang theo</span>           </div>         </div>          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">           <div className="flex items-center justify-between text-slate-400">             <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">               ChuyÃªn cáº§n lá»›p             </span>             <CheckCircle2 className="w-4 h-4 text-emerald-500" />           </div>           <div className="mt-3 flex items-baseline gap-1.5">             <span className="text-2xl font-bold text-slate-900 dark:text-white">94%</span>             <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">+3% thÃ¡ng trÆ°á»›c</span>           </div>         </div>       </div>        {/* Main 2-Column Info Section */}       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">         {/* Left Column: Contact & Basic Info */}         <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">           <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">             <User className="w-4 h-4 text-orange-500" />             ThÃ´ng tin liÃªn há»‡           </h2>            <div className="space-y-4 text-sm">             <div className="flex items-start gap-3">               <Phone className="w-4 h-4 text-slate-400 mt-0.5" />               <div>                 <p className="text-xs text-slate-400">Sá»‘ Ä‘iá»‡n thoáº¡i</p>                 <p className="font-medium text-slate-800 dark:text-slate-200">                   {profile?.phone || phone || "0900 000 000"}                 </p>               </div>             </div>              <div className="flex items-start gap-3">               <Mail className="w-4 h-4 text-slate-400 mt-0.5" />               <div>                 <p className="text-xs text-slate-400">Email cÃ´ng viá»‡c</p>                 <p className="font-medium text-slate-800 dark:text-slate-200">                   {profile?.email || email || "hoxuananhnam1@gmail.com"}                 </p>               </div>             </div>              <div className="flex items-start gap-3">               <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />               <div>                 <p className="text-xs text-slate-400">NgÃ y sinh</p>                 <p className="font-medium text-slate-800 dark:text-slate-200">                   {profile?.dob                     ? new Date(profile.dob).toLocaleDateString("vi-VN", {                         day: "2-digit",                         month: "2-digit",                         year: "numeric",                       })                     : "15/08/1998"}                 </p>               </div>             </div>              <div className="flex items-start gap-3">               <Shield className="w-4 h-4 text-slate-400 mt-0.5" />               <div>                 <p className="text-xs text-slate-400">Giá»›i tÃ­nh</p>                 <p className="font-medium text-slate-800 dark:text-slate-200">                   {profile?.gender || gender || "Nam"}                 </p>               </div>             </div>              <div className="flex items-start gap-3">               <Award className="w-4 h-4 text-slate-400 mt-0.5" />               <div>                 <p className="text-xs text-slate-400">Tráº¡ng thÃ¡i cÃ´ng tÃ¡c</p>                 <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 mt-0.5">                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>                   Äang giáº£ng dáº¡y chÃ­nh thá»©c                 </span>               </div>             </div>           </div>         </div>          {/* Right Column: Certifications & Recognition */}         <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">           <div className="flex items-center justify-between">             <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">               <Award className="w-4 h-4 text-orange-500" />               Báº±ng cáº¥p & Chá»©ng chá»‰ chuyÃªn mÃ´n             </h2>             <div className="flex items-center gap-2">               <span className="text-xs text-slate-400">{displayCerts.length} chá»©ng chá»‰ Ä‘Ã£ xÃ¡c thá»±c</span>               <button                 type="button"                 onClick={handleOpenEdit}                 className="text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1"               >                 <Edit3 className="w-3 h-3" />                 Chá»‰nh sá»­a               </button>             </div>           </div>            <div className="divide-y divide-slate-100 dark:divide-slate-800">             {displayCerts.map((c, i) => (               <div key={i} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3">                 <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />                 <div className="flex-1">                   <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{c}</p>                   <p className="text-xs text-slate-400">ÄÃ£ kiá»ƒm tra bá»Ÿi Quáº£n lÃ½ Trung tÃ¢m SportCenter</p>                 </div>               </div>             ))}           </div>            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3">             <Shield className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />             <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">               ThÃ´ng tin báº±ng cáº¥p vÃ  chá»©ng chá»‰ Ä‘Æ°á»£c Ä‘á»“ng bá»™ vá»›i há»“ sÆ¡ nhÃ¢n sá»± cá»§a há»‡ thá»‘ng. Báº¡n cÃ³ thá»ƒ thÃªm hoáº·c cáº­p nháº­t cÃ¡c chá»©ng chá»‰ má»›i trong pháº§n Cáº­p nháº­t há»“ sÆ¡.             </p>           </div>         </div>       </div>        {/* EDIT PROFILE MODAL - FORM CHUáº¨N GIá»NG 'Táº O GIÃO ÃN Má»šI' */}       {isEditModalOpen &&         createPortal(           <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">               {/* Header giá»‘ng 'Táº¡o giÃ¡o Ã¡n má»›i' */}               <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">                 <h3 className="font-bold text-slate-900 dark:text-white text-base">                   Cáº­p nháº­t thÃ´ng tin Huáº¥n luyá»‡n viÃªn                 </h3>                 <button                   type="button"                   onClick={() => setIsEditModalOpen(false)}                   className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"                 >                   <X className="w-5 h-5" />                 </button>               </div>                {/* Form Body - scroll duy nháº¥t, spacing chuáº©n */}               <form onSubmit={handleSaveProfile} className="flex-1 flex flex-col overflow-hidden">                 <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs">                   {profileMsg && (                     <div                       className={`p-3 rounded-lg flex items-center gap-2 font-medium ${                         profileMsg.type === "success"                           ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"                           : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"                       }`}                     >                       <Check className="w-4 h-4 shrink-0" />                       <span>{profileMsg.text}</span>                     </div>                   )}                    <div>                     <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">                       Há» vÃ  tÃªn: <span className="text-rose-500">*</span>                     </label>                     <input                       type="text"                       required                       placeholder="VD: Enam..."                       value={fullName}                       onChange={(e) => setFullName(e.target.value)}                       className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"                     />                   </div>                    <div className="grid grid-cols-2 gap-3">                     <div>                       <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">                         Sá»‘ Ä‘iá»‡n thoáº¡i: <span className="text-rose-500">*</span>                       </label>                       <input                         type="text"                         required                         placeholder="VD: 0900 000 000"                         value={phone}                         onChange={(e) => setPhone(e.target.value)}                         className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"                       />                     </div>                     <div>                       <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">                         Email:                       </label>                       <input                         type="email"                         placeholder="email@example.com"                         value={email}                         onChange={(e) => setEmail(e.target.value)}                         className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"                       />                     </div>                   </div>                    <div className="grid grid-cols-3 gap-3">                     <div>                       <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">                         NgÃ y sinh:                       </label>                       <input                         type="date"                         value={dob}                         onChange={(e) => setDob(e.target.value)}                         className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"                       />                     </div>                     <div>                       <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">                         Giá»›i tÃ­nh:                       </label>                       <select                         value={gender}                         onChange={(e) => setGender(e.target.value)}                         className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"                       >                         <option value="Nam">Nam</option>                         <option value="Ná»¯">Ná»¯</option>                         <option value="KhÃ¡c">KhÃ¡c</option>                       </select>                     </div>                     <div>                       <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">                         Kinh nghiá»‡m (nÄƒm):                       </label>                       <input                         type="number"                         min={0}                         max={50}                         value={experienceYears}                         onChange={(e) => setExperienceYears(Number(e.target.value))}                         className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"                       />                     </div>                   </div>                    <div>                     <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">                       Link áº£nh Ä‘áº¡i diá»‡n (Avatar URL):                     </label>                     <input                       type="text"                       placeholder="https://... hoáº·c Ä‘á»ƒ trá»‘ng"                       value={avatarUrl}                       onChange={(e) => setAvatarUrl(e.target.value)}                       className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"                     />                   </div>                    <div>                     <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">                       ChuyÃªn mÃ´n (ngÄƒn cÃ¡ch báº±ng dáº¥u pháº©y):                     </label>                     <input                       type="text"                       placeholder="Gym Fitness, Yoga, BodyCombat, Boxing..."                       value={specialtiesStr}                       onChange={(e) => setSpecialtiesStr(e.target.value)}                       className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"                     />                   </div>                    {/* Chá»©ng chá»‰ - Style giá»‘ng danh sÃ¡ch bÃ i táº­p cá»§a 'Táº¡o giÃ¡o Ã¡n má»›i' */}                   <div className="pt-1">                     <div className="flex items-center justify-between mb-2">                       <span className="font-bold text-slate-800 dark:text-slate-200">                         Danh sÃ¡ch báº±ng cáº¥p & chá»©ng chá»‰ ({certsList.length})                       </span>                       <button                         type="button"                         onClick={handleAddCert}                         className="px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"                       >                         <Plus className="w-3 h-3" /> ThÃªm chá»©ng chá»‰                       </button>                     </div>                      <div className="flex gap-2 mb-2">                       <input                         type="text"                         placeholder="Nháº­p tÃªn chá»©ng chá»‰ má»›i rá»“i báº¥m 'ThÃªm chá»©ng chá»‰'..."                         value={newCertInput}                         onChange={(e) => setNewCertInput(e.target.value)}                         onKeyDown={(e) => {                           if (e.key === "Enter") {                             e.preventDefault();                             handleAddCert();                           }                         }}                         className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"                       />                     </div>                      <div className="flex flex-col gap-2">                       {certsList.map((c, idx) => (                         <div                           key={idx}                           className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-2"                         >                           <div className="flex items-center gap-2 flex-1">                             <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />                             <span className="font-medium text-slate-800 dark:text-slate-200">{c}</span>                           </div>                           <button                             type="button"                             onClick={() => handleRemoveCert(idx)}                             className="p-1.5 text-slate-400 hover:text-rose-500 rounded transition-colors"                             title="XÃ³a chá»©ng chá»‰ nÃ y"                           >                             <Trash2 className="w-4 h-4" />                           </button>                         </div>                       ))}                     </div>                   </div>                    <div>                     <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">                       Tiá»ƒu sá»­ & PhÆ°Æ¡ng chÃ¢m huáº¥n luyá»‡n:                     </label>                     <textarea                       rows={3}                       placeholder="Ghi chÃº thÃªm vá» phong cÃ¡ch huáº¥n luyá»‡n, thÃ nh tÃ­ch cÃ¡ nhÃ¢n..."                       value={bio}                       onChange={(e) => setBio(e.target.value)}                       className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"                     />                   </div>                 </div>                  {/* Footer giá»‘ng 'Táº¡o giÃ¡o Ã¡n má»›i' */}                 <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">                   <button                     type="button"                     onClick={() => setIsEditModalOpen(false)}                     className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"                   >                     Há»§y                   </button>                   <button                     type="submit"                     disabled={savingProfile}                     className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-lg shadow-sm transition-colors"                   >                     {savingProfile ? "Äang lÆ°u..." : "LÆ°u thay Ä‘á»•i"}                   </button>                 </div>               </form>             </div>           </div>,           document.body         )}        {/* CHANGE PASSWORD MODAL - CHUáº¨N GIá»NG 'Táº O GIÃO ÃN Má»šI' */}       {isPasswordModalOpen &&         createPortal(           <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">               <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">                 <h3 className="font-bold text-slate-900 dark:text-white text-base">                   Äá»•i máº­t kháº©u tÃ i khoáº£n                 </h3>                 <button                   type="button"                   onClick={() => setIsPasswordModalOpen(false)}                   className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"                 >                   <X className="w-5 h-5" />                 </button>               </div>                <form onSubmit={handleSavePassword}>                 <div className="p-5 flex flex-col gap-4 text-xs">                   {passwordMsg && (                     <div                       className={`p-3 rounded-lg flex items-center gap-2 font-medium ${                         passwordMsg.type === "success"                           ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"                           : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"                       }`}                     >                       <span>{passwordMsg.text}</span>                     </div>                   )}                    <div>                     <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">                       Máº­t kháº©u hiá»‡n táº¡i: <span className="text-rose-500">*</span>                     </label>                     <input                       type="password"                       required                       placeholder="Nháº­p máº­t kháº©u hiá»‡n táº¡i"                       value={currentPassword}                       onChange={(e) => setCurrentPassword(e.target.value)}                       className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"                     />                   </div>                    <div>                     <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">                       Máº­t kháº©u má»›i: <span className="text-rose-500">*</span>                     </label>                     <input                       type="password"                       required                       placeholder="Tá»‘i thiá»ƒu 6 kÃ½ tá»±"                       value={newPassword}                       onChange={(e) => setNewPassword(e.target.value)}                       className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"                     />                   </div>                    <div>                     <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">                       XÃ¡c nháº­n máº­t kháº©u má»›i: <span className="text-rose-500">*</span>                     </label>                     <input                       type="password"                       required                       placeholder="Nháº­p láº¡i máº­t kháº©u má»›i"                       value={confirmPassword}                       onChange={(e) => setConfirmPassword(e.target.value)}                       className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"                     />                   </div>                 </div>                  <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">                   <button                     type="button"                     onClick={() => setIsPasswordModalOpen(false)}                     className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"                   >                     Há»§y                   </button>                   <button                     type="submit"                     disabled={savingPassword}                     className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm text-xs transition-colors"                   >                     {savingPassword ? "Äang xá»­ lÃ½..." : "Cáº­p nháº­t máº­t kháº©u"}                   </button>                 </div>               </form>             </div>           </div>,           document.body         )}     </div>   );
}

