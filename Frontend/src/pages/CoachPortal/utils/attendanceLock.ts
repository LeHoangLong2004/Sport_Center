/**
 * Tiện ích kiểm tra và xử lý quy định khóa điểm danh (24-hour attendance locking rule).
 *
 * QUY ĐỊNH:
 * - Điểm danh hoặc điều chỉnh điểm danh chỉ được thực hiện trong vòng 24 giờ kể từ thời điểm ca học bắt đầu.
 * - Ví dụ: Ca học bắt đầu lúc 09:00 ngày 12/11/2026 thì thời hạn chỉnh sửa kết thúc vào 09:00 ngày 13/11/2026.
 * - Sau 24 giờ kể từ giờ bắt đầu, sổ điểm danh sẽ bị KHÓA VĨNH VIỄN. HLV không thể mở lại để điểm danh bổ sung hay sửa điểm.
 */

export interface AttendanceDeadlineInfo {
  isLocked: boolean;
  startDateTime: Date | null;
  deadline: Date | null;
  formattedStart: string;
  formattedDeadline: string;
  remainingText: string;
}

/**
 * Phân tích ngày (YYYY-MM-DD) và giờ bắt đầu (HH:mm) của buổi học thành đối tượng Date.
 */
export function getSessionStartDateTime(dateStr?: string, timeStr?: string): Date | null {
  if (!dateStr) return null;

  const cleanDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr.trim();
  const dateParts = cleanDate.split("-").map(Number);
  if (dateParts.length !== 3 || dateParts.some(isNaN)) return null;

  const [year, month, day] = dateParts;

  let hours = 0;
  let minutes = 0;
  if (timeStr && timeStr.trim()) {
    const timeParts = timeStr.trim().split(":").map(Number);
    if (!isNaN(timeParts[0])) hours = timeParts[0];
    if (timeParts.length > 1 && !isNaN(timeParts[1])) minutes = timeParts[1];
  }

  const start = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return isNaN(start.getTime()) ? null : start;
}

/**
 * Kiểm tra xem một ca học đã quá 24 giờ kể từ giờ bắt đầu hay chưa.
 * Trả về true nếu đã quá 24 giờ (đã bị khóa vĩnh viễn).
 */
export function isAttendanceLocked24h(dateStr?: string, timeStr?: string): boolean {
  const start = getSessionStartDateTime(dateStr, timeStr);
  if (!start) return false;

  const deadlineMs = start.getTime() + 24 * 60 * 60 * 1000;
  return Date.now() > deadlineMs;
}

/**
 * Lấy thông tin chi tiết về thời hạn điểm danh (hạn chót, thời gian còn lại, chuỗi định dạng).
 */
export function getAttendanceLockDeadlineInfo(dateStr?: string, timeStr?: string): AttendanceDeadlineInfo {
  const start = getSessionStartDateTime(dateStr, timeStr);
  if (!start) {
    return {
      isLocked: false,
      startDateTime: null,
      deadline: null,
      formattedStart: "",
      formattedDeadline: "",
      remainingText: "",
    };
  }

  const deadline = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const now = Date.now();
  const diffMs = deadline.getTime() - now;
  const isLocked = diffMs <= 0;

  const pad = (n: number) => String(n).padStart(2, "0");
  const formattedStart = `${pad(start.getHours())}:${pad(start.getMinutes())} ngày ${pad(start.getDate())}/${pad(
    start.getMonth() + 1
  )}/${start.getFullYear()}`;
  const formattedDeadline = `${pad(deadline.getHours())}:${pad(deadline.getMinutes())} ngày ${pad(
    deadline.getDate()
  )}/${pad(deadline.getMonth() + 1)}/${deadline.getFullYear()}`;

  let remainingText = "";
  if (!isLocked) {
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours > 0) {
      remainingText = `Còn ${hours} giờ ${mins} phút để chốt / sửa`;
    } else {
      remainingText = `Còn ${mins} phút để chốt / sửa`;
    }
  } else {
    remainingText = "Đã quá hạn 24 giờ (Khóa vĩnh viễn)";
  }

  return {
    isLocked,
    startDateTime: start,
    deadline,
    formattedStart,
    formattedDeadline,
    remainingText,
  };
}

