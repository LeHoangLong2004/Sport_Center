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
  sessionName?: string;
  createdAt: string;
}

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api";

function getAuthHeaders(): Record<string, string> {
  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token");

  return token ? { Authorization: `Bearer ${token}` } : {};
}

function mapReview(data: any): SyncedCoachReview {
  const memberName = data.memberName || "Học viên ẩn danh";

  return {
    id: String(data.id || ""),
    coachId: String(data.coachId || ""),
    coachName: data.coachName || "",
    memberId: String(data.memberId || ""),
    memberName,
    anonymizedMemberName: memberName,
    rating: Math.min(5, Math.max(1, Number(data.rating) || 1)),
    comment: data.comment || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    sessionId: data.sessionId || undefined,
    sessionName: data.sessionName || undefined,
    createdAt: data.createdAt || new Date().toISOString(),
  };
}

async function requestReviews(endpoint: string): Promise<SyncedCoachReview[]> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Review API error: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data)
    ? data
        .map(mapReview)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    : [];
}

export async function fetchCoachReviews(coachId: string): Promise<SyncedCoachReview[]> {
  if (!coachId) return [];
  return requestReviews(`/reviews/coach/${encodeURIComponent(coachId)}`);
}

export async function fetchMyReviews(): Promise<SyncedCoachReview[]> {
  return requestReviews("/reviews/my");
}

export async function submitCoachReview(params: {
  coachId: string;
  coachName?: string;
  sessionId?: string;
  sessionName?: string;
  rating: number;
  comment: string;
  tags?: string[];
  memberName?: string;
}): Promise<SyncedCoachReview> {
  if (!params.coachId) throw new Error("Không xác định được huấn luyện viên.");

  const response = await fetch(`${BASE_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      coachId: params.coachId,
      sessionId: params.sessionId,
      sessionName: params.sessionName,
      rating: params.rating,
      comment: params.comment.trim(),
      tags: params.tags || [],
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Không thể lưu đánh giá (${response.status}).`);
  }

  return mapReview(data);
}
