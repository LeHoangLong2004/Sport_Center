import {
  Crown,
  Sparkles,
  Clock,
  Flame,
  Ticket,
  Droplets,
  Lock,
  Activity,
  RefreshCw,
} from "lucide-react";
import type { CatalogPackage, MembershipStatus } from "../../../../services/packageApi";

interface ActiveMembershipCardProps {
  membershipStatus: MembershipStatus;
  catalog: CatalogPackage[];
  onStartPurchase: (pkg: CatalogPackage) => void;
}

export function ActiveMembershipCard({
  membershipStatus,
  catalog,
  onStartPurchase,
}: ActiveMembershipCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white p-7 shadow-xl">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-60 h-60 rounded-full bg-gradient-to-tr from-emerald-500/20 to-transparent blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div
            className={`size-16 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${
              membershipStatus.tier === "premium"
                ? "bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-amber-500/30"
                : membershipStatus.tier === "plus"
                ? "bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 shadow-emerald-500/30"
                : "bg-gradient-to-br from-slate-600 to-slate-800 text-white"
            }`}
          >
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Thẻ Thành Viên Số
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  membershipStatus.tier === "premium"
                    ? "bg-amber-400 text-slate-950"
                    : membershipStatus.tier === "plus"
                    ? "bg-emerald-400 text-slate-950"
                    : "bg-slate-700 text-slate-200"
                }`}
              >
                {membershipStatus.name}
              </span>
            </div>
            <h3 className="text-2xl font-black tracking-tight mt-1">
              {membershipStatus.tier === "premium"
                ? "👑 Hạng Premium VIP"
                : membershipStatus.tier === "plus"
                ? "🥈 Hạng Plus Member"
                : "🥉 Hạng Cơ Bản (Basic)"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {membershipStatus.tier === "basic"
                ? "Hạng miễn phí trọn đời • Quyền lợi mặc định mua lẻ từng môn tập"
                : `Thời hạn: ${membershipStatus.startDate ? new Date(membershipStatus.startDate).toLocaleDateString("vi-VN") : "Hôm nay"} đến ${membershipStatus.endDate ? new Date(membershipStatus.endDate).toLocaleDateString("vi-VN") : "Đang hoạt động"}`}
            </p>
          </div>
        </div>

        {membershipStatus.tier === "basic" ? (
          <button
            type="button"
            onClick={() => {
              const plusPkg = catalog.find((p) => p.tier === "plus");
              if (plusPkg) onStartPurchase(plusPkg);
            }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Nâng cấp nhận thêm đặc quyền</span>
          </button>
        ) : (
          <div className="flex items-center gap-3">
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
          </div>
        )}
      </div>

      {/* 6 Key Perks Grid */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6">
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-[11px] font-semibold">Ưu đãi mua môn</span>
          </div>
          <div className="mt-2 text-sm font-black text-white">
            {membershipStatus.tier === "premium" ? (
              <span className="text-amber-400">Giảm 10% / 5%</span>
            ) : membershipStatus.tier === "plus" ? (
              <span className="text-emerald-400">Giảm 5% / 2%</span>
            ) : (
              <span className="text-slate-400">Giá gốc (0%)</span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">Lớp nhóm & PT 1-1</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-[11px] font-semibold">Đặt lịch trước</span>
          </div>
          <div className="mt-2 text-sm font-black text-white">
            {membershipStatus.bookingAdvanceHours || 24} giờ
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">
            {membershipStatus.tier === "premium" ? "Trước 5 ngày (VIP)" : membershipStatus.tier === "plus" ? "Trước 3 ngày" : "Trước 24 giờ"}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <Ticket className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-semibold">Vé mời bạn bè</span>
          </div>
          <div className="mt-2 text-sm font-black text-white">
            {membershipStatus.tier === "premium" ? (
              <span className="text-emerald-400">2 lượt / tháng</span>
            ) : membershipStatus.tier === "plus" ? (
              <span className="text-emerald-400">1 lượt / tháng</span>
            ) : (
              <span className="text-slate-400">0 lượt</span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">1 Day-Pass trải nghiệm</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] font-semibold">Xông hơi & Bồn sục</span>
          </div>
          <div className="mt-2 text-sm font-black text-white">
            {membershipStatus.tier === "premium" ? (
              <span className="text-cyan-300">Miễn phí Sauna</span>
            ) : (
              <span className="text-slate-500">Chưa hỗ trợ</span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">Đá muối & Jacuzzi</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <Lock className="w-4 h-4 text-purple-400" />
            <span className="text-[11px] font-semibold">Tủ đồ & Khăn tập</span>
          </div>
          <div className="mt-2 text-sm font-black text-white truncate">
            {membershipStatus.tier === "premium"
              ? "Tủ riêng + Khăn VIP"
              : membershipStatus.tier === "plus"
              ? "Tủ thường + 1 khăn"
              : "Tủ đồ thường"}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">Trong buổi tập</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <Activity className="w-4 h-4 text-pink-400" />
            <span className="text-[11px] font-semibold">InBody & Trợ lý AI</span>
          </div>
          <div className="mt-2 text-sm font-black text-white">
            {membershipStatus.tier === "premium" ? (
              <span className="text-pink-300">Không giới hạn</span>
            ) : membershipStatus.tier === "plus" ? (
              <span className="text-pink-300">1 lần / tháng</span>
            ) : (
              <span className="text-slate-400">1 lần kích hoạt</span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">Tư vấn thực đơn & cơ</span>
        </div>
      </div>
    </div>
  );
}
