import { useState, useEffect } from "react";
import {
  billingTabs,
  starterFeatures,
  fitnessFeatures,
  premiumFeatures,
  ptFeatures,
  yogaFeatures,
  kickfitFeatures,
  comparisonRows,
  addons,
  faqs
} from "./pricingData";
import FAQSection from "./PricingPageComponents/FAQSection";
import ComparisonTable from "./PricingPageComponents/ComparisonTable";
import AddOnServices from "./PricingPageComponents/AddOnServices";
import HeroSection from "./PricingPageComponents/HeroSection";
import PromoBanner from "./PricingPageComponents/PromoBanner";
import BottomCTA from "./PricingPageComponents/BottomCTA";

export default function GoiTapBangGiaRedesign() {
  const [billing, setBilling] = useState<"monthly" | "6month" | "annual">("monthly");
  const [packageCategory, setPackageCategory] = useState<"member" | "training">("member");
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/packages')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((p: any) => ({
          ...p,
          features: p.features?.map((f: any) => typeof f === 'string' ? f : (f.featureText || f.benefitName || "")) || []
        }));
        setPackages(formatted);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const discountMultiplier = billing === "monthly" ? 1 : billing === "6month" ? 0.85 : 0.7;

  function formatPrice(base: number) {
    const price = Math.round((base * discountMultiplier) / 1000) * 1000;
    return price.toLocaleString("vi-VN") + "đ";
  }

  return (
    <div className="flex flex-col items-start w-full min-h-screen bg-[#f8fafc]">
      

      <HeroSection 
        billing={billing}
        setBilling={setBilling}
        packageCategory={packageCategory}
        setPackageCategory={setPackageCategory}
      />

      {/* Conditional Rendering based on packageCategory */}
      {packageCategory === "member" ? (
        <>
          {/* Pricing Grid */}
          <section className="bg-[#f8fafc] flex flex-col items-center gap-[48px] px-[80px] py-[80px] w-full">
            <div className="flex gap-[24px] items-stretch w-full max-w-[1120px] flex-wrap justify-center">
              {packages.filter(p => p.packageType === "member" || p.packageType === "membership" || p.packageType === "subscription").length > 0 ? (
                packages.filter(p => p.packageType === "member" || p.packageType === "membership" || p.packageType === "subscription").map((pkg, idx) => (
                  <div key={pkg.id} className={`bg-white ${idx === 1 ? 'border-2 border-[#2563eb] shadow-lg relative' : 'border border-[#e2e8f0]'} rounded-[16px] flex flex-col gap-[24px] p-[32px] flex-1 min-w-[300px]`}>
                    {idx === 1 && (
                      <div className="absolute -top-[14px] left-1/2 -translate-x-1/2">
                        <span className="bg-[#2563eb] text-white font-['Inter:Bold'] font-bold text-[11px] uppercase tracking-[1px] px-[16px] py-[6px] rounded-full whitespace-nowrap">
                          PHỔ BIẾN NHẤT
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col gap-[8px]">
                      <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[20px]">{pkg.name}</p>
                      <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px]">
                        {pkg.tagline || pkg.description || "Gói hội viên cao cấp"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-[4px]">
                      <p className={`font-['Inter:Extra_Bold'] font-extrabold ${idx === 1 ? 'text-[#2563eb]' : 'text-[#0f172a]'} text-[36px] leading-none`}>
                        {formatPrice(billing === "annual" ? (pkg.yearlyPrice || pkg.monthlyPrice * 12) : (pkg.monthlyPrice || 0))}
                      </p>
                      <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">
                        /{billing === "annual" ? "năm" : "tháng"}
                      </p>
                    </div>
                    <div className="border-t border-[#e2e8f0]" />
                    <div className="flex flex-col gap-[12px] flex-1">
                      {(pkg.features?.length > 0 ? pkg.features : ["Sử dụng phòng tập tiêu chuẩn", "Tham gia lớp nhóm cơ bản"]).map((f: string) => (
                        <div key={f} className="flex gap-[10px] items-start">
                          <span className="text-[15px] font-bold shrink-0 mt-[1px] text-[#10b981]">✓</span>
                          <p className="font-['Inter:Regular'] font-normal text-[14px] leading-snug text-[#1e293b]">
                            {f}
                          </p>
                        </div>
                      ))}
                    </div>
                    <button data-planid={pkg.id} data-period={billing === "annual" ? "yearly" : "monthly"} className={`${idx === 1 ? 'bg-[#2563eb] hover:bg-[#1d4ed8]' : 'bg-[#0f172a] hover:bg-[#1e293b]'} text-white font-['Inter:Bold'] font-bold text-[14px] py-[14px] rounded-[10px] w-full transition-colors cursor-pointer`}>
                      Đăng ký {pkg.name}
                    </button>
                  </div>
                ))
              ) : (
                <>
                  {/* Starter Pack */}
                  <div className="bg-white border border-[#e2e8f0] rounded-[16px] flex flex-col gap-[24px] p-[32px] flex-1">
                    <div className="flex flex-col gap-[8px]">
              <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[20px]">Starter Pack</p>
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px]">
                Thích hợp cho nhu cầu rèn luyện cơ bản
              </p>
            </div>
            <div className="flex flex-col gap-[4px]">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[36px] leading-none">
                {formatPrice(590000)}
              </p>
              <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">/tháng</p>
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
              <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[20px]">Fitness Plus</p>
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px]">
                Hội viên tối ưu mọi không gian luyện tập
              </p>
            </div>
            <div className="flex flex-col gap-[4px]">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#2563eb] text-[36px] leading-none">
                {formatPrice(990000)}
              </p>
              <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">/tháng</p>
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
              <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[20px]">Premium VIP</p>
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px]">
                Trải nghiệm đặc quyền đẳng cấp vượt trội
              </p>
            </div>
            <div className="flex flex-col gap-[4px]">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[36px] leading-none">
                {formatPrice(1490000)}
              </p>
              <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">/tháng</p>
            </div>
            <div className="border-t border-[#e2e8f0]" />
            <div className="flex flex-col gap-[12px] flex-1">
              {premiumFeatures.map((f) => (
                <div key={f.text} className="flex gap-[10px] items-start">
                  <span className="text-[#10b981] text-[15px] font-bold shrink-0 mt-[1px]">✓</span>
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

      <ComparisonTable />
        </>
      ) : (
        <>
          <section className="bg-[#f8fafc] flex flex-col items-center gap-[48px] px-[80px] py-[80px] w-full">
            <div className="flex gap-[24px] items-stretch w-full max-w-[1120px] flex-wrap justify-center">
              {packages.filter(p => p.packageType === "training" || p.packageType === "sport" || p.packageType === "class").length > 0 ? (
                packages.filter(p => p.packageType === "training" || p.packageType === "sport" || p.packageType === "class").map((pkg, idx) => (
                  <div key={pkg.id} className={`bg-white border border-[#e2e8f0] rounded-[16px] flex flex-col gap-[24px] p-[32px] flex-1 min-w-[300px] ${idx === 0 ? 'border-2 border-[#10b981] shadow-lg relative' : ''}`}>
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
                    <div className="flex flex-col gap-[4px]">
                      <p className={`font-['Inter:Extra_Bold'] font-extrabold ${idx === 0 ? 'text-[#10b981]' : 'text-[#0f172a]'} text-[36px] leading-none`}>
                        {formatPrice(pkg.monthlyPrice || pkg.yearlyPrice || 0)}
                      </p>
                      <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">/khóa</p>
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
                    <button data-planid={pkg.id} data-period={billing === "annual" ? "yearly" : "monthly"} className={`${idx === 0 ? 'bg-[#10b981] hover:bg-[#059669]' : 'bg-[#0f172a] hover:bg-[#1e293b]'} text-white font-['Inter:Bold'] font-bold text-[14px] py-[14px] rounded-[10px] w-full transition-colors cursor-pointer`}>
                      Đăng ký {pkg.name}
                    </button>
                  </div>
                ))
              ) : (
                <>
                  {/* PT 1:1 */}
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
                    {formatPrice(450000)}
                  </p>
                  <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">/buổi (gói 24 buổi)</p>
                </div>
                <div className="border-t border-[#e2e8f0]" />
                <div className="flex flex-col gap-[12px] flex-1">
                  {ptFeatures.map((f) => (
                    <div key={f.text} className="flex gap-[10px] items-start">
                      <span className="text-[15px] font-bold shrink-0 mt-[1px] text-[#10b981]">✓</span>
                      <p className="font-['Inter:Regular'] font-normal text-[14px] leading-snug text-[#1e293b]">
                        {f.text}
                      </p>
                    </div>
                  ))}
                </div>
                <button className="bg-[#10b981] text-white font-['Inter:Bold'] font-bold text-[14px] py-[14px] rounded-[10px] w-full hover:bg-[#059669] transition-colors cursor-pointer">
                  Đăng ký tập PT
                </button>
              </div>

              {/* Master Yoga */}
              <div className="bg-white border border-[#e2e8f0] rounded-[16px] flex flex-col gap-[24px] p-[32px] flex-1">
                <div className="flex flex-col gap-[8px]">
                  <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[20px]">Yoga Trị Liệu Chuyên Sâu</p>
                  <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px]">
                    Lớp nhóm nhỏ chuẩn Ấn Độ
                  </p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[36px] leading-none">
                    {formatPrice(2500000)}
                  </p>
                  <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">/tháng (giới hạn 5 người)</p>
                </div>
                <div className="border-t border-[#e2e8f0]" />
                <div className="flex flex-col gap-[12px] flex-1">
                  {yogaFeatures.map((f) => (
                    <div key={f.text} className="flex gap-[10px] items-start">
                      <span className="text-[15px] font-bold shrink-0 mt-[1px] text-[#10b981]">✓</span>
                      <p className="font-['Inter:Regular'] font-normal text-[14px] leading-snug text-[#1e293b]">
                        {f.text}
                      </p>
                    </div>
                  ))}
                </div>
                <button className="bg-[#0f172a] text-white font-['Inter:Bold'] font-bold text-[14px] py-[14px] rounded-[10px] w-full hover:bg-[#1e293b] transition-colors cursor-pointer">
                  Đăng ký Yoga
                </button>
              </div>

              {/* Kickfit */}
              <div className="bg-white border border-[#e2e8f0] rounded-[16px] flex flex-col gap-[24px] p-[32px] flex-1">
                <div className="flex flex-col gap-[8px]">
                  <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[20px]">Kickfit Đốt Mỡ</p>
                  <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px]">
                    Giải tỏa căng thẳng, siết mỡ tối đa
                  </p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[36px] leading-none">
                    {formatPrice(350000)}
                  </p>
                  <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">/buổi (gói 12 buổi)</p>
                </div>
                <div className="border-t border-[#e2e8f0]" />
                <div className="flex flex-col gap-[12px] flex-1">
                  {kickfitFeatures.map((f) => (
                    <div key={f.text} className="flex gap-[10px] items-start">
                      <span className="text-[15px] font-bold shrink-0 mt-[1px] text-[#10b981]">✓</span>
                      <p className="font-['Inter:Regular'] font-normal text-[14px] leading-snug text-[#1e293b]">
                        {f.text}
                      </p>
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
        </>
      )}

      <AddOnServices />

      <PromoBanner />

      <FAQSection />

      <BottomCTA />

      
    </div>
  );
}
