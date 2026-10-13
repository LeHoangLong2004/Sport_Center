import {
  fitnessFeatures,
  premiumFeatures,
  starterFeatures,
} from "./pricingData";

interface MembershipPricingGridProps {
  packages: any[];
  billing: "monthly" | "3month" | "6month" | "annual";
  formatMonthlyPrice: (pkg: any) => string;
  formatTotalPrice: (pkg: any) => string;
}

export function MembershipPricingGrid({
  packages,
  billing,
  formatMonthlyPrice,
  formatTotalPrice,
}: MembershipPricingGridProps) {
  const isMultipleMonths = billing !== "monthly";
  const periodText = 
    billing === "annual" ? "12 tháng" :
    billing === "6month" ? "6 tháng" :
    billing === "3month" ? "3 tháng" : "1 tháng";

  return (
    <>
      {/* Pricing Grid */}
      <section className="bg-[#f8fafc] flex flex-col items-center gap-[48px] px-[80px] py-[80px] w-full">
        <div className="flex gap-[24px] items-stretch w-full max-w-[1120px] flex-wrap justify-center">
          {packages.filter(
            (p) =>
              p.packageType === "member" ||
              p.packageType === "membership" ||
              p.packageType === "subscription",
          ).length > 0 ? (
            packages
              .filter(
                (p) =>
                  p.packageType === "member" ||
                  p.packageType === "membership" ||
                  p.packageType === "subscription",
              )
              .map((pkg, idx) => (
                <div
                  key={pkg.id}
                  className={`bg-white ${
                    idx === 1
                      ? "border-2 border-[#2563eb] shadow-lg relative"
                      : "border border-[#e2e8f0]"
                  } rounded-[16px] flex flex-col gap-[24px] p-[32px] flex-1 min-w-[300px]`}
                >
                  {idx === 1 && (
                    <div className="absolute -top-[14px] left-1/2 -translate-x-1/2">
                      <span className="bg-[#2563eb] text-white font-['Inter:Bold'] font-bold text-[11px] uppercase tracking-[1px] px-[16px] py-[6px] rounded-full whitespace-nowrap">
                        PHỔ BIẾN NHẤT
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col gap-[8px]">
                    <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[20px]">
                      {pkg.name}
                    </p>
                    <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px]">
                      {pkg.tagline || pkg.description || "Gói hội viên cao cấp"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-[10px]">
                    <div className="flex items-baseline gap-[6px]">
                      <p
                        className={`font-['Inter:Extra_Bold'] font-extrabold ${
                          idx === 1 ? "text-[#2563eb]" : "text-[#0f172a]"
                        } text-[36px] leading-none`}
                      >
                        {formatMonthlyPrice(pkg)}
                      </p>
                      <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">
                        /tháng
                      </p>
                    </div>

                    {isMultipleMonths && (
                      <div className="bg-emerald-50 border border-emerald-200/80 rounded-[10px] p-[10px] flex flex-col gap-[2px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-semibold text-emerald-800">
                            Tổng thanh toán ({periodText}):
                          </span>
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-[8px] py-[2px] rounded-full uppercase tracking-wider">
                            Gói {periodText}
                          </span>
                        </div>
                        <p className="text-[16px] font-bold text-emerald-700">
                          {formatTotalPrice(pkg)}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-[#e2e8f0]" />
                  <div className="flex flex-col gap-[12px] flex-1">
                    {(pkg.features?.length > 0
                      ? pkg.features
                      : [
                          "Sử dụng phòng tập tiêu chuẩn",
                          "Tham gia lớp nhóm cơ bản",
                        ]
                    ).map((f: string) => (
                      <div key={f} className="flex gap-[10px] items-start">
                        <span className="text-[15px] font-bold shrink-0 mt-[1px] text-[#10b981]">
                          ✓
                        </span>
                        <p className="font-['Inter:Regular'] font-normal text-[14px] leading-snug text-[#1e293b]">
                          {f}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button
                    data-planid={pkg.id}
                    data-period={billing === "annual" ? "yearly" : billing === "6month" ? "6month" : billing === "3month" ? "3month" : "monthly"}
                    className={`${
                      idx === 1
                        ? "bg-[#2563eb] hover:bg-[#1d4ed8]"
                        : "bg-[#0f172a] hover:bg-[#1e293b]"
                    } text-white font-['Inter:Bold'] font-bold text-[14px] py-[14px] rounded-[10px] w-full transition-colors cursor-pointer`}
                  >
                    Đăng ký {pkg.name}
                  </button>
                </div>
              ))
          ) : (
            <>
              {/* Starter Pack */}
              <div className="bg-white border border-[#e2e8f0] rounded-[16px] flex flex-col gap-[24px] p-[32px] flex-1">
                <div className="flex flex-col gap-[8px]">
                  <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[20px]">
                    Starter Pack
                  </p>
                  <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px]">
                    Thích hợp cho nhu cầu rèn luyện cơ bản
                  </p>
                </div>
                <div className="flex flex-col gap-[10px]">
                  <div className="flex items-baseline gap-[6px]">
                    <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[36px] leading-none">
                      {formatMonthlyPrice({ monthlyPrice: 590000 })}
                    </p>
                    <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">
                      /tháng
                    </p>
                  </div>
                  {isMultipleMonths && (
                    <div className="bg-emerald-50 border border-emerald-200/80 rounded-[10px] p-[10px] flex flex-col gap-[2px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-emerald-800">
                          Tổng thanh toán ({periodText}):
                        </span>
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-[8px] py-[2px] rounded-full uppercase tracking-wider">
                          Gói {periodText}
                        </span>
                      </div>
                      <p className="text-[16px] font-bold text-emerald-700">
                        {formatTotalPrice({ monthlyPrice: 590000 })}
                      </p>
                    </div>
                  )}
                </div>
                <div className="border-t border-[#e2e8f0]" />
                <div className="flex flex-col gap-[12px] flex-1">
                  {starterFeatures.map((f) => (
                    <div key={f.text} className="flex gap-[10px] items-start">
                      <span
                        className={`text-[15px] font-bold shrink-0 mt-[1px] ${
                          f.included ? "text-[#10b981]" : "text-[#94a3b8]"
                        }`}
                      >
                        {f.included ? "✓" : "✗"}
                      </span>
                      <p
                        className={`font-['Inter:Regular'] font-normal text-[14px] leading-snug ${
                          f.included ? "text-[#1e293b]" : "text-[#94a3b8]"
                        }`}
                      >
                        {f.text}
                      </p>
                    </div>
                  ))}
                </div>
                <button className="bg-[#0f172a] text-white font-['Inter:Bold'] font-bold text-[14px] py-[14px] rounded-[10px] w-full hover:bg-[#1e293b] transition-colors cursor-pointer">
                  Chọn gói Starter
                </button>
              </div>

              {/* Fitness Plus */}
              <div className="bg-white border-2 border-[#2563eb] rounded-[16px] flex flex-col gap-[24px] p-[32px] flex-1 relative shadow-lg">
                <div className="absolute -top-[14px] left-1/2 -translate-x-1/2">
                  <span className="bg-[#2563eb] text-white font-['Inter:Bold'] font-bold text-[11px] uppercase tracking-[1px] px-[16px] py-[6px] rounded-full whitespace-nowrap">
                    PHỔ BIẾN NHẤT
                  </span>
                </div>
                <div className="flex flex-col gap-[8px]">
                  <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[20px]">
                    Fitness Plus
                  </p>
                  <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px]">
                    Hội viên tối ưu mọi không gian luyện tập
                  </p>
                </div>
                <div className="flex flex-col gap-[10px]">
                  <div className="flex items-baseline gap-[6px]">
                    <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#2563eb] text-[36px] leading-none">
                      {formatMonthlyPrice({ monthlyPrice: 990000 })}
                    </p>
                    <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">
                      /tháng
                    </p>
                  </div>
                  {isMultipleMonths && (
                    <div className="bg-emerald-50 border border-emerald-200/80 rounded-[10px] p-[10px] flex flex-col gap-[2px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-emerald-800">
                          Tổng thanh toán ({periodText}):
                        </span>
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-[8px] py-[2px] rounded-full uppercase tracking-wider">
                          Gói {periodText}
                        </span>
                      </div>
                      <p className="text-[16px] font-bold text-emerald-700">
                        {formatTotalPrice({ monthlyPrice: 990000 })}
                      </p>
                    </div>
                  )}
                </div>
                <div className="border-t border-[#e2e8f0]" />
                <div className="flex flex-col gap-[12px] flex-1">
                  {fitnessFeatures.map((f) => (
                    <div key={f.text} className="flex gap-[10px] items-start">
                      <span
                        className={`text-[15px] font-bold shrink-0 mt-[1px] ${
                          f.included ? "text-[#10b981]" : "text-[#94a3b8]"
                        }`}
                      >
                        {f.included ? "✓" : "✗"}
                      </span>
                      <p
                        className={`font-['Inter:Regular'] font-normal text-[14px] leading-snug ${
                          f.included ? "text-[#1e293b]" : "text-[#94a3b8]"
                        }`}
                      >
                        {f.text}
                      </p>
                    </div>
                  ))}
                </div>
                <button className="bg-[#2563eb] text-white font-['Inter:Bold'] font-bold text-[14px] py-[14px] rounded-[10px] w-full hover:bg-[#1d4ed8] transition-colors cursor-pointer">
                  Đăng ký Fitness Plus
                </button>
              </div>

              {/* Premium VIP */}
              <div className="bg-white border border-[#e2e8f0] rounded-[16px] flex flex-col gap-[24px] p-[32px] flex-1">
                <div className="flex flex-col gap-[8px]">
                  <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[20px]">
                    Premium VIP
                  </p>
                  <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px]">
                    Trải nghiệm đặc quyền đẳng cấp vượt trội
                  </p>
                </div>
                <div className="flex flex-col gap-[10px]">
                  <div className="flex items-baseline gap-[6px]">
                    <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[36px] leading-none">
                      {formatMonthlyPrice({ monthlyPrice: 1490000 })}
                    </p>
                    <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">
                      /tháng
                    </p>
                  </div>
                  {isMultipleMonths && (
                    <div className="bg-emerald-50 border border-emerald-200/80 rounded-[10px] p-[10px] flex flex-col gap-[2px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-emerald-800">
                          Tổng thanh toán ({periodText}):
                        </span>
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-[8px] py-[2px] rounded-full uppercase tracking-wider">
                          Gói {periodText}
                        </span>
                      </div>
                      <p className="text-[16px] font-bold text-emerald-700">
                        {formatTotalPrice({ monthlyPrice: 1490000 })}
                      </p>
                    </div>
                  )}
                </div>
                <div className="border-t border-[#e2e8f0]" />
                <div className="flex flex-col gap-[12px] flex-1">
                  {premiumFeatures.map((f) => (
                    <div key={f.text} className="flex gap-[10px] items-start">
                      <span className="text-[#10b981] text-[15px] font-bold shrink-0 mt-[1px]">
                        ✓
                      </span>
                      <p className="font-['Inter:Regular'] font-normal text-[#1e293b] text-[14px] leading-snug">
                        {f.text}
                      </p>
                    </div>
                  ))}
                </div>
                <button className="bg-[#0f172a] text-white font-['Inter:Bold'] font-bold text-[14px] py-[14px] rounded-[10px] w-full hover:bg-[#1e293b] transition-colors cursor-pointer">
                  Chọn gói Premium
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
