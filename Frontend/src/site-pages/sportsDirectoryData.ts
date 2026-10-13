import {
  imgHero,
  imgPool,
  imgCheck,
} from "./sportsDetailData";
import {
  imgSport1,
  imgSport2,
  imgSport3,
  imgSport4,
  imgSport5,
  imgSport6,
} from "./homePageData";

export interface SportInfo {
  id: string;
  name: string;
  tagline: string;
  heroImg: string;
  facilityImg: string;
  facilityTitle: string;
  facilityDesc: string;
  features: string[];
  schedule: {
    time: string;
    name: string;
    coach: string;
    room: string;
    slots: string;
    full: boolean;
  }[];
  roadmap: {
    level: string;
    period: string;
    title: string;
    desc: string;
  }[];
}

export const SPORTS_DIRECTORY: Record<string, SportInfo> = {
  "boi-loi": {
    id: "boi-loi",
    name: "Bơi lội & Aqua Fitness",
    tagline: "Hệ sinh thái bơi lội tiêu chuẩn Olympic, kết hợp phương pháp phục hồi chức năng thể chất và nâng cao hiệu suất tim mạch dưới nước.",
    heroImg: imgHero,
    facilityImg: imgPool,
    facilityTitle: "Tại sao nên chọn Bơi lội tại SportCenter?",
    facilityDesc: "Sở hữu hồ bơi vô cực rộng 50m tiêu chuẩn quốc tế, trang bị hệ thống lọc nước ozone không sử dụng hóa chất độc hại, thân thiện tuyệt đối với làn da và hệ hô hấp.",
    features: [
      "Nâng cao thể lực tim mạch vượt trội",
      "Phương pháp an toàn không gây tổn thương xương khớp",
      "Giáo án cá nhân hóa theo mục tiêu từng học viên",
    ],
    schedule: [
      { time: "Thứ Ba - 08:00 - 09:30", name: "Aqua Basic Therapy", coach: "HLV. Alexander Trần", room: "Hồ Bơi Lớn A", slots: "Còn 5 chỗ trống", full: false },
      { time: "Thứ Năm - 18:30 - 20:00", name: "Aqua HIIT Power", coach: "HLV. Alexander Trần", room: "Hồ Bơi Lớn B", slots: "Còn 8 chỗ trống", full: false },
      { time: "Thứ Bảy - 09:00 - 10:30", name: "Olympic Performance Swim", coach: "HLV. Minh Thư", room: "Hồ Bơi Lớn A", slots: "Lớp đã đầy", full: true },
    ],
    roadmap: [
      { level: "CƠ BẢN", period: "Tháng thứ 1-2", title: "Nhập môn & Kỹ thuật nổi", desc: "Học viên làm quen nước, kiểm soát nhịp thở, học các động tác đập chân cơ bản của bơi sải." },
      { level: "TRUNG CẤP", period: "Tháng thứ 3-4", title: "Kỹ thuật thở & Hoàn thiện sải", desc: "Kết hợp thở nhịp nhàng, tối ưu sải tay, bơi liên tục 50m không mất sức." },
      { level: "NÂNG CAO", period: "Tháng thứ 5 trở đi", title: "Aqua HIIT & Bơi tốc độ", desc: "Rèn luyện sức bền tim mạch nâng cao kết hợp các bài tập tạ dưới nước củng cố cơ lõi." },
    ],
  },
  "gym": {
    id: "gym",
    name: "Gym & Fitness Tăng Cơ Giảm Mỡ",
    tagline: "Khu phức hợp thể hình đẳng cấp với 100% thiết bị Technogym chuẩn châu Âu, đo chỉ số InBody và kèm cặp kỹ thuật chuyên sâu.",
    heroImg: imgSport1,
    facilityImg: imgSport1,
    facilityTitle: "Hệ thống trang thiết bị Gym tiêu chuẩn cao",
    facilityDesc: "Khu tạ tự do (Free Weights), khu máy kháng lực (Pin-selected Machines) và dàn Cardio hiện đại với màn hình theo dõi nhịp tim thông minh.",
    features: [
      "Trang bị máy tập chuẩn giải phẫu cơ bắp",
      "Đo InBody và phân tích tiến độ hàng tuần",
      "Khu vực giãn cơ phục hồi chuyên biệt",
    ],
    schedule: [
      { time: "Thứ Hai - 06:00 - 07:30", name: "HIIT Sáng Sớm", coach: "PT Minh Khoa", room: "Khu Cardio A", slots: "Còn 4 chỗ trống", full: false },
      { time: "Thứ Tư - 18:00 - 19:30", name: "Body Building Tăng Cơ", coach: "PT Hoàng Nam", room: "Khu Tạ Tự Do", slots: "Còn 6 chỗ trống", full: false },
      { time: "Thứ Sáu - 19:00 - 20:30", name: "Core & Abs Blast", coach: "PT Minh Khoa", room: "Studio 1", slots: "Lớp đã đầy", full: true },
    ],
    roadmap: [
      { level: "CƠ BẢN", period: "Tháng thứ 1", title: "Thích nghi & Chuẩn Form", desc: "Nắm vững kỹ thuật hít thở, chuẩn form các bài tạ đa khớp (Squat, Deadlift, Bench Press)." },
      { level: "TRUNG CẤP", period: "Tháng thứ 2-3", title: "Tăng tiến mức tạ (Progressive Overload)", desc: "Xây dựng lịch tập chia nhóm cơ chuyên sâu (Push/Pull/Legs), tối ưu dinh dưỡng tăng cơ." },
      { level: "NÂNG CAO", period: "Tháng thứ 4+", title: "Siết cơ & Thể lực đỉnh cao", desc: "Kỹ thuật nâng cao Drop-set, Super-set giúp cắt nét cơ thể và duy trì vóc dáng lý tưởng." },
    ],
  },
  "yoga": {
    id: "yoga",
    name: "Yoga & Pilates Trị Liệu",
    tagline: "Không gian tĩnh lặng hòa cùng âm nhạc thư giãn, phục hồi cột sống và đánh thức nguồn năng lượng tích cực từ bên trong.",
    heroImg: imgSport3,
    facilityImg: imgSport3,
    facilityTitle: "Studio Yoga Ánh Sáng Tự Nhiên Chuyên Biệt",
    facilityDesc: "Không gian cách âm tuyệt đối, hệ thống sàn gỗ kháng khuẩn và thảm tập cao cấp hỗ trợ bảo vệ tối đa các khớp xương.",
    features: [
      "Master Yoga Ấn Độ hướng dẫn trực tiếp",
      "Hỗ trợ giải tỏa đau mỏi cổ vai gáy hiệu quả",
      "Lớp học sĩ số nhỏ dưới 12 người để chỉnh sửa form",
    ],
    schedule: [
      { time: "Thứ Hai - 07:00 - 08:00", name: "Hatha Yoga Chào Ngày Mới", coach: "Master Rajesh", room: "Studio Yoga 1", slots: "Còn 3 chỗ trống", full: false },
      { time: "Thứ Tư - 18:30 - 19:30", name: "Vinyasa Flow Dẻo Dai", coach: "HLV Lan Anh", room: "Studio Yoga 1", slots: "Còn 5 chỗ trống", full: false },
      { time: "Thứ Bảy - 08:30 - 09:30", name: "Yoga Phục Hồi Cột Sống", coach: "HLV Lan Anh", room: "Studio Yoga 2", slots: "Lớp đã đầy", full: true },
    ],
    roadmap: [
      { level: "CƠ BẢN", period: "Tuần 1-4", title: "Hơi thở & Khớp xương", desc: "Làm quen kỹ thuật thở Pranayama, các tư thế mở khớp háng và kéo giãn gân kheo an toàn." },
      { level: "TRUNG CẤP", period: "Tuần 5-12", title: "Thăng bằng & Dẻo dai", desc: "Chinh phục các chuỗi Asana liên hoàn, tăng sức mạnh cơ trung tâm và giữ thăng bằng." },
      { level: "NÂNG CAO", period: "Tuần 13+", title: "Uốn lưng & Trị liệu sâu", desc: "Thực hiện các tư thế nâng cao (Bánh xe, Trồng chuối), tĩnh tâm thiền định chuyên sâu." },
    ],
  },
  "boxing": {
    id: "boxing",
    name: "Boxing & Kickfit Thể Lực",
    tagline: "Bộ môn cardio đốt mỡ siêu tốc lên đến 800 kcal/giờ, tăng phản xạ tự vệ và giải tỏa căng thẳng công việc tuyệt đối.",
    heroImg: imgSport4,
    facilityImg: imgSport4,
    facilityTitle: "Võ đài chuẩn đấu trường & Trang thiết bị Everlast",
    facilityDesc: "Võ đài tiêu chuẩn, dàn bao cát nhiều kích cỡ, găng tay và đồ bảo hộ thi đấu đạt chuẩn an toàn quốc tế.",
    features: [
      "Đốt cháy mỡ thừa và làm săn chắc toàn thân",
      "Rèn luyện kỹ năng tự vệ thực chiến",
      "Âm nhạc sôi động tạo cảm hứng bùng nổ",
    ],
    schedule: [
      { time: "Thứ Ba - 18:00 - 19:30", name: "Kickboxing Pro Đốt Mỡ", coach: "PT Gia Hân", room: "Khu Võ Đài", slots: "Còn 6 chỗ trống", full: false },
      { time: "Thứ Năm - 19:30 - 21:00", name: "Boxing Kỹ Thuật Đòn Tay", coach: "HLV Quốc Bảo", room: "Khu Võ Đài", slots: "Còn 4 chỗ trống", full: false },
      { time: "Chủ Nhật - 09:00 - 10:30", name: "Sparring & Thể Lực Cuối Tuần", coach: "HLV Quốc Bảo", room: "Khu Võ Đài", slots: "Lớp đã đầy", full: true },
    ],
    roadmap: [
      { level: "CƠ BẢN", period: "Tháng 1", title: "Bộ chân & Đòn đấm căn bản", desc: "Luyện bộ chân Footwork, 4 đòn tay cơ bản (Jab, Cross, Hook, Uppercut) và né đòn." },
      { level: "TRUNG CẤP", period: "Tháng 2-3", title: "Tổ hợp đòn & Tốc độ", desc: "Ghép chuỗi đòn đấm đá liên hoàn, phản xạ né đòn trên bao cát và đích đấm (Pad work)." },
      { level: "NÂNG CAO", period: "Tháng 4+", title: "Đấu tập Sparring & Thực chiến", desc: "Chiến thuật di chuyển, phân phối thể lực và thi đấu cọ xát có bảo hộ an toàn." },
    ],
  },
  "bong-ro": {
    id: "bong-ro",
    name: "Bóng rổ & Huấn luyện Thể chất",
    tagline: "Sân bóng rổ sàn gỗ tiêu chuẩn FIBA, phát triển chiều cao vượt trội và tư duy đồng đội cho mọi lứa tuổi.",
    heroImg: imgSport5,
    facilityImg: imgSport5,
    facilityTitle: "Sân bóng rổ tiêu chuẩn thi đấu trong nhà",
    facilityDesc: "Sàn gỗ thông nhập khẩu giảm chấn động khớp gối, bảng rổ kính cường lực và hệ thống chiếu sáng không chói mắt.",
    features: [
      "Tăng cường sức bật và phát triển chiều cao",
      "Huấn luyện viên từng thi đấu tại giải VBA",
      "Lớp học phân chia theo từng độ tuổi",
    ],
    schedule: [
      { time: "Thứ Bảy - 07:30 - 09:00", name: "Bóng rổ Thanh Thiếu Niên", coach: "HLV Tuấn Kiệt", room: "Sân Bóng Rổ A", slots: "Còn 8 chỗ trống", full: false },
      { time: "Chủ Nhật - 16:30 - 18:00", name: "Kỹ năng Dẫn bóng & Ném rổ", coach: "HLV Tuấn Kiệt", room: "Sân Bóng Rổ A", slots: "Còn 5 chỗ trống", full: false },
    ],
    roadmap: [
      { level: "CƠ BẢN", period: "Giai đoạn 1", title: "Nhồi bóng & Lên rổ", desc: "Cảm giác bóng, nhồi bóng 2 tay và kỹ thuật lên rổ 2 bước căn bản." },
      { level: "TRUNG CẤP", period: "Giai đoạn 2", title: "Ném rổ & Phối hợp nhóm", desc: "Tư thế ném rổ chuẩn form, kỹ thuật chuyền bóng và chạy bài phối hợp pick-and-roll." },
      { level: "NÂNG CAO", period: "Giai đoạn 3", title: "Chiến thuật thi đấu 5x5", desc: "Chiến thuật phòng ngự khu vực, kèm người và thi đấu đối kháng giải phong trào." },
    ],
  },
  "aerobic": {
    id: "aerobic",
    name: "Thể dục nhịp điệu & Zumba Dance",
    tagline: "Hòa mình vào âm nhạc Latin cuồng nhiệt, giải phóng hình thể và đốt cháy năng lượng một cách vui vẻ nhất.",
    heroImg: imgSport6,
    facilityImg: imgSport6,
    facilityTitle: "Studio Nhảy & Dance Hiện Đại",
    facilityDesc: "Hệ thống âm thanh vòm sống động, gương tràn tường lớn giúp học viên dễ dàng quan sát và căn chỉnh động tác vũ đạo.",
    features: [
      "Vừa tập thể dục vừa giải trí xả stress",
      "Âm nhạc sôi động tạo hưng phấn tức thì",
      "Phù hợp cho mọi người ở mọi độ tuổi",
    ],
    schedule: [
      { time: "Thứ Hai - 18:00 - 19:00", name: "Zumba Party Fitness", coach: "HLV Thảo Vy", room: "Studio Dance", slots: "Còn 7 chỗ trống", full: false },
      { time: "Thứ Sáu - 18:30 - 19:30", name: "Aerobic Dance Đốt Mỡ", coach: "HLV Thảo Vy", room: "Studio Dance", slots: "Còn 10 chỗ trống", full: false },
    ],
    roadmap: [
      { level: "CƠ BẢN", period: "Tuần 1-2", title: "Cảm nhịp & Bước chân", desc: "Làm quen với nhịp phách âm nhạc, các bước nhảy cơ bản và nhún nhảy tự nhiên." },
      { level: "TRUNG CẤP", period: "Tuần 3-6", title: "Chuyển động hông & Tay", desc: "Kết hợp chuyển động toàn thân, di chuyển linh hoạt theo tiết tấu nhanh." },
      { level: "NÂNG CAO", period: "Tuần 7+", title: "Vũ đạo hoàn chỉnh", desc: "Thực hiện trọn vẹn bài nhảy hoàn chỉnh với năng lượng tích cực cao nhất." },
    ],
  },
};
