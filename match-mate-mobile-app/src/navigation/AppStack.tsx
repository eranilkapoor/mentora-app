import React from 'react';
import { TouchableOpacity, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../core/theme/ThemeProvider';
import { AppStackParamList } from './types';

import BottomTabs from './BottomTabs';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import SettingsScreen from '../screens/Settings/Settings.screen';
import ChangePasswordScreen from '../screens/ChangePassword/ChangePassword.screen';
import ChatScreen from '../screens/Chats/ChatScreen';
import MatchDetailScreen from '../screens/Matches/MatchDetailScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicy/PrivacyPolicyScreen';
import HelpSupportScreen from '../screens/HelpSupport/HelpSupportScreen';
import NotificationSettingsScreen from '../screens/NotificationSettings/NotificationSettingsScreen';
import EditProfileScreen from '../screens/EditProfile/EditProfileScreen';
import OnlineMatchesScreen from '../screens/Matches/OnlineMatchesScreen';
import LanguageScreen from '../screens/Language/Language.screen';
import ThemeScreen from '../screens/Theme/Theme.screen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack(): React.ReactElement {
  const { theme } = useTheme();

  // ─── Shared header options applied to every screen ───────────────────────
  const sharedOptions: NativeStackNavigationOptions = {
    headerStyle: {
      backgroundColor: theme.colors.white,
    },
    headerTitleStyle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    headerTintColor: theme.colors.primary,
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal', // iOS: shows only chevron, no "Back" text
    // Custom back button — consistent across iOS & Android
    // headerLeft: ({ canGoBack, navigation }: any) =>
    //   canGoBack ? (
    //     <TouchableOpacity
    //       onPress={() => {
    //         try {
    //           navigation.pop();
    //         } catch {
    //           navigation.navigate('Tabs');
    //         }
    //       }}
    //       style={{
    //         width: 36,
    //         height: 36,
    //         borderRadius: 18,
    //         backgroundColor: theme.colors.backgroundLight,
    //         alignItems: 'center',
    //         justifyContent: 'center',
    //         marginLeft: Platform.OS === 'android' ? 4 : 0,
    //       }}
    //       accessibilityRole="button"
    //       accessibilityLabel="Go back"
    //     >
    //       <Feather
    //         name="arrow-left"
    //         size={18}
    //         color={theme.colors.textPrimary}
    //       />
    //     </TouchableOpacity>
    //   ) : null,
    contentStyle: {
      backgroundColor: theme.colors.backgroundPage,
    },
    animation: Platform.OS === 'android' ? 'slide_from_right' : 'default',
  };

  return (
    <Stack.Navigator screenOptions={sharedOptions}>
      {/* ── Root ── */}
      <Stack.Screen
        name="Tabs"
        component={BottomTabs}
        options={{ headerShown: false }}
      />

      {/* ── Profile & Account ── */}
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Change Password' }}
      />

      {/* ── Settings ── */}
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="Languages"
        component={LanguageScreen}
        options={{ title: 'Language' }}
      />
      <Stack.Screen
        name="Themes"
        component={ThemeScreen}
        options={{ title: 'Appearance' }}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ title: 'Notifications' }}
      />

      {/* ── Matches ── */}
      <Stack.Screen
        name="MatchDetails"
        component={MatchDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OnlineMatches"
        component={OnlineMatchesScreen}
        options={{ headerShown: false }}
      />

      {/* ── Chat ── */}
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{ headerShown: false }}
      />

      {/* ── Notifications ── */}
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />

      {/* ── Support ── */}
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{ title: 'Help & Support' }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ title: 'Privacy Policy' }}
      />
    </Stack.Navigator>
  );
}
