export type SessionStatus = "sắp diễn ra" | "đang diễn ra" | "hoàn thành" | "đã hủy";
export type AttendanceStatus = "chưa điểm danh" | "attended" | "no_show" | "late";

export interface MockMember {
  id: string;
  name: string;
  code: string;
  avatar: string;
  goal: string;
  level: string;
  sport: string;
  phone: string;
  email: string;
  classIds: string[];
}

export interface MockSession {
  id: string;
  classId: string;
  className: string;
  sport: string;
  level: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;
  room: string;
  coachName: string;
  capacity: number;
  registeredMemberIds: string[];
  status: SessionStatus;
}

export interface AttendanceRecord {
  sessionId: string;
  memberId: string;
  status: AttendanceStatus;
  note: string;
}

export interface MockCurriculum {
  id: string;
  name: string;
  sport: string;
  goal: string;
  level: string;
  duration: number; // phút
  status: "Nháp" | "Đã giao" | "Lưu trữ";
  updatedAt: string;
  description: string;
  exercises: { name: string; reps: string; rest: string; note: string }[];
  assignedTo: { type: "class" | "member"; id: string; name: string }[];
}

export interface MockNotification {
  id: string;
  title: string;
  content: string;
  type: "Thông báo" | "Bài tập về nhà";
  sentAt: string;
  targetType: "class" | "member";
  targetId: string;
  targetName: string;
  deadline?: string;
}

export interface AssessmentRecord {
  id: string;
  sessionId: string;
  memberId: string;
  completion: number; // 0-100
  metrics: { label: string; value: string; unit: string }[];
  comment: string;
  nextStep: string;
  createdAt: string;
}

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {})
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers
    });
    
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
        const query = new URLSearchParams();
        if (startDate) query.append('startDate', startDate);
        if (endDate) query.append('endDate', endDate);
        const qs = query.toString() ? `?${query.toString()}` : '';
        return fetchApi(`/coach/schedule${qs}`);
    },

    // 3. Chi tiết lớp
    getSessionDetail: async (sessionId: string): Promise<MockSession> => {
        return fetchApi(`/coach/sessions/${sessionId}`);
    },

    // 4. Lấy học viên của lớp
    getSessionMembers: async (sessionId: string): Promise<MockMember[]> => {
        return fetchApi(`/coach/sessions/${sessionId}/members`);
    },
    
    // 4b. Lấy toàn bộ học viên
    getMembers: async (): Promise<MockMember[]> => {
        return fetchApi('/coach/members');
    },

    // 5. Điểm danh
    getAttendance: async (sessionId: string): Promise<AttendanceRecord[]> => {
        return fetchApi(`/coach/sessions/${sessionId}/attendance`);
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
    getCurricula: async () => {
        return fetchApi('/coach/curricula');
    },
    saveCurriculum: async (curriculum: any) => {
        return fetchApi('/coach/curricula', {
            method: 'POST',
            body: JSON.stringify(curriculum)
        });
    },
    assignCurriculum: async (id: string, target: any) => {
        return fetchApi(`/coach/curricula/${id}/assign`, {
            method: 'POST',
            body: JSON.stringify(target)
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
    }
};
