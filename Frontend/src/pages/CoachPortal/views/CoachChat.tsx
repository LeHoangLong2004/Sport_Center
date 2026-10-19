import { useState, useMemo, useRef, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { coachApi } from "../services/api";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { type Conversation, type Message } from "./chat/types";
import { ChatConversationList } from "./chat/ChatConversationList";
import { ChatWindow } from "./chat/ChatWindow";

interface CoachChatProps {
  initialMemberId?: string | null;
}

export default function CoachChat({ initialMemberId }: CoachChatProps) {
  const { profile } = useUserProfile();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "class" | "direct">("all");
  const [inputText, setInputText] = useState("");
  const [openError, setOpenError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const openedMemberRef = useRef<string | null>(null);

  // Polling for real-time messages
  useEffect(() => {
    let isMounted = true;
    async function loadConversations() {
      try {
        const coachId = profile?.id || "";
        const res = await coachApi.getCoachConversations(coachId);
        if (isMounted && Array.isArray(res)) {
          setConversations(res);
          setActiveId((current) =>
            res.some((conversation) => conversation.id === current)
              ? current
              : (res[0]?.id || "")
          );
        }
      } catch (err) {
        // Keeps current conversations
      }
    }

    loadConversations();
    const interval = setInterval(loadConversations, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [profile?.id]);

  // A profile's "Nhắn tin trao đổi" action creates/gets the DB conversation
  // and selects it. The conversation then remains in the normal list and is
  // available on later visits for this coach.
  useEffect(() => {
    if (!initialMemberId) {
      openedMemberRef.current = null;
      setOpenError(null);
      return;
    }
    if (!profile?.id || openedMemberRef.current === initialMemberId) return;
    openedMemberRef.current = initialMemberId;
    setOpenError(null);
    let cancelled = false;

    (async () => {
      try {
        const started = await coachApi.startMemberConversation(initialMemberId);
        const conversation = started?.conversation;
        if (cancelled || !conversation?.id) return;

        const refreshed = await coachApi.getCoachConversations(profile.id);
        if (cancelled) return;
        const nextConversations = Array.isArray(refreshed)
          ? refreshed
          : [conversation];
        setConversations(nextConversations);
        setActiveId(conversation.id);
      } catch (error) {
        // The API checks ownership; leave the chat empty if the member is not
        // assigned to this coach instead of showing a fake conversation.
        openedMemberRef.current = null;
        if (!cancelled) {
          setOpenError(
            error instanceof Error
              ? error.message
              : "Không thể mở cuộc trò chuyện với học viên này."
          );
        }
        console.warn("Không thể mở cuộc trò chuyện với học viên:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialMemberId, profile?.id]);

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
  }, [activeConv?.messages?.length]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend || !activeConv) return;

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
      const res = await coachApi.sendCoachMessage({
        conversationId: activeConv.id,
        text: textToSend,
        coachId: profile?.id,
      });
      if (res && res.data) {
        // Refresh to ensure exact sync
        const coachId = profile?.id || "";
        const updated = await coachApi.getCoachConversations(coachId);
        if (Array.isArray(updated)) {
          setConversations(updated);
        }
      }
    } catch (err) {
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === activeConv.id
            ? { ...conversation, messages: conversation.messages.filter((message) => message.id !== newMsg.id) }
            : conversation
        )
      );
      console.warn("Không thể lưu tin nhắn lên máy chủ:", err);
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

        <ChatWindow
          activeConv={activeConv}
          inputText={inputText}
          setInputText={setInputText}
          onSendMessage={handleSendMessage}
          messagesEndRef={messagesEndRef}
          errorMessage={openError}
        />
      </div>
    </div>
  );
}
