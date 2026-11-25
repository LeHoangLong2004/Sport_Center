import {
  Crown,
  Sparkles,
  Clock,
  Flame,
  Lock,
  RefreshCw,
  XCircle,
} from "lucide-react";
import type { CatalogPackage, MembershipStatus } from "../../../../services/packageApi";

interface ActiveMembershipCardProps {
  membershipStatus: MembershipStatus;
  catalog: CatalogPackage[];
  onStartPurchase: (pkg: CatalogPackage) => void;
  onCancelMembership?: () => void;
}

export function ActiveMembershipCard({
  membershipStatus,
  catalog,
  onStartPurchase,
  onCancelMembership,
}: ActiveMembershipCardProps) {
  const daysLeft = membershipStatus.endDate
    ? Math.max(0, Math.ceil((new Date(membershipStatus.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;
  const benefits = membershipStatus.benefits?.filter(Boolean) ?? [];
  const firstUpgrade = catalog
    .filter((pkg) => pkg.tier !== "basic" && pkg.isActive)
    .sort((a, b) => (a.tierRank ?? 0) - (b.tierRank ?? 0))[0];
  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-7 shadow-xl">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-60 h-60 rounded-full bg-gradient-to-tr from-emerald-500/20 to-transparent blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div
            className={`size-16 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${
              membershipStatus.tier === "premium"
                ? "bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-amber-500/30"
                : membershipStatus.tier === "plus"
                ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 shadow-emerald-500/30"
                : "bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-400/30 text-emerald-300"
            }`}
          >
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-emerald-300/90 uppercase">
                Thẻ Thành Viên Số
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  membershipStatus.tier === "premium"
                    ? "bg-amber-400 text-slate-950"
                    : membershipStatus.tier === "plus"
                    ? "bg-emerald-400 text-slate-950"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                }`}
              >
                {membershipStatus.name}
              </span>
            </div>
            <h3 className="text-2xl font-black tracking-tight mt-1">
              {membershipStatus.tier === "premium"
                ? "Hạng Premium VIP"
              : membershipStatus.tier === "plus"
              ? "Hạng Plus Member"
              : membershipStatus.tier === "basic"
              ? "Hạng Cơ Bản (Basic)"
              : membershipStatus.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p className="text-xs text-slate-300">
                {membershipStatus.tier === "basic"
                  ? "Hạng miễn phí trọn đời • Quyền lợi mặc định mua lẻ từng môn tập"
                  : `Thời hạn: ${membershipStatus.startDate ? new Date(membershipStatus.startDate).toLocaleDateString("vi-VN") : "Hôm nay"} đến ${membershipStatus.endDate ? new Date(membershipStatus.endDate).toLocaleDateString("vi-VN") : "Đang hoạt động"}`}
              </p>
              {membershipStatus.tier !== "basic" && daysLeft !== null && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/25 text-emerald-300 border border-emerald-400/30">
                  <Clock className="w-3 h-3" />
                  Còn {daysLeft} ngày
                </span>
              )}
            </div>
          </div>
        </div>

        {membershipStatus.tier === "basic" ? (
          <button
            type="button"
            onClick={() => {
              if (firstUpgrade) onStartPurchase(firstUpgrade);
            }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-500 hover:from-emerald-400 hover:to-emerald-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Nâng cấp nhận thêm đặc quyền</span>
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                const cur = catalog.find((p) => p.tier === membershipStatus.tier);
                if (cur) onStartPurchase(cur);
              }}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Gia hạn thẻ</span>
            </button>
            {onCancelMembership && (
              <button
                type="button"
                onClick={onCancelMembership}
                className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 font-bold text-xs border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Hủy gói thành viên hiện tại và quay về Hạng Cơ bản"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Hủy gói</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 5 Key Perks Grid */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-6">
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <Flame className="w-4 h-4 text-slate-400" />
            <span className="text-[11px] font-semibold">Chiết khấu dịch vụ</span>
          </div>
          <div className="mt-2 text-sm font-black text-white">
            {(membershipStatus.groupDiscountPct ?? 0) > 0 || (membershipStatus.coachDiscountPct ?? 0) > 0
              ? <span className="text-emerald-400">Lớp {membershipStatus.groupDiscountPct ?? 0}% / Coach {membershipStatus.coachDiscountPct ?? 0}%</span>
              : <span className="text-slate-400">Giá gốc (0%)</span>}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">
            {(membershipStatus.groupDiscountPct ?? 0) > 0 || (membershipStatus.coachDiscountPct ?? 0) > 0 ? "Đặt lớp nhóm & Coach 1-1" : "Không áp dụng giảm giá"}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-[11px] font-semibold">Đặt lịch trước</span>
          </div>
          <div className="mt-2 text-sm font-black text-white">
            {membershipStatus.bookingAdvanceHours ?? 24} giờ
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">
            Thời gian đặt trước tối đa
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <Lock className="w-4 h-4 text-slate-400" />
            <span className="text-[11px] font-semibold">Tủ đồ & Khăn tập</span>
          </div>
          <div className="mt-2 text-sm font-black text-white truncate">
            {membershipStatus.lockerTerms || "Theo quy định trung tâm"}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">Quy định sử dụng</span>
        </div>
        {benefits.slice(0, 2).map((benefit, index) => (
          <div key={`membership-benefit-${index}`} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col justify-between">
            <div className="flex items-center gap-2 text-slate-400"><Sparkles className="w-4 h-4 text-emerald-300" /><span className="text-[11px] font-semibold">Quyền lợi</span></div>
            <div className="mt-2 text-sm font-black text-white">{benefit}</div>
            <span className="text-[10px] text-slate-400 mt-0.5">Theo gói thành viên</span>
          </div>
        ))}
      </div>
    </div>
  );
}
