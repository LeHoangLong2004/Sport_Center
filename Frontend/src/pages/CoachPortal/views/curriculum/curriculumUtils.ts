import type { MockCurriculum, SportOption } from "../../services/api";

/**
 * Tránh lặp chuỗi "(Bản sao) (Bản sao)..." khi nhân bản hoặc hiển thị giáo án.
 * Nếu có nhiều hậu tố bản sao, chuẩn hóa thành "(Bản sao N)".
 */
export function cleanDuplicateSuffixes(title: string): string {
  if (!title) return "";
  const trimmed = title.trim();
  const matches = [...trimmed.matchAll(/\((?:Bản sao|Copy)(?:\s*(\d+))?\)/gi)];
  if (matches.length <= 1) {
    return trimmed;
  }
  const baseTitle = trimmed.replace(/(\s*\((?:Bản sao|Copy)(?:\s*\d+)?\))+$/gi, "").trim();
  return `${baseTitle} (Bản sao ${matches.length})`;
}

/**
 * Tạo tên cho lần nhân bản tiếp theo một cách thông minh:
 * "Giáo án Bơi" -> "Giáo án Bơi (Bản sao)"
 * "Giáo án Bơi (Bản sao)" -> "Giáo án Bơi (Bản sao 2)"
 * "Giáo án Bơi (Bản sao 2)" -> "Giáo án Bơi (Bản sao 3)"
 */
export function getNextCloneTitle(title: string): string {
  if (!title) return "Kế hoạch tập luyện (Bản sao)";
  const trimmed = title.trim();
  const matches = [...trimmed.matchAll(/\((?:Bản sao|Copy)(?:\s*(\d+))?\)/gi)];

  if (matches.length === 0) {
    return `${trimmed} (Bản sao)`;
  }

  const baseTitle = trimmed.replace(/(\s*\((?:Bản sao|Copy)(?:\s*\d+)?\))+$/gi, "").trim();
  let nextNumber = matches.length + 1;
  const lastMatch = matches[matches.length - 1];
  if (lastMatch[1]) {
    const parsed = parseInt(lastMatch[1], 10);
    if (!isNaN(parsed)) {
      nextNumber = parsed + 1;
    }
  }

  return `${baseTitle} (Bản sao ${nextNumber})`;
}

/**
 * Chuẩn hóa cách viết trình độ:
 * Thống nhất "Cơ bản", "Trung cấp", "Nâng cao", "Mọi trình độ".
 * Xử lý các từ tiếng Anh (basic, beginner, intermediate, advanced) hoặc gõ không dấu.
 */
