import type {
  SessionStatus,
  AttendanceStatus,
  MockMember,
  CoachClassOverview,
  CoachMembersOverview,
  MockSession,
  AttendanceRecord,
  MockCurriculum,
  MockNotification,
  AssessmentRecord,
  ScheduleChangeRequest,
  AvailabilitySlot,
  SportOption,
  FacilityOption,
  Flow5Target,
  Flow5Exercise,
  Flow5AiMetadata,
  Flow5WorkoutPlan,
  GenerateFlow5RecommendationRequest,
  UpdateFlow5DraftRequest,
  AssignFlow5PlanRequest,
  AssignFlow5PlanResponse,
} from "./types";
import type { MemberProfileData } from "../views/member-profile/types";
import { fetchApi } from "./fetchApi";

export type {
  SessionStatus,
  AttendanceStatus,
  MockMember,
  CoachClassOverview,
  CoachMembersOverview,
  MockSession,
  AttendanceRecord,
  MockCurriculum,
  MockNotification,
  AssessmentRecord,
  ScheduleChangeRequest,
  AvailabilitySlot,
  SportOption,
  FacilityOption,
  Flow5Target,
  Flow5Exercise,
  Flow5AiMetadata,
  Flow5WorkoutPlan,
  GenerateFlow5RecommendationRequest,
  UpdateFlow5DraftRequest,
  AssignFlow5PlanRequest,
  AssignFlow5PlanResponse,
};

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
    return [];
  },

  // 3. Chi tiết lớp
  getSessionDetail: async (sessionId: string): Promise<MockSession> => {
    return fetchApi(`/coach/sessions/${sessionId}`);
  },

  // 4. Lấy học viên của lớp
  getSessionMembers: async (sessionId: string): Promise<MockMember[]> => {
    const res = await fetchApi(`/coach/sessions/${sessionId}/members`);
    return Array.isArray(res) ? res : [];
  },

  // 4b. Lấy toàn bộ học viên
  getMembers: async (): Promise<MockMember[]> => {
    try {
      const res = await fetchApi('/coach/members');
      return Array.isArray(res) ? res : (Array.isArray(res?.members) ? res.members : []);
    } catch {
      return [];
    }
  },

  // 4c. Thống kê học viên & lớp học theo thời gian thực
  getMembersOverview: async (): Promise<CoachMembersOverview> => {
    const res = await fetchApi('/coach/members-overview');
    if (res && Array.isArray(res.classes) && Array.isArray(res.members)) {
      return res as CoachMembersOverview;
    }
    throw new Error('Dữ liệu học viên phụ trách không hợp lệ.');
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
      return plans.map((p: any) => {
        const rawStatus = String(p.status || "").toLowerCase().trim();
        let mappedStatus: MockCurriculum["status"] = "Nháp";
        if (rawStatus === "assigned" || rawStatus === "đã giao" || rawStatus === "da giao") {
          mappedStatus = "Đã giao";
        } else if (rawStatus === "approved" || rawStatus === "đã duyệt" || rawStatus === "da duyet") {
          mappedStatus = "Đã duyệt";
        } else if (rawStatus === "archived" || rawStatus === "lưu trữ" || rawStatus === "luu tru") {
          mappedStatus = "Lưu trữ";
        } else {
          mappedStatus = "Nháp";
        }

        return {
          id: p.id,
          name: p.planName,
          sportId: p.sportId || null,
          sport: "",
          goal: p.goal || "",
          level: p.level || "",
          duration: p.durationMinutes || 60,
          status: mappedStatus,
          source: p.source || (p.aiMetadata ? "ai_recommendation" : "manual"),
          updatedAt: p.updatedAt
            ? new Date(p.updatedAt).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          description: p.description || "",
          exercises: p.exercises?.map((e: any) => ({ 
            name: e.name, reps: e.reps, rest: e.rest, note: e.note 
          })) || [],
          assignedTo: p.recommendationTargetId
            ? [{ type: p.recommendationTargetType || "class", id: p.recommendationTargetId, name: p.planName || p.name }]
            : (p.assignedTo || [])
        };
      });
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
    const payload = {
      planName: curriculum.name,
      sportId: curriculum.sportId || null,
      description: curriculum.description,
      goal: curriculum.goal,
      level: curriculum.level,
      durationMinutes: curriculum.duration,
      status: curriculum.status === "Nháp" ? "draft" : "approved",
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
      status: curriculum.status === "Nháp" ? "draft" : "approved",
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
  approveCurriculum: async (id: string) => {
    return fetchApi(`/coach/curricula/${id}/approve`, {
      method: 'POST'
    });
  },
  assignCurriculum: async (id: string, target: any) => {
    let parsedDueDate: string | undefined = undefined;
    if (target.deadline) {
      if (typeof target.deadline === "string" && target.deadline.includes("/")) {
        const parts = target.deadline.split("/");
        if (parts.length === 3) {
          const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
          if (!isNaN(d.getTime())) parsedDueDate = d.toISOString();
        }
      } else {
        const d = new Date(target.deadline);
        if (!isNaN(d.getTime())) parsedDueDate = d.toISOString();
      }
    }

    const payload = {
      type: target.type || (target.id ? "member" : undefined),
      classId: target.type === "class" ? target.id : undefined,
      memberId: target.type === "class" ? undefined : target.id,
      planId: id,
      dueDate: parsedDueDate,
      notes: target.note || "Tập luyện theo hướng dẫn của huấn luyện viên"
    };
    return fetchApi(`/homework/assign`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  verifyWorkout: async (homeworkId: string, payload: { status: "completed" | "rejected"; notes?: string }) => {
    return fetchApi(`/homework/${homeworkId}/verify`, {
      method: 'PUT',
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

  // 9. Schedule Change Requests
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

  // 11. Đánh giá từ học viên
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
  },

  // 13. Flow 5 - AI Workout Plan Recommendation
  generateFlow5Recommendation: async (data: GenerateFlow5RecommendationRequest): Promise<Flow5WorkoutPlan> => {
    return fetchApi('/workout-plans/ai-recommendation', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  getFlow5Plan: async (id: string): Promise<Flow5WorkoutPlan> => {
    return fetchApi(`/workout-plans/${encodeURIComponent(id)}/flow5`);
  },
  updateFlow5Draft: async (id: string, data: UpdateFlow5DraftRequest): Promise<Flow5WorkoutPlan> => {
    return fetchApi(`/workout-plans/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },
  approveFlow5Plan: async (id: string, expectedVersion: number, note?: string): Promise<Flow5WorkoutPlan> => {
    return fetchApi(`/workout-plans/${encodeURIComponent(id)}/approve`, {
      method: 'POST',
      body: JSON.stringify({ expectedVersion, note })
    });
  },
  assignFlow5Plan: async (id: string, data: AssignFlow5PlanRequest): Promise<AssignFlow5PlanResponse> => {
    return fetchApi(`/workout-plans/${encodeURIComponent(id)}/assign`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  cloneFlow5Plan: async (id: string, expectedVersion: number, planName?: string): Promise<Flow5WorkoutPlan> => {
    return fetchApi(`/workout-plans/${encodeURIComponent(id)}/clone`, {
      method: 'POST',
      body: JSON.stringify({ expectedVersion, planName })
    });
  },
  archiveFlow5Plan: async (id: string, expectedVersion: number, note?: string): Promise<Flow5WorkoutPlan> => {
    return fetchApi(`/workout-plans/${encodeURIComponent(id)}/archive`, {
      method: 'POST',
      body: JSON.stringify({ expectedVersion, note })
    });
  }
};

export const coachApi = CoachAPI;

