import type {
  SessionStatus,
  AttendanceStatus,
  MockMember,
  MockSession,
  AttendanceRecord,
  MockCurriculum,
  MockNotification,
  AssessmentRecord,
  ScheduleChangeRequest,
  AvailabilitySlot,
  SportOption,
  FacilityOption,
} from "./types";
import type { MemberProfileData } from "../views/member-profile/types";

export type {
  SessionStatus,
  AttendanceStatus,
  MockMember,
  MockSession,
  AttendanceRecord,
  MockCurriculum,
  MockNotification,
  AssessmentRecord,
  ScheduleChangeRequest,
  AvailabilitySlot,
  SportOption,
  FacilityOption,
};

import { fetchApi } from "./apiClient";

export const CoachAPI = {
  // 1. Dashboard
  getDashboardStats: async () => {
    return fetchApi('/coach/dashboard');
  },

    // 2. Lịch dạy
    getSchedule: async (startDate?: string, endDate?: string): Promise<MockSession[]> => {
        try {
            const query = new URLSearchParams();
            if (startDate) query.append('startDate', startDate);
            if (endDate) query.append('endDate', endDate);
            const qs = query.toString() ? `?${query.toString()}` : '';
            const res = await fetchApi(`/coach/schedule${qs}`);
            // An empty array is valid: this coach may have no assigned classes.
            // Do not replace it with shared demo sessions from another coach.
            if (Array.isArray(res)) {
                return res.map((s: any) => ({
                    ...s,
                    date: typeof s.date === 'string' ? s.date.slice(0, 10) : s.date,
                    startTime: typeof s.startTime === 'string' ? s.startTime.slice(0, 5) : s.startTime,
                    endTime: typeof s.endTime === 'string' ? s.endTime.slice(0, 5) : s.endTime,
                    registeredMemberIds: Array.isArray(s.registeredMemberIds)
                        ? s.registeredMemberIds
                        : (s.memberId ? [s.memberId] : []),
                }));
            }
        } catch {}
        // Do not return shared demo sessions when the authenticated request fails.
        return [];
    },

    // 3. Chi tiết lớp
    getSessionDetail: async (sessionId: string): Promise<MockSession> => {
        return fetchApi(`/coach/sessions/${sessionId}`);
    },

    // 4. Lấy học viên của lớp
    getSessionMembers: async (sessionId: string): Promise<MockMember[]> => {
        try {
            const res = await fetchApi(`/coach/sessions/${sessionId}/members`);
            return Array.isArray(res) ? res : [];
        } catch (error) {
            throw error;
        }
    },

    // 4b. Lấy toàn bộ học viên
    getMembers: async (): Promise<MockMember[]> => {
        try {
            const res = await fetchApi('/coach/members');
            return Array.isArray(res) ? res : [];
        } catch {
            return [];
        }
    },

    getMemberProfile: async (memberId: string): Promise<MemberProfileData> => {
        return fetchApi(`/coach/members/${encodeURIComponent(memberId)}/profile`);
    },

    saveMemberNote: async (memberId: string, data: { comment: string; completion?: number; sessionId?: string }) => {
        return fetchApi(`/coach/members/${encodeURIComponent(memberId)}/notes`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // 5. Điểm danh
    getAttendance: async (sessionId: string): Promise<AttendanceRecord[]> => {
        try {
            const res = await fetchApi(`/coach/sessions/${sessionId}/attendance`);
            if (Array.isArray(res)) return res;
        } catch {}
        return [];
    },
    saveAttendanceDraft: async (sessionId: string, records: AttendanceRecord[]) => {
        return fetchApi(`/coach/sessions/${sessionId}/attendance/draft`, {
            method: 'POST',
            body: JSON.stringify({ records })
        });
    },
    finalizeAttendance: async (sessionId: string, records: AttendanceRecord[]) => {
        return fetchApi(`/coach/sessions/${sessionId}/attendance/finalize`, {
            method: 'POST',
            body: JSON.stringify({ records })
        });
    },

    // 6. Giáo án
    getCurricula: async (): Promise<MockCurriculum[]> => {
        try {
            const plans = await fetchApi('/workout-plans/coach');
            if (!Array.isArray(plans)) return [];
            return plans.map((p: any) => ({
                id: p.id,
                name: p.planName,
                sportId: p.sportId || null,
                sport: "",
                goal: p.goal || "",
                level: p.level || "",
                duration: p.durationMinutes || 60,
                status: (p.status === "Nháp" ? "Nháp" : p.status === "Lưu trữ" ? "Lưu trữ" : "Đã giao") as MockCurriculum["status"],
                updatedAt: p.updatedAt
                    ? new Date(p.updatedAt).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0],
                description: p.description || "",
                exercises: p.exercises?.map((e: any) => ({ 
                    name: e.name, reps: e.reps, rest: e.rest, note: e.note 
                })) || [],
                assignedTo: []
            }));
        } catch {
            return [];
        }
    },
    getSports: async (): Promise<SportOption[]> => {
        try {
            const sports = await fetchApi('/sports');
            return Array.isArray(sports)
                ? sports
                    .filter((sport: any) => sport?.id && sport?.name)
                    .map((sport: any) => ({ id: String(sport.id), name: String(sport.name).trim() }))
                : [];
        } catch {
            return [];
        }
    },
    getFacilities: async (): Promise<FacilityOption[]> => {
        try {
            const facilities = await fetchApi('/facilities');
            return Array.isArray(facilities)
                ? facilities
                    .filter((facility: any) => facility?.id && facility?.name)
                    .map((facility: any) => ({ id: String(facility.id), name: String(facility.name).trim() }))
                : [];
        } catch {
            return [];
        }
    },
    saveCurriculum: async (curriculum: any) => {
        // Map frontend structure to backend CreateWorkoutPlanRequest
        const payload = {
            planName: curriculum.name,
            sportId: curriculum.sportId || null,
            description: curriculum.description,
            goal: curriculum.goal,
            level: curriculum.level,
            durationMinutes: curriculum.duration,
            exercises: curriculum.exercises.map((e: any) => ({
                name: e.name,
                reps: e.reps,
                rest: e.rest,
                note: e.note
            }))
        };
        return fetchApi('/workout-plans', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },
    updateCurriculum: async (id: string, curriculum: any) => {
        const payload = {
            planName: curriculum.name,
            sportId: curriculum.sportId || null,
            description: curriculum.description,
            goal: curriculum.goal,
            level: curriculum.level,
            durationMinutes: curriculum.duration,
            exercises: curriculum.exercises.map((e: any) => ({
                name: e.name,
                reps: e.reps,
                rest: e.rest,
                note: e.note
            }))
        };
        return fetchApi(`/workout-plans/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
    },
    assignCurriculum: async (id: string, target: any) => {
        // Giao bài tập về nhà
        const payload = {
            memberId: target.id,
            planId: id,
            notes: "Vui lòng hoàn thành đúng tiến độ"
        };
        return fetchApi(`/homework/assign`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    // 7. Thông báo
    getNotifications: async (): Promise<MockNotification[]> => {
        const notifications = await fetchApi('/notifications') as Array<{
            id: string;
            title: string;
            message?: string | null;
            type?: string;
            createdAt: string;
        }>;

        return (Array.isArray(notifications) ? notifications : []).map((notification) => ({
            id: notification.id,
            title: notification.title,
            content: notification.message || "",
            type: "Thông báo" as const,
            sentAt: notification.createdAt,
            targetType: "class" as const,
            targetId: "",
            targetName: "Hệ thống",
        }));
    },
    sendNotification: async (notification: any) => {
        return fetchApi('/coach/notifications', {
            method: 'POST',
            body: JSON.stringify(notification)
        });
    },

    // 8. Đánh giá (Assessments)
    getAssessments: async () => {
        return fetchApi('/coach/assessments');
    },
    saveAssessment: async (assessment: any) => {
        return fetchApi('/coach/assessments', {
            method: 'POST',
            body: JSON.stringify(assessment)
        });
    },

    // 9. Schedule Change Requests (Yêu cầu đổi lịch / Dạy thay / Báo vắng)
    getScheduleRequests: async (): Promise<ScheduleChangeRequest[]> => {
        try {
            return await fetchApi('/coach/schedule-requests');
        } catch {
            return [];
        }
    },
    createScheduleRequest: async (data: Partial<ScheduleChangeRequest>) => {
        return fetchApi('/coach/schedule-requests', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // 10. PT 1-1 Availability Slots
    getAvailabilitySlots: async (): Promise<AvailabilitySlot[]> => {
        try {
            const res = await fetchApi('/coach/availability');
            return Array.isArray(res) ? res : [];
        } catch {
            return [];
        }
    },
    createAvailabilitySlot: async (data: {
        date: string;
        startTime: string;
        endTime: string;
        sport: string;
        room: string;
        note?: string;
    }): Promise<AvailabilitySlot> => {
        return fetchApi('/coach/availability', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    toggleAvailabilitySlot: async (slotId: string) => {
        return fetchApi(`/coach/availability/toggle/${slotId}`, {
            method: 'POST'
        });
    },
    deleteAvailabilitySlot: async (slotId: string) => {
        return fetchApi(`/coach/availability/${encodeURIComponent(slotId)}`, {
            method: 'DELETE'
        });
    },

    // 11. Đánh giá từ học viên (Anonymous Reviews)
    getCoachReviews: async (coachId: string) => {
        return fetchApi(`/reviews/coach/${coachId}`);
    },

    // 12. Tin nhắn trao đổi (Chat)
    getCoachConversations: async (coachId: string = '') => {
        return fetchApi(`/coach/chat/conversations?coachId=${encodeURIComponent(coachId)}`);
    },
    startMemberConversation: async (memberId: string) => {
        return fetchApi('/coach/chat/conversations/start', {
            method: 'POST',
            body: JSON.stringify({ memberId })
        });
    },
    getConversationMessages: async (conversationId: string) => {
        return fetchApi(`/coach/chat/messages/${conversationId}`);
    },
    sendCoachMessage: async (data: { conversationId: string; text: string; coachId?: string }) => {
        return fetchApi('/coach/chat/messages', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
};

export const coachApi = CoachAPI;


