import {
  Crown,
  CheckCircle2,
  Clock,
  ArrowRight,
  Ticket,
  Droplets,
  Lock,
  Activity,
} from "lucide-react";
import type { CatalogPackage, PackagePeriod, MembershipStatus } from "../../../../services/packageApi";
import { ActiveMembershipCard } from "./ActiveMembershipCard";

interface Props {
  membershipStatus: MembershipStatus;
  membershipPackages: CatalogPackage[];
  selectedDuration: PackagePeriod;
  onSelectDuration: (period: PackagePeriod) => void;
  onStartPurchase: (pkg: CatalogPackage) => void;
  catalog: CatalogPackage[];
}

export default function MembershipTab({
  membershipStatus,
  membershipPackages,
  selectedDuration,
  onSelectDuration,
  onStartPurchase,
  catalog,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Active Membership Digital Card */}
      <ActiveMembershipCard
        membershipStatus={membershipStatus}
        catalog={catalog}
        onStartPurchase={onStartPurchase}
      />

      {/* Membership Tiers Upgrade Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Bảng Hạng Thành Viên Chuẩn
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Nâng cấp gói thành viên để tự động giảm giá cho toàn bộ các gói môn tập và tận hưởng đặc quyền cao cấp
            </p>
          </div>

          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            {([1, 3, 6, 12] as PackagePeriod[]).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => onSelectDuration(period)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedDuration === period
                    ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {period} Tháng {period > 1 && <span className="text-[10px] opacity-80">(-{period === 3 ? "10%" : period === 6 ? "15%" : "20%"})</span>}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {membershipPackages.map((pkg) => {
            const isCurrentTier = membershipStatus.tier === pkg.tier;
            const price = pkg.prices[selectedDuration] || 0;
            const isPremium = pkg.tier === "premium";
            const isPlus = pkg.tier === "plus";

            return (
              <div
                key={pkg.id}
                className={`p-6 rounded-3xl border flex flex-col justify-between transition-all relative ${
                  isPremium
                    ? "bg-gradient-to-b from-amber-50/50 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 border-amber-300 dark:border-amber-700/60 shadow-lg ring-1 ring-amber-400/40"
                    : isPlus
                    ? "bg-gradient-to-b from-emerald-50/40 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 border-emerald-300 dark:border-emerald-700/60 shadow-sm"
                    : "bg-slate-50/60 dark:bg-slate-850/60 border-slate-200 dark:border-slate-800"
                }`}
              >
                {isPremium && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                    Phổ biến nhất
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`size-8 rounded-lg flex items-center justify-center ${
                          isPremium
                            ? "bg-amber-400 text-slate-950"
                            : isPlus
                            ? "bg-emerald-400 text-slate-950"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <Crown className="w-4 h-4" />
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {pkg.name}
                      </h4>
                    </div>

                    {isCurrentTier && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                        Đang dùng
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 min-h-[32px]">
                    {pkg.description}
                  </p>

                  <div className="mt-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {price === 0 ? "Miễn phí" : `${price.toLocaleString("vi-VN")} đ`}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {price === 0 ? "Trọn đời" : `thanh toán cho ${selectedDuration} tháng`}
                    </span>
                  </div>

                  <div className="py-4 space-y-2.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Đặc quyền bao gồm
                    </span>

                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${isPremium ? "text-amber-500" : isPlus ? "text-emerald-500" : "text-slate-400"}`} />
                      <span className="text-slate-700 dark:text-slate-300">
                        {isPremium ? (
                          <strong className="text-amber-600 dark:text-amber-400 font-bold">Giảm {pkg.groupDiscountPct || 10}% Lớp / {pkg.coachDiscountPct || 5}% PT 1-1</strong>
                        ) : isPlus ? (
                          <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Giảm {pkg.groupDiscountPct || 5}% Lớp / {pkg.coachDiscountPct || 2}% PT 1-1</strong>
                        ) : (
                          "Không có giảm giá mua môn"
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">
                        Đặt lịch trước: <strong>{pkg.bookingAdvanceHours || 24} giờ</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <Ticket className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">
                        {isPremium ? (
                          <>Vé mời bạn bè: <strong>2 lượt/tháng</strong></>
                        ) : isPlus ? (
                          <>Vé mời bạn bè: <strong>1 lượt/tháng</strong></>
                        ) : (
                          "Không có vé mời bạn bè"
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <Droplets className="w-4 h-4 text-cyan-500 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">
                        Xông hơi (Sauna): {isPremium ? <strong>Miễn phí</strong> : "Chưa hỗ trợ"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <Lock className="w-4 h-4 text-purple-500 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">
                        Tủ đồ: <strong>{pkg.lockerTerms || (isPremium ? "Tủ riêng VIP" : "Tủ chung")}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <Activity className="w-4 h-4 text-pink-500 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">
                        Phân tích InBody: <strong>{isPremium ? "Không giới hạn" : isPlus ? "1 lần / tháng" : "Chưa hỗ trợ"}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  {isCurrentTier ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed"
                    >
                      <span>Hạng Hiện Tại Của Bạn</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onStartPurchase(pkg)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                        isPremium
                          ? "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/20"
                          : isPlus
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                          : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700"
                      }`}
                    >
                      <span>Nâng cấp ngay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
