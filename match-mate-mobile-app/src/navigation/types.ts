import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';

// ─── Auth Stack ───────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { accessToken: string };
};

// ─── Onboarding Stack ─────────────────────────────────────────────────────────
export type OnboardingStackParamList = {
  OnboardingScreen: undefined;
};

// ─── Home Stack ───────────────────────────────────────────────────────────────
export type HomeStackParamList = {
  HomeScreen: undefined;
  Notifications: undefined;
};

// ─── Matches Stack ────────────────────────────────────────────────────────────
export type MatchesStackParamList = {
  MatchList: undefined;
  OnlineMatches: undefined;
  MatchDetails: { userId: string };
};

// ─── Chats Stack ──────────────────────────────────────────────────────────────
export type ChatsStackParamList = {
  ChatList: undefined;
  ChatDetails: {
    userId: string;
    partnerName: string;
    partnerPhoto: string;
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
  EditPreference: undefined;
  ChangePassword: undefined;
  Languages: undefined;
  Themes: undefined;
  NotificationSettings: undefined;
  HelpSupport: undefined;
  PrivacyPolicy: undefined;
  AccountSettings: undefined;
  PrivacySettings: undefined;
  CommunicationSettings: undefined;
};

// ─── Bottom Tabs ──────────────────────────────────────────────────────────────
export type BottomTabParamList = {
  Home: undefined;
  Matches: undefined;
  Chats: undefined;
  Membership: undefined;
  Profile: undefined;
};

// ─── App Stack ────────────────────────────────────────────────────────────────
// Settings is a stack navigator reachable from the app level
export type AppStackParamList = {
  Tabs: undefined;
  Settings: undefined; // navigates into SettingsStackNavigator
};

// ─── Root Stack ───────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  App: undefined;
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
export type MatchesNavigationProp =
  NativeStackNavigationProp<MatchesStackParamList>;
export type ChatsNavigationProp =
  NativeStackNavigationProp<ChatsStackParamList>;
export type ProfileNavigationProp =
  NativeStackNavigationProp<ProfileStackParamList>;
export type SettingsNavigationProp =
  NativeStackNavigationProp<SettingsStackParamList>;
export type AppNavigationProp = NativeStackNavigationProp<AppStackParamList>;
export type BottomNavigationProp = BottomTabNavigationProp<BottomTabParamList>; // fixed typo

// ─── Route Props (for screens that receive params) ────────────────────────────
export type MatchDetailsRouteProp = RouteProp<
  MatchesStackParamList,
  'MatchDetails'
>;
export type ChatDetailsRouteProp = RouteProp<
  ChatsStackParamList,
  'ChatDetails'
>;
