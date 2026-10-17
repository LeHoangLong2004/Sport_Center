import { useState, useEffect } from "react";
import { MembershipPricingGrid } from "./MembershipPricingGrid";
import FAQSection from "./PricingPageComponents/FAQSection";
import ComparisonTable from "./PricingPageComponents/ComparisonTable";
import AddOnServices from "./PricingPageComponents/AddOnServices";
import HeroSection from "./PricingPageComponents/HeroSection";
import PromoBanner from "./PricingPageComponents/PromoBanner";
import BottomCTA from "./PricingPageComponents/BottomCTA";
import { PackageAPI, CatalogPackage, PackagePeriod } from "../services/packageApi";
import { ptFeatures, yogaFeatures, kickfitFeatures } from "./pricingData";

export default function GoiTapBangGiaRedesign() {
  const [billing, setBilling] = useState<"monthly" | "3month" | "6month" | "annual">("monthly");
  const [packageCategory, setPackageCategory] = useState<"member" | "training">("member");
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    PackageAPI.getPackages()
      .then((data: CatalogPackage[]) => {
        const formatted = data.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          packageType: p.category === "membership" ? "membership" : "sport",
          tier: p.tier,
          sport: p.sport,
          format: p.format,
          tagline: p.description,
          description: p.description,
          prices: p.prices || { 1: 0, 3: 0, 6: 0, 12: 0 },
          monthlyPrice: p.prices?.[1] || 0,
          features: (p.benefits && p.benefits.length > 0) ? p.benefits : (p.terms || []),
          benefits: p.benefits || [],
          terms: p.terms || [],
          groupDiscountPct: p.groupDiscountPct,
          coachDiscountPct: p.coachDiscountPct,
          bookingAdvanceHours: p.bookingAdvanceHours,
          sessionsPerMonth: p.sessionsPerMonth,
          minutesPerSession: p.minutesPerSession,
          isActive: p.isActive,
        }));
        setPackages(formatted);
      })
      .catch((err) => console.error(err));
  }, []);

  const currentPeriod: PackagePeriod = 
    billing === "annual" ? 12 :
    billing === "6month" ? 6 :
    billing === "3month" ? 3 : 1;

  const periodText = 
    billing === "annual" ? "12 tháng" : 
    billing === "6month" ? "6 tháng" : 
    billing === "3month" ? "3 tháng" : "1 tháng";

  function getPackagePrice(pkg: any, period: PackagePeriod): number {
    if (pkg.prices && typeof pkg.prices[period] === "number") {
      return pkg.prices[period];
    }
    const base = pkg.monthlyPrice || 0;
    const discountMultiplier = period === 1 ? 1 : period === 3 ? 0.95 : period === 6 ? 0.85 : 0.7;
    return Math.round((base * discountMultiplier * period) / 1000) * 1000;
  }

  function formatMonthlyPrice(pkg: any): string {
    const total = typeof pkg === "number" ? pkg : getPackagePrice(pkg, currentPeriod);
    const monthlyRate = Math.round(total / currentPeriod / 1000) * 1000;
    return monthlyRate.toLocaleString("vi-VN") + "đ";
  }

  function formatTotalPrice(pkg: any): string {
    const total = typeof pkg === "number" ? pkg : getPackagePrice(pkg, currentPeriod);
    return total.toLocaleString("vi-VN") + "đ";
  }

  const sportPackages = packages.filter(
    (p) => p.packageType === "training" || p.packageType === "sport" || p.packageType === "class"
  );

  return (
    <div className="flex flex-col items-start w-full min-h-screen bg-[#f8fafc]">
      <HeroSection 
        billing={billing}
        setBilling={setBilling}
        packageCategory={packageCategory}
        setPackageCategory={setPackageCategory}
      />

      {packageCategory === "member" ? (
        <>
          <MembershipPricingGrid
            packages={packages}
            billing={billing}
            formatMonthlyPrice={formatMonthlyPrice}
            formatTotalPrice={formatTotalPrice}
          />
          <ComparisonTable />
        </>
      ) : (
        <section className="bg-[#f8fafc] flex flex-col items-center gap-[48px] px-[80px] py-[80px] w-full">
          <div className="flex gap-[24px] items-stretch w-full max-w-[1120px] flex-wrap justify-center">
            {sportPackages.length > 0 ? (
              sportPackages.map((pkg, idx) => (
                <div 
                  key={pkg.id} 
                  className={`bg-white border border-[#e2e8f0] rounded-[16px] flex flex-col gap-[24px] p-[32px] flex-1 min-w-[300px] ${
                    idx === 0 ? "border-2 border-[#10b981] shadow-lg relative" : ""
                  }`}
                >
                  {idx === 0 && (
                    <div className="absolute -top-[14px] left-1/2 -translate-x-1/2">
                      <span className="bg-[#10b981] text-white font-['Inter:Bold'] font-bold text-[11px] uppercase tracking-[1px] px-[16px] py-[6px] rounded-full whitespace-nowrap">
                        TỐI ƯU HIỆU QUẢ
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col gap-[8px]">
                    <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[20px]">{pkg.name}</p>
                    <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px]">
                      {pkg.tagline || pkg.description || "Gói tập chuyên nghiệp"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-[10px]">
                    <div className="flex items-baseline gap-[6px]">
                      <p className={`font-['Inter:Extra_Bold'] font-extrabold ${idx === 0 ? "text-[#10b981]" : "text-[#0f172a]"} text-[36px] leading-none`}>
                        {formatMonthlyPrice(pkg)}
                      </p>
                      <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">/tháng</p>
                    </div>

                    {billing !== "monthly" && (
                      <div className="bg-emerald-50 border border-emerald-200/80 rounded-[10px] p-[10px] flex flex-col gap-[2px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-semibold text-emerald-800">
                            Tổng thanh toán ({periodText}):
                          </span>
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-[8px] py-[2px] rounded-full uppercase tracking-wider">
                            {pkg.sport || "Môn tập"}
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
                    {(pkg.features?.length > 0 ? pkg.features : ["Tập cùng huấn luyện viên", "Đánh giá kết quả định kỳ"]).map((f: string) => (
                      <div key={f} className="flex gap-[10px] items-start">
                        <span className="text-[15px] font-bold shrink-0 mt-[1px] text-[#10b981]">✓</span>
                        <p className="font-['Inter:Regular'] font-normal text-[14px] leading-snug text-[#1e293b]">
                          {f}
                        </p>
                      </div>
                    ))}
                  </div>

                  <button 
                    data-planid={pkg.id} 
                    data-period={billing === "annual" ? "yearly" : billing === "6month" ? "6month" : billing === "3month" ? "3month" : "monthly"} 
                    className={`${idx === 0 ? "bg-[#10b981] hover:bg-[#059669]" : "bg-[#0f172a] hover:bg-[#1e293b]"} text-white font-['Inter:Bold'] font-bold text-[14px] py-[14px] rounded-[10px] w-full transition-colors cursor-pointer`}
                  >
                    Đăng ký {pkg.name}
                  </button>
                </div>
              ))
            ) : (
              <>
                {/* Fallback PT 1:1 */}
                <div className="bg-white border-2 border-[#10b981] rounded-[16px] flex flex-col gap-[24px] p-[32px] flex-1 relative shadow-lg">
                  <div className="absolute -top-[14px] left-1/2 -translate-x-1/2">
                    <span className="bg-[#10b981] text-white font-['Inter:Bold'] font-bold text-[11px] uppercase tracking-[1px] px-[16px] py-[6px] rounded-full whitespace-nowrap">
                      TỐI ƯU HIỆU QUẢ
                    </span>
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[20px]">Huấn luyện viên cá nhân 1:1</p>
                    <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px]">
                      Đạt mục tiêu nhanh chóng với giáo án riêng biệt
                    </p>
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#10b981] text-[36px] leading-none">
                      {formatMonthlyPrice(450000)}
                    </p>
                    <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">/buổi (gói 24 buổi)</p>
                  </div>
                  <div className="border-t border-[#e2e8f0]" />
                  <div className="flex flex-col gap-[12px] flex-1">
                    {ptFeatures.map((f) => (
                      <div key={f.text} className="flex gap-[10px] items-start">
                        <span className="text-[15px] font-bold shrink-0 mt-[1px] text-[#10b981]">✓</span>
                        <p className="font-['Inter:Regular'] font-normal text-[14px] leading-snug text-[#1e293b]">{f.text}</p>
                      </div>
                    ))}
                  </div>
                  <button className="bg-[#10b981] text-white font-['Inter:Bold'] font-bold text-[14px] py-[14px] rounded-[10px] w-full hover:bg-[#059669] transition-colors cursor-pointer">
                    Đăng ký tập PT
                  </button>
                </div>

                {/* Fallback Yoga */}
                <div className="bg-white border border-[#e2e8f0] rounded-[16px] flex flex-col gap-[24px] p-[32px] flex-1">
                  <div className="flex flex-col gap-[8px]">
                    <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[20px]">Yoga Trị Liệu Chuyên Sâu</p>
                    <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px]">
                      Lớp nhóm nhỏ chuẩn Ấn Độ
                    </p>
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[36px] leading-none">
                      {formatMonthlyPrice(2500000)}
                    </p>
                    <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">/tháng (giới hạn 5 người)</p>
                  </div>
                  <div className="border-t border-[#e2e8f0]" />
                  <div className="flex flex-col gap-[12px] flex-1">
                    {yogaFeatures.map((f) => (
                      <div key={f.text} className="flex gap-[10px] items-start">
                        <span className="text-[15px] font-bold shrink-0 mt-[1px] text-[#10b981]">✓</span>
                        <p className="font-['Inter:Regular'] font-normal text-[14px] leading-snug text-[#1e293b]">{f.text}</p>
                      </div>
                    ))}
                  </div>
                  <button className="bg-[#0f172a] text-white font-['Inter:Bold'] font-bold text-[14px] py-[14px] rounded-[10px] w-full hover:bg-[#1e293b] transition-colors cursor-pointer">
                    Đăng ký Yoga
                  </button>
                </div>

                {/* Fallback Kickfit */}
                <div className="bg-white border border-[#e2e8f0] rounded-[16px] flex flex-col gap-[24px] p-[32px] flex-1">
                  <div className="flex flex-col gap-[8px]">
                    <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[20px]">Kickfit Đốt Mỡ</p>
                    <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px]">
                      Giải tỏa căng thẳng, siết mỡ tối đa
                    </p>
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[36px] leading-none">
                      {formatMonthlyPrice(350000)}
                    </p>
                    <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">/buổi (gói 12 buổi)</p>
                  </div>
                  <div className="border-t border-[#e2e8f0]" />
                  <div className="flex flex-col gap-[12px] flex-1">
                    {kickfitFeatures.map((f) => (
                      <div key={f.text} className="flex gap-[10px] items-start">
                        <span className="text-[15px] font-bold shrink-0 mt-[1px] text-[#10b981]">✓</span>
                        <p className="font-['Inter:Regular'] font-normal text-[14px] leading-snug text-[#1e293b]">{f.text}</p>
                      </div>
                    ))}
                  </div>
                  <button className="bg-[#0f172a] text-white font-['Inter:Bold'] font-bold text-[14px] py-[14px] rounded-[10px] w-full hover:bg-[#1e293b] transition-colors cursor-pointer">
                    Đăng ký Kickfit
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      <AddOnServices />
      <PromoBanner />
      <FAQSection />
      <BottomCTA />
    </div>
  );
}
