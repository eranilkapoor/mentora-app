import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../core/theme/ThemeProvider';
import { BottomTabParamList } from './types';

import HomeScreen from '../features/Home/HomeScreen';
import MatchListScreen from '../features/Matches/MatchListScreen';
import ProfileScreen from '../features/Profile/ProfileScreen';
import ChatListScreen from '../features/ChatList/ChatListScreen';
import MembershipScreen from '../features/Membership/MembershipScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();

// ─── Custom Tab Icon ──────────────────────────────────────────────────────────
function TabIcon({
  name,
  focused,
  color,
  badge,
}: {
  name: string;
  focused: boolean;
  color: string;
  badge?: number;
}): React.ReactElement {
  return (
    <View style={tabIconStyles.wrapper}>
      <Feather name={name} size={22} color={color} />
      {badge !== undefined && badge > 0 && (
        <View style={tabIconStyles.badge}>
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
    backgroundColor: '#E91E63',
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

// ─── Bottom Tabs ─────────────────────────────────────────────────────────────

export default function BottomTabs(): React.ReactElement {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
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
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="home" focused={focused} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Matches"
        component={MatchListScreen}
        options={{
          tabBarLabel: 'Matches',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="heart" focused={focused} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Chats"
        component={ChatListScreen}
        options={{
          tabBarLabel: 'Chats',
          tabBarBadge: 3,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name="message-circle"
              focused={focused}
              color={color}
              badge={3} // TODO: wire to unread count from Redux
            />
          ),
        }}
      />

      <Tab.Screen
        name="Membership"
        component={MembershipScreen}
        options={{
          tabBarLabel: 'Premium',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="star" focused={focused} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="user" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
