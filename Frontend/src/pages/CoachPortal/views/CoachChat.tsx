import { useState, useMemo, useRef, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { coachApi } from "../services/api";
import { useUserProfile } from "../../../hooks/useUserProfile";
import {
  INITIAL_CONVERSATIONS,
  type Conversation,
  type Message,
} from "./chat/types";
import { ChatConversationList } from "./chat/ChatConversationList";
import { ChatWindow } from "./chat/ChatWindow";

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
        <ChatConversationList
          conversations={filteredConversations}
          activeId={activeConv?.id}
          onSelect={(id) => setActiveId(id)}
          search={search}
          onSearchChange={setSearch}
          filterType={filterType}
          onFilterChange={setFilterType}
        />

        {/* Right pane: Chat Area */}
        <ChatWindow
          activeConv={activeConv}
          inputText={inputText}
          setInputText={setInputText}
          onSendMessage={handleSendMessage}
          messagesEndRef={messagesEndRef}
        />
      </div>
    </div>
  );
}
