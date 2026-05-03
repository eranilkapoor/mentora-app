import React, { useMemo } from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { BottomTabParamList } from './types';

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
  }: TabIconProps): React.ReactElement => (
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
  )
);

TabIcon.displayName = 'TabIcon';

// ─── Bottom Tabs ──────────────────────────────────────────────────────────────

export default function BottomTabs(): React.ReactElement {
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Read unread count from Redux — replace with your actual selector
  const unreadCount = useAppSelector((s) => s.chats.unreadCount ?? 0);

  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textMuted,
      tabBarShowLabel: true,
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600' as const,
        marginTop: Platform.OS === 'android' ? 0 : -2,
        marginBottom: Platform.OS === 'android' ? 4 : 0,
      },
      tabBarStyle: {
        backgroundColor: theme.colors.white,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.colors.divider,
        height: Platform.OS === 'android' ? 60 : 82,
        paddingBottom: Platform.OS === 'android' ? 8 : 24,
        paddingTop: 8,
        elevation: 12,
      },
      tabBarItemStyle: {
        paddingVertical: 0,
      },
    }),
    [theme]
  );

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const tabIconStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
});
