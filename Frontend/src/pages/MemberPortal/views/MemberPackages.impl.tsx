import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { MemberScreen } from "../types";
import {
    PackageAPI, CatalogPackage,
    PackageOrder, PackagePeriod, MembershipTier, SportFormat, getMembershipStatus, MembershipStatus,
} from "../../../services/packageApi";
import {
    Crown, Sparkles, ShieldCheck, CheckCircle2,
    Clock, ArrowRight, CreditCard, Dumbbell, Zap, Calendar,
    Ticket, Droplets, Layers, Lock, RefreshCw, AlertCircle,
    X, ChevronRight, Activity, Flame, Info, QrCode,
    Building,
} from "lucide-react";
import UniversalPaymentModal, { UniversalPaymentItem } from "../components/UniversalPaymentModal";
interface Props {
    onNavigate: (screen: MemberScreen) => void; onCheckout?: (item: CatalogPackage,
        duration: PackagePeriod, discountPct: number) => void;
}
export default function MemberPackages({ onNavigate, onCheckout }: Props) {
    // State
    const [activeTab, setActiveTab] = useState<"membership" | "sport">("membership"); const [catalog, setCatalog] = useState<CatalogPackage[]>([]); const [orders, setOrders] = useState<PackageOrder[]>([]); const [loading, setLoading] = useState(true); const [selectedDuration, setSelectedDuration] = useState<PackagePeriod>(1); const [sportFilter, setSportFilter] = useState("all");
    const [formatFilter, setFormatFilter] = useState<"all" | SportFormat>("all");
    // Quick checkout modal state
    const [selectedPackage, setSelectedPackage] = useState<CatalogPackage | null>(null);
    const [checkoutDuration, setCheckoutDuration] = useState<PackagePeriod>(1);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
    // Load data
    const loadData = useCallback(async () => {
        try {
            setLoading(true); const [apiCatalog, apiOrders] = await Promise.all([PackageAPI.getPackages().catch(() => []), PackageAPI.getMyOrders().catch(() => []),
            ]); setCatalog(apiCatalog || []); setOrders(apiOrders || []);
        } catch (err) { console.warn("Failed to load packages from API", err); } finally {
            setLoading(false);
        }
    }, []); useEffect(() => { void loadData(); }, [loadData]);
    useEffect(() => {
        const handleSwitchTab = (e: Event) => {
            const customEvent = e as CustomEvent<string>;
            if (customEvent.detail === "sport" || customEvent.detail === "membership") {
                setActiveTab(customEvent.detail);
            }
        };
        window.addEventListener("switch-packages-tab", handleSwitchTab);
        return () => window.removeEventListener("switch-packages-tab", handleSwitchTab);
    }, []);
    // Compute active membership status
    const membershipStatus = useMemo<MembershipStatus>(() => {
        const status = getMembershipStatus(orders, catalog); if (status) return status; return {
            tier: "basic", name: "Hội viên Cơ bản",
            benefits: ["Hạng mặc định miễn phí trọn đời", "Có thể mua riêng từng gói môn tập", "Tủ đồ tiêu chuẩn trong ca tập", "1 lần đo InBody khi kích hoạt",],
            groupDiscountPct: 0, coachDiscountPct: 0, bookingAdvanceHours: 24, lockerTerms: "Tủ đồ tiêu chuẩn trong ca tập.",
        };
    }, [orders, catalog]);
    // Filter membership packages
    const membershipPackages = useMemo(() => { return catalog.filter((pkg) => pkg.category === "membership" && pkg.isActive); }, [catalog]);
    // Active sport orders
    const activeSportOrders = useMemo(() => {
        const now = new Date(); const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`; return orders.filter((order) => order.status === "paid" &&
            order.packageSnapshot.category === "sport" && (!order.endDate || order.endDate.slice(0, 10) >= todayStr));
    }, [orders]);
    // Available sport packages for browsing
    const availableSportPackages = useMemo(() => {
        return catalog.filter((pkg) => {
            if (pkg.category !== "sport" || !pkg.isActive) return false; if (sportFilter !== "all" && pkg.sport !== sportFilter) return false; if (formatFilter !== "all" && pkg.format !== formatFilter) return false; return true;
        });
    }, [catalog, sportFilter, formatFilter]);
    // Sport options for filter dropdown
    const sportOptions = useMemo(() => {
        const set = new Set<string>(); catalog.filter((p) => p.category === "sport" && p.sport).forEach((p) => set.add(p.sport!)); return Array.from(set);
    }, [catalog]);
    // Calculate discount for a package based on active membership tier
    const calculateDiscount = useCallback((pkg: CatalogPackage): { discountPct: number; originalPrice: number; finalPrice: number } => {
        const orig = pkg.prices[selectedDuration] || pkg.prices[1] || 0; if (pkg.category === "membership") { return { discountPct: 0, originalPrice: orig, finalPrice: orig }; }
        let discountPct = 0; if (pkg.format === "coach") { discountPct = membershipStatus.coachDiscountPct || 0; } else { discountPct = membershipStatus.groupDiscountPct || 0; }
        const finalPrice = Math.round(orig * (1 - discountPct / 100)); return { discountPct, originalPrice: orig, finalPrice };
    }, [membershipStatus, selectedDuration]);
    // Handle start purchase
    const handleStartPurchase = (pkg: CatalogPackage) => {
        setSelectedPackage(pkg);
        setCheckoutDuration(selectedDuration);
    };

    const universalPaymentItem = useMemo<UniversalPaymentItem | null>(() => {
        if (!selectedPackage) return null;
        const { discountPct, originalPrice, finalPrice } = calculateDiscount(selectedPackage);
        return {
            id: selectedPackage.id,
            categoryTitle: selectedPackage.category === "membership" ? "ĐĂNG KÝ GÓI THÀNH VIÊN" : "ĐĂNG KÝ GÓI MÔN TẬP",
            title: selectedPackage.name,
            subtitle: `${checkoutDuration} tháng • ${selectedPackage.sport || "Hội viên"}`,
            description: selectedPackage.description,
            originalPrice,
            discountPct,
            discountAmount: originalPrice - finalPrice,
            finalPrice,
            memoPrefix: selectedPackage.category === "membership" ? "MEMBER" : "SPORT",
        };
    }, [selectedPackage, checkoutDuration, calculateDiscount]);

    const handleUniversalCheckoutSuccess = async (method: "qr" | "wallet" | "card" | "counter") => {
        if (!selectedPackage) return;
        const pkgName = selectedPackage.name;
        try {
            await PackageAPI.checkout(selectedPackage.id, checkoutDuration, method);
            setSelectedPackage(null);
            setFeedback({
                type: "success",
                text: method === "counter"
                    ? `Đã tạo đơn đăng ký gói "${pkgName}". Vui lòng thanh toán tại quầy lễ tân để kích hoạt!`
                    : `Thanh toán thành công gói "${pkgName}"! Quyền lợi đã được kích hoạt ngay lập tức.`,
            });
            await loadData();
        } catch (err: any) {
            setFeedback({
                type: "error",
                text: err?.message || "Không thể hoàn tất đơn đăng ký gói tập. Vui lòng thử lại.",
            });
        }
    };
    return (<div className="space-y-6"> {/* Toast feedback */} {feedback && (<div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-lg transition-all animate-fadeIn ${feedback.type === "success" ? "bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200" : "bg-red-50 dark:bg-red-950/70 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"}`} > <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (<CheckCircle2 className="w-5 h-5 shrink-0" />) : (<AlertCircle className="w-5 h-5 shrink-0" />)} <span>{feedback.text}</span>
        </div> <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-75 rounded-lg" > <X className="w-4 h-4" />
        </button> </div>)} {/* HEADER WITH CATEGORY TABS */} <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"> <div>
            <div className="flex items-center gap-2"> <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300"> Trung Tâm Thể Thao Đa Năng </span> </div> <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                Gói tập & Dịch vụ của tôi </h2> <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed"> Hệ thống phân tách rõ ràng giữa <strong>Gói Thành Viên</strong> (nền tảng đặc quyền, chiết khấu, tiện ích thư giãn) và <strong>Gói Môn Tập</strong> (quyền vào sàn tập riêng từng môn: Gym, Bơi, Yoga, Boxing...). </p> </div>
            {/* Tab switchers */} <div className="flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 shrink-0"> <button type="button" onClick={() => setActiveTab("membership")} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === "membership" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`} > <Crown className="w-4 h-4 text-slate-500" />
                <span>1. Gói Thành Viên</span> <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-slate-100 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300"> {membershipStatus.tier.toUpperCase()} </span> </button> <button
                    type="button" onClick={() => setActiveTab("sport")} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === "sport" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`} > <Dumbbell className="w-4 h-4" /> <span>2. Gói Môn Tập</span> {activeSportOrders.length > 0 && (<span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            {activeSportOrders.length} đang có </span>)} </button> </div> </div>
        {/* ========================================================================= */} {/* TAB 1: GÓI THÀNH VIÊN (MEMBERSHIP PASS)                                     */} {/* ========================================================================= */} {activeTab === "membership" && (<div className="space-y-6"> {/* Active Membership Digital Card */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white p-7 shadow-xl"> {/* Ambient background decoration */} <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-gradient-to-br from-slate-500/20 via-slate-500/10 to-transparent blur-3xl pointer-events-none" /> <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-60 h-60 rounded-full bg-gradient-to-tr from-emerald-500/20 to-transparent blur-2xl pointer-events-none" /> <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10"> <div className="flex items-center gap-4">
                <div className={`size-16 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${membershipStatus.tier === "premium" ? "bg-gradient-to-br from-slate-400 to-slate-500 text-slate-950 shadow-slate-500/30" : membershipStatus.tier === "plus" ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 shadow-emerald-500/30"
                    : "bg-gradient-to-br from-slate-600 to-slate-800 text-white"}`} > <Crown className="w-8 h-8" /> </div> <div>
                    <div className="flex items-center gap-2"> <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase"> Thẻ Thành Viên Số </span> <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${membershipStatus.tier === "premium" ? "bg-slate-400 text-slate-950" : membershipStatus.tier === "plus" ? "bg-emerald-400 text-slate-950" : "bg-slate-700 text-slate-200"}`}
                    > {membershipStatus.name} </span> </div> <h3 className="text-2xl font-black tracking-tight mt-1"> {membershipStatus.tier === "premium"
                        ? "Hạng Premium VIP" : membershipStatus.tier === "plus" ? "Hạng Plus Member" : "Hạng Cơ Bản (Basic)"} </h3> <p className="text-xs text-slate-400 mt-0.5">
                        {membershipStatus.tier === "basic" ? "Hạng miễn phí trọn đời • Quyền lợi mặc định mua lẻ từng môn tập" : `Thời hạn: ${membershipStatus.startDate ? new Date(membershipStatus.startDate).toLocaleDateString("vi-VN") : "Hôm nay"} đến ${membershipStatus.endDate ? new Date(membershipStatus.endDate).toLocaleDateString("vi-VN") : "Đang hoạt động"}`} </p> </div> </div>
                {membershipStatus.tier === "basic" ? (<button type="button" onClick={() => {
                    const plusPkg = catalog.find((p) => p.tier === "plus"); if (plusPkg) handleStartPurchase(plusPkg);
                }} className="px-6 py-3 rounded-2xl bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-300 hover:to-slate-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-slate-500/25 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer" > <Sparkles className="w-4 h-4" /> <span>Nâng cấp nhận thêm đặc quyền</span> </button>
                ) : (<div className="flex items-center gap-3"> <button type="button" onClick={() => {
                    const cur = catalog.find((p) => p.tier === membershipStatus.tier);
                    if (cur) handleStartPurchase(cur);
                }} className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all flex items-center gap-1.5" > <RefreshCw className="w-3.5 h-3.5" /> <span>Gia hạn thẻ</span>
                </button> </div>)} </div> {/* 6 Key Perks Grid */} <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6">
                    {/* 1. Discount */} <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col justify-between"> <div className="flex items-center gap-2 text-slate-400"> <Flame className="w-4 h-4 text-slate-400" /> <span className="text-[11px] font-semibold">Ưu đãi mua môn</span> </div>
                        <div className="mt-2 text-sm font-black text-white"> {membershipStatus.tier === "premium" ? (<span className="text-slate-400">Giảm 10% / 5%</span>) : membershipStatus.tier === "plus" ? (<span className="text-emerald-400">Giảm 5% / 2%</span>) : (
                            <span className="text-slate-400">Giá gốc (0%)</span>)} </div> <span className="text-[10px] text-slate-400 mt-0.5"> Lớp nhóm & PT 1-1 </span>
                    </div> {/* 2. Advance Booking */} <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col justify-between"> <div className="flex items-center gap-2 text-slate-400"> <Clock className="w-4 h-4 text-slate-400" /> <span className="text-[11px] font-semibold">Đặt lịch trước</span>
                    </div> <div className="mt-2 text-sm font-black text-white"> {membershipStatus.bookingAdvanceHours || 24} giờ </div> <span className="text-[10px] text-slate-400 mt-0.5"> {membershipStatus.tier === "premium"
                        ? "Trước 5 ngày (VIP)" : membershipStatus.tier === "plus" ? "Trước 3 ngày" : "Trước 24 giờ"} </span> </div>
                    {/* 3. Guest Pass */} <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col justify-between"> <div className="flex items-center gap-2 text-slate-400"> <Ticket className="w-4 h-4 text-slate-400" /> <span className="text-[11px] font-semibold">Vé mời bạn bè</span> </div>
                        <div className="mt-2 text-sm font-black text-white"> {membershipStatus.tier === "premium" ? (<span className="text-emerald-400">2 lượt / tháng</span>) : membershipStatus.tier === "plus" ? (<span className="text-emerald-400">1 lượt / tháng</span>) : (
                            <span className="text-slate-400">0 lượt</span>)} </div> <span className="text-[10px] text-slate-400 mt-0.5"> 1 Day-Pass trải nghiệm </span>
                    </div> {/* 4. Sauna & Jacuzzi */} <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col justify-between"> <div className="flex items-center gap-2 text-slate-400"> <Droplets className="w-4 h-4 text-slate-400" /> <span className="text-[11px] font-semibold">Xông hơi & Bồn sục</span>
                    </div> <div className="mt-2 text-sm font-black text-white"> {membershipStatus.tier === "premium" ? (<span className="text-slate-300">Miễn phí Sauna</span>) : (<span className="text-slate-500">Chưa hỗ trợ</span>
                    )} </div> <span className="text-[10px] text-slate-400 mt-0.5"> Đá muối & Jacuzzi </span> </div>
                    {/* 5. Smart Locker & Towel */} <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col justify-between"> <div className="flex items-center gap-2 text-slate-400"> <Lock className="w-4 h-4 text-slate-400" /> <span className="text-[11px] font-semibold">Tủ đồ & Khăn tập</span> </div>
                        <div className="mt-2 text-sm font-black text-white truncate"> {membershipStatus.tier === "premium" ? "Tủ riêng + Khăn VIP" : membershipStatus.tier === "plus" ? "Tủ thường + 1 khăn" : "Tủ đồ thường"}
                        </div> <span className="text-[10px] text-slate-400 mt-0.5"> Trong buổi tập </span> </div> {/* 6. InBody & AI */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col justify-between"> <div className="flex items-center gap-2 text-slate-400"> <Activity className="w-4 h-4 text-slate-400" /> <span className="text-[11px] font-semibold">InBody & Trợ lý AI</span> </div> <div className="mt-2 text-sm font-black text-white">
                        {membershipStatus.tier === "premium" ? (<span className="text-slate-300">Không giới hạn</span>) : membershipStatus.tier === "plus" ? (<span className="text-slate-300">1 lần / tháng</span>) : (<span className="text-slate-400">1 lần kích hoạt</span>
                        )} </div> <span className="text-[10px] text-slate-400 mt-0.5"> Tư vấn thực đơn & cơ </span> </div>
                </div> </div> {/* Membership Tiers Upgrade Section */} <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6"> <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"> <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white"> Bảng Hạng Thành Viên Chuẩn </h3> <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5"> Nâng cấp gói thành viên để tự động giảm giá cho toàn bộ các gói môn tập và tận hưởng đặc quyền cao cấp </p>
                </div> {/* Duration selector */} <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start sm:self-auto"> {([1, 3, 6, 12] as PackagePeriod[]).map((period) => (<button key={period}
                    type="button" onClick={() => setSelectedDuration(period)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedDuration === period ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`} > {period} Tháng {period > 1 && <span className="text-[10px] opacity-80">(-{period === 3 ? "10%" : period === 6 ? "15%" : "20%"})</span>} </button>))} </div>
                </div> {/* 3 Tier Cards */} <div className="grid grid-cols-1 md:grid-cols-3 gap-5"> {membershipPackages.map((pkg) => {
                    const isCurrentTier = membershipStatus.tier === pkg.tier; const price = pkg.prices[selectedDuration] || 0;
                    const isPremium = pkg.tier === "premium"; const isPlus = pkg.tier === "plus"; return (<div key={pkg.id} className={`p-6 rounded-3xl border flex flex-col justify-between transition-all relative ${isPremium ? "bg-gradient-to-b from-slate-50/50 via-white to-white dark:from-slate-950/20 dark:via-slate-900 dark:to-slate-900 border-emerald-400 dark:border-emerald-600 shadow-lg ring-1 ring-emerald-500/30" : isPlus ? "bg-gradient-to-b from-emerald-50/40 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 border-emerald-300 dark:border-emerald-700/60 shadow-sm" : "bg-slate-50/60 dark:bg-slate-850/60 border-slate-200 dark:border-slate-800"}`}
                    > {isPremium && (<div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-emerald-600 text-white shadow-sm flex items-center gap-1"> <Sparkles className="w-3 h-3" /> <span>Khuyên dùng tốt nhất</span> </div>
                    )} <div> <div className="flex items-center justify-between"> <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${isPremium
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300" : isPlus ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`} >
                        Hạng {pkg.name} </span> {isCurrentTier && (<span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"> <CheckCircle2 className="w-3.5 h-3.5" /> Đang dùng
                        </span>)} </div> <h4 className="text-lg font-black text-slate-900 dark:text-white mt-3"> {pkg.name} </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2"> {pkg.description} </p> <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800"> {price === 0 ? (<span className="text-2xl font-black text-slate-900 dark:text-white">
                                Miễn phí </span>) : (<div> <span className="text-2xl font-black text-slate-900 dark:text-white"> {price.toLocaleString("vi-VN")} đ
                                </span> <span className="text-xs text-slate-500 ml-1"> / {selectedDuration} tháng </span> {selectedDuration > 1 && (<div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                                    ~{Math.round(price / selectedDuration).toLocaleString("vi-VN")} đ / tháng </div>)} </div>)} </div>
                            {/* Benefits list */} <ul className="mt-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-300"> {pkg.benefits.map((b, idx) => (<li key={idx} className="flex items-start gap-2"> <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isPremium || isPlus ? "text-emerald-500" : "text-slate-400"}`}
                            /> <span>{b}</span> </li>))} </ul> </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800"> {isCurrentTier ? (pkg.tier === "basic" ? (<button disabled className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold cursor-not-allowed text-center"
                        > Hạng mặc định của bạn </button>) : (<button type="button"
                            onClick={() => handleStartPurchase(pkg)} className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer" > <RefreshCw className="w-3.5 h-3.5" /> <span>Gia hạn thêm {selectedDuration} tháng</span> </button>
                        )) : (<button type="button" onClick={() => handleStartPurchase(pkg)} className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${isPremium ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20" : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500"}`} > <span>Nâng cấp ngay</span>
                            <ArrowRight className="w-4 h-4" /> </button>)} </div> </div>);
                })} </div> </div> </div>)} {/* ========================================================================= */}
        {/* TAB 2: GÓI MÔN TẬP (SPORT PACKAGES)                                        */} {/* ========================================================================= */} {activeTab === "sport" && (<div className="space-y-6"> {/* SECTION 2A: MY ACTIVE SPORT PACKAGES */} <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between"> <div> <h3 className="text-base font-extrabold text-slate-900 dark:text-white"> Gói Môn Bạn Đang Sở Hữu </h3> <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Các gói cấp quyền vào sàn tập Gym, Bể bơi, Studio Yoga hoặc đặt lịch Huấn luyện viên </p> </div> <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"> {activeSportOrders.length} gói hoạt động </span>
            </div> {activeSportOrders.length === 0 ? (<div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-dashed border-slate-200 dark:border-slate-700 text-center flex flex-col items-center justify-center"> <div className="size-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3"> <Dumbbell className="w-7 h-7" /> </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200"> Bạn chưa kích hoạt gói môn tập nào </h4> <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1"> Gói thành viên chỉ cung cấp đặc quyền giảm giá và tiện ích. Để vào sàn tập Gym, Bơi, Yoga hay Boxing, hãy đăng ký gói môn bên dưới! </p>
                <a href="#store-sports" className="mt-4 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-500 dark:text-slate-950 text-xs font-bold transition-all" > Khám phá gói môn mở bán </a>
            </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"> {activeSportOrders.map((order) => {
                const pkg = order.packageSnapshot; const daysLeft = order.endDate
                    ? Math.max(0, Math.ceil((new Date(order.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    ) : 30; return (<div key={order.id} className="p-5 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                    > <div> <div className="flex items-center justify-between"> <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"> {pkg.sport || "Thể thao"} •{" "} {pkg.format === "coach"
                        ? "Coach 1–1" : pkg.format === "group" ? "Lớp nhóm" : "Tự tập"} </span> <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                            Còn {daysLeft} ngày </span> </div> <h4 className="text-base font-bold text-slate-900 dark:text-white mt-3"> {pkg.name} </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5"> Khu vực: <strong>{pkg.area || "Toàn khu"}</strong> </p> <div className="mt-3 p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/70 space-y-1 text-xs"> <div className="flex justify-between text-slate-600 dark:text-slate-300"> <span>Thời hạn hiệu lực:</span>
                                <span className="font-semibold"> {order.startDate ? new Date(order.startDate).toLocaleDateString("vi-VN") : "Bắt đầu"} - {order.endDate ? new Date(order.endDate).toLocaleDateString("vi-VN") : "Vô thời hạn"} </span> </div> {pkg.sessionsPerMonth && (<div className="flex justify-between text-slate-600 dark:text-slate-300">
                                    <span>Số buổi định mức:</span> <span className="font-semibold"> {pkg.sessionsPerMonth} buổi / tháng </span> </div>)}
                            </div> </div> <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2"> {pkg.format !== "self" && (<button type="button"
                                onClick={() => onNavigate("booking")} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs" > Đặt lịch tập </button>)}
                            <button type="button" onClick={() => handleStartPurchase(pkg)} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold transition-all" > Gia hạn gói môn
                            </button> </div> </div>);
            })} </div>
            )} </div> {/* SECTION 2B: BROWSE SPORT PACKAGES STORE */} <div id="store-sports" className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6"
            > <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"> <div> <h3 className="text-base font-extrabold text-slate-900 dark:text-white"> Danh Mục Gói Môn Tập Mở Bán </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5"> Đã tự động tính chiết khấu giảm giá theo <strong>Hạng {membershipStatus.name}</strong> của bạn </p> </div> {/* Filters */} <div className="flex flex-wrap items-center gap-2.5">
                        {/* Sport filter */} <select value={sportFilter} onChange={(e) => setSportFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none" >
                            <option value="all">Tất cả bộ môn</option> {sportOptions.map((s) => (<option key={s} value={s}> {s} </option>))}
                        </select> {/* Format filter */} <select value={formatFilter} onChange={(e) => setFormatFilter(e.target.value as any)} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
                        > <option value="all">Tất cả hình thức</option> <option value="self">Tự tập (Self)</option> <option value="group">Lớp nhóm (Group)</option> <option value="coach">Huấn luyện 1–1 (Coach)</option> </select>
                        {/* Duration selector */} <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"> {([1, 3, 6, 12] as PackagePeriod[]).map((p) => (<button key={p} type="button"
                            onClick={() => setSelectedDuration(p)} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${selectedDuration === p ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                        > {p}T </button>))} </div> </div>
                </div> {/* Sport Package Cards Grid */} <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"> {availableSportPackages.map((pkg) => {
                    const { discountPct, originalPrice, finalPrice } = calculateDiscount(pkg); const isCoach = pkg.format === "coach";
                    const isGroup = pkg.format === "group"; return (<div key={pkg.id} className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-850 shadow-xs flex flex-col justify-between hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all group" >
                        <div> {/* Top tags */} <div className="flex items-center justify-between"> <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"> {pkg.sport} • {isCoach ? "Coach 1–1" : isGroup ? "Lớp nhóm" : "Tự tập"} </span>
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400"> {pkg.area} </span> </div> <h4 className="text-base font-bold text-slate-900 dark:text-white mt-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"> {pkg.name}
                            </h4> <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2"> {pkg.description} </p> {/* Pricing block with automatic Member discount */} <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                                {discountPct > 0 ? (<div> <div className="flex items-center gap-2"> <span className="text-xs text-slate-400 line-through"> {originalPrice.toLocaleString("vi-VN")} đ </span>
                                    <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"> Giảm {discountPct}% (Hạng {membershipStatus.name}) </span> </div> <div className="mt-1"> <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                                        {finalPrice.toLocaleString("vi-VN")} đ </span> <span className="text-xs text-slate-500 ml-1"> / {selectedDuration} tháng </span> </div>
                                </div>) : (<div> <span className="text-xl font-black text-slate-900 dark:text-white"> {finalPrice.toLocaleString("vi-VN")} đ </span>
                                    <span className="text-xs text-slate-500 ml-1"> / {selectedDuration} tháng </span> </div>)} {selectedDuration > 1 && (
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5"> ~{Math.round(finalPrice / selectedDuration).toLocaleString("vi-VN")} đ / tháng </div>)} </div> {/* Benefits & Scope */}
                            <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300"> {pkg.benefits.map((b, idx) => (<li key={idx} className="flex items-start gap-2"> <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" /> <span>{b}</span> </li>
                            ))} </ul> </div> <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800"> <button type="button"
                                onClick={() => handleStartPurchase(pkg)} className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer" > <span>Đăng ký gói môn</span> <ArrowRight className="w-4 h-4" /> </button>
                        </div> </div>);
                })} </div> </div>
        </div>)}

        {/* UNIVERSAL PAYMENT MODAL */}
        <UniversalPaymentModal
            isOpen={!!selectedPackage}
            item={universalPaymentItem}
            onClose={() => setSelectedPackage(null)}
            onSuccess={handleUniversalCheckoutSuccess}
        />
      </div>
    );
}


