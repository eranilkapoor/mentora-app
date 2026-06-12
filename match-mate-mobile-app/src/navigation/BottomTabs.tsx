import React, { useMemo } from 'react';
import {
  View,
  Text,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { isTabletWidth } from '@/core/utils/device';
import { BottomTabParamList } from './types';
import { bottomTabsStyles } from '@/core/styles/BottomTabs.styles';

import MembershipScreen from '@/features/Membership/Membership.screen';
import HomeStack from './HomeStack';
import MatchesStack from './MatchesStack';
import ChatsStack from './ChatsStack';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator<BottomTabParamList>();

// ─── Tab Icon ─────────────────────────────────────────────────────────────────

type TabIconProps = {
  name: React.ComponentProps<typeof Feather>['name'];
  focused: boolean;
  color: string;
  badge?: number;
  badgeColor: string;
};

const TabIcon = React.memo(
  ({
    name,
    focused,
    color,
    badge,
    badgeColor,
  }: TabIconProps): React.ReactElement => {
    const tabIconStyles = useThemedStyles(bottomTabsStyles);

    return (
      <View style={tabIconStyles.wrapper}>
        <Feather name={name} size={22} color={color} />

        {badge !== undefined && badge > 0 && (
          <View style={[tabIconStyles.badge, { backgroundColor: badgeColor }]}>
            <Text style={tabIconStyles.badgeText}>
              {badge > 99 ? '99+' : badge}
            </Text>
          </View>
        )}

        {focused && (
          <View style={[tabIconStyles.dot, { backgroundColor: color }]} />
        )}
      </View>
    );
  }
);

TabIcon.displayName = 'TabIcon';

// ─── Bottom Tabs ──────────────────────────────────────────────────────────────

export default function BottomTabs(): React.ReactElement {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = isTabletWidth(width);

  const unreadCount = useAppSelector((s) => s.chats.unreadCount ?? 0);

  const screenOptions = useMemo(() => {
    const bottomInset = Math.max(
      insets.bottom,
      Platform.OS === 'android' ? 8 : 12
    );
    const tabHeight = (isTablet ? 66 : 58) + bottomInset;

    return {
      headerShown: false,
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textMuted,
      tabBarShowLabel: true,
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600' as const,
        marginTop: 0,
        marginBottom: isTablet ? 2 : 0,
      },
      tabBarStyle: {
        backgroundColor: theme.colors.surface,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.colors.divider,
        height: tabHeight,
        paddingBottom: bottomInset,
        paddingTop: isTablet ? 10 : 7,
        elevation: 12,
      },
      tabBarItemStyle: {
        paddingVertical: 0,
      },
    };
  }, [insets.bottom, isTablet, theme]);

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          popToTopOnBlur: true,
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name="home"
              focused={focused}
              color={color}
              badgeColor={theme.colors.error}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Matches"
        component={MatchesStack}
        options={{
          popToTopOnBlur: true,
          tabBarLabel: t('tabs.matches'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name="heart"
              focused={focused}
              color={color}
              badgeColor={theme.colors.error}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Chats"
        component={ChatsStack}
        options={{
          popToTopOnBlur: true,
          tabBarLabel: t('tabs.chats'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name="message-circle"
              focused={focused}
              color={color}
              badge={unreadCount}
              badgeColor={theme.colors.error}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Membership"
        component={MembershipScreen}
        options={{
          popToTopOnBlur: true,
          tabBarLabel: t('tabs.premium'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name="star"
              focused={focused}
              color={color}
              badgeColor={theme.colors.error}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          popToTopOnBlur: true,
          tabBarLabel: t('tabs.profile'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name="user"
              focused={focused}
              color={color}
              badgeColor={theme.colors.error}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
