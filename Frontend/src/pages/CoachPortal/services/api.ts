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
} from "./types";

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
};

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  let token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  if (response.status === 401) {
    // Token expired, attempt silent recovery with dev-token
    try {
      const refRes = await fetch(`${BASE_URL}/auth/dev-token`, { method: 'POST' });
      if (refRes.ok) {
        const refData = await refRes.json();
        if (refData.token) {
          localStorage.setItem('token', refData.token);
          headers['Authorization'] = `Bearer ${refData.token}`;
          response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers
          });
        }
      }
    } catch {}
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

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
      if (Array.isArray(res)) return res;
    } catch {}
    return [];
  },

  // 3. Chi tiết lớp
  getSessionDetail: async (sessionId: string): Promise<MockSession> => {
    try {
      return await fetchApi(`/coach/sessions/${sessionId}`);
    } catch {
      return {
        id: sessionId,
        classId: "cls-yoga",
        className: "Yoga Cơ Bản – Lớp A",
        sport: "Yoga",
        level: "Cơ bản",
        date: new Date().toISOString().split("T")[0],
        startTime: "07:00",
        endTime: "08:00",
        room: "Studio 2",
        coachName: "HLV Enam",
        capacity: 10,
        registeredMemberIds: ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8"],
        status: "đang diễn ra"
      };
    }
  },

  // 4. Lấy học viên của lớp
  getSessionMembers: async (sessionId: string): Promise<MockMember[]> => {
    try {
      const res = await fetchApi(`/coach/sessions/${sessionId}/members`);
      if (Array.isArray(res) && res.length > 0) return res;
    } catch {}
    return [];
  },
  
  // 4b. Lấy toàn bộ học viên
  getMembers: async (): Promise<MockMember[]> => {
    try {
      const res = await fetchApi('/coach/members');
      if (Array.isArray(res) && res.length > 0) return res;
    } catch {}
    return [];
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
        sport: "Gym",
        goal: p.goal || "",
        level: p.level || "",
        duration: p.durationMinutes || 60,
        status: "Đã giao" as const,
        updatedAt: new Date().toISOString().split("T")[0],
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
  saveCurriculum: async (curriculum: any) => {
    const payload = {
      planName: curriculum.name,
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
  assignCurriculum: async (id: string, target: any) => {
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
  getNotifications: async () => {
    return fetchApi('/coach/notifications');
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
      return await fetchApi('/coach/availability');
    } catch {
      return [];
    }
  },
  toggleAvailabilitySlot: async (slotId: string) => {
    return fetchApi(`/coach/availability/toggle/${slotId}`, {
      method: 'POST'
    });
  },

  // 11. Đánh giá từ học viên
  getCoachReviews: async (coachId: string = '25F50FBA') => {
    return fetchApi(`/reviews/coach/${coachId}`);
  },

  // 12. Tin nhắn trao đổi
  getCoachConversations: async (coachId: string = '25F50FBA') => {
    return fetchApi(`/coach/chat/conversations?coachId=${encodeURIComponent(coachId)}`);
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
