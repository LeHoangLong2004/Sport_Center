import { useState, useMemo, useRef, useEffect } from "react";
import {
  MessageSquare,
  Search,
  Send,
  Users,
  User,
  Paperclip,
  CheckCheck,
  Clock,
  Phone,
  MoreVertical,
  Dumbbell
} from "lucide-react";
import { coachApi } from "../services/api";
import { useUserProfile } from "../../../hooks/useUserProfile";

interface Message {
  id: string;
  sender: "coach" | "member";
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  type: "class" | "direct";
  title: string;
  subtitle: string;
  avatar?: string;
  lastMessage: string;
  lastTime: string;
  unreadCount?: number;
  online?: boolean;
  messages: Message[];
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    type: "direct",
    title: "Nguyễn Văn An",
    subtitle: "Học viên PT 1-1 (Mục tiêu: Tăng cơ)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    lastMessage: "Thầy ơi, buổi tập sáng mai 7h em đến sớm 10 phút khởi động trước nhé ạ!",
    lastTime: "14:20",
    unreadCount: 1,
    online: true,
    messages: [
      { id: "m1", sender: "coach", text: "Chào An, tuần này em cảm thấy cơ bắp phục hồi thế nào rồi?", timestamp: "09:15" },
      { id: "m2", sender: "member", text: "Dạ cơ đùi sau hôm tập chân hơi mỏi nhưng đỡ nhiều rồi thầy ạ.", timestamp: "09:30" },
      { id: "m3", sender: "coach", text: "Tốt lắm, nhớ bổ sung đủ 2 lít nước và ăn đủ đạm sau buổi tập nhé.", timestamp: "09:35" },
      { id: "m4", sender: "member", text: "Thầy ơi, buổi tập sáng mai 7h em đến sớm 10 phút khởi động trước nhé ạ!", timestamp: "14:20" },
    ],
  },
  {
    id: "conv-2",
    type: "class",
    title: "Lớp Yoga Cơ Bản – Lớp A",
    subtitle: "Nhóm lớp • 10 học viên",
    lastMessage: "Coach: Nhắc cả lớp chiều nay mang theo thảm cá nhân nhé!",
    lastTime: "11:45",
    unreadCount: 0,
    online: true,
    messages: [
      { id: "m20", sender: "member", text: "Em chào thầy và cả lớp ạ!", timestamp: "08:00" },
      { id: "m21", sender: "coach", text: "Chào cả lớp, chiều nay chúng ta sẽ học kỹ thuật thở bụng sâu và tư thế chiến binh.", timestamp: "11:40" },
      { id: "m22", sender: "coach", text: "Nhắc cả lớp chiều nay mang theo thảm cá nhân và khăn lau nhé!", timestamp: "11:45" },
    ],
  },
  {
    id: "conv-3",
    type: "direct",
    title: "Lê Thu Hà",
    subtitle: "Học viên kèm 1-1 (Mục tiêu: Giảm mỡ)",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
    lastMessage: "Em đã hoàn thành bài tập về nhà hôm qua rồi ạ.",
    lastTime: "Hôm qua",
    unreadCount: 0,
    online: false,
    messages: [
      { id: "m30", sender: "coach", text: "Chào Hà, giáo án tuần 2 thầy đã giao trên hệ thống rồi nhé.", timestamp: "Hôm qua 10:00" },
      { id: "m31", sender: "member", text: "Em đã hoàn thành bài tập về nhà hôm qua rồi ạ. Cảm giác rất khỏe!", timestamp: "Hôm qua 17:30" },
      { id: "m32", sender: "coach", text: "Tuyệt vời, tiếp tục duy trì phong độ nhé!", timestamp: "Hôm qua 18:00" },
    ],
  },
  {
    id: "conv-4",
    type: "class",
    title: "Gym Group BodyCombat",
    subtitle: "Nhóm lớp • 8 học viên",
    lastMessage: "Phạm Kiệt: Ca hôm nay tập sung quá mọi người!",
    lastTime: "Hôm qua",
    unreadCount: 0,
    online: true,
    messages: [
      { id: "m40", sender: "coach", text: "Hôm nay cả lớp tập rất tốt, nhịp độ cardio rất đều.", timestamp: "Hôm qua 10:45" },
      { id: "m41", sender: "member", text: "Ca hôm nay tập sung quá mọi người! Cảm ơn Coach nhiều ạ.", timestamp: "Hôm qua 11:00" },
    ],
  },
];

