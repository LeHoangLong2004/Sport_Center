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
 * Phân tích ngày (YYYY-MM-DD) và giờ bắt đầu (HH:mm) theo múi giờ trung tâm (Asia/Bangkok)
 * thành một thời điểm tuyệt đối để việc khóa không phụ thuộc múi giờ của trình duyệt.
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

  const start = new Date(Date.UTC(year, month - 1, day, hours - 7, minutes, 0, 0));
  return isNaN(start.getTime()) ? null : start;
}

/** True until the scheduled local start time of this session. */
export function isAttendanceNotStarted(dateStr?: string, timeStr?: string): boolean {
  const start = getSessionStartDateTime(dateStr, timeStr);
  // Fail closed if the schedule is missing or malformed: do not allow marking
  // attendance when the session start time cannot be verified.
  return !start || Date.now() < start.getTime();
}

function formatCenterDateTime(value: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hourCycle: "h23",
  }).format(value).replace(",", "");
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

  const formattedStart = formatCenterDateTime(start);
  const formattedDeadline = formatCenterDateTime(deadline);

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

