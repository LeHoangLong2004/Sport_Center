import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  MessageSquare,
  Search,
  Send,
  Users,
  User,
  CheckCheck,
  Clock,
  Phone,
  Sparkles,
  Dumbbell,
  Calendar,
  ChevronRight,
  Plus,
  RefreshCw,
  Award,
  CheckCircle2,
  Shield,
  Building2,
  Headphones,
  UserCheck,
  X
} from "lucide-react";
import { MemberAPI } from "../services/api";
import type { MemberScreen } from "../types";

export interface ChatMessage {
  id: string;
  sender: "coach" | "member" | "manager" | "other_member";
  senderName?: string;
  text: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  type: "class" | "direct";
  category?: "coach" | "member" | "manager" | "class";
  roleTag?: string;
  badgeColor?: string;
  title: string;
  subtitle: string;
  avatar?: string;
  lastMessage: string;
  lastTime: string;
  unreadCount?: number;
  online?: boolean;
  coachId?: string;
  coachName?: string;
  messages: ChatMessage[];
}

interface Props {
  onNavigate?: (screen: MemberScreen) => void;
}

// Initial full set of realistic conversations covering Coach, Members, Managers, and Classes
const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: "conv-nam",
    type: "direct",
    category: "coach",
    roleTag: "HLV",
    badgeColor: "orange",
    title: "HLV Nam (PT Thể Hình)",
    subtitle: "HLV Huấn luyện viên cá nhân 1-1",
    avatar: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=100&auto=format&fit=crop&q=80",
    lastMessage: "Thầy ơi, buổi tập sáng mai 7h em đến sớm 10 phút khởi động trước nhé ạ!",
    lastTime: "14:20",
    unreadCount: 0,
    online: true,
    coachId: "25F50FBA",
    coachName: "HLV Nam",
    messages: [
      { id: "nam1", sender: "coach", senderName: "HLV Nam", text: "Chào Nam! Tuần này cơ bắp của bạn sau buổi tập chân hồi phục thế nào rồi?", timestamp: "09:15" },
      { id: "nam2", sender: "member", senderName: "Hồ Xuân Ánh Nam", text: "Dạ đỡ mỏi đùi rồi thầy ơi, form Squat bài trước em làm thấy vào mông đùi rất tốt ạ.", timestamp: "09:30" },
      { id: "nam3", sender: "coach", senderName: "HLV Nam", text: "Tốt lắm! Nhớ nạp đủ 120g protein/ngày và uống tối thiểu 2.5 lít nước nhé.", timestamp: "09:35" },
      { id: "nam4", sender: "member", senderName: "Hồ Xuân Ánh Nam", text: "Thầy ơi, buổi tập sáng mai 7h em đến sớm 10 phút khởi động trước nhé ạ!", timestamp: "14:20" },
    ],
  },
  {
    id: "conv-manager",
    type: "direct",
    category: "manager",
    roleTag: "QUẢN LÝ",
    badgeColor: "blue",
    title: "Quản lý Trung tâm SportCenter",
    subtitle: "Ban Quản lý & Tiếp nhận yêu cầu hội viên",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
    lastMessage: "Ban quản lý SportCenter luôn sẵn sàng hỗ trợ giải đáp mọi thắc mắc của bạn.",
    lastTime: "08:00",
    unreadCount: 0,
    online: true,
    messages: [
      { id: "mgr-1", sender: "manager", senderName: "Quản lý Trung tâm", text: "Chào bạn Hồ Xuân Ánh Nam! Ban quản lý SportCenter luôn sẵn sàng tiếp nhận ý kiến và giải quyết thắc mắc về hợp đồng, cơ sở vật chất hay đổi gói tập.", timestamp: "08:00" },
    ],
  },
  {
    id: "conv-reception",
    type: "direct",
    category: "manager",
    roleTag: "LỄ TÂN",
    badgeColor: "blue",
    title: "Quầy Lễ Tân & Dịch Vụ Hội Viên",
    subtitle: "Hỗ trợ Check-in, Khóa tủ & Gia hạn gói",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80",
    lastMessage: "Quầy Lễ tân mở cửa từ 06:00 đến 22:00 hàng ngày.",
    lastTime: "08:15",
    unreadCount: 0,
    online: true,
    messages: [
      { id: "rec-1", sender: "manager", senderName: "Quầy Lễ Tân", text: "Dạ chào anh Nam, quầy Lễ tân mở cửa hỗ trợ từ 06:00 - 22:00 hàng ngày. Anh cần hỗ trợ kiểm tra thời hạn gói tập hay dịch vụ tủ đồ cá nhân không ạ?", timestamp: "08:15" },
    ],
  },
  {
    id: "conv-member-an",
    type: "direct",
    category: "member",
    roleTag: "HỘI VIÊN",
    badgeColor: "emerald",
    title: "Nguyễn Văn An",
    subtitle: "Hội viên Thể thao · Bạn tập Gym",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    lastMessage: "Chiều nay tầm 17h30 bạn có qua phòng gym tập ngực không, tập chung đổi tạ cho vui nhé!",
    lastTime: "09:30",
    unreadCount: 0,
    online: true,
    messages: [
      { id: "an-1", sender: "other_member", senderName: "Nguyễn Văn An", text: "Chào bạn Nam! Chiều nay tầm 17h30 bạn có qua phòng gym tập bài ngực không, tập chung đổi tạ cho vui nhé!", timestamp: "09:30" },
    ],
  },
  {
    id: "conv-member-lananh",
    type: "direct",
    category: "member",
    roleTag: "HỘI VIÊN",
    badgeColor: "emerald",
    title: "Nguyễn Lan Anh",
    subtitle: "Hội viên Thể thao · Nhóm Yoga & Pilates",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    lastMessage: "Chào anh Nam, sáng mai anh có tham gia buổi tập Yoga Vinyasa cùng HLV Minh Tuyết không ạ?",
    lastTime: "10:00",
    unreadCount: 0,
    online: true,
    messages: [
      { id: "la-1", sender: "other_member", senderName: "Nguyễn Lan Anh", text: "Chào anh Nam, sáng mai anh có tham gia buổi tập Yoga Vinyasa cùng HLV Minh Tuyết không ạ?", timestamp: "10:00" },
    ],
  },
  {
    id: "conv-1",
    type: "direct",
    category: "coach",
    roleTag: "HLV",
    badgeColor: "orange",
    title: "HLV Enam (Master PT)",
    subtitle: "HLV Thể hình & PT Cá nhân 1-1",
    avatar: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=100&auto=format&fit=crop&q=80",
    lastMessage: "Thầy ơi, buổi tập sáng mai 7h em đến sớm 10 phút khởi động trước nhé ạ!",
    lastTime: "14:20",
    unreadCount: 0,
    online: true,
    coachId: "25F50FBA",
    coachName: "HLV Enam",
    messages: [
      { id: "m1", sender: "coach", senderName: "HLV Enam", text: "Chào bạn, tuần này bạn cảm thấy cơ bắp phục hồi thế nào rồi?", timestamp: "09:15" },
      { id: "m2", sender: "member", senderName: "Học viên", text: "Dạ đỡ mỏi đùi rồi thầy, form Squat bài trước em làm thấy vào mông đùi rất tốt ạ.", timestamp: "09:30" },
    ],
  },
  {
    id: "conv-2",
    type: "class",
    category: "class",
    roleTag: "NHÓM LỚP",
    badgeColor: "purple",
    title: "Lớp Yoga Cơ Bản – Sáng 3-5-7",
    subtitle: "Nhóm lớp học • HLV Minh Tuyết",
    avatar: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=100&auto=format&fit=crop&q=80",
    lastMessage: "Buổi mai lớp mình tập bài thở Pranayama nâng cao nhé!",
    lastTime: "11:05",
    unreadCount: 0,
    online: true,
    coachId: "coach-02",
    coachName: "HLV Minh Tuyết",
    messages: [
      { id: "c1", sender: "coach", senderName: "HLV Minh Tuyết", text: "Chào cả lớp, mọi người nhớ mang theo khăn riêng và thảm cá nhân nhé.", timestamp: "Hôm qua" },
      { id: "c2", sender: "coach", senderName: "HLV Minh Tuyết", text: "Buổi mai lớp mình tập bài thở Pranayama nâng cao nhé!", timestamp: "11:05" },
      { id: "c3", sender: "member", senderName: "Lan Anh", text: "Dạ vâng HLV ạ, sáng mai em sẽ đến sớm 10 phút ạ!", timestamp: "11:15" }
    ],
  },
  {
    id: "conv-4",
    type: "class",
    category: "class",
    roleTag: "NHÓM LỚP",
    badgeColor: "purple",
    title: "Gym Group BodyCombat",
    subtitle: "Nhóm cardio & kickfit • HLV Hoàng Long",
    avatar: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=100&auto=format&fit=crop&q=80",
    lastMessage: "Ca hôm nay tập sung quá mọi người! Cảm ơn Coach nhiều ạ.",
    lastTime: "Hôm qua",
    unreadCount: 0,
    online: true,
    coachId: "coach-03",
    coachName: "HLV Hoàng Long",
    messages: [
      { id: "m40", sender: "coach", senderName: "HLV Hoàng Long", text: "Hôm nay cả lớp tập rất tốt, nhịp độ cardio rất đều.", timestamp: "Hôm qua 10:45" },
      { id: "m41", sender: "member", senderName: "Phạm Kiệt", text: "Ca hôm nay tập sung quá mọi người! Cảm ơn Coach nhiều ạ.", timestamp: "Hôm qua 11:00" },
    ],
  },
];

