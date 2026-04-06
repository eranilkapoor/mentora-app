import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../core/theme/ThemeProvider';

import HomeScreen from '../screens/Home/HomeScreen';
import MatchListScreen from '../screens/Matches/MatchListScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ChatsListScreen from '../screens/Chats/ChatsListScreen';
import MembershipScreen from '../screens/Membership/MembershipScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name="home-outline"
              size={focused ? size + 2 : size}
              color={focused ? theme.colors.primary : color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Matches"
        component={MatchListScreen}
        options={{
          tabBarLabel: 'Matches',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name="heart-outline"
              size={focused ? size + 2 : size}
              color={focused ? theme.colors.primary : color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Chats"
        component={ChatsListScreen}
        options={{
          tabBarLabel: 'Chats',
          tabBarBadge: 3,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name="chatbubble-outline"
              size={focused ? size + 2 : size}
              color={focused ? theme.colors.primary : color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name="person-outline"
              size={focused ? size + 2 : size}
              color={focused ? theme.colors.primary : color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Membership"
        component={MembershipScreen}
        options={{
          tabBarLabel: 'Membership',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name="card-outline"
              size={focused ? size + 2 : size}
              color={focused ? theme.colors.primary : color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
