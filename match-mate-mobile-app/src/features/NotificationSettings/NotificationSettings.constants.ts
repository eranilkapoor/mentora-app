import { NotificationGroup } from "./NotificationSettings.types";

export const NOTIFICATION_GROUPS: NotificationGroup[] = [
  {
    title: 'Matches & Interests',
    subtitle: 'Stay updated on your match activity',
    settings: [
      {
        key: 'newMatches',
        label: 'New Matches',
        description: 'When someone matches your preferences',
        icon: 'heart',
      },
      {
        key: 'interestReceived',
        label: 'Interest Received',
        description: 'When someone sends you an interest',
        icon: 'star',
      },
      {
        key: 'interestAccepted',
        label: 'Interest Accepted',
        description: 'When your interest is accepted',
        icon: 'check-circle',
      },
      {
        key: 'profileShortlisted',
        label: 'Profile Shortlisted',
        description: 'When someone shortlists your profile',
        icon: 'bookmark',
      },
      {
        key: 'profileViewed',
        label: 'Profile Viewed',
        description: 'When someone views your profile',
        icon: 'eye',
      },
    ],
  },
  {
    title: 'Messages & Chat',
    subtitle: 'Notifications for your conversations',
    settings: [
      {
        key: 'newMessages',
        label: 'New Messages',
        description: 'When you receive a new chat message',
        icon: 'message-circle',
      },
      {
        key: 'messageRequests',
        label: 'Message Requests',
        description: 'When someone requests to chat',
        icon: 'mail',
      },
    ],
  },
  {
    title: 'Account & Security',
    subtitle: 'Important updates about your account',
    settings: [
      {
        key: 'profileApproval',
        label: 'Profile Approval',
        description: 'Status updates on your profile review',
        icon: 'shield',
      },
      {
        key: 'verificationUpdates',
        label: 'Verification Updates',
        description: 'Updates on ID or photo verification',
        icon: 'award',
      },
      {
        key: 'loginAlerts',
        label: 'Login Alerts',
        description: 'Alerts for new device sign-ins',
        icon: 'log-in',
      },
      {
        key: 'passwordChanges',
        label: 'Password Changes',
        description: 'When your password is updated',
        icon: 'lock',
      },
    ],
  },
  {
    title: 'Subscription & Offers',
    subtitle: 'Plan updates and special deals',
    settings: [
      {
        key: 'premiumOffers',
        label: 'Premium Offers',
        description: 'Discounts and upgrade promotions',
        icon: 'tag',
      },
      {
        key: 'planExpiry',
        label: 'Plan Expiry Reminders',
        description: 'Reminders before your plan expires',
        icon: 'clock',
      },
      {
        key: 'paymentUpdates',
        label: 'Payment Updates',
        description: 'Receipts and billing notifications',
        icon: 'credit-card',
      },
    ],
  },
  {
    title: 'Reminders & Tips',
    subtitle: 'Helpful nudges to improve your experience',
    settings: [
      {
        key: 'profileCompletion',
        label: 'Profile Completion',
        description: 'Tips to improve your profile score',
        icon: 'user',
      },
      {
        key: 'dailyMatches',
        label: 'Daily Match Digest',
        description: 'A daily summary of recommended profiles',
        icon: 'sun',
      },
      {
        key: 'inactivityReminders',
        label: 'Inactivity Reminders',
        description: "Reminders when you haven't logged in",
        icon: 'bell',
      },
    ],
  },
];