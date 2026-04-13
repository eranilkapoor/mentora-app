import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Profile } from '../core/types/profile.types';

// ─── Auth Stack ───────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Onboarding: undefined;
};

// ─── Bottom Tabs ──────────────────────────────────────────────────────────────
export type BottomTabParamList = {
  Home: undefined;
  Matches: undefined;
  Chats: undefined;
  Profile: undefined;
  Membership: undefined;
};

// ─── App Stack ────────────────────────────────────────────────────────────────
export type AppStackParamList = {
  Tabs: undefined;
  Notifications: undefined;
  Settings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Languages: undefined;
  Themes: undefined;
  NotificationSettings: undefined;
  HelpSupport: undefined;
  PrivacyPolicy: undefined;
  OnlineMatches: undefined;
  MatchDetails: { user: Profile };
  ChatsDetail: {
    userId: string;
    partnerName: string;
    partnerPhoto: string;
  };
};

// ─── Root Stack ───────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type AppNavigationProp = NativeStackNavigationProp<AppStackParamList>;
export type BottamNavigationProp = BottomTabNavigationProp<BottomTabParamList>;

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
