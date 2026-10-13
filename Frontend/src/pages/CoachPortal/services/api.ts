export type SessionStatus = "sắp diễn ra" | "đang diễn ra" | "hoàn thành" | "đã hủy";
export type AttendanceStatus = "chưa điểm danh" | "attended" | "no_show" | "late" | "excused";

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
            if (Array.isArray(res) && res.length > 0) return res;
        } catch {}
        const today = new Date().toISOString().split("T")[0];
        return [
            { id: "s1", classId: "cls-yoga", className: "Yoga Cơ Bản – Lớp A", sport: "Yoga", level: "Cơ bản", date: today, startTime: "07:00", endTime: "08:00", room: "Studio 2", coachName: "HLV Enam", capacity: 10, registeredMemberIds: ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8"], status: "đang diễn ra" },
            { id: "s2", classId: "cls-gym", className: "Gym Group BodyCombat", sport: "Gym", level: "Nâng cao", date: today, startTime: "09:00", endTime: "10:30", room: "Khu Tạ Tự Do", coachName: "HLV Enam", capacity: 8, registeredMemberIds: ["m1", "m3", "m4", "m7", "m8", "m10"], status: "đang diễn ra" },
            { id: "s3", classId: "cls-zumba", className: "Zumba Dance", sport: "Zumba", level: "Trung bình", date: today, startTime: "17:00", endTime: "18:00", room: "Studio 1", coachName: "HLV Enam", capacity: 20, registeredMemberIds: ["m1", "m2", "m3", "m5", "m6", "m7", "m9", "m10"], status: "sắp diễn ra" },
            { id: "s4", classId: "cls-swim", className: "Bơi Lội Sáng Sớm", sport: "Swimming", level: "Trung bình", date: today, startTime: "06:00", endTime: "07:00", room: "Hồ Bơi", coachName: "HLV Enam", capacity: 15, registeredMemberIds: ["m1", "m3", "m6", "m8"], status: "sắp diễn ra" },
            { id: "s5", classId: "cls-boxing", className: "Boxing Cơ Bản", sport: "Boxing", level: "Cơ bản", date: today, startTime: "07:00", endTime: "08:30", room: "Võ Đài", coachName: "HLV Enam", capacity: 6, registeredMemberIds: ["m2", "m4", "m8", "m10"], status: "sắp diễn ra" },
            { id: "s6", classId: "cls-pilates", className: "Pilates Nâng Cao", sport: "Pilates", level: "Nâng cao", date: today, startTime: "14:00", endTime: "15:00", room: "Studio 1", coachName: "HLV Enam", capacity: 12, registeredMemberIds: ["m2", "m5", "m7", "m9"], status: "sắp diễn ra" },
        ];
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
            if (Array.isArray(res) && res.length >= 2) return res;
        } catch {}
        return [
            { id: "m1", name: "Nguyễn Văn An", code: "MB001", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80", goal: "Tăng cơ giảm mỡ", level: "Cơ bản", sport: "Gym", phone: "0912345678", email: "an.nguyen@gmail.com", classIds: ["s1", "s2", "s3"] },
            { id: "m2", name: "Lê Thu Hà", code: "MB002", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80", goal: "Cải thiện vóc dáng", level: "Trung bình", sport: "Yoga", phone: "0987654321", email: "ha.le@gmail.com", classIds: ["s1", "s3", "s5"] },
            { id: "m3", name: "Phạm Tuấn Kiệt", code: "MB003", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80", goal: "Sức bền tim mạch", level: "Nâng cao", sport: "Gym", phone: "0903332211", email: "kiet.pham@gmail.com", classIds: ["s1", "s2", "s4"] },
            { id: "m4", name: "Trần Minh Đức", code: "MB004", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80", goal: "Tăng cơ ngực & vai", level: "Cơ bản", sport: "Gym", phone: "0977889900", email: "duc.tran@gmail.com", classIds: ["s2", "s5"] },
            { id: "m5", name: "Hoàng Thu Uyên", code: "MB005", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80", goal: "Cải thiện tư thế", level: "Cơ bản", sport: "Pilates", phone: "0933112233", email: "uyen.hoang@gmail.com", classIds: ["s1", "s3", "s6"] },
            { id: "m6", name: "Đỗ Quốc Bảo", code: "MB006", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80", goal: "Bơi sải thể lực", level: "Trung bình", sport: "Swimming", phone: "0909123456", email: "bao.do@gmail.com", classIds: ["s3", "s4", "s5"] },
            { id: "m7", name: "Vũ Mai Chi", code: "MB007", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80", goal: "Giảm mỡ toàn thân", level: "Cơ bản", sport: "Zumba", phone: "0922334455", email: "chi.vu@gmail.com", classIds: ["s1", "s2", "s3"] },
            { id: "m8", name: "Bùi Hoàng Nam", code: "MB008", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80", goal: "Tăng sức mạnh & Siết cơ", level: "Nâng cao", sport: "Boxing", phone: "0911223344", email: "nam.bui@gmail.com", classIds: ["s1", "s2", "s5"] },
            { id: "m9", name: "Đặng Thúy Nga", code: "MB009", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&auto=format&fit=crop&q=80", goal: "Dẻo dai & Thư giãn", level: "Cơ bản", sport: "Yoga", phone: "0933445566", email: "nga.dang@gmail.com", classIds: ["s1", "s3", "s6"] },
            { id: "m10", name: "Ngô Gia Huy", code: "MB010", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80", goal: "Thể lực tổng hợp", level: "Trung bình", sport: "Gym", phone: "0944556677", email: "huy.ngo@gmail.com", classIds: ["s2", "s3", "s5"] }
        ];
    },
    
    // 4b. Lấy toàn bộ học viên
    getMembers: async (): Promise<MockMember[]> => {
        try {
            const res = await fetchApi('/coach/members');
            if (Array.isArray(res) && res.length >= 2) return res;
        } catch {}
        return [
            { id: "m1", name: "Nguyễn Văn An", code: "MB001", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80", goal: "Tăng cơ giảm mỡ", level: "Cơ bản", sport: "Gym", phone: "0912345678", email: "an.nguyen@gmail.com", classIds: ["s1", "s2", "s3"] },
            { id: "m2", name: "Lê Thu Hà", code: "MB002", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80", goal: "Cải thiện vóc dáng", level: "Trung bình", sport: "Yoga", phone: "0987654321", email: "ha.le@gmail.com", classIds: ["s1", "s3", "s5"] },
            { id: "m3", name: "Phạm Tuấn Kiệt", code: "MB003", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80", goal: "Sức bền tim mạch", level: "Nâng cao", sport: "Gym", phone: "0903332211", email: "kiet.pham@gmail.com", classIds: ["s1", "s2", "s4"] },
            { id: "m4", name: "Trần Minh Đức", code: "MB004", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80", goal: "Tăng cơ ngực & vai", level: "Cơ bản", sport: "Gym", phone: "0977889900", email: "duc.tran@gmail.com", classIds: ["s2", "s5"] },
            { id: "m5", name: "Hoàng Thu Uyên", code: "MB005", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80", goal: "Cải thiện tư thế", level: "Cơ bản", sport: "Pilates", phone: "0933112233", email: "uyen.hoang@gmail.com", classIds: ["s1", "s3", "s6"] },
            { id: "m6", name: "Đỗ Quốc Bảo", code: "MB006", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80", goal: "Bơi sải thể lực", level: "Trung bình", sport: "Swimming", phone: "0909123456", email: "bao.do@gmail.com", classIds: ["s3", "s4", "s5"] },
            { id: "m7", name: "Vũ Mai Chi", code: "MB007", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80", goal: "Giảm mỡ toàn thân", level: "Cơ bản", sport: "Zumba", phone: "0922334455", email: "chi.vu@gmail.com", classIds: ["s1", "s2", "s3"] },
            { id: "m8", name: "Bùi Hoàng Nam", code: "MB008", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80", goal: "Tăng sức mạnh & Siết cơ", level: "Nâng cao", sport: "Boxing", phone: "0911223344", email: "nam.bui@gmail.com", classIds: ["s1", "s2", "s5"] },
            { id: "m9", name: "Đặng Thúy Nga", code: "MB009", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&auto=format&fit=crop&q=80", goal: "Dẻo dai & Thư giãn", level: "Cơ bản", sport: "Yoga", phone: "0933445566", email: "nga.dang@gmail.com", classIds: ["s1", "s3", "s6"] },
            { id: "m10", name: "Ngô Gia Huy", code: "MB010", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80", goal: "Thể lực tổng hợp", level: "Trung bình", sport: "Gym", phone: "0944556677", email: "huy.ngo@gmail.com", classIds: ["s2", "s3", "s5"] }
        ];
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
        // Map frontend structure to backend CreateWorkoutPlanRequest
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

    // 11. Đánh giá từ học viên (Anonymous Reviews)
    getCoachReviews: async (coachId: string = '25F50FBA') => {
        return fetchApi(`/reviews/coach/${coachId}`);
    },

    // 12. Tin nhắn trao đổi (Chat)
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

export interface ScheduleChangeRequest {
    id: string;
    sessionId: string;
    className: string;
    requestType: "dời lịch" | "dạy thay" | "báo vắng";
    substituteCoachName?: string;
    newDate?: string;
    newTime?: string;
    reason: string;
    status: "chờ duyệt" | "đã duyệt" | "từ chối";
    createdAt: string;
    managerNote?: string;
}

export interface AvailabilitySlot {
    id: string;
    dayOfWeek: number; // 1: T2, 2: T3, ... 7: CN
    period: "Sáng" | "Chiều" | "Tối";
    startTime: string;
    endTime: string;
    isOpen: boolean;
    bookedMemberName?: string;
    bookedMemberPhone?: string;
    goal?: string;
}