// Available Directory for "+ Cuộc trò chuyện mới"
const DIRECTORY_CONTACTS = {
  coaches: [
    {
      id: "25F50FBA",
      name: "HLV Nam (PT Thể Hình)",
      role: "coach",
      roleTag: "HLV",
      subtitle: "HLV Huấn luyện viên cá nhân 1-1",
      avatar: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "coach-enam",
      name: "HLV Enam (Master PT)",
      role: "coach",
      roleTag: "HLV",
      subtitle: "HLV Thể hình & PT Cá nhân 1-1",
      avatar: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "coach-01",
      name: "HLV Minh Tuấn (Yoga Specialist)",
      role: "coach",
      roleTag: "HLV",
      subtitle: "Chuyên gia Yoga & Phục hồi cột sống",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "coach-02",
      name: "HLV Minh Tuyết",
      role: "coach",
      roleTag: "HLV",
      subtitle: "HLV Yoga Vinyasa & Thiền dưỡng sinh",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "coach-03",
      name: "HLV Hoàng Long",
      role: "coach",
      roleTag: "HLV",
      subtitle: "HLV KickFit, Cardio & Boxing",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    },
  ],
  managers: [
    {
      id: "mgr-01",
      name: "Quản lý Trung tâm SportCenter",
      role: "manager",
      roleTag: "QUẢN LÝ",
      subtitle: "Ban Quản lý & Tiếp nhận phản ánh dịch vụ",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "rec-01",
      name: "Quầy Lễ Tân & Dịch Vụ Hội Viên",
      role: "reception",
      roleTag: "LỄ TÂN",
      subtitle: "Check-in thẻ, Khóa tủ & Gia hạn gói",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "cskh-01",
      name: "Bộ phận Chăm sóc Khách hàng (CSKH)",
      role: "manager",
      roleTag: "CSKH",
      subtitle: "Hỗ trợ chính sách hội viên & Voucher ưu đãi",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    },
  ],
  members: [
    {
      id: "m-01",
      name: "Nguyễn Văn An",
      role: "member",
      roleTag: "HỘI VIÊN",
      subtitle: "Hội viên Thể thao · Bạn tập Gym",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "m-lananh",
      name: "Nguyễn Lan Anh",
      role: "member",
      roleTag: "HỘI VIÊN",
      subtitle: "Hội viên Thể thao · Nhóm Yoga & Pilates",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "m-ha",
      name: "Lê Thu Hà",
      role: "member",
      roleTag: "HỘI VIÊN",
      subtitle: "Hội viên Yoga trị liệu",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "m-kiet",
      name: "Phạm Tuấn Kiệt",
      role: "member",
      roleTag: "HỘI VIÊN",
      subtitle: "Hội viên Boxing & Cardio",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
    },
  ],
  classes: [
    {
      id: "cls-yoga-01",
      name: "Lớp Yoga Cơ Bản – Sáng 3-5-7",
      role: "class",
      roleTag: "NHÓM LỚP",
      subtitle: "Nhóm lớp học • HLV Minh Tuyết",
      avatar: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "cls-combat",
      name: "Gym Group BodyCombat",
      role: "class",
      roleTag: "NHÓM LỚP",
      subtitle: "Nhóm cardio & kickfit • HLV Hoàng Long",
      avatar: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=100&auto=format&fit=crop&q=80",
    },
  ],
};