export default function CoachChat() {
  const { profile } = useUserProfile();
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string>("conv-1");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "class" | "direct">("all");
  const [inputText, setInputText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadConversations() {
      try {
        const coachId = profile?.id || "25F50FBA";
        const res = await coachApi.getCoachConversations(coachId);
        if (Array.isArray(res) && res.length > 0) {
          setConversations(res);
        }
      } catch (err) {
        // Keeps initial conversations
      }
    }
    loadConversations();
  }, [profile?.id]);

  const activeConv = useMemo(
    () => conversations.find((c) => c.id === activeId) || conversations[0],
    [conversations, activeId]
  );

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.subtitle.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === "all" || c.type === filterType;
      return matchSearch && matchType;
    });
  }, [conversations, search, filterType]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "coach",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConv.id) {
          return {
            ...c,
            messages: [...c.messages, newMsg],
            lastMessage: `Coach: ${newMsg.text}`,
            lastTime: newMsg.timestamp,
          };
        }
        return c;
      })
    );

    setInputText("");

    try {
      await coachApi.sendCoachMessage({
        conversationId: activeConv.id,
        text: textToSend,
        coachId: profile?.id || "25F50FBA"
      });
    } catch (err) {
      console.warn("Lưu tin nhắn lên backend thất bại, đã lưu tạm trên trình duyệt:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            Tin nhắn trao đổi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Kênh liên lạc trực tiếp giữa Huấn luyện viên và Học viên các lớp phụ trách
          </p>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row h-[calc(100vh-220px)] min-h-[550px]">
        
        {/* Left pane: Conversation List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
          
          {/* Search bar */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm học viên hoặc lớp học..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
              />
            </div>

            {/* Filter pills */}
            <div className="flex gap-1.5 mt-2.5">
              {(["all", "direct", "class"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilterType(type)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterType === type
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  {type === "all" ? "Tất cả" : type === "direct" ? "Kèm 1–1" : "Nhóm lớp"}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations scroll area */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredConversations.map((conv) => {
              const isSelected = conv.id === activeConv?.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveId(conv.id)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-slate-100/90 dark:bg-slate-800/80"
                      : "hover:bg-slate-50 dark:hover:bg-slate-850"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {conv.type === "class" ? (
                      <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
                        <Users className="w-5 h-5" />
                      </div>
                    ) : (
                      <img
                        src={conv.avatar}
                        alt={conv.title}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                    )}
                    {conv.online && (
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 absolute bottom-0 right-0"></span>
                    )}
                  </div>

                  {/* Conv details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                        {conv.title}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {conv.lastTime}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate leading-snug">
                      {conv.lastMessage}
                    </p>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-slate-400 truncate">
                        {conv.subtitle}
                      </span>
                      {conv.unreadCount ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-500 text-white rounded-full">
                          {conv.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right pane: Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50/40 dark:bg-slate-900/60">
          
          {/* Active conversation header */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                {activeConv.type === "class" ? (
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                    <Users className="w-5 h-5" />
                  </div>
                ) : (
                  <img
                    src={activeConv.avatar}
                    alt={activeConv.title}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                )}
                {activeConv.online && (
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 absolute bottom-0 right-0"></span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                  {activeConv.title}
                </h3>
                <span className="text-xs text-slate-400">
                  {activeConv.subtitle} • {activeConv.online ? "Đang trực tuyến" : "Ngoại tuyến"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                {activeConv.type === "class" ? "Hội thoại lớp" : "Kèm 1–1"}
              </span>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {activeConv.messages.map((m) => {
              const isMe = m.sender === "coach";
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed shadow-sm ${
                      isMe
                        ? "bg-slate-900 text-white dark:bg-emerald-600 dark:text-white rounded-br-none"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-bl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {m.timestamp}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input message form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Nhắn tin cho ${activeConv.title}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0"
              title="Gửi tin nhắn"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
