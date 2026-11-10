interface MembershipPricingGridProps {
  packages: any[];
  billing: "monthly" | "3month" | "6month" | "annual";
  formatMonthlyPrice: (pkg: any) => string;
  formatTotalPrice: (pkg: any) => string;
}

export function MembershipPricingGrid({ packages, billing, formatMonthlyPrice, formatTotalPrice }: MembershipPricingGridProps) {
  const membershipPackages = packages.filter((pkg) => ["member", "membership", "subscription"].includes(pkg.packageType));
  const isMultipleMonths = billing !== "monthly";
  const periodText = billing === "annual" ? "12 tháng" : billing === "6month" ? "6 tháng" : billing === "3month" ? "3 tháng" : "1 tháng";

  return (
    <section className="bg-[#f8fafc] flex flex-col items-center gap-[48px] px-[80px] py-[80px] w-full">
      {membershipPackages.length === 0 ? (
        <div className="bg-white border border-dashed border-[#cbd5e1] rounded-[16px] p-[40px] text-center text-[#64748b] w-full max-w-[1120px]">
          Chưa có gói hội viên đang hoạt động trong cơ sở dữ liệu.
        </div>
      ) : (
        <div className="flex gap-[24px] items-stretch w-full max-w-[1120px] flex-wrap justify-center">
          {membershipPackages.map((pkg, index) => {
            const features = pkg.features?.length ? pkg.features : ["Quyền lợi đang được cập nhật"];
            const isPremium = pkg.tier === "premium" || index === 2;
            const isPlus = pkg.tier === "plus" || index === 1;
            return (
              <div
                key={pkg.id}
                className={`bg-white ${
                  isPremium
                    ? "border-2 border-amber-400 shadow-lg relative"
                    : isPlus
                    ? "border-2 border-emerald-500 shadow-md relative"
                    : "border border-[#e2e8f0]"
                } rounded-[16px] flex flex-col gap-[24px] p-[32px] flex-1 min-w-[300px]`}
              >
                {isPremium && (
                  <div className="absolute -top-[14px] left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-[11px] uppercase tracking-[1px] px-[16px] py-[6px] rounded-full whitespace-nowrap shadow-sm">
                      PHỔ BIẾN NHẤT
                    </span>
                  </div>
                )}
                <div className="flex flex-col gap-[8px]">
                  <p className="font-bold text-[#0f172a] text-[20px]">{pkg.name}</p>
                  <p className="text-[#64748b] text-[14px]">{pkg.tagline || pkg.description || ""}</p>
                </div>
                <div className="flex flex-col gap-[10px]">
                  <div className="flex items-baseline gap-[6px]">
                    <p
                      className={`font-extrabold ${
                        isPremium ? "text-amber-600" : isPlus ? "text-emerald-600" : "text-[#0f172a]"
                      } text-[36px] leading-none`}
                    >
                      {formatMonthlyPrice(pkg)}
                    </p>
                    <p className="text-[#94a3b8] text-[13px]">/tháng</p>
                  </div>
                  {isMultipleMonths && (
                    <div
                      className={`${
                        isPremium
                          ? "bg-amber-50 border-amber-200/80 text-amber-800"
                          : "bg-emerald-50 border-emerald-200/80 text-emerald-800"
                      } border rounded-[10px] p-[10px]`}
                    >
                      <span className="text-[12px] font-semibold">Tổng thanh toán ({periodText})</span>
                      <p className="text-[16px] font-bold">{formatTotalPrice(pkg)}</p>
                    </div>
                  )}
                </div>
                <div className="border-t border-[#e2e8f0]" />
                <div className="flex flex-col gap-[12px] flex-1">
                  {features.map((feature: string) => (
                    <div key={feature} className="flex gap-[10px] items-start">
                      <span className={`${isPremium ? "text-amber-500" : "text-[#10b981]"} text-[15px] font-bold`}>✓</span>
                      <p className="text-[14px] leading-snug text-[#1e293b]">{feature}</p>
                    </div>
                  ))}
                </div>
                <button
                  data-planid={pkg.id}
                  data-period={billing === "annual" ? "yearly" : billing}
                  className={`${
                    isPremium
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      : isPlus
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-[#0f172a] hover:bg-[#1e293b]"
                  } text-white font-bold text-[14px] py-[14px] rounded-[10px] w-full transition-colors cursor-pointer`}
                >
                  Đăng ký {pkg.name}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
