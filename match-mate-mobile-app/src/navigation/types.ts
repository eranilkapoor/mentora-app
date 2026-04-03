import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Profile } from '../core/types/profile.types';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Onboarding: undefined;
  Home: undefined;
  Profile: undefined;
  Notifications: undefined;
  Settings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Languages: undefined;
  Themes: undefined;
  NotificationSettings: undefined;
  HelpSupport: undefined;
  PrivacyPolicy: undefined;
  Matches: undefined;
  OnlineMatches: undefined;
  MatchDetails: { user: Profile };
  Chats: { userId: string };
  ChatDetails: undefined; // add params if needed
  // add all your screens here
};

export type ParamlessScreen = {
  [K in keyof RootStackParamList]: RootStackParamList[K] extends undefined
    ? K
    : never;
}[keyof RootStackParamList];

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
