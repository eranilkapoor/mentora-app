import { Colors } from '@/core/constants/colors';
import { NotifSection } from './Notifications.types';

export const INITIAL_NOTIFICATIONS: NotifSection[] = [
  {
    title: 'New',
    icon: 'star',
    data: [
      {
        id: '1',
        title: 'New Match Found! 🎉',
        message: 'Priya from Delhi matches 92% of your preferences.',
        time: '2 min ago',
        unread: true,
        icon: 'heart',
        iconColor: Colors.danger,
      },
      {
        id: '2',
        title: 'Profile Viewed',
        message: 'Someone from Mumbai viewed your profile.',
        time: '15 min ago',
        unread: true,
        icon: 'eye',
      },
      {
        id: '3',
        title: 'Interest Accepted 🎊',
        message: 'Anjali accepted your interest request.',
        time: '1 hour ago',
        unread: true,
        icon: 'check-circle',
        iconColor: Colors.success,
      },
    ],
  },
  {
    title: 'Earlier',
    icon: 'clock',
    data: [
      {
        id: '4',
        title: 'Profile Shortlisted',
        message: 'Your profile has been shortlisted by 3 new members.',
        time: 'Yesterday',
        unread: false,
        icon: 'bookmark',
      },
      {
        id: '5',
        title: 'Complete Your Profile',
        message: 'Add more details to get 3× more matches.',
        time: '2 days ago',
        unread: false,
        icon: 'user',
      },
      {
        id: '6',
        title: 'New Message',
        message: 'You have a new message from Rahul.',
        time: '3 days ago',
        unread: false,
        icon: 'message-circle',
      },
    ],
  },
];