export default function MemberChat({ onNavigate }: Props) {
  // Load current member identity
  const userStr = localStorage.getItem("user");
  let memberName = "Hồ Xuân Ánh Nam";
  let memberId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      memberName = u.fullName || u.name || "Hồ Xuân Ánh Nam";
      memberId = u.id || "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
    } catch {}
  }

  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string>("conv-nam");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | "coach" | "member" | "manager" | "class">("all");
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modal state
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [modalTab, setModalTab] = useState<"coaches" | "managers" | "members" | "classes">("coaches");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations from backend
  const loadConversations = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await MemberAPI.getMemberConversations(memberId);
      if (Array.isArray(res) && res.length > 0) {
        setConversations(res);
      }
    } catch (err) {
      // Keep state if network issue
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  // Real-time auto sync polling every 2.5s
  useEffect(() => {
    loadConversations(true);
    const interval = setInterval(() => {
      loadConversations(true);
    }, 2500);

    return () => clearInterval(interval);
  }, [memberId]);

  const activeConv = useMemo(
    () => conversations.find((c) => c.id === activeId) || conversations[0],
    [conversations, activeId]
  );

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.subtitle.toLowerCase().includes(search.toLowerCase());
      
      const cat = c.category || (c.type === "class" ? "class" : "coach");
      const matchCategory = filterCategory === "all" || cat === filterCategory;

      return matchSearch && matchCategory;
    });
  }, [conversations, search, filterCategory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages?.length]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText ?? inputText).trim();
    if (!textToSend || !activeConv || isSending) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "member",
      senderName: memberName,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    // Optimistically update
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConv.id) {
          return {
            ...c,
            messages: [...c.messages, newMsg],
            lastMessage: `${memberName}: ${newMsg.text}`,
            lastTime: newMsg.timestamp,
          };
        }
        return c;
      })
    );

    if (!customText) setInputText("");
    setIsSending(true);

    try {
      const res = await MemberAPI.sendMemberMessage({
        conversationId: activeConv.id,
        text: textToSend,
        memberId,
        memberName
      });
      if (res && res.data) {
        // Refresh conversations to keep exact sync
        const updated = await MemberAPI.getMemberConversations(memberId);
        if (Array.isArray(updated) && updated.length > 0) {
          setConversations(updated);
        }
      }
    } catch (err) {
      console.warn("Lưu tin nhắn lên backend, đã lưu tạm:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleStartChat = async (contact: {
    id: string;
    name: string;
    role: string;
    roleTag: string;
    subtitle: string;
    avatar: string;
  }) => {
    try {
      const res = await MemberAPI.startConversation({
        targetId: contact.id,
        targetName: contact.name,
        role: contact.role,
        memberId,
        memberName,
        avatar: contact.avatar,
        subtitle: contact.subtitle,
      });

      if (res && res.conversation) {
        setConversations((prev) => {
          const exists = prev.some((c) => c.id === res.conversation.id);
          if (exists) return prev;
          return [res.conversation, ...prev];
        });
        setActiveId(res.conversation.id);
      }
    } catch (err) {
      // Local fallback
      const newId = `conv-${contact.id}`;
      const fallbackConv: ChatConversation = {
        id: newId,
        type: contact.role === "class" ? "class" : "direct",
        category: contact.role === "coach" ? "coach" : (contact.role === "class" ? "class" : (contact.role === "member" ? "member" : "manager")),
        roleTag: contact.roleTag,
        title: contact.name,
        subtitle: contact.subtitle,
        avatar: contact.avatar,
        lastMessage: "Bắt đầu cuộc trò chuyện",
        lastTime: "Vừa xong",
        online: true,
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender: contact.role === "coach" ? "coach" : "other_member",
            senderName: contact.name,
            text: `Chào bạn ${memberName}, mình là ${contact.name}. Rất vui được kết nối cùng bạn tại SportCenter!`,
            timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
          }
        ]
      };
      setConversations((prev) => [fallbackConv, ...prev]);
      setActiveId(newId);
    } finally {
      setShowNewChatModal(false);
    }
  };

  // Dynamic quick prompts based on active conversation category
  const quickPrompts = useMemo(() => {
    const cat = activeConv?.category || (activeConv?.type === "class" ? "class" : "coach");
    if (cat === "coach") {
      return [
        "Thầy ơi cho em hỏi về bài tập hôm nay với ạ!",
        "Em muốn dời lịch tập ngày mai sang buổi tối được không ạ?",
        "Sau buổi tập em nên nạp thêm gì để phục hồi cơ tốt nhất ạ?",
        "Buổi tập hôm nay rất bổ ích, cảm ơn HLV nhiều ạ!"
      ];
    }
    if (cat === "manager") {
      return [
        "Chào ban quản lý, em cần tư vấn về thủ tục gia hạn thẻ tập ạ!",
        "Cho em hỏi thời gian mở cửa của trung tâm vào các ngày lễ ạ?",
        "Em muốn đăng ký thuê tủ locker cá nhân dài hạn ạ!",
        "Nhờ ban quản lý hỗ trợ em kiểm tra lịch sử thanh toán hóa đơn với ạ!"
      ];
    }
    if (cat === "member") {
      return [
        "Chiều nay bạn có qua phòng gym tập bài ngực không, tập chung nhé?",
        "Bài tập hôm nay đốt mỡ mệt thật nhưng sảng khoái ghê!",
        "Bạn tập ở chi nhánh này lâu chưa, có bí quyết gì chia sẻ không?"
      ];
    }
    return [
      "Chào cả lớp, hôm nay có ai đi tập sớm không ạ?",
      "Nhờ HLV nhắc lại giúp bài tập về nhà với ạ!",
      "Hôm nay lớp mình tập năng lượng quá, cảm ơn mọi người!"
    ];
  }, [activeConv]);

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4 pb-8 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Kết nối trực tiếp
            </span>
            <span className="text-xs text-slate-400">Đồng bộ dữ liệu thời gian thực</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-emerald-500" />
            Tin nhắn & Trò chuyện
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Kênh liên lạc trực tiếp giữa Hội viên, Huấn luyện viên, Ban quản lý trung tâm và các bạn tập
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => loadConversations(false)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-2xs"
            title="Đồng bộ tin nhắn mới nhất từ hệ thống"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? "animate-spin text-emerald-500" : ""}`} />
            <span>Đồng bộ</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewChatModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Cuộc trò chuyện mới</span>
          </button>
        </div>
      </div>

      {/* Main Chat Layout Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col md:flex-row h-[calc(100vh-210px)] min-h-[580px]">
        {/* Left pane: Conversation List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
          {/* Search bar */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Tìm HLV, hội viên, quản lý, nhóm lớp..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400"
              />
            </div>

            {/* Filter Category Tabs */}
            <div className="flex items-center gap-1 mt-2.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-semibold">
              <button
                onClick={() => setFilterCategory("all")}
                className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                  filterCategory === "all"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilterCategory("coach")}
                className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                  filterCategory === "coach"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                HLV
              </button>
              <button
                onClick={() => setFilterCategory("member")}
                className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                  filterCategory === "member"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                Hội viên
              </button>
              <button
                onClick={() => setFilterCategory("manager")}
                className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                  filterCategory === "manager"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                Quản lý
              </button>
              <button
                onClick={() => setFilterCategory("class")}
                className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                  filterCategory === "class"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                Nhóm lớp
              </button>
            </div>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Không tìm thấy cuộc trò chuyện phù hợp.
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = c.id === activeConv?.id;
                const cat = c.category || (c.type === "class" ? "class" : "coach");
                const roleTag = c.roleTag || (cat === "coach" ? "HLV" : (cat === "manager" ? "QUẢN LÝ" : (cat === "member" ? "HỘI VIÊN" : "LỚP")));

                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors relative ${
                      isActive
                        ? "bg-emerald-50/60 dark:bg-emerald-950/20"
                        : "hover:bg-slate-50 dark:hover:bg-slate-850"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r" />
                    )}

                    <div className="relative shrink-0 mt-0.5">
                      {c.avatar ? (
                        <img
                          src={c.avatar}
                          alt={c.title}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs ring-2 ring-slate-100 dark:ring-slate-800">
                          {c.type === "class" ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                      )}
                      {c.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                            {c.title}
                          </h4>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              cat === "coach"
                                ? "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300"
                                : cat === "manager"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                                : cat === "member"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                                : "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300"
                            }`}
                          >
                            {roleTag}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">{c.lastTime}</span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate font-medium">
                        {c.lastMessage}
                      </p>

                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                        <span className="truncate">{c.subtitle}</span>
                        {Boolean(c.unreadCount) && (
                          <span className="w-4 h-4 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[10px] shrink-0 ml-1">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Cần đặt lịch tập mới?</span>
            <button
              onClick={() => onNavigate?.("booking")}
              className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5"
            >
              Đặt lịch PT &gt;
            </button>
          </div>
        </div>

        {/* Right pane: Active Conversation & Messages */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30 dark:bg-slate-900/50">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    {activeConv.avatar ? (
                      <img
                        src={activeConv.avatar}
                        alt={activeConv.title}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs ring-2 ring-slate-100 dark:ring-slate-800">
                        {activeConv.type === "class" ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                    )}
                    {activeConv.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate">
                        {activeConv.title}
                      </h3>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          activeConv.category === "coach"
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300"
                            : activeConv.category === "manager"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                            : activeConv.category === "member"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300"
                        }`}
                      >
                        {activeConv.roleTag || "LIÊN HỆ"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {activeConv.subtitle} · {activeConv.online ? "Đang trực tuyến" : "Ngoại tuyến"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeConv.category === "coach" && (
                    <>
                      <button
                        onClick={() => onNavigate?.("workouts")}
                        className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                      >
                        <Dumbbell className="w-3.5 h-3.5 text-emerald-500" />
                        Giáo án
                      </button>
                      <button
                        onClick={() => onNavigate?.("schedule")}
                        className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                      >
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        Lịch tập
                      </button>
                    </>
                  )}
                  {activeConv.category === "manager" && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 text-blue-700 dark:text-blue-300 text-[11px] font-semibold">
                      <Headphones className="w-3 h-3" />
                      Hotline: 1900 6868
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-700 dark:text-emerald-300">
                    {activeConv.type === "class" ? "Nhóm lớp" : "Trò chuyện 1-1"}
                  </span>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                <div className="flex justify-center my-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 bg-white/80 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                    <Shield className="w-3 h-3 text-emerald-500" />
                    Tin nhắn được mã hóa và lưu trữ an toàn trên hệ thống SmartGym
                  </span>
                </div>

                {activeConv.messages.map((m) => {
                  const isMe = m.sender === "member";

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[75%] ${
                        isMe ? "ml-auto" : "mr-auto"
                      }`}
                    >
                      {!isMe && (
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {m.senderName || activeConv.title}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                              m.sender === "coach"
                                ? "bg-orange-100 text-orange-700"
                                : m.sender === "manager"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {m.sender === "coach" ? "HLV" : (m.sender === "manager" ? "BQL" : "HỘI VIÊN")}
                          </span>
                        </div>
                      )}

                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                          isMe
                            ? "bg-emerald-600 text-white rounded-br-xs"
                            : "bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-xs"
                        }`}
                      >
                        {m.text}
                      </div>

                      <div
                        className={`flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1 ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span>{m.timestamp}</span>
                        {isMe && <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  Gợi ý:
                </span>
                {quickPrompts.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(undefined, q)}
                    className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 border border-slate-200/60 dark:border-slate-700 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Message Input Field */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  placeholder={`Nhắn tin cho ${activeConv.title}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isSending}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-emerald-500"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 rounded-xl transition-colors shadow-2xs shrink-0 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
              <p className="text-sm font-semibold">Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: CUỘC TRÒ CHUYỆN MỚI */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Bắt đầu cuộc trò chuyện mới
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Chọn người bạn muốn trao đổi trong hệ thống SportCenter
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewChatModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 px-4 text-xs font-bold">
              <button
                onClick={() => setModalTab("coaches")}
                className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  modalTab === "coaches"
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Dumbbell className="w-4 h-4" />
                Huấn luyện viên
              </button>
              <button
                onClick={() => setModalTab("managers")}
                className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  modalTab === "managers"
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Building2 className="w-4 h-4" />
                Quản lý & Hỗ trợ
              </button>
              <button
                onClick={() => setModalTab("members")}
                className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  modalTab === "members"
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Hội viên khác
              </button>
              <button
                onClick={() => setModalTab("classes")}
                className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  modalTab === "classes"
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Users className="w-4 h-4" />
                Nhóm lớp
              </button>
            </div>

            {/* Modal Body List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
              {modalTab === "coaches" &&
                DIRECTORY_CONTACTS.coaches.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleStartChat(c)}
                    className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img src={c.avatar} alt={c.name} className="w-11 h-11 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{c.name}</h4>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-orange-100 text-orange-700">HLV</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.subtitle}</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs">
                      Nhắn tin
                    </button>
                  </div>
                ))}

              {modalTab === "managers" &&
                DIRECTORY_CONTACTS.managers.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleStartChat(m)}
                    className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img src={m.avatar} alt={m.name} className="w-11 h-11 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{m.name}</h4>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-700">{m.roleTag}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.subtitle}</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs">
                      Liên hệ
                    </button>
                  </div>
                ))}

              {modalTab === "members" &&
                DIRECTORY_CONTACTS.members.map((mb) => (
                  <div
                    key={mb.id}
                    onClick={() => handleStartChat(mb)}
                    className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img src={mb.avatar} alt={mb.name} className="w-11 h-11 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{mb.name}</h4>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700">HỘI VIÊN</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{mb.subtitle}</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs">
                      Kết nối
                    </button>
                  </div>
                ))}

              {modalTab === "classes" &&
                DIRECTORY_CONTACTS.classes.map((cl) => (
                  <div
                    key={cl.id}
                    onClick={() => handleStartChat(cl)}
                    className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img src={cl.avatar} alt={cl.name} className="w-11 h-11 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{cl.name}</h4>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-700">NHÓM LỚP</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{cl.subtitle}</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs">
                      Vào nhóm
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
