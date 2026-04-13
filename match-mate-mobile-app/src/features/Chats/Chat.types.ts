import { NavigationProp, RouteProp } from "@react-navigation/native";

export type RootStackParamList = {
  ChatsDetail: { userId: string; partnerName?: string; partnerPhoto?: string };
  ProfileDetails: { userId: string };
};

export type Props = {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'ChatsDetail'>;
};

export type Message = {
  id: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  timestamp: number;
  type: 'text' | 'image';
  read?: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const formatTime = (ts: number): string =>
  new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

export const formatDateLabel = (ts: number): string => {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const fetchMessages = (pId: string): Message[] => [
  {
    id: '1',
    senderId: 'me',
    text: 'Hi, nice to connect! 😊',
    timestamp: Date.now() - 60000,
    type: 'text',
    read: true,
  },
  {
    id: '2',
    senderId: pId,
    text: 'Hello! Same here. Looking forward to getting to know you better.',
    timestamp: Date.now() - 30000,
    type: 'text',
  },
  {
    id: '3',
    senderId: 'me',
    text: 'Tell me about yourself!',
    timestamp: Date.now() - 10000,
    type: 'text',
    read: false,
  },
];