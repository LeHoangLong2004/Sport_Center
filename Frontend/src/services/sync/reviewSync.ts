export interface SyncedCoachReview {
  id: string;
  coachId: string;
  coachName: string;
  memberId: string;
  memberName: string;
  anonymizedMemberName: string;
  rating: number;
  comment: string;
  tags: string[];
  sessionId?: string;
  sessionName: string;
  createdAt: string;
}

const STORAGE_KEY = "synced_coach_reviews";
const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api";

export const INITIAL_COACH_REVIEWS: SyncedCoachReview[] = [
  {
    id: "rev-1",
    coachId: "25f50fba-506a-4edf-9db7-43f77f6741a4",
    coachName: "HLV Hồ Xuân Ánh Nam",
    memberId: "m1",
    memberName: "Học viên Nguyễn Văn An",
    anonymizedMemberName: "Học viên ẩn danh #842",
    rating: 5,
    sessionName: "Gym Group BodyCombat",
    comment: "Thầy hướng dẫn rất tận tâm, chỉnh sửa tư thế squat và deadlift cực kỳ chi tiết. Sau 1 tháng tập cảm thấy lưng không còn mỏi nữa!",
    tags: ["Nhiệt tình", "Sửa form kỹ", "Động viên tích cực"],
    createdAt: "2026-10-03T09:30:00Z",
  },
  {
    id: "rev-2",
    coachId: "25f50fba-506a-4edf-9db7-43f77f6741a4",
    coachName: "HLV Hồ Xuân Ánh Nam",
    memberId: "m2",
    memberName: "Học viên Lê Thị Bình",
    anonymizedMemberName: "Học viên ẩn danh #319",
    rating: 5,
    sessionName: "Yoga Phục Hồi",
    comment: "Lớp Yoga cơ bản siêu thích, thầy tạo không khí thoải mái, thở đúng cách giúp mình ngủ ngon hơn hẳn.",
    tags: ["Âm nhạc thư giãn", "Đúng giờ", "Giảng dạy dễ hiểu"],
    createdAt: "2026-09-29T18:15:00Z",
  },
  {
    id: "rev-3",
    coachId: "25f50fba-506a-4edf-9db7-43f77f6741a4",
    coachName: "HLV Hồ Xuân Ánh Nam",
    memberId: "m3",
    memberName: "Học viên Trần Quốc Cường",
    anonymizedMemberName: "Học viên ẩn danh #507",
    rating: 4,
    sessionName: "Boxing Cơ Bản",
    comment: "Giáo án tập thể lực rất chất lượng, khối lượng bài tập vừa sức. Hy vọng buổi sau có thêm bài tập bổ trợ cho cơ vai.",
    tags: ["Bài tập đa dạng", "Nhiệt tình"],
    createdAt: "2026-09-21T10:00:00Z",
  },
  {
    id: "rev-4",
    coachId: "25f50fba-506a-4edf-9db7-43f77f6741a4",
    coachName: "HLV Hồ Xuân Ánh Nam",
    memberId: "m4",
    memberName: "Học viên Phạm Duy",
    anonymizedMemberName: "Học viên ẩn danh #192",
    rating: 5,
    sessionName: "Yoga Cơ Bản – Lớp A",
    comment: "HLV nhiệt tình, đến lớp sớm chuẩn bị dụng cụ chu đáo. Luôn động viên học viên khi sắp đuối sức.",
    tags: ["Đúng giờ", "Nhiệt tình"],
    createdAt: "2026-09-16T16:45:00Z",
  },
];

function getStoredReviews(): SyncedCoachReview[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COACH_REVIEWS));
      return INITIAL_COACH_REVIEWS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_COACH_REVIEWS;
  }
}

function saveStoredReviews(reviews: SyncedCoachReview[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    window.dispatchEvent(new CustomEvent("synced_reviews_updated", { detail: reviews }));
  } catch {
    // ignore
  }
}

export async function fetchCoachReviews(coachId: string = "25F50FBA"): Promise<SyncedCoachReview[]> {
  const localList = getStoredReviews();
  try {
    const res = await fetch(`${BASE_URL}/reviews/coach/${coachId}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const apiMapped: SyncedCoachReview[] = data.map((d: any, idx: number) => ({
          id: d.id || `api-rev-${idx}`,
          coachId: d.coachId || coachId,
          coachName: d.coachName || "HLV Hồ Xuân Ánh Nam",
          memberId: d.memberId || "",
          memberName: d.memberName || `Học viên ẩn danh #${(idx + 1) * 137 % 900 + 100}`,
          anonymizedMemberName: d.memberName || `Học viên ẩn danh #${(idx + 1) * 137 % 900 + 100}`,
          rating: Number(d.rating) || 5,
          comment: d.comment || "",
          tags: Array.isArray(d.tags) ? d.tags : [],
          sessionId: d.sessionId || "",
          sessionName: d.sessionName || "Lớp tập luyện",
          createdAt: d.createdAt || new Date().toISOString(),
        }));

        const map = new Map<string, SyncedCoachReview>();
        apiMapped.forEach((r) => map.set(r.id, r));
        localList.forEach((r) => {
          if (!map.has(r.id)) map.set(r.id, r);
        });

        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        saveStoredReviews(merged);
        return merged;
      }
    }
  } catch (err) {
    console.warn("fetchCoachReviews API failed, using cached:", err);
  }

  return localList.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function submitCoachReview(params: {
  coachId?: string;
  coachName?: string;
  sessionId?: string;
  sessionName?: string;
  rating: number;
  comment: string;
  tags?: string[];
  memberId?: string;
  memberName?: string;
}): Promise<SyncedCoachReview> {
  const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
  const memberName = params.memberName || "Hồ Xuân Ánh Nam";
  const memberId = params.memberId || "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
  const hash = Math.abs(memberId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 900 + 100;
  const anonName = `Học viên ẩn danh #${hash}`;

  const newReview: SyncedCoachReview = {
    id: `rev-${Date.now()}`,
    coachId: params.coachId || "25f50fba-506a-4edf-9db7-43f77f6741a4",
    coachName: params.coachName || "HLV Hồ Xuân Ánh Nam",
    memberId,
    memberName,
    anonymizedMemberName: anonName,
    rating: params.rating,
    comment: params.comment.trim(),
    tags: params.tags || [],
    sessionId: params.sessionId || "",
    sessionName: params.sessionName || "Buổi tập PT 1-1",
    createdAt: new Date().toISOString(),
  };

  const current = getStoredReviews();
  const updated = [newReview, ...current.filter((r) => r.id !== newReview.id)];
  saveStoredReviews(updated);

  try {
    await fetch(`${BASE_URL}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        coachId: newReview.coachId,
        coachName: newReview.coachName,
        sessionId: newReview.sessionId,
        sessionName: newReview.sessionName,
        rating: newReview.rating,
        comment: newReview.comment,
        tags: newReview.tags,
      }),
    });
  } catch (err) {
    console.warn("API submit review error (stored locally):", err);
  }

  return newReview;
}

export function subscribeToReviews(callback: (reviews: SyncedCoachReview[]) => void): () => void {
  const handleUpdate = (e: any) => {
    if (e.detail) {
      callback(e.detail);
    } else {
      callback(getStoredReviews());
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getStoredReviews());
    }
  };

  window.addEventListener("synced_reviews_updated", handleUpdate);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener("synced_reviews_updated", handleUpdate);
    window.removeEventListener("storage", handleStorage);
  };
}
