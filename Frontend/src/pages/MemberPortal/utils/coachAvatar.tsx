import React, { useState, useEffect } from "react";

/**
 * Trích xuất 2 chữ cái viết tắt của HLV (bỏ tiền tố Coach / HLV).
 * Ví dụ:
 *  - "Pham Vu" -> "PV"
 *  - "Coach Đỗ Hoàng E" -> "HE"
 *  - "Coach Phạm Văn C" -> "PC"
 *  - "Coach Lê Thị D" -> "LD"
 *  - "Coach Nguyễn Văn A" -> "NA"
 */
export function getCoachInitials(name?: string): string {
  if (!name) return "HLV";
  const cleaned = name.replace(/^(Coach|HLV)\s+/i, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "HLV";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const COACH_GRADIENTS = [
  "from-teal-600 to-emerald-700",
  "from-cyan-600 to-blue-700",
  "from-indigo-600 to-purple-700",
  "from-emerald-600 to-teal-800",
  "from-amber-600 to-orange-700",
  "from-rose-600 to-pink-700",
];

export function getCoachGradient(name?: string): string {
  if (!name) return COACH_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % COACH_GRADIENTS.length;
  return COACH_GRADIENTS[idx];
}

/**
 * Chỉ trả về avatar thật nếu tài khoản HLV đã upload.
 * Nếu chưa có avatar thì trả về null (tuyệt đối KHÔNG gán ảnh AI giả định).
 */
export function getRealCoachAvatar(name?: string, avatarUrl?: string | null, coachId?: string): string | null {
  if (avatarUrl && typeof avatarUrl === "string" && avatarUrl.trim() !== "" && !avatarUrl.includes("ui-avatars.com")) {
    return avatarUrl.trim();
  }
  return null;
}

interface CoachAvatarProps {
  src?: string | null;
  name?: string;
  className?: string;
}

/**
 * Component hiển thị Avatar HLV:
 * - Nếu tài khoản HLV ĐÃ CÓ avatar thật: Hiển thị đúng ảnh đại diện thật của HLV.
 * - Nếu tài khoản HLV CHƯA CÓ avatar: Hiển thị avatar chữ cái viết tắt tên HLV chuẩn thể thao,
 *   KHÔNG dùng ảnh AI người lạ mặc định, và KHÔNG bao giờ bị lỗi icon ảnh hỏng.
 */
export function CoachAvatar({
  src,
  name = "HLV",
  className = "w-10 h-10 rounded-full",
}: CoachAvatarProps) {
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setLoadError(false);
  }, [src]);

  const hasValidSrc =
    src &&
    typeof src === "string" &&
    src.trim() !== "" &&
    !src.includes("ui-avatars.com") &&
    !loadError;

  if (hasValidSrc) {
    return (
      <img
        src={src}
        alt={name}
        className={`${className} object-cover shrink-0`}
        onError={() => setLoadError(true)}
      />
    );
  }

  const initials = getCoachInitials(name);
  const gradient = getCoachGradient(name);

  return (
    <div
      className={`${className} bg-gradient-to-br ${gradient} text-white flex items-center justify-center font-black tracking-wider shrink-0 select-none shadow-xs border border-white/20`}
      title={name}
    >
      <span className="text-[0.75em] leading-none">{initials}</span>
    </div>
  );
}
