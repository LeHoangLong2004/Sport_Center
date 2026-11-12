export interface Message {
  id: string;
  sender: "coach" | "member";
  text: string;
  timestamp: string;
  attachmentUrl?: string;
  attachmentType?: string;
}

export interface Conversation {
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

export const INITIAL_CONVERSATIONS: Conversation[] = [];
