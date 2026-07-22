import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useTheme } from '@/core/theme/ThemeProvider';
import { getSharedScreenOptions } from './sharedScreenOptions';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearPostOnboardingTarget } from '@/store/slices/auth.slice';

import BottomTabs from './BottomTabs';
import SettingsStack from './SettingsStack';
import { AppNavigationProp, AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

type SettingsEntryTarget = 'EditProfile' | 'PrivacySettings';
type TabEntryTarget = 'Learn' | 'Schedule' | 'Progress' | 'Profile';

const SETTINGS_TARGETS = new Set<SettingsEntryTarget>([
  'EditProfile',
  'PrivacySettings',
]);
const TAB_TARGETS = new Set<TabEntryTarget>([
  'Learn',
  'Schedule',
  'Progress',
  'Profile',
]);

const isSettingsEntryTarget = (
  value: string | null
): value is SettingsEntryTarget =>
  SETTINGS_TARGETS.has(value as SettingsEntryTarget);

const isTabEntryTarget = (value: string | null): value is TabEntryTarget =>
  TAB_TARGETS.has(value as TabEntryTarget);

export default function AppStack(): React.ReactElement {
  const { theme, reduceAnimations } = useTheme();
  const navigation = useNavigation<AppNavigationProp>();
  const dispatch = useAppDispatch();
  const postOnboardingTarget = useAppSelector(
    (s) => s.auth.postOnboardingTarget
  );

  useEffect(() => {
    if (!postOnboardingTarget) {
      return;
    }

    if (isSettingsEntryTarget(postOnboardingTarget)) {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: 'Tabs' },
            {
              name: 'Settings',
              params: { screen: postOnboardingTarget },
            },
          ],
        })
      );
    } else if (isTabEntryTarget(postOnboardingTarget)) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'Tabs',
              params: { screen: postOnboardingTarget },
            },
          ],
        })
      );
    }

    dispatch(clearPostOnboardingTarget());
  }, [dispatch, navigation, postOnboardingTarget]);

  return (
    <Stack.Navigator
      screenOptions={getSharedScreenOptions(theme, reduceAnimations)}
    >
      <Stack.Screen name="Tabs" component={BottomTabs} />
      <Stack.Screen name="Settings" component={SettingsStack} />
    </Stack.Navigator>
  );
}
