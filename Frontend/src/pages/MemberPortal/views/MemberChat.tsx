import React, { useState, useMemo, useRef, useEffect } from "react";
import { MessageSquare, RefreshCw, Plus } from "lucide-react";
import { MemberAPI } from "../services/api";
import type { MemberScreen } from "../types";
import { getRealCoachAvatar } from "../utils/coachAvatar";
import type { ChatMessage, ChatConversation, DirectoryContact, ChatDirectory } from "./chat/chatTypes";
import { NewChatModal } from "./chat/NewChatModal";
import { ChatSidebar } from "./chat/ChatSidebar";
import { ChatActiveArea } from "./chat/ChatActiveArea";
import { getQuickPromptsForCategory } from "./chat/chatDefaults";

export type { ChatMessage, ChatConversation };

interface Props {
  onNavigate?: (screen: MemberScreen) => void;
}

export default function MemberChat({ onNavigate }: Props) {
  const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = userStr ? JSON.parse(userStr) : null;
  const memberName = user?.fullName || user?.name || "Hội viên";
  const memberId = user?.id || "";

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | "coach" | "member" | "manager" | "class">("all");
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal state
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [coachContacts, setCoachContacts] = useState<DirectoryContact[]>([]);
  const [directory, setDirectory] = useState<ChatDirectory>({ managers: [], members: [], classes: [] });
  const [isDirectoryLoading, setIsDirectoryLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    setIsDirectoryLoading(true);
    Promise.all([MemberAPI.getCoaches(), MemberAPI.getChatDirectory()])
      .then(([coaches, chatDirectory]) => {
        if (!mounted) return;
        setCoachContacts(
          Array.isArray(coaches)
            ? coaches.map((coach: any) => ({
                id: String(coach.id),
                name: coach.fullName || coach.email || "Huấn luyện viên",
                role: "coach",
                roleTag: "HLV",
                subtitle: coach.specialty || "Huấn luyện viên SportCenter",
                avatar: getRealCoachAvatar(coach.fullName, coach.avatarUrl, coach.id),
              }))
            : []
        );
        setDirectory({
          managers: Array.isArray(chatDirectory?.managers) ? chatDirectory.managers : [],
          members: Array.isArray(chatDirectory?.members) ? chatDirectory.members : [],
          classes: Array.isArray(chatDirectory?.classes) ? chatDirectory.classes : [],
        });
      })
      .catch(() => {
        if (!mounted) return;
        setCoachContacts([]);
        setDirectory({ managers: [], members: [], classes: [] });
      })
      .finally(() => {
        if (mounted) setIsDirectoryLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const conversationsRef = useRef<ChatConversation[]>([]);
  conversationsRef.current = conversations;

  const loadConversations = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      if (memberId) {
        const res = await MemberAPI.getMemberConversations(memberId);
        if (Array.isArray(res)) {
          const list = res as ChatConversation[];
          // Only update state if data actually changed to prevent UI freezing
          const currentList = conversationsRef.current;
          const isSame =
            currentList.length === list.length &&
            list.every((item, i) => {
              const cur = currentList[i];
              return (
                cur &&
                cur.id === item.id &&
                cur.messages?.length === item.messages?.length &&
                cur.messages?.[cur.messages.length - 1]?.id ===
                  item.messages?.[item.messages.length - 1]?.id
              );
            });

          if (!isSame) {
            setConversations(list);
            setActiveId((curr) => (list.some((c) => c.id === curr) ? curr : list[0]?.id || ""));
          }
        }
      }
    } catch (err) {
      // keep state if network error
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadConversations(true);
    const interval = setInterval(() => {
      if (!document.hidden) {
        loadConversations(true);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [memberId]);

  useEffect(() => {
    const targetCoachStr = localStorage.getItem("chat_target_coach");
    if (!targetCoachStr) return;

    try {
      localStorage.removeItem("chat_target_coach");
      const targetCoach = JSON.parse(targetCoachStr);
      if (!targetCoach?.coachName) return;

      const coachName = targetCoach.coachName;
      const coachId = targetCoach.coachId || coachName;
      if (!coachId) return;

      const existing = conversationsRef.current.find(
        (c) =>
          (targetCoach.coachId && (c.coachId === targetCoach.coachId || c.id.includes(targetCoach.coachId))) ||
          c.title.toLowerCase().includes(coachName.toLowerCase())
      );

      if (existing) {
        setActiveId(existing.id);
      } else if (memberId) {
        MemberAPI.startConversation({
          targetId: coachId,
          targetName: coachName,
          role: "coach",
          memberId,
          memberName,
          avatar: targetCoach.coachAvatar || "",
          subtitle: "Huấn luyện viên phụ trách lớp học",
        })
          .then((res) => {
            if (!res?.conversation) return;
            setConversations((prev) => [res.conversation, ...prev.filter((c) => c.id !== res.conversation.id)]);
            setActiveId(res.conversation.id);
          })
          .catch(() => {});
      }
    } catch (e) {
      console.warn("Failed to consume chat_target_coach:", e);
    }
  }, [memberId, memberName]);

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
      return matchSearch && (filterCategory === "all" || cat === filterCategory);
    });
  }, [conversations, search, filterCategory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages?.length]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText ?? inputText).trim();
    if (!textToSend || !activeConv || isSending) return;

    setIsSending(true);
    try {
      const res = await MemberAPI.sendMemberMessage({
        conversationId: activeConv.id,
        text: textToSend,
        memberId,
        memberName,
      });
      if (res?.data) {
        if (!customText) setInputText("");
        const updated = await MemberAPI.getMemberConversations(memberId);
        if (Array.isArray(updated)) setConversations(updated);
      }
    } catch (err) {
      console.warn("Không thể lưu tin nhắn lên máy chủ:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleStartChat = async (contact: DirectoryContact) => {
    try {
      const res = await MemberAPI.startConversation({
        targetId: contact.id,
        targetName: contact.name,
        role: contact.role,
        memberId,
        memberName,
        avatar: contact.avatar || undefined,
        subtitle: contact.subtitle,
      });

      if (res?.conversation) {
        setConversations((prev) => {
          const exists = prev.some((c) => c.id === res.conversation.id);
          return exists ? prev : [res.conversation, ...prev];
        });
        setActiveId(res.conversation.id);
      }
    } catch (err) {
      console.warn("Không thể tạo cuộc trò chuyện trên máy chủ:", err);
    } finally {
      setShowNewChatModal(false);
    }
  };

  const quickPrompts = useMemo(() => getQuickPromptsForCategory(activeConv), [activeConv]);

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
        <ChatSidebar
          conversations={filteredConversations}
          activeId={activeId}
          search={search}
          onSearchChange={setSearch}
          filterCategory={filterCategory}
          onFilterCategoryChange={setFilterCategory}
          onSelectConversation={setActiveId}
          onNavigate={onNavigate}
        />

        <ChatActiveArea
          activeConv={activeConv}
          inputText={inputText}
          onInputTextChange={setInputText}
          isSending={isSending}
          quickPrompts={quickPrompts}
          onSendMessage={handleSendMessage}
          messagesEndRef={messagesEndRef}
          onNavigate={onNavigate}
        />
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        coachContacts={coachContacts}
        directory={directory}
        isLoading={isDirectoryLoading}
        onStartChat={handleStartChat}
      />
    </div>
  );
}

