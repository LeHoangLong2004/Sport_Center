import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export interface CoachScheduleRequest {
  id: string;
  sessionId: string;
  className: string;
  coachName: string;
  substituteCoachName?: string;
  requestType: string;
  newDate?: string;
  newTime?: string;
  reason: string;
  status: string;
  managerNote?: string;
  createdAt: string;
}

export function useCoachScheduleRequests(onClassesChanged: () => Promise<void>) {
  const [requests, setRequests] = useState<CoachScheduleRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/manager/coach-schedule-requests", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.ok) setRequests(await response.json());
    } catch (error) {
      console.error("Failed to fetch Coach schedule requests:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const pending = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.status.toLowerCase() === "pending" ||
          request.status.toLowerCase() === "substitute_accepted",
      ),
    [requests],
  );

  const handleAction = useCallback(async (
    id: string,
    action: "approve" | "reject",
    managerNote: string,
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/manager/coach-schedule-requests/${id}/${action}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ managerNote }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "Không thể xử lý yêu cầu ca dạy.");
      await Promise.all([fetchRequests(), onClassesChanged()]);
      toast.success(
        action === "approve"
          ? "Đã duyệt yêu cầu điều chỉnh ca dạy thành công."
          : "Đã từ chối yêu cầu điều chỉnh ca dạy.",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xử lý yêu cầu ca dạy.");
    }
  }, [fetchRequests, onClassesChanged]);

  return { requests, loading, pending, handleAction };
}
