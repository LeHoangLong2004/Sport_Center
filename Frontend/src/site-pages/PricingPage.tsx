import { useState, useEffect } from "react";

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

  const billingTabs: { key: "monthly" | "6month" | "annual"; label: string }[] = [
    { key: "monthly", label: "Thanh toán Tháng" },
    { key: "6month", label: "6 Tháng (-15%)" },
    { key: "annual", label: "12 Tháng (-30%)" },
  ];

  const starterFeatures = [
    { text: "Sử dụng Gym & Cardio chuyên biệt", included: true },
    { text: "Tham gia 2 lớp thể thao nhóm/tuần", included: true },
    { text: "Đánh giá thể chất InBody định kỳ", included: true },
    { text: "Thuê tủ đồ cá nhân tiêu chuẩn", included: true },
    { text: "Miễn phí nước uống lọc tại quầy", included: true },
    { text: "Hồ bơi Aqua & Sauna trị liệu", included: false },
    { text: "Huấn luyện viên cá nhân (PT)", included: false },
  ];

  const fitnessFeatures = [
    { text: "Sử dụng Gym & Cardio chuyên biệt", included: true },
    { text: "Tham gia không giới hạn lớp nhóm", included: true },
    { text: "Đánh giá thể chất InBody định kỳ", included: true },
    { text: "Hồ bơi Aqua & Sauna trị liệu", included: true },
    { text: "Ưu tiên đăng ký lịch tập trước", included: true },
    { text: "Tủ đồ VIP & Khăn tắm sạch mỗi buổi", included: true },
    { text: "Miễn phí nước uống ion kiềm", included: true },
    { text: "Huấn luyện viên cá nhân (PT)", included: false },
  ];

  const premiumFeatures = [
    { text: "Đặc quyền sử dụng 5 khu vực tập luyện VIP", included: true },
    { text: "Tham gia không giới hạn lớp nhóm", included: true },
    { text: "Đánh giá InBody & Giáo án riêng", included: true },
    { text: "Hồ bơi Aqua & Sauna trị liệu", included: true },
    { text: "4 Buổi tập cá nhân cùng PT/tháng", included: true },
    { text: "Lối đi ưu tiên - Check-in không đợi", included: true },
    { text: "Quầy bar nước uống & trái cây tươi miễn phí", included: true },
  ];

  const ptFeatures = [
    { text: "Huấn luyện viên cá nhân 1 kèm 1", included: true },
    { text: "Lộ trình tập luyện thiết kế riêng", included: true },
    { text: "Tư vấn dinh dưỡng chuyên sâu", included: true },
    { text: "Đo InBody và theo dõi chỉ số mỗi tuần", included: true },
    { text: "Giãn cơ phục hồi sau buổi tập", included: true },
    { text: "Tặng kèm thẻ tập trong những ngày PT", included: true },
    { text: "Cam kết đạt mục tiêu hình thể", included: true },
  ];

  const yogaFeatures = [
    { text: "Huấn luyện viên Master Yoga Ấn Độ", included: true },
    { text: "Lớp học nhóm nhỏ dưới 5 người", included: true },
    { text: "Chỉnh sửa tư thế chuẩn xác", included: true },
    { text: "Trị liệu cổ vai gáy, thoái hóa", included: true },
    { text: "Phòng tập Yoga tĩnh lặng chuyên biệt", included: true },
    { text: "Thảm tập cao cấp kháng khuẩn", included: true },
    { text: "Trà thảo mộc thanh lọc cơ thể", included: true },
  ];

  const kickfitFeatures = [
    { text: "Tập luyện 1 kèm 1 với HLV Kickfit", included: true },
    { text: "Giảm mỡ nhanh, cắt nét cơ thể", included: true },
    { text: "Tăng phản xạ, tự vệ thực chiến", included: true },
    { text: "Trang bị bao tay, giáp bảo hộ VIP", included: true },
    { text: "Giãn cơ phục hồi sau buổi tập", included: true },
    { text: "Tặng kèm thẻ tập tự do", included: true },
    { text: "Chế độ ăn siết mỡ chuyên sâu", included: true },
  ];

  const comparisonRows = [
    {
      label: "Giờ mở cửa",
      starter: { text: "05:00-22:00", color: "text-[#64748b]" },
      fitness: { text: "24/7 Không giới hạn", color: "text-[#2563eb]" },
      premium: { text: "24/7 Không giới hạn", color: "text-[#10b981]" },
    },
    {
      label: "Lớp Group Fitness",
      starter: { text: "2 lớp/tuần", color: "text-[#64748b]" },
      fitness: { text: "Không giới hạn", color: "text-[#2563eb]" },
      premium: { text: "Không giới hạn & Ưu tiên", color: "text-[#10b981]" },
    },
    {
      label: "Huấn luyện viên cá nhân",
      starter: { text: "Không hỗ trợ", color: "text-[#64748b]" },
      fitness: { text: "Tập thử 1 buổi", color: "text-[#2563eb]" },
      premium: { text: "4 buổi chuyên sâu/tháng", color: "text-[#10b981]" },
    },
    {
      label: "Hồ bơi Aqua & Sauna",
      starter: { text: "Phụ thu phí", color: "text-[#64748b]" },
      fitness: { text: "Miễn phí sử dụng", color: "text-[#2563eb]" },
      premium: { text: "Miễn phí + Phòng VIP", color: "text-[#10b981]" },
    },
    {
      label: "Khăn tắm & Tủ khóa VIP",
      starter: { text: "Tủ đồ tiêu chuẩn", color: "text-[#64748b]" },
      fitness: { text: "Khăn & Tủ khóa miễn phí", color: "text-[#2563eb]" },
      premium: { text: "Tủ khóa VIP cố định riêng", color: "text-[#10b981]" },
    },
  ];

  const addons = [
    {
      title: "Huấn luyện viên cá nhân (PT)",
      price: "Từ 350.000đ / buổi",
      desc: "Lộ trình thiết kế 1-1 tối ưu hóa thể trạng và phù hợp mục tiêu cá nhân của từng hội viên.",
    },
    {
      title: "Thuê sân bóng rổ / Sàn đấu",
      price: "Từ 200.000đ / giờ",
      desc: "Sân tiêu chuẩn thi đấu FIBA, được trang bị đầy đủ ánh sáng chuyên nghiệp và bảng điện tử.",
    },
    {
      title: "Tủ khóa VIP cố định tháng",
      price: "150.000đ / tháng",
      desc: "Tủ cá nhân bảo mật vân tay, không gian riêng tư để cất đồ tập và vật dụng cá nhân hàng ngày.",
    },
  ];

  const faqs = [
    {
      q: "Tôi có thể bảo lưu gói tập không?",
      a: "Có. Gói 6 tháng bảo lưu 30 ngày, gói 12 tháng bảo lưu 60 ngày miễn phí.",
    },
    {
      q: "Gói tập có bao gồm dịch vụ hồ bơi không?",
      a: "Từ gói Fitness Plus trở lên, hội viên được sử dụng hồ bơi Aqua và Sauna không giới hạn.",
    },
    {
      q: "Tôi có được thay đổi huấn luyện viên không?",
      a: "Được. Khách hàng sử dụng dịch vụ PT có quyền yêu cầu đổi HLV bất kỳ lúc nào.",
    },
    {
      q: "Có bắt buộc thanh toán một lần không?",
      a: "SportCenter hỗ trợ trả góp 0% lãi suất qua thẻ tín dụng liên kết với hơn 20 ngân hàng lớn.",
    },
    {
      q: "Tôi có thể chuyển nhượng gói tập không?",
      a: "Có. Gói tập có thể chuyển nhượng cho người thân một lần duy nhất với thủ tục đơn giản tại quầy lễ tân.",
    },
    {
      q: "Hội viên Starter có phải trả phí gửi xe không?",
      a: "Không. Tất cả hạng hội viên đều được miễn phí gửi xe trong thời gian tập luyện.",
    },
  ];

  return (
    <div className="flex flex-col items-start w-full min-h-screen bg-[#f8fafc]">
      

      {/* Hero Section */}
      <section className="bg-[#0f172a] flex flex-col items-center gap-[32px] px-[80px] py-[80px] w-full">
        <span className="bg-[#10b981]/20 text-[#10b981] font-['Inter:Semi_Bold'] font-semibold text-[12px] uppercase tracking-[1.5px] px-[16px] py-[8px] rounded-full">
          BẢNG GIÁ MINH BẠCH - KHÔNG PHÍ ẨN
        </span>
        <h1 className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[44px] text-center leading-tight max-w-[640px]">
          Đầu tư cho phiên bản tốt hơn của bạn
        </h1>
        <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[16px] text-center leading-relaxed max-w-[560px]">
          Hệ thống gói tập linh hoạt, minh bạch chi phí — thiết kế riêng cho từng mục tiêu và lịch trình cá nhân của bạn.
        </p>

        {/* Category Tabs */}
        <div className="flex bg-[#1e293b] rounded-full p-1 gap-2 mt-4 mb-2">
          <button
            onClick={() => setPackageCategory("member")}
            className={`px-8 py-3 rounded-full text-[15px] transition-colors cursor-pointer ${
              packageCategory === "member"
                ? "bg-teal-500 font-bold text-white shadow-lg"
                : "font-medium text-[#94a3b8] hover:text-white"
            }`}
          >
            Gói thành viên
          </button>
          <button
            onClick={() => setPackageCategory("training")}
            className={`px-8 py-3 rounded-full text-[15px] transition-colors cursor-pointer ${
              packageCategory === "training"
                ? "bg-teal-500 font-bold text-white shadow-lg"
                : "font-medium text-[#94a3b8] hover:text-white"
            }`}
          >
            Gói tập
          </button>
        </div>

        {/* Billing Toggle (Only for membership, or applies to both?) */}
        <div className="flex bg-[#1e293b] rounded-[12px] p-[4px] gap-[4px]">
          {billingTabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setBilling(key)}
              className={`px-[24px] py-[10px] rounded-[8px] text-[14px] transition-colors cursor-pointer ${
                billing === key
                  ? "bg-[#2563eb] font-['Inter:Bold'] font-bold text-white"
                  : "font-['Inter:Medium'] font-medium text-[#94a3b8] hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

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

      {/* Comparison Table */}
      <section className="bg-white flex flex-col items-center gap-[48px] px-[80px] py-[80px] w-full">
        <div className="flex flex-col items-center gap-[12px]">
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px]">
            So sánh đặc quyền chi tiết
          </h2>
          <div className="bg-[#2563eb] h-[3px] rounded-full w-[48px]" />
        </div>
        <div className="w-full max-w-[1120px] rounded-[16px] overflow-hidden border border-[#e2e8f0]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#0f172a]">
                <th className="text-left px-[28px] py-[18px] font-['Inter:Bold'] font-bold text-white text-[14px] w-[34%]">
                  Đặc quyền hội viên
                </th>
                <th className="text-center px-[20px] py-[18px] font-['Inter:Bold'] font-bold text-white text-[14px] w-[22%]">
                  Starter
                </th>
                <th className="text-center px-[20px] py-[18px] font-['Inter:Bold'] font-bold text-white text-[14px] w-[22%]">
                  Fitness Plus
                </th>
                <th className="text-center px-[20px] py-[18px] font-['Inter:Bold'] font-bold text-white text-[14px] w-[22%]">
                  Premium VIP
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr
                  key={row.label}
                  className={i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}
                >
                  <td className="px-[28px] py-[16px] font-['Inter:Medium'] font-medium text-[#1e293b] text-[14px]">
                    {row.label}
                  </td>
                  <td className={`px-[20px] py-[16px] text-center font-['Inter:Regular'] font-normal text-[14px] ${row.starter.color}`}>
                    {row.starter.text}
                  </td>
                  <td className={`px-[20px] py-[16px] text-center font-['Inter:Semi_Bold'] font-semibold text-[14px] ${row.fitness.color}`}>
                    {row.fitness.text}
                  </td>
                  <td className={`px-[20px] py-[16px] text-center font-['Inter:Semi_Bold'] font-semibold text-[14px] ${row.premium.color}`}>
                    {row.premium.text}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
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

      {/* Add-on Services */}
      <section className="bg-[#f8fafc] flex flex-col items-center gap-[48px] px-[80px] py-[80px] w-full">
        <div className="flex flex-col items-center gap-[12px]">
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px]">
            Dịch vụ bổ sung theo yêu cầu
          </h2>
          <div className="bg-[#2563eb] h-[3px] rounded-full w-[48px]" />
        </div>
        <div className="flex gap-[24px] w-full max-w-[1120px]">
          {addons.map((addon) => (
            <div
              key={addon.title}
              className="bg-white border border-[#e2e8f0] rounded-[16px] flex flex-col gap-[16px] p-[28px] flex-1"
            >
              <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[18px]">{addon.title}</p>
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#10b981] text-[22px]">{addon.price}</p>
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] leading-relaxed">
                {addon.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="bg-[#f8fafc] px-[80px] pb-[80px] w-full">
        <div className="bg-[#2563eb] rounded-[20px] flex flex-col items-center gap-[24px] px-[80px] py-[64px] w-full">
          <span className="bg-white/20 text-white font-['Inter:Bold'] font-bold text-[12px] uppercase tracking-[1.5px] px-[16px] py-[8px] rounded-full">
            ƯU ĐÃI LỚN NHẤT THÁNG
          </span>
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[32px] text-center leading-tight max-w-[640px]">
            Giảm ngay 20% gói 12 tháng khi đăng ký trong tháng này
          </h2>
          <p className="font-['Inter:Regular'] font-normal text-white/80 text-[16px] text-center leading-relaxed max-w-[540px]">
            Tặng kèm bộ quà tặng bình giữ nhiệt cao cấp và 02 buổi tập cùng Master Trainer.
          </p>
          <button
            data-name="btn-register"
            className="bg-white text-[#2563eb] font-['Inter:Bold'] font-bold text-[15px] px-[32px] py-[14px] rounded-[10px] hover:bg-[#f8fafc] transition-colors cursor-pointer"
          >
            Nhận ưu đãi ngay
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white flex flex-col items-center gap-[48px] px-[80px] py-[80px] w-full">
        <div className="flex flex-col items-center gap-[12px]">
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px]">
            Câu hỏi thường gặp
          </h2>
          <div className="bg-[#2563eb] h-[3px] rounded-full w-[48px]" />
        </div>
        <div className="grid grid-cols-2 gap-[20px] w-full max-w-[1120px]">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[14px] flex flex-col gap-[12px] p-[28px]"
            >
              <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[15px] leading-snug">{faq.q}</p>
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#f8fafc] px-[80px] pb-[80px] w-full">
        <div className="bg-[#0f172a] rounded-[20px] flex flex-col items-center gap-[32px] px-[80px] py-[64px] w-full">
          <div className="flex flex-col items-center gap-[16px]">
            <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[32px] text-center">
              Chưa chắc chắn chọn gói nào?
            </h2>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[16px] text-center leading-relaxed max-w-[560px]">
              Đăng ký tập thử MIỄN PHÍ 01 buổi trải nghiệm dịch vụ chuẩn quốc tế cùng HLV hướng dẫn chuyên nghiệp.
            </p>
          </div>
          <div className="flex gap-[12px] items-center w-full max-w-[640px]">
            <input
              type="text"
              placeholder="Họ và tên của bạn"
              className="bg-[#1e293b] text-white placeholder-[#64748b] font-['Inter:Regular'] font-normal text-[14px] px-[18px] py-[14px] rounded-[10px] flex-1 outline-none border border-[#1e293b] focus:border-[#2563eb] transition-colors"
            />
            <input
              type="text"
              placeholder="Số điện thoại"
              className="bg-[#1e293b] text-white placeholder-[#64748b] font-['Inter:Regular'] font-normal text-[14px] px-[18px] py-[14px] rounded-[10px] flex-1 outline-none border border-[#1e293b] focus:border-[#2563eb] transition-colors"
            />
            <button
              data-name="btn-submit"
              className="bg-[#10b981] text-white font-['Inter:Bold'] font-bold text-[14px] px-[24px] py-[14px] rounded-[10px] whitespace-nowrap hover:bg-[#059669] transition-colors cursor-pointer shrink-0"
            >
              Đăng ký tập thử ngay
            </button>
          </div>
        </div>
      </section>

      
    </div>
  );
}
