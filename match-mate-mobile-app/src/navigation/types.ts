import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// ─── Auth Stack ───────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
};

// ─── Onboarding Stack ───────────────────────────────────────────────────────────────
export type OnboardingStackParamList = {
  Onboarding: undefined;
};

// ─── Home Stack ───────────────────────────────────────────────────────────────
export type HomeStackParamList = {
  HomeScreen: undefined;
  Notifications: undefined;
};

// ─── Matches Stack ────────────────────────────────────────────────────────────────
export type MatchesStackParamList = {
  MatchList: undefined;
  OnlineMatches: undefined;
  MatchDetails: { userId: string };
};

// ─── Chats Stack ────────────────────────────────────────────────────────────────
export type ChatsStackParamList = {
  ChatList: undefined;
  ChatDetails: {
    userId: string;
    partnerName: string;
    partnerPhoto: string;
  };
};

// ─── Profile Stack ────────────────────────────────────────────────────────────────
export type ProfileStackParamList = {
  ProfileScreen: undefined;
  Settings: undefined;
};

// ─── Bottom Tabs ──────────────────────────────────────────────────────────────
export type BottomTabParamList = {
  Home: undefined;
  Matches: undefined;
  Chats: undefined;
  Membership: undefined;
  Profile: undefined;
};

// ─── Settings Stack ───────────────────────────────────────────────────────────────
export type SettingsStackParamList = {
  SettingsScreen: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Languages: undefined;
  Themes: undefined;
  NotificationSettings: undefined;
  HelpSupport: undefined;
  PrivacyPolicy: undefined;
};

// ─── App Stack ────────────────────────────────────────────────────────────────
export type AppStackParamList = {
  Tabs: undefined;
};

// ─── Root Stack ───────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  App: undefined;
};

export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type AppNavigationProp = NativeStackNavigationProp<AppStackParamList>;
export type BottamNavigationProp = BottomTabNavigationProp<BottomTabParamList>;
export type ProfileNavigationProp =
  NativeStackNavigationProp<ProfileStackParamList>;

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
