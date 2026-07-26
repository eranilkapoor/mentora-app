import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';

// ─── Auth Stack ───────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { code?: string };
  MagicLogin: { token?: string };
  PrivacyPolicy: undefined;
  TermsConditions: undefined;
  TwoFactorChallenge: {
    challengeId: string;
    method?: 'sms' | 'email' | 'authenticator';
  };
};

// ─── Onboarding Stack ─────────────────────────────────────────────────────────
export type OnboardingStackParamList = {
  OnboardingScreen: undefined;
  OnboardingSuccess: undefined;
};

// ─── Home Stack ───────────────────────────────────────────────────────────────
export type HomeStackParamList = {
  HomeScreen: undefined;
  Notifications: undefined;
  NotificationDetail: {
    id: string;
    title: string;
    message: string;
    time: string;
    unread: boolean;
    icon: string;
    iconColor?: string;
    type: string;
    category: string;
    actorId?: string;
    actorName?: string;
    actorImage?: string;
    action?: {
      screen: string;
      params?: Record<string, unknown>;
    };
    metadata?: Record<string, unknown>;
    createdAt?: string;
  };
  ChatDetails: {
    userId: string;
    contactName: string;
    contactPhoto: string;
    roomId?: string;
  };
};

// ─── Chats Stack ──────────────────────────────────────────────────────────────
export type ChatsStackParamList = {
  ChatList: undefined;
  ChatDetails: {
    userId: string;
    contactName: string;
    contactPhoto: string;
    roomId?: string;
  };
};

// ─── Profile Stack ────────────────────────────────────────────────────────────
// Settings screen here navigates INTO the SettingsStack navigator
export type ProfileStackParamList = {
  ProfileScreen: undefined;
};

// ─── Settings Stack ───────────────────────────────────────────────────────────
export type SettingsStackParamList = {
  SettingsScreen: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  NotificationSettings: undefined;
  HelpSupport: undefined;
  SupportTickets: undefined;
  SupportTicketDetail: { ticketId: string };
  Faqs: undefined;
  CommunityGuidelines: undefined;
  ChildSafety: undefined;
  AiTutorDisclaimer: undefined;
  RefundPolicy: undefined;
  AccountDeletion: undefined;
  PrivacyPolicy: undefined;
  TermsConditions: undefined;
  AccountSettings: undefined;
  ChangeEmailPhone: { mode: 'email' | 'phone' };
  LinkedAccounts: undefined;
  ProfileVerification: undefined;
  ManageDevices: undefined;
  LoginHistory: undefined;
  TwoFactorSetup: undefined;
  Membership: undefined;
  SubscriptionBilling: undefined;
  ReferRewards: undefined;
  BlockedUsers: undefined;
  PrivacySettings: undefined;
  CommunicationSettings: undefined;
  AccessibilitySettings: undefined;
  AiSettings: undefined;
  MediaSettings: undefined;
  LocalizationSettings: undefined;
  SecuritySettings: undefined;
};

// ─── Bottom Tabs ──────────────────────────────────────────────────────────────
export type BottomTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  Learn: undefined;
  Schedule: undefined;
  Progress: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

// ─── App Stack ────────────────────────────────────────────────────────────────
// Settings is a stack navigator reachable from the app level
export type AppStackParamList = {
  Tabs: NavigatorScreenParams<BottomTabParamList> | undefined;
  Settings: NavigatorScreenParams<SettingsStackParamList> | undefined;
};

// ─── Root Stack ───────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  Onboarding: undefined;
  App: NavigatorScreenParams<AppStackParamList> | undefined;
};

// ─── Global declaration — enables typed useNavigation() with no generics ──────
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// ─── Navigation Props ─────────────────────────────────────────────────────────
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type OnboardingNavigationProp =
  NativeStackNavigationProp<OnboardingStackParamList>;
export type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList>;
export type ChatsNavigationProp =
  NativeStackNavigationProp<ChatsStackParamList>;
export type ProfileNavigationProp =
  NativeStackNavigationProp<ProfileStackParamList>;
export type SettingsNavigationProp =
  NativeStackNavigationProp<SettingsStackParamList>;
export type AppNavigationProp = NativeStackNavigationProp<AppStackParamList>;
export type BottomNavigationProp = BottomTabNavigationProp<BottomTabParamList>; // fixed typo

// ─── Route Props (for screens that receive params) ────────────────────────────
export type ChatDetailsRouteProp = RouteProp<
  ChatsStackParamList,
  'ChatDetails'
>;
