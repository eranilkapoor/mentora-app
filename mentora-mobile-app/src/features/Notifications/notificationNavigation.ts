import { navigationRef } from '@/navigation/navigationRef';

export interface NotificationAction {
  screen: string;
  params?: Record<string, unknown>;
}

export const navigateFromNotificationAction = (
  action?: NotificationAction,
  fallback?: {
    actorId?: string;
    title?: string;
    image?: string;
  }
): boolean => {
  if (!action?.screen || !navigationRef.isReady()) {
    return false;
  }

  const rootNavigation = navigationRef as unknown as {
    navigate: (name: string, params?: unknown) => void;
  };

  if (action.screen === 'ChatDetails') {
    const userId =
      typeof action.params?.userId === 'string'
        ? action.params.userId
        : fallback?.actorId;

    if (!userId) {
      return false;
    }

    rootNavigation.navigate('App', {
      screen: 'Tabs',
      params: {
        screen: 'Chats',
        params: {
          screen: 'ChatDetails',
          params: {
            userId,
            roomId:
              typeof action.params?.roomId === 'string'
                ? action.params.roomId
                : undefined,
            partnerName: fallback?.title ?? 'Chat',
            partnerPhoto: fallback?.image ?? '',
          },
        },
      },
    });
    return true;
  }

  if (action.screen === 'MatchDetails') {
    const userId =
      typeof action.params?.userId === 'string'
        ? action.params.userId
        : fallback?.actorId;

    if (!userId) {
      return false;
    }

    rootNavigation.navigate('App', {
      screen: 'Tabs',
      params: {
        screen: 'Matches',
        params: {
          screen: 'MatchDetails',
          params: { userId },
        },
      },
    });
    return true;
  }

  if (action.screen === 'Notifications') {
    rootNavigation.navigate('App', {
      screen: 'Tabs',
      params: {
        screen: 'Home',
        params: { screen: 'Notifications' },
      },
    });
    return true;
  }

  if (action.screen === 'Matches') {
    rootNavigation.navigate('App', {
      screen: 'Tabs',
      params: { screen: 'Matches' },
    });
    return true;
  }

  return false;
};

export const parseNotificationAction = (
  value: unknown
): NotificationAction | undefined => {
  if (!value) return undefined;

  if (typeof value === 'string') {
    try {
      return parseNotificationAction(JSON.parse(value));
    } catch {
      return undefined;
    }
  }

  if (typeof value !== 'object') return undefined;

  const action = value as Record<string, unknown>;
  if (typeof action.screen !== 'string') return undefined;

  const parsed: NotificationAction = { screen: action.screen };
  if (action.params && typeof action.params === 'object') {
    parsed.params = action.params as Record<string, unknown>;
  }

  return parsed;
};
