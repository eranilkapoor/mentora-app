import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type ChatsStackParamList = {
  ChatDetails: {
    userId: string;
    roomId?: string;
    partnerName?: string;
    partnerPhoto?: string;
  };
  RequestContact: { userId: string };
};

export type ChatListProps = {
  navigation: NativeStackNavigationProp<ChatsStackParamList>;
};

export type ChatMatch = {
  id: string;
  roomId?: string;
  status?: string;
  requestedById?: string;
  name: string;
  age: number;
  city: string;
  lastMessage: string;
  lastMessageSenderId?: string;
  lastMessageStatus: 'sent' | 'delivered' | 'read' | null;
  avatarUrl: string;
  matchedAt: string;
  isOnline: boolean;
  unreadCount: number;
  isArchived: boolean;
  isPinned: boolean;
  isMuted: boolean;
  isRequestIncoming?: boolean;
  isRequestOutgoing?: boolean;
};

export type ChatFilter =
  | 'all'
  | 'unread'
  | 'online'
  | 'pinned'
  | 'muted'
  | 'archived';

export const formatTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
};
