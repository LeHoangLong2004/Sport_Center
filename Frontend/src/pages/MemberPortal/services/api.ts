const configuredApiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE_URL = configuredApiUrl
    ? `${configuredApiUrl}${configuredApiUrl.endsWith('/api') ? '' : '/api'}`
    : '/api';

async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {})
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
        response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
    } catch {
        throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend đang chạy.');
    }
    
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(data?.message || `API error: ${response.status}`);
    }

    return data;
}

export const MemberAPI = {
    // 1. Subscriptions
    getMySubscriptions: async () => {
        return fetchApi('/subscriptions/me');
    },

    // 2. Homework / Workout Plans
    getMyHomework: async () => {
        return fetchApi('/homework/my');
    },
    updateHomeworkProgress: async (homeworkId: string, data: { status?: string, progressPct?: number, notes?: string }) => {
        return fetchApi(`/homework/${homeworkId}/progress`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    // 3. Reviews (Đánh giá Coach)
    reviewCoach: async (data: { coachId: string, rating: number, comment?: string }) => {
        return fetchApi('/reviews', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // 4. Classes
    getAvailableClasses: async () => {
        return fetchApi('/classes/available');
    },
    getClassDetail: async (classId: string) => {
        return fetchApi(`/classes/${classId}`);
    },
    bookClass: async (classId: string) => {
        return fetchApi(`/classes/${classId}/book`, {
            method: 'POST'
        });
    },
    payAndBookClass: async (classId: string, paymentMethod: string = 'qr', amount: number = 150000) => {
        return fetchApi(`/classes/${classId}/pay-and-book`, {
            method: 'POST',
            body: JSON.stringify({ paymentMethod, amount })
        });
    },
    cancelClassBooking: async (classId: string) => {
        return fetchApi(`/classes/${classId}/cancel-booking`, {
            method: 'POST'
        });
    },
    getMemberSchedule: async () => {
        return fetchApi('/schedule/member');
    },
    getAvailablePtSlots: async () => {
        return fetchApi('/member/available-pt-slots');
    },
    bookPtSlot: async (data: {
        slotId: string;
        sport: string;
        date: string;
        startTime: string;
        endTime: string;
        room: string;
        coachId?: string;
        coachName?: string;
        goal?: string;
        coachNote?: string;
    }) => {
        return fetchApi('/member/bookings', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    cancelPtBooking: async (sessionId: string, reason?: string) => {
        const query = reason ? `?reason=${encodeURIComponent(reason)}` : '';
        return fetchApi(`/member/bookings/${encodeURIComponent(sessionId)}${query}`, {
            method: 'DELETE'
        });
    },

    // 4. Lịch cá nhân
    getMySchedule: async () => {
        return fetchApi('/schedule/my');
    },

    getCoaches: async () => {
        return fetchApi('/coaches');
    },

    // 5. Invoices & Bookings
    getMyInvoices: async () => {
        return fetchApi('/payments/my');
    },
    getMyBookings: async () => {
        return fetchApi('/bookings/my');
    },

    // 6. Tin nhắn trao đổi với Huấn luyện viên (Chat)
    getMemberConversations: async (memberId?: string) => {
        const query = memberId ? `?memberId=${encodeURIComponent(memberId)}` : '';
        return fetchApi(`/member/chat/conversations${query}`);
    },
    getMemberMessages: async (conversationId: string) => {
        return fetchApi(`/member/chat/messages/${conversationId}`);
    },
    sendMemberMessage: async (data: { conversationId: string; text: string; memberId?: string; memberName?: string }) => {
        return fetchApi('/member/chat/messages', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    startChatWithCoach: async (data: { coachId: string; coachName: string; memberId?: string; memberName?: string }) => {
        return fetchApi('/member/chat/start', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    startConversation: async (data: { targetId: string; targetName: string; role: string; memberId?: string; memberName?: string; avatar?: string; subtitle?: string }) => {
        return fetchApi('/member/chat/start', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
};