export function normalizeLevel(level: string | null | undefined): string {
  if (!level) return "Cơ bản";
  const clean = level.trim().toLowerCase();

  if (
    clean === "basic" ||
    clean === "beginner" ||
    clean === "cơ bản" ||
    clean === "co ban" ||
    clean === "sơ cấp" ||
    clean === "so cap" ||
    clean === "nhập môn"
  ) {
    return "Cơ bản";
  }

  if (
    clean === "intermediate" ||
    clean === "trung cấp" ||
    clean === "trung cap" ||
    clean === "vừa" ||
    clean === "trung bình"
  ) {
    return "Trung cấp";
  }

  if (
    clean === "advanced" ||
    clean === "nâng cao" ||
    clean === "nang cao" ||
    clean === "chuyên sâu" ||
    clean === "chuyên nghiệp"
  ) {
    return "Nâng cao";
  }

  if (clean === "all" || clean === "mọi trình độ" || clean === "moi trinh do" || clean === "tất cả") {
    return "Mọi trình độ";
  }

  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/**
 * Chuẩn hóa hiển thị bộ môn:
 * Tránh hiển thị "Chưa xác định" khi giáo án đã có thông tin bộ môn
 * trong tên giáo án, mục tiêu, hoặc mô tả (Pilates, Boxing, Yoga, Bơi lội, Gym, Cầu lông...).
 */
export function resolveSportInfo(
  sport: string | null | undefined,
  sportId: string | null | undefined,
  sports: SportOption[] = [],
  planName: string = "",
  goal: string = "",
  description: string = ""
): { sport: string; sportId: string | null } {
  // 1. Khớp theo sportId nếu có
  if (sportId) {
    const matched = sports.find(
      (s) => s.id?.toLowerCase() === String(sportId).toLowerCase()
    );
    if (matched) return { sport: matched.name, sportId: matched.id };
  }

  // 2. Khớp theo tên bộ môn đã có (nếu hợp lệ và không phải "Chưa xác định")
  if (sport && sport.trim() && sport.trim() !== "Chưa xác định") {
    const trimmed = sport.trim();
    const matched = sports.find(
      (s) => s.name?.toLowerCase() === trimmed.toLowerCase()
    );
    if (matched) return { sport: matched.name, sportId: matched.id };
    return { sport: trimmed, sportId: sportId || null };
  }

  // 3. Suy luận thông minh từ tên giáo án, mục tiêu, mô tả
  const textToScan = `${planName} ${goal} ${description}`.toLowerCase();

  const sportKeywordMap: { pattern: RegExp; canonicalName: string }[] = [
    { pattern: /\b(bơi|bơi lội|swimming|swim)\b/i, canonicalName: "Bơi lội" },
    { pattern: /\b(pilates)\b/i, canonicalName: "Pilates" },
    { pattern: /\b(boxing|quyền anh|kickboxing)\b/i, canonicalName: "Boxing" },
    { pattern: /\b(yoga|yogi)\b/i, canonicalName: "Yoga" },
    { pattern: /\b(gym|thể hình|fitness|cardio|tập tạ|calisthenics)\b/i, canonicalName: "Gym" },
    { pattern: /\b(cầu lông|badminton)\b/i, canonicalName: "Cầu lông" },
    { pattern: /\b(bóng đá|football|soccer)\b/i, canonicalName: "Bóng đá" },
    { pattern: /\b(bóng rổ|basketball)\b/i, canonicalName: "Bóng rổ" },
    { pattern: /\b(tennis|quần vợt)\b/i, canonicalName: "Tennis" },
    { pattern: /\b(võ|võ thuật|karate|taekwondo|judo)\b/i, canonicalName: "Võ thuật" },
  ];

  for (const item of sportKeywordMap) {
    if (item.pattern.test(textToScan)) {
      const matched = sports.find(
        (s) => s.name?.toLowerCase() === item.canonicalName.toLowerCase()
      );
      if (matched) {
        return { sport: matched.name, sportId: matched.id };
      }
      return { sport: item.canonicalName, sportId: sportId || null };
    }
  }

  return {
    sport: sport && sport.trim() ? sport.trim() : "Chưa xác định",
    sportId: sportId || null,
  };
}

export type EffectiveStatusKey = "ready" | "empty" | "draft" | "archived";

export interface EffectiveStatusInfo {
  key: EffectiveStatusKey;
  label: string;
  badgeClass: string;
  canAssign: boolean;
  tooltip?: string;
}

/**
 * Tính toán trạng thái thực tế của giáo án:
 * - Nếu giáo án có 0 bài tập: Gắn nhãn "Chưa có bài tập", không để "Sẵn sàng giao", không cho giao.
 * - Việc giao học viên được theo dõi riêng ở danh sách bài tập về nhà.
 * - Nếu đã duyệt & có >= 1 bài tập: Gắn nhãn "Sẵn sàng giao".
 * - Nếu là nháp: Gắn nhãn "Bản nháp".
 */
export function getEffectiveStatus(curriculum: MockCurriculum): EffectiveStatusInfo {
  const exerciseCount = Array.isArray(curriculum.exercises) ? curriculum.exercises.length : 0;

  if (exerciseCount === 0) {
    return {
      key: "empty",
      label: "Chưa có bài tập",
      badgeClass: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      canAssign: false,
      tooltip: "Cần bổ sung ít nhất 1 bài tập trước khi giao cho học viên/lớp",
    };
  }

  const rawStatus = String(curriculum.status || "").trim();

  if (rawStatus === "Lưu trữ" || rawStatus.toLowerCase() === "archived") {
    return {
      key: "archived",
      label: "Lưu trữ",
      badgeClass: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
      canAssign: false,
      tooltip: "Kế hoạch đang lưu trữ",
    };
  }

  if (rawStatus === "Đã duyệt" || rawStatus.toLowerCase() === "approved") {
    return {
      key: "ready",
      label: "Sẵn sàng giao",
      badgeClass: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      canAssign: true,
    };
  }

  return {
    key: "draft",
    label: "Bản nháp",
    badgeClass: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    canAssign: true,
  };
}

/**
 * Làm sạch danh sách đối tượng được giao bài:
 * Loại bỏ các đối tượng có tên trùng với tên giáo án (lỗi lặp dữ liệu trước đây)
 * và chỉ giữ lại tên học viên/lớp thực sự.
 */
export function getValidAssignmentText(curriculum: MockCurriculum): {
  isAssigned: boolean;
  displayText: string;
} {
  const isAssigned = curriculum.assignedTo.length > 0;
  const cleanPlanName = curriculum.name.trim().toLowerCase();

  const validTargets = (curriculum.assignedTo || []).filter((target) => {
    if (!target || !target.name) return false;
    const cleanTargetName = target.name.trim().toLowerCase();
    // Loại bỏ trường hợp tên đối tượng bị gán bằng chính tên giáo án
    return cleanTargetName !== cleanPlanName && cleanTargetName.length > 0;
  });

  if (validTargets.length > 0) {
    const names = validTargets.map((t) => t.name).join(", ");
    return {
      isAssigned: true,
      displayText: `Đã giao cho: ${names}`,
    };
  }

  if (isAssigned) {
    return {
      isAssigned: true,
      displayText: "Đã phát sinh bài tập về nhà",
    };
  }

  return {
    isAssigned: false,
    displayText: "Chưa phát sinh bài tập về nhà",
  };
}

