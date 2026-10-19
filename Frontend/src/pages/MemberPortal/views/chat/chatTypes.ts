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

export interface DirectoryContact {
  id: string;
  name: string;
  role: string;
  roleTag: string;
  subtitle: string;
  avatar?: string | null;
}

export interface ChatDirectory {
  managers: DirectoryContact[];
  members: DirectoryContact[];
  classes: DirectoryContact[];
}
