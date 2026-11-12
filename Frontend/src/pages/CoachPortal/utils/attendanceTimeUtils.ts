/**
 * Tiện ích xử lý thời gian và kiểm tra khóa ca dạy quá 24 giờ.
 * Quy định: Những lịch đã kết thúc quá 24h tính từ lúc buổi tập bắt đầu
 * (date + startTime) thì sẽ bị khóa vĩnh viễn và không thể điểm danh lớp
 * hoặc điều chỉnh điểm danh được nữa.
 */

export function parseSessionStartDateTime(dateStr?: string, startTimeStr?: string): Date | null {
  if (!dateStr) return null;
  try {
    const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    const [y, m, d] = datePart.split("-").map(Number);
    if (!y || !m || !d) return null;

    let hours = 0;
    let minutes = 0;
    if (startTimeStr) {
      const parts = startTimeStr.split(":");
      hours = parseInt(parts[0], 10) || 0;
      minutes = parseInt(parts[1], 10) || 0;
    }

    return new Date(y, m - 1, d, hours, minutes, 0);
  } catch {
    return null;
  }
}

export function isSessionPast24Hours(dateStr?: string, startTimeStr?: string): boolean {
  const startDateTime = parseSessionStartDateTime(dateStr, startTimeStr);
  if (!startDateTime) return false;

  const now = new Date();
  const diffMs = now.getTime() - startDateTime.getTime();

  // Quá 24 tiếng = 24 * 60 * 60 * 1000 = 86,400,000 ms
  return diffMs > 24 * 60 * 60 * 1000;
}

