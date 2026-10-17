import React, { useEffect, useState } from "react";
import { Check, Loader2, UserRound, X } from "lucide-react";
import { toast } from "sonner";

interface CoachAssignment {
  id: string;
  fullName: string;
  email?: string | null;
  isAssigned: boolean;
}

interface CoachSportAssignmentModalProps {
  sport: {
    id: string;
    name: string;
  };
  onClose: () => void;
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function CoachSportAssignmentModal({ sport, onClose }: CoachSportAssignmentModalProps) {
  const [coaches, setCoaches] = useState<CoachAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingCoachId, setSavingCoachId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadAssignments = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/sports/${sport.id}/coach-assignments`, {
          headers: authHeaders(),
        });

        if (!response.ok) {
          throw new Error("Không thể tải danh sách Coach.");
        }

        const data = (await response.json()) as CoachAssignment[];
        if (!cancelled) {
          setCoaches(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          toast.error("Không thể tải danh sách Coach phụ trách.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadAssignments();

    return () => {
      cancelled = true;
    };
  }, [sport.id]);

  const toggleAssignment = async (coach: CoachAssignment) => {
    if (savingCoachId) return;

    setSavingCoachId(coach.id);
    try {
      const response = await fetch(`/api/sports/${sport.id}/coaches/${coach.id}`, {
        method: coach.isAssigned ? "DELETE" : "POST",
        headers: authHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Không thể cập nhật Coach phụ trách.");
      }

      setCoaches((current) =>
        current.map((item) => (item.id === coach.id ? { ...item, isAssigned: !item.isAssigned } : item)),
      );
      toast.success(coach.isAssigned ? "Đã bỏ Coach khỏi bộ môn." : "Đã gán Coach cho bộ môn.");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật Coach phụ trách.");
    } finally {
      setSavingCoachId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="flex max-h-[min(680px,calc(100vh-2rem))] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Quản lý Coach phụ trách</h3>
            <p className="mt-1 text-sm text-slate-500">
              Bộ môn: <span className="font-semibold text-slate-700">{sport.name}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            title="Đóng"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
              <Loader2 className="size-4 animate-spin" />
              Đang tải danh sách Coach...
            </div>
          ) : coaches.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">Chưa có Coach đang hoạt động.</div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
              {coaches.map((coach) => {
                const isSaving = savingCoachId === coach.id;

                return (
                  <div key={coach.id} className="flex items-center gap-3 p-3 first:rounded-t-xl last:rounded-b-xl hover:bg-slate-50">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <UserRound className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{coach.fullName}</p>
                      {coach.email && <p className="truncate text-xs text-slate-500">{coach.email}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => void toggleAssignment(coach)}
                      disabled={Boolean(savingCoachId)}
                      className={`inline-flex min-w-32 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        coach.isAssigned
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "border-slate-300 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                    >
                      {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : coach.isAssigned ? <Check className="size-3.5" /> : null}
                      {coach.isAssigned ? "Đã phụ trách" : "Gán phụ trách"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
