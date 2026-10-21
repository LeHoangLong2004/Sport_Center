import { useEffect, useState } from "react";
import { MembershipPricingGrid } from "./MembershipPricingGrid";
import HeroSection from "./PricingPageComponents/HeroSection";
import PromoBanner from "./PricingPageComponents/PromoBanner";
import BottomCTA from "./PricingPageComponents/BottomCTA";
import FAQSection from "./PricingPageComponents/FAQSection";
import AddOnServices from "./PricingPageComponents/AddOnServices";
import { CatalogPackage, PackageAPI, PackagePeriod } from "../services/packageApi";

type Billing = "monthly" | "3month" | "6month" | "annual";

export default function GoiTapBangGiaRedesign() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [packageCategory, setPackageCategory] = useState<"member" | "training">("member");
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    PackageAPI.getPackages()
      .then((data: CatalogPackage[]) => setPackages(data.map((pkg) => ({
        ...pkg,
        packageType: pkg.category === "membership" ? "membership" : "sport",
        tagline: pkg.description,
        prices: pkg.prices || { 1: 0, 3: 0, 6: 0, 12: 0 },
        monthlyPrice: pkg.prices?.[1] || 0,
        features: pkg.benefits?.length ? pkg.benefits : (pkg.terms || []),
      }))))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const currentPeriod: PackagePeriod = billing === "annual" ? 12 : billing === "6month" ? 6 : billing === "3month" ? 3 : 1;
  const getPrice = (pkg: any) => {
    if (typeof pkg === "number") return pkg;
    if (typeof pkg.prices?.[currentPeriod] === "number") return pkg.prices[currentPeriod];
    return Number(pkg.monthlyPrice || 0) * currentPeriod;
  };
  const formatMonthlyPrice = (pkg: any) => `${Math.round(getPrice(pkg) / currentPeriod).toLocaleString("vi-VN")} đ`;
  const formatTotalPrice = (pkg: any) => `${getPrice(pkg).toLocaleString("vi-VN")} đ`;
  const sportPackages = packages.filter((pkg) => ["sport", "training", "class"].includes(pkg.packageType));

  return (
    <div className="flex flex-col items-start w-full min-h-screen bg-[#f8fafc]">
      <HeroSection billing={billing} setBilling={setBilling} packageCategory={packageCategory} setPackageCategory={setPackageCategory} />
      {loading ? (
        <div className="w-full text-center py-[80px] text-[#64748b]">Đang tải bảng giá...</div>
      ) : error ? (
        <div className="w-full text-center py-[80px] text-red-600">Không thể tải bảng giá từ cơ sở dữ liệu.</div>
      ) : packageCategory === "member" ? (
        <MembershipPricingGrid packages={packages} billing={billing} formatMonthlyPrice={formatMonthlyPrice} formatTotalPrice={formatTotalPrice} />
      ) : (
        <TrainingPackageSection packages={sportPackages} billing={billing} formatMonthlyPrice={formatMonthlyPrice} formatTotalPrice={formatTotalPrice} />
      )}
      <AddOnServices />
      <PromoBanner />
      <FAQSection />
      <BottomCTA />
    </div>
  );
}

function TrainingPackageSection({ packages, billing, formatMonthlyPrice, formatTotalPrice }: { packages: any[]; billing: Billing; formatMonthlyPrice: (pkg: any) => string; formatTotalPrice: (pkg: any) => string }) {
  return (
    <section className="bg-[#f8fafc] flex flex-col items-center gap-[48px] px-[80px] py-[80px] w-full">
      {packages.length === 0 ? (
        <div className="bg-white border border-dashed border-[#cbd5e1] rounded-[16px] p-[40px] text-center text-[#64748b] w-full max-w-[1120px]">Chưa có gói tập đang hoạt động trong cơ sở dữ liệu.</div>
      ) : (
        <div className="flex gap-[24px] items-stretch w-full max-w-[1120px] flex-wrap justify-center">
          {packages.map((pkg, index) => {
            const features = pkg.features?.length ? pkg.features : ["Quyền lợi đang được cập nhật"];
            return <div key={pkg.id} className={`bg-white ${index === 0 ? "border-2 border-[#10b981] shadow-lg" : "border border-[#e2e8f0]"} rounded-[16px] flex flex-col gap-[24px] p-[32px] flex-1 min-w-[300px]`}>
              <div className="flex flex-col gap-[8px]"><p className="font-bold text-[#0f172a] text-[20px]">{pkg.name}</p><p className="text-[#64748b] text-[14px]">{pkg.tagline || ""}</p></div>
              <div><p className={`font-extrabold ${index === 0 ? "text-[#10b981]" : "text-[#0f172a]"} text-[36px] leading-none`}>{formatMonthlyPrice(pkg)}</p><p className="text-[#94a3b8] text-[13px]">/tháng</p>{billing !== "monthly" && <p className="text-emerald-700 text-[13px] mt-[8px]">Tổng {formatTotalPrice(pkg)}</p>}</div>
              <div className="border-t border-[#e2e8f0]" />
              <div className="flex flex-col gap-[12px] flex-1">{features.map((feature: string) => <div key={feature} className="flex gap-[10px] items-start"><span className="text-[#10b981] font-bold">✓</span><p className="text-[14px] text-[#1e293b]">{feature}</p></div>)}</div>
              <button data-planid={pkg.id} data-period={billing} className={`${index === 0 ? "bg-[#10b981] hover:bg-[#059669]" : "bg-[#0f172a] hover:bg-[#1e293b]"} text-white font-bold text-[14px] py-[14px] rounded-[10px] w-full transition-colors cursor-pointer`}>Đăng ký {pkg.name}</button>
            </div>;
          })}
        </div>
      )}
    </section>
  );
}
