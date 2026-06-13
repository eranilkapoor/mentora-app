import { NavigationProp, RouteProp } from '@react-navigation/native';

export type ChatsStackParamList = {
  ChatDetails: {
    userId: string;
    roomId?: string;
    partnerName?: string;
    partnerPhoto?: string;
  };
  MatchDetails: { userId: string };
};

export type Props = {
  navigation: NavigationProp<ChatsStackParamList>;
  route: RouteProp<ChatsStackParamList, 'ChatDetails'>;
};

export type Message = {
  id: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  timestamp: number;
  type: 'text' | 'image' | 'audio';
  status: 'sent' | 'delivered' | 'read';
  reactions?: Array<{
    userId: string;
    emoji: string;
    reactedAt?: string;
  }>;
};

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
