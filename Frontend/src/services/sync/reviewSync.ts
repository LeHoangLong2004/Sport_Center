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
  coachReply?: string;
  repliedAt?: string;
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
    coachReply: data.coachReply || undefined,
    repliedAt: data.repliedAt || undefined,
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

export async function replyToReview(
  reviewId: string,
  reply: string
): Promise<{ success: boolean; message: string; reply: string; repliedAt: string }> {
  const response = await fetch(`${BASE_URL}/reviews/${encodeURIComponent(reviewId)}/reply`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reply }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Phản hồi đánh giá thất bại.");
  }
  return response.json();
}

export async function fetchReviewById(reviewId: string): Promise<SyncedCoachReview | null> {
  if (!reviewId) return null;
  try {
    const res = await fetch(`${BASE_URL}/reviews/${encodeURIComponent(reviewId)}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return mapReview(data);
  } catch {
    return null;
  }
}

export async function fetchMyReviews(): Promise<SyncedCoachReview[]> {
  const localStr = localStorage.getItem("member_local_reviews");
  let localReviews: SyncedCoachReview[] = [];
  try {
    if (localStr) localReviews = JSON.parse(localStr);
  } catch {}

  try {
    const remote = await requestReviews("/reviews/my");
    const combined = [...remote];
    for (const loc of localReviews) {
      if (!combined.some((r) => (r.sessionId && r.sessionId === loc.sessionId) || r.id === loc.id)) {
        combined.push(loc);
      }
    }
    return combined.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (err) {
    return localReviews;
  }
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
  if (!params.coachId && !params.coachName) {
    throw new Error("Không xác định được huấn luyện viên.");
  }

  const localReview: SyncedCoachReview = {
    id: `rev-local-${Date.now()}`,
    coachId: params.coachId || "",
    coachName: params.coachName || "Huấn luyện viên",
    memberId: "",
    memberName: params.memberName || "Hội viên",
    anonymizedMemberName: params.memberName || "Hội viên",
    rating: params.rating,
    comment: params.comment.trim(),
    tags: params.tags || [],
    sessionId: params.sessionId,
    sessionName: params.sessionName,
    createdAt: new Date().toISOString(),
  };

  try {
    const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.coachId);
    const response = await fetch(`${BASE_URL}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        coachId: isGuid ? params.coachId : "00000000-0000-0000-0000-000000000000",
        coachName: params.coachName,
        sessionId: params.sessionId,
        sessionName: params.sessionName,
        rating: params.rating,
        comment: params.comment.trim(),
        tags: params.tags || [],
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (response.ok && data) {
      const mapped = mapReview(data);
      saveLocalReview(mapped);
      return mapped;
    }
  } catch (e) {
    console.warn("Could not post review to server, saved locally:", e);
  }

  // If backend was not reached or returned an error, still save locally so UX is seamless
  saveLocalReview(localReview);
  return localReview;
}

function saveLocalReview(review: SyncedCoachReview) {
  try {
    const current = JSON.parse(localStorage.getItem("member_local_reviews") || "[]");
    const updated = [review, ...current.filter((r: any) => r.sessionId !== review.sessionId && r.id !== review.id)];
    localStorage.setItem("member_local_reviews", JSON.stringify(updated));
    // Also save reviewed session ids
    if (review.sessionId) {
      const reviewedIds = JSON.parse(localStorage.getItem("reviewed_session_ids") || "[]");
      if (!reviewedIds.includes(review.sessionId)) {
        reviewedIds.push(review.sessionId);
        localStorage.setItem("reviewed_session_ids", JSON.stringify(reviewedIds));
      }
    }
  } catch {}
}
