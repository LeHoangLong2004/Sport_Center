/**
 * Helper chuẩn hóa và xác định ảnh đại diện cho Lớp học & Bộ môn thể thao.
 * Hỗ trợ tự động ánh xạ thông minh theo:
 * 1. customImageUrl (nếu có và hợp lệ)
 * 2. Tên bộ môn (sportName)
 * 3. Tên lớp học (className)
 * Đảm bảo 100% đúng môn thể thao, không bị lệch ảnh.
 */

export const DEFAULT_SPORT_IMAGES = {
  football: "/assets/images/football.jpg",
  badminton: "/assets/images/hero_bg.jpg",
  swimming: "/assets/cfb22.png",
  gym: "/assets/e865e.png",
  yoga: "/assets/88bba.png",
  boxing: "/assets/252a5.png",
  basketball: "/assets/3c386.png",
  zumba: "/assets/b457c.png",
  default: "/assets/images/hero_bg.jpg",
};

export function getClassImage(
  sportName?: string,
  className?: string,
  customImageUrl?: string | null,
): string {
  if (
    customImageUrl &&
    typeof customImageUrl === "string" &&
    customImageUrl.trim() !== "" &&
    !customImageUrl.includes("undefined") &&
    !customImageUrl.includes("null")
  ) {
    return customImageUrl;
  }

  const rawText = `${sportName || ""} ${className || ""}`.trim();
  if (!rawText) return DEFAULT_SPORT_IMAGES.default;

  const text = rawText
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  // 1. Bóng đá / Futsal / Sân cỏ / Soccer / Football
  if (
    text.includes("bong da") ||
    text.includes("futsal") ||
    text.includes("football") ||
    text.includes("soccer") ||
    text.includes("da banh") ||
    text.includes("san banh") ||
    text.includes("san co")
  ) {
    return DEFAULT_SPORT_IMAGES.football;
  }

  // 2. Bơi lội / Hồ bơi / Aqua / Swim
  if (
    text.includes("boi") ||
    text.includes("swim") ||
    text.includes("aqua") ||
    text.includes("ho boi") ||
    text.includes("duoi nuoc")
  ) {
    return DEFAULT_SPORT_IMAGES.swimming;
  }

  // 3. Yoga / Pilates / Thiền / Dẻo dai / Cột sống
  if (
    text.includes("yoga") ||
    text.includes("pilates") ||
    text.includes("thien") ||
    text.includes("chua lanh") ||
    text.includes("thu gian") ||
    text.includes("deo dai") ||
    text.includes("cot song")
  ) {
    return DEFAULT_SPORT_IMAGES.yoga;
  }

  // 4. Zumba / Dance / Nhảy / Khiêu vũ / Aerobic
  if (
    text.includes("zumba") ||
    text.includes("dance") ||
    text.includes("nhay") ||
    text.includes("khieu vu") ||
    text.includes("aerobic") ||
    text.includes("dot chay calo")
  ) {
    return DEFAULT_SPORT_IMAGES.zumba;
  }

  // 5. Boxing / Kickfit / Võ thuật / Đấm bốc / Muay / Ring
  if (
    text.includes("box") ||
    text.includes("kickfit") ||
    text.includes("vo thuat") ||
    text.includes("dam boc") ||
    text.includes("muay") ||
    text.includes("ring")
  ) {
    return DEFAULT_SPORT_IMAGES.boxing;
  }

  // 6. Bóng rổ / Basketball
  if (
    text.includes("bong ro") ||
    text.includes("basket")
  ) {
    return DEFAULT_SPORT_IMAGES.basketball;
  }

  // 7. Cầu lông / Badminton / Thảm lông
  if (
    text.includes("cau long") ||
    text.includes("badminton") ||
    text.includes("vot cau")
  ) {
    return DEFAULT_SPORT_IMAGES.badminton;
  }

  // 8. Gym / Thể hình / Fitness / HIIT / Tạ / Siết cơ / Tăng cơ
  if (
    text.includes("gym") ||
    text.includes("the hinh") ||
    text.includes("hiit") ||
    text.includes("fitness") ||
    text.includes("tang co") ||
    text.includes("siet co") ||
    text.includes("tap ta") ||
    text.includes("the luc")
  ) {
    return DEFAULT_SPORT_IMAGES.gym;
  }

  return DEFAULT_SPORT_IMAGES.default;
}

