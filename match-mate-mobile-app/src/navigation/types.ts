import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Profile } from '../types/profile.types';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  Home: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  ForgotPassword: undefined;
  NotificationSettings: undefined;
  HelpSupport: undefined;
  PrivacyPolicy: undefined;
  ChatScreen: { user: Profile };
  MatchDetail: { user: Profile };
  // add all your screens here
};

export type ParamlessScreen = {
  [K in keyof RootStackParamList]: RootStackParamList[K] extends undefined
    ? K
    : never;
}[keyof RootStackParamList];

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
