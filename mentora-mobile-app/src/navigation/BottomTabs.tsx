import React, { useMemo } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { bottomTabsStyles } from '@/core/styles/BottomTabs.styles';
import { isTabletWidth } from '@/core/utils/device';
import { isParentRole } from '@/core/utils/role';
import { useAppSelector } from '@/store/hooks';
import LearningTabScreen from '@/features/LearningShell/LearningTab.screen';
import HomeStack from './HomeStack';
import ProfileStack from './ProfileStack';
import { BottomTabParamList } from './types';

const Tab = createBottomTabNavigator<BottomTabParamList>();

const INITIAL_TAB_ROUTES = {
  Home: { screen: 'HomeScreen' },
  Profile: { screen: 'ProfileScreen' },
} as const;

type TabIconProps = {
  name: React.ComponentProps<typeof Feather>['name'];
  focused: boolean;
  color: string;
  badgeColor: string;
};

const TabIcon = React.memo(
  ({ name, focused, color, badgeColor }: TabIconProps): React.ReactElement => {
    const tabIconStyles = useThemedStyles(bottomTabsStyles);

    return (
      <View style={tabIconStyles.wrapper}>
        <Feather name={name} size={22} color={color} />
        {focused && (
          <View style={[tabIconStyles.dot, { backgroundColor: badgeColor }]} />
        )}
      </View>
    );
  }
);

TabIcon.displayName = 'TabIcon';

export default function BottomTabs(): React.ReactElement {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = isTabletWidth(width);
  const isParentMode = useAppSelector((state) =>
    isParentRole(state.auth.user?.roles)
  );

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
        listeners={({ navigation }) => ({
          tabPress: (event) => {
            event.preventDefault();
            navigation.navigate('Home', INITIAL_TAB_ROUTES.Home);
          },
        })}
        options={{
          popToTopOnBlur: true,
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name="home"
              focused={focused}
              color={color}
              badgeColor={theme.colors.primary}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Learn"
        children={() => (
          <LearningTabScreen
            mode="learn"
            title={isParentMode ? 'Children' : 'Learn'}
            subtitle={
              isParentMode
                ? 'Manage student profiles, subjects, parental controls, and learning access.'
                : 'Continue subjects, AI tutoring, practice, assessments, and study materials.'
            }
            items={
              isParentMode
                ? [
                    'Child profiles',
                    'Academic records',
                    'Subject enrollments',
                    'Parental controls',
                  ]
                : ['My subjects', 'AI tutor', 'Practice', 'Assessments']
            }
          />
        )}
        options={{
          tabBarLabel: isParentMode ? t('tabs.children') : t('tabs.learn'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={isParentMode ? 'users' : 'book-open'}
              focused={focused}
              color={color}
              badgeColor={theme.colors.primary}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Schedule"
        children={() => (
          <LearningTabScreen
            mode="schedule"
            title="Schedule"
            subtitle="Create and review AI tutor sessions, assessments, reminders, and learning events."
            items={[
              'Upcoming sessions',
              'Calendar',
              'Create session',
              'Session history',
            ]}
          />
        )}
        options={{
          tabBarLabel: t('tabs.schedule'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name="calendar"
              focused={focused}
              color={color}
              badgeColor={theme.colors.primary}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Progress"
        children={() => (
          <LearningTabScreen
            mode="progress"
            title={isParentMode ? 'Dashboard' : 'Progress'}
            subtitle={
              isParentMode
                ? 'Review learning time, attendance, assessments, payments, and safety alerts.'
                : 'Track topic mastery, assessment scores, learning time, and recommendations.'
            }
            items={
              isParentMode
                ? [
                    'Child summaries',
                    'Upcoming sessions',
                    'Subscription usage',
                    'Recent activity',
                  ]
                : [
                    'Subject progress',
                    'Topic mastery',
                    'Assessment scores',
                    'Recommendations',
                  ]
            }
          />
        )}
        options={{
          tabBarLabel: isParentMode ? t('tabs.dashboard') : t('tabs.progress'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={isParentMode ? 'grid' : 'trending-up'}
              focused={focused}
              color={color}
              badgeColor={theme.colors.primary}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        listeners={({ navigation }) => ({
          tabPress: (event) => {
            event.preventDefault();
            navigation.navigate('Profile', INITIAL_TAB_ROUTES.Profile);
          },
        })}
        options={{
          popToTopOnBlur: true,
          tabBarLabel: t('tabs.profile'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name="user"
              focused={focused}
              color={color}
              badgeColor={theme.colors.primary}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
