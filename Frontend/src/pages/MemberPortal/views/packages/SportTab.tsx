import React from "react";
import { Dumbbell, CheckCircle2, ArrowRight } from "lucide-react";
import type {
  CatalogPackage,
  PackageOrder,
  PackagePeriod,
  SportFormat,
  MembershipStatus,
} from "../../../../services/packageApi";
import type { MemberScreen } from "../../types";

interface Props {
  activeSportOrders: PackageOrder[];
  availableSportPackages: CatalogPackage[];
  membershipStatus: MembershipStatus;
  selectedDuration: PackagePeriod;
  onSelectDuration: (period: PackagePeriod) => void;
  sportFilter: string;
  onSportFilterChange: (val: string) => void;
  formatFilter: "all" | SportFormat;
  onFormatFilterChange: (val: "all" | SportFormat) => void;
  sportOptions: string[];
  calculateDiscount: (pkg: CatalogPackage) => {
    discountPct: number;
    originalPrice: number;
    finalPrice: number;
  };
  onStartPurchase: (pkg: CatalogPackage) => void;
  onNavigate: (screen: MemberScreen) => void;
}

export default function SportTab({
  activeSportOrders,
  availableSportPackages,
  membershipStatus,
  selectedDuration,
  onSelectDuration,
  sportFilter,
  onSportFilterChange,
  formatFilter,
  onFormatFilterChange,
  sportOptions,
  calculateDiscount,
  onStartPurchase,
  onNavigate,
}: Props) {
  const getSportTheme = (sport?: string, format?: SportFormat) => {
    const s = (sport || "").toLowerCase();
    if (s.includes("bơi") || s.includes("swim")) {
      return {
        badge: "bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60",
        cardBorder: "border-sky-200/80 dark:border-sky-900/50 hover:border-sky-500/60 dark:hover:border-sky-500/60",
        cardBg: "from-sky-50/40 via-white to-white dark:from-sky-950/20 dark:via-slate-900 dark:to-slate-850",
        titleHover: "group-hover:text-sky-600 dark:group-hover:text-sky-400",
        priceText: "text-sky-600 dark:text-sky-400",
        checkIcon: "text-sky-500",
        btn: "bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20",
      };
    }
    if (s.includes("yoga") || s.includes("pilates")) {
      return {
        badge: "bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60",
        cardBorder: "border-violet-200/80 dark:border-violet-900/50 hover:border-violet-500/60 dark:hover:border-violet-500/60",
        cardBg: "from-violet-50/40 via-white to-white dark:from-violet-950/20 dark:via-slate-900 dark:to-slate-850",
        titleHover: "group-hover:text-violet-600 dark:group-hover:text-violet-400",
        priceText: "text-violet-600 dark:text-violet-400",
        checkIcon: "text-violet-500",
        btn: "bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/20",
      };
    }
    if (s.includes("box") || s.includes("kick") || s.includes("võ")) {
      return {
        badge: "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60",
        cardBorder: "border-rose-200/80 dark:border-rose-900/50 hover:border-rose-500/60 dark:hover:border-rose-500/60",
        cardBg: "from-rose-50/40 via-white to-white dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-850",
        titleHover: "group-hover:text-rose-600 dark:group-hover:text-rose-400",
        priceText: "text-rose-600 dark:text-rose-400",
        checkIcon: "text-rose-500",
        btn: "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20",
      };
    }
    if (s.includes("cầu lông") || s.includes("tennis") || s.includes("pickle")) {
      return {
        badge: "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60",
        cardBorder: "border-amber-200/80 dark:border-amber-900/50 hover:border-amber-500/60 dark:hover:border-amber-500/60",
        cardBg: "from-amber-50/40 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-850",
        titleHover: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
        priceText: "text-amber-600 dark:text-amber-400",
        checkIcon: "text-amber-500",
        btn: "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20",
      };
    }
    if (s.includes("zumba") || s.includes("dance") || s.includes("nhảy")) {
      return {
        badge: "bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 border border-pink-200/60 dark:border-pink-800/60",
        cardBorder: "border-pink-200/80 dark:border-pink-900/50 hover:border-pink-500/60 dark:hover:border-pink-500/60",
        cardBg: "from-pink-50/40 via-white to-white dark:from-pink-950/20 dark:via-slate-900 dark:to-slate-850",
        titleHover: "group-hover:text-pink-600 dark:group-hover:text-pink-400",
        priceText: "text-pink-600 dark:text-pink-400",
        checkIcon: "text-pink-500",
        btn: "bg-pink-600 hover:bg-pink-500 text-white shadow-pink-600/20",
      };
    }
    if (format === "coach") {
      return {
        badge: "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60",
        cardBorder: "border-amber-200/80 dark:border-amber-900/50 hover:border-amber-500/60 dark:hover:border-amber-500/60",
        cardBg: "from-amber-50/35 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-850",
        titleHover: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
        priceText: "text-amber-600 dark:text-amber-400",
        checkIcon: "text-amber-500",
        btn: "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20",
      };
    }
    if (format === "group") {
      return {
        badge: "bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60",
        cardBorder: "border-blue-200/80 dark:border-blue-900/50 hover:border-blue-500/60 dark:hover:border-blue-500/60",
        cardBg: "from-blue-50/35 via-white to-white dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-850",
        titleHover: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
        priceText: "text-blue-600 dark:text-blue-400",
        checkIcon: "text-blue-500",
        btn: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20",
      };
    }
    return {
      badge: "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60",
      cardBorder: "border-emerald-200/80 dark:border-emerald-900/50 hover:border-emerald-500/60 dark:hover:border-emerald-500/60",
      cardBg: "from-emerald-50/35 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-850",
      titleHover: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
      priceText: "text-emerald-600 dark:text-emerald-400",
      checkIcon: "text-emerald-500",
      btn: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20",
    };
  };

  return (
    <div className="space-y-6">
      {/* SECTION 2A: MY ACTIVE SPORT PACKAGES */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Gói Môn Bạn Đang Sở Hữu
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Các gói cấp quyền vào sàn tập Gym, Bể bơi, Studio Yoga hoặc đặt lịch Huấn luyện viên
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            {activeSportOrders.length} gói hoạt động
          </span>
        </div>

        {activeSportOrders.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-dashed border-slate-200 dark:border-slate-700 text-center flex flex-col items-center justify-center">
            <div className="size-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Dumbbell className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Bạn chưa kích hoạt gói môn tập nào
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1">
              Gói thành viên chỉ cung cấp đặc quyền giảm giá và tiện ích. Để vào sàn tập Gym, Bơi, Yoga hay Boxing, hãy đăng ký gói môn bên dưới!
            </p>
            <a
              href="#store-sports"
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-500 dark:text-slate-950 text-xs font-bold transition-all"
            >
              Khám phá gói môn mở bán
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {activeSportOrders.map((order) => {
              const pkg = order.packageSnapshot;
              const theme = getSportTheme(pkg.sport, pkg.format);
              const daysLeft = order.endDate
                ? Math.max(
                    0,
                    Math.ceil(
                      (new Date(order.endDate).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  )
                : 30;

              return (
                <div
                  key={order.id}
                  className={`p-5 rounded-2xl bg-gradient-to-br ${theme.cardBg} border ${theme.cardBorder} shadow-xs flex flex-col justify-between transition-all`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${theme.badge}`}>
                        {pkg.sport || "Thể thao"} •{" "}
                        {pkg.format === "coach"
                          ? "Coach 1–1"
                          : pkg.format === "group"
                          ? "Lớp nhóm"
                          : "Tự tập"}
                      </span>
                      <span className={`text-xs font-extrabold ${theme.priceText}`}>
                        Còn {daysLeft} ngày
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-3">
                      {pkg.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Khu vực: <strong>{pkg.area || "Toàn khu"}</strong>
                    </p>

                    <div className="mt-3 p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/70 space-y-1 text-xs">
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>Thời hạn hiệu lực:</span>
                        <span className="font-semibold">
                          {order.startDate ? new Date(order.startDate).toLocaleDateString("vi-VN") : "Bắt đầu"} - {order.endDate ? new Date(order.endDate).toLocaleDateString("vi-VN") : "Vô thời hạn"}
                        </span>
                      </div>
                      {pkg.sessionsPerMonth && (
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                          <span>Số buổi định mức:</span>
                          <span className="font-semibold">
                            {pkg.sessionsPerMonth} buổi / tháng
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                    {pkg.format !== "self" && (
                      <button
                        type="button"
                        onClick={() => onNavigate("booking")}
                        className={`px-4 py-2 rounded-xl ${theme.btn} text-xs font-bold transition-all shadow-xs cursor-pointer`}
                      >
                        Đặt lịch tập
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onStartPurchase(pkg)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      Gia hạn gói môn
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2B: BROWSE SPORT PACKAGES STORE */}
      <div
        id="store-sports"
        className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Danh Mục Gói Môn Tập Mở Bán
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Đã tự động tính chiết khấu giảm giá theo <strong>Hạng {membershipStatus.name}</strong> của bạn
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={sportFilter}
              onChange={(e) => onSportFilterChange(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="all">Tất cả bộ môn</option>
              {sportOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={formatFilter}
              onChange={(e) => onFormatFilterChange(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="all">Tất cả hình thức</option>
              <option value="self">Tự tập (Self)</option>
              <option value="group">Lớp nhóm (Group)</option>
              <option value="coach">Huấn luyện 1–1 (Coach)</option>
            </select>

            <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {([1, 3, 6, 12] as PackagePeriod[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onSelectDuration(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedDuration === p
                      ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {p}T
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sport Package Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {availableSportPackages.map((pkg) => {
            const { discountPct, originalPrice, finalPrice } = calculateDiscount(pkg);
            const isCoach = pkg.format === "coach";
            const isGroup = pkg.format === "group";
            const theme = getSportTheme(pkg.sport, pkg.format);

            return (
              <div
                key={pkg.id}
                className={`p-6 rounded-3xl border ${theme.cardBorder} bg-gradient-to-b ${theme.cardBg} shadow-xs flex flex-col justify-between transition-all group`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${theme.badge}`}>
                      {pkg.sport} • {isCoach ? "Coach 1–1" : isGroup ? "Lớp nhóm" : "Tự tập"}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {pkg.area}
                    </span>
                  </div>

                  <h4 className={`text-base font-bold text-slate-900 dark:text-white mt-3 ${theme.titleHover} transition-colors`}>
                    {pkg.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {pkg.description}
                  </p>

                  <div className="mt-4 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                    {discountPct > 0 ? (
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 line-through">
                            {originalPrice.toLocaleString("vi-VN")} đ
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                            Giảm {discountPct}% (Hạng {membershipStatus.name})
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className={`text-xl font-black ${theme.priceText}`}>
                            {finalPrice.toLocaleString("vi-VN")} đ
                          </span>
                          <span className="text-xs text-slate-500 ml-1">
                            / {selectedDuration} tháng
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className={`text-xl font-black ${theme.priceText}`}>
                          {finalPrice.toLocaleString("vi-VN")} đ
                        </span>
                        <span className="text-xs text-slate-500 ml-1">
                          / {selectedDuration} tháng
                        </span>
                      </div>
                    )}

                    {selectedDuration > 1 && (
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        ~{Math.round(finalPrice / selectedDuration).toLocaleString("vi-VN")} đ / tháng
                      </div>
                    )}
                  </div>

                  <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {pkg.benefits.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${theme.checkIcon} shrink-0 mt-0.5`} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => onStartPurchase(pkg)}
                    className={`w-full py-2.5 rounded-xl ${theme.btn} text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer`}
                  >
                    <span>Đăng ký gói môn</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
