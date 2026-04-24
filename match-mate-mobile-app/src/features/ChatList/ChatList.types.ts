import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type ChatsStackParamList = {
  ChatDetails: { userId: string; partnerName: string; partnerPhoto: string };
  RequestContact: { userId: string };
};

export type ChatListProps = {
  navigation: NativeStackNavigationProp<ChatsStackParamList>;
};

export type ChatMatch = {
  id: string;
  name: string;
  age: number;
  city: string;
  lastMessage: string;
  avatarUrl: string;
  matchedAt: string;
  isOnline: boolean;
  unreadCount: number;
};

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

export const mockFetchMatches = async (): Promise<ChatMatch[]> => {
  await new Promise<void>((r) => setTimeout(r, 600));
  return [
    {
      id: '1',
      name: 'Priya Sharma',
      age: 28,
      city: 'Mumbai',
      lastMessage: 'Hi, how are you? 😊',
      avatarUrl: 'https://i.pravatar.cc/150?img=10',
      matchedAt: new Date().toISOString(),
      isOnline: true,
      unreadCount: 2,
    },
    {
      id: '2',
      name: 'Ankit Verma',
      age: 31,
      city: 'Delhi',
      lastMessage: 'Thanks for accepting!',
      avatarUrl: 'https://i.pravatar.cc/150?img=11',
      matchedAt: new Date(Date.now() - 3600000).toISOString(),
      isOnline: false,
      unreadCount: 0,
    },
    {
      id: '3',
      name: 'Sneha Iyer',
      age: 26,
      city: 'Bengaluru',
      lastMessage: 'Looking forward to talking!',
      avatarUrl: 'https://i.pravatar.cc/150?img=47',
      matchedAt: new Date(Date.now() - 7200000).toISOString(),
      isOnline: true,
      unreadCount: 5,
    },
    {
      id: '4',
      name: 'Rahul Mehta',
      age: 30,
      city: 'Pune',
      lastMessage: 'Would love to know more about you.',
      avatarUrl: 'https://i.pravatar.cc/150?img=15',
      matchedAt: new Date(Date.now() - 86400000).toISOString(),
      isOnline: false,
      unreadCount: 0,
    },
  ];
};
