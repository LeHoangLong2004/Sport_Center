const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
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
    bookClass: async (classId: string) => {
        return fetchApi(`/classes/${classId}/book`, {
            method: 'POST'
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
