export const billingTabs: { key: "monthly" | "6month" | "annual"; label: string }[] = [
  { key: "monthly", label: "Thanh toán Tháng" },
  { key: "6month", label: "6 Tháng (-15%)" },
  { key: "annual", label: "12 Tháng (-30%)" },
];

export const starterFeatures = [
  { text: "Sử dụng Gym & Cardio chuyên biệt", included: true },
  { text: "Tham gia 2 lớp thể thao nhóm/tuần", included: true },
  { text: "Đánh giá thể chất InBody định kỳ", included: true },
  { text: "Thuê tủ đồ cá nhân tiêu chuẩn", included: true },
  { text: "Miễn phí nước uống lọc tại quầy", included: true },
  { text: "Hồ bơi Aqua & Sauna trị liệu", included: false },
  { text: "Huấn luyện viên cá nhân (PT)", included: false },
];

export const fitnessFeatures = [
  { text: "Sử dụng Gym & Cardio chuyên biệt", included: true },
  { text: "Tham gia không giới hạn lớp nhóm", included: true },
  { text: "Đánh giá thể chất InBody định kỳ", included: true },
  { text: "Hồ bơi Aqua & Sauna trị liệu", included: true },
  { text: "Ưu tiên đăng ký lịch tập trước", included: true },
  { text: "Tủ đồ VIP & Khăn tắm sạch mỗi buổi", included: true },
  { text: "Miễn phí nước uống ion kiềm", included: true },
  { text: "Huấn luyện viên cá nhân (PT)", included: false },
];

export const premiumFeatures = [
  { text: "Đặc quyền sử dụng 5 khu vực tập luyện VIP", included: true },
  { text: "Tham gia không giới hạn lớp nhóm", included: true },
  { text: "Đánh giá InBody & Giáo án riêng", included: true },
  { text: "Hồ bơi Aqua & Sauna trị liệu", included: true },
  { text: "4 Buổi tập cá nhân cùng PT/tháng", included: true },
  { text: "Lối đi ưu tiên - Check-in không đợi", included: true },
  { text: "Quầy bar nước uống & trái cây tươi miễn phí", included: true },
];

export const ptFeatures = [
  { text: "Huấn luyện viên cá nhân 1 kèm 1", included: true },
  { text: "Lộ trình tập luyện thiết kế riêng", included: true },
  { text: "Tư vấn dinh dưỡng chuyên sâu", included: true },
  { text: "Đo InBody và theo dõi chỉ số mỗi tuần", included: true },
  { text: "Giãn cơ phục hồi sau buổi tập", included: true },
  { text: "Tặng kèm thẻ tập trong những ngày PT", included: true },
  { text: "Cam kết đạt mục tiêu hình thể", included: true },
];

export const yogaFeatures = [
  { text: "Huấn luyện viên Master Yoga Ấn Độ", included: true },
  { text: "Lớp học nhóm nhỏ dưới 5 người", included: true },
  { text: "Chỉnh sửa tư thế chuẩn xác", included: true },
  { text: "Trị liệu cổ vai gáy, thoái hóa", included: true },
  { text: "Phòng tập Yoga tĩnh lặng chuyên biệt", included: true },
  { text: "Thảm tập cao cấp kháng khuẩn", included: true },
  { text: "Trà thảo mộc thanh lọc cơ thể", included: true },
];

export const kickfitFeatures = [
  { text: "Tập luyện 1 kèm 1 với HLV Kickfit", included: true },
  { text: "Giảm mỡ nhanh, cắt nét cơ thể", included: true },
  { text: "Tăng phản xạ, tự vệ thực chiến", included: true },
  { text: "Trang bị bao tay, giáp bảo hộ VIP", included: true },
  { text: "Giãn cơ phục hồi sau buổi tập", included: true },
  { text: "Tặng kèm thẻ tập tự do", included: true },
  { text: "Chế độ ăn siết mỡ chuyên sâu", included: true },
];

export const comparisonRows = [
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

export const addons = [
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

export const faqs = [
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
