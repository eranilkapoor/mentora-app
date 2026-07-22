import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
const mockShowConfirm = jest.fn();
const mockHandlePrimaryAction = jest.fn();
const mockHandleRejectRequest = jest.fn();
const mockHandleDismissCurated = jest.fn();
const mockHandleShortlist = jest.fn();
const mockSetPage = jest.fn();

jest.mock('expo-location', () => ({
  PermissionStatus: {
    UNDETERMINED: 'undetermined',
    GRANTED: 'granted',
  },
  Accuracy: { Balanced: 3 },
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

jest.mock('@/core/theme/useThemedStyles', () => ({
  useThemedStyles: () => ({}),
}));

jest.mock('@/core/theme/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      colors: new Proxy(
        {},
        {
          get: () => '#111827',
        }
      ),
    },
  }),
}));

jest.mock('@/core/components/Header', () => {
  const { Pressable, Text, View } = require('react-native');
  return {
    __esModule: true,
    default: ({
      title,
      actions,
    }: {
      title: string;
      actions?: Array<{ icon: string; badge?: boolean; onPress: () => void }>;
    }) => (
      <View>
        <Text>{title}</Text>
        {actions?.map((action) => (
          <Pressable key={action.icon} onPress={action.onPress}>
            <Text>{action.icon}</Text>
            {action.badge ? <Text>{`${action.icon}-badge`}</Text> : null}
          </Pressable>
        ))}
      </View>
    ),
  };
});

jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      auth: { user: { userId: 'me' } },
      settings: { locationSharing: false },
    }),
}));

jest.mock('@/store/services/profileApi.service', () => ({
  useGetMyProfileMediaImagesQuery: () => ({
    data: { data: [{ isPrimary: true, url: '/me.jpg' }] },
  }),
  useUpdateProfileLocationMutation: () => [
    jest.fn(() => ({ unwrap: () => Promise.resolve({}) })),
  ],
}));

jest.mock('@/store/services/localizationSettingsApi.service', () => ({
  useUpdateLocalizationSettingsMutation: () => [
    jest.fn(() => ({ unwrap: () => Promise.resolve({}) })),
  ],
}));

jest.mock('@/store/services/matchApi.service', () => ({
  useGetDiscoveryProfilesQuery: () => ({
    data: { data: [], meta: { total: 0 } },
  }),
}));

jest.mock('@/store/slices/settings.slice', () => ({
  setLocationSharing: (value: boolean) => ({
    type: 'settings/setLocationSharing',
    payload: value,
  }),
}));

jest.mock('@/core/utils/device', () => ({ getDeviceId: () => 'device-1' }));
jest.mock('@/core/utils/storage', () => ({
  Storage: { getItem: jest.fn(), setItem: jest.fn() },
}));
jest.mock('@/core/utils/toast', () => ({
  showError: jest.fn(),
}));
jest.mock('@/core/utils/confirm', () => ({
  showConfirm: (params: unknown) => mockShowConfirm(params),
}));

const matchItem = {
  id: 'match-1',
  name: 'Asha',
  age: 29,
  height: '5 ft 4 in',
  religion: 'Hindu',
  caste: 'Any',
  education: 'MBA',
  profession: 'Designer',
  location: 'Delhi',
  avatarUrl: '/asha.jpg',
  isOnline: true,
  isNew: false,
  isMatched: false,
  isShortlisted: false,
  isInterestPending: false,
  shouldBlurPhoto: false,
};

jest.mock('./hooks/useMatchListData', () => ({
  useMatchListData: () => ({
    visibleMatches: [matchItem],
    matches: [matchItem],
    acceptedMatches: [],
    shortlistedMatches: [],
    requestMatches: [],
    activeMeta: { hasNextPage: false },
    activeLoading: false,
    activeFetching: false,
    activeError: null,
    refetch: jest.fn(),
    refetchMyMatches: jest.fn(),
    refetchShortlisted: jest.fn(),
    refetchShortlistedStatus: jest.fn(),
    refetchSentInterests: jest.fn(),
    refetchReceivedInterests: jest.fn(),
  }),
}));

jest.mock('./hooks/useMatchListActions', () => ({
  useMatchListActions: () => ({
    handlePrimaryAction: mockHandlePrimaryAction,
    handleOpenChat: jest.fn(),
    handleRejectRequest: mockHandleRejectRequest,
    handleDismissCurated: mockHandleDismissCurated,
    handleShortlist: mockHandleShortlist,
  }),
}));

jest.mock('./components/MatchCard', () => {
  const { Pressable, Text, View } = require('react-native');
  return {
    MatchCard: ({
      item,
      onViewProfile,
      onPrimaryAction,
      onRejectRequest,
      onDismissCurated,
      onShortlist,
    }: {
      item: { name: string };
      onViewProfile: () => void;
      onPrimaryAction: () => void;
      onRejectRequest: () => void;
      onDismissCurated: () => void;
      onShortlist: () => void;
    }) => (
      <View>
        <Text>{item.name}</Text>
        <Pressable onPress={onViewProfile}>
          <Text>match-view</Text>
        </Pressable>
        <Pressable onPress={onPrimaryAction}>
          <Text>match-primary</Text>
        </Pressable>
        <Pressable onPress={onRejectRequest}>
          <Text>match-reject</Text>
        </Pressable>
        <Pressable onPress={onDismissCurated}>
          <Text>match-dismiss</Text>
        </Pressable>
        <Pressable onPress={onShortlist}>
          <Text>match-shortlist</Text>
        </Pressable>
      </View>
    ),
  };
});

jest.mock('./components/MatchTabs', () => {
  const { Pressable, Text, View } = require('react-native');
  return {
    MatchTabs: ({
      tabs,
      onTabChange,
    }: {
      tabs: Array<{ key: string; labelKey: string }>;
      onTabChange: (key: string) => void;
    }) => (
      <View>
        {tabs.map((tab) => (
          <Pressable key={tab.key} onPress={() => onTabChange(tab.key)}>
            <Text>{tab.key}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => onTabChange('nearby')}>
          <Text>nearby</Text>
        </Pressable>
      </View>
    ),
  };
});

jest.mock('./components/MatchEmpty', () => {
  const { Text } = require('react-native');
  return { MatchEmpty: () => <Text>match-empty</Text> };
});

jest.mock('./components/MatchFilterModal', () => {
  const { Pressable, Text } = require('react-native');
  return {
    MatchFilterModal: ({
      visible,
      onApply,
    }: {
      visible: boolean;
      onApply: () => void;
    }) =>
      visible ? (
        <Pressable onPress={onApply}>
          <Text>filter-modal-open</Text>
        </Pressable>
      ) : null,
  };
});

jest.mock('./components/MatchSuccessModal', () => {
  const { Text } = require('react-native');
  return { MatchSuccessModal: () => <Text>match-success-modal</Text> };
});

jest.mock('./components/MatchListToolbar', () => {
  const { Text } = require('react-native');
  return {
    MatchListToolbar: ({ resultCount }: { resultCount: number }) => (
      <Text>{`results:${resultCount}`}</Text>
    ),
  };
});

import MatchListScreen from './MatchList.screen';

describe('MatchListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('wires filters, nearby confirmation, and match card actions', async () => {
    const { getAllByText, getByText } = await render(
      <MatchListScreen navigation={{ navigate: mockNavigate } as never} />
    );

    await fireEvent.press(getByText('sliders'));
    expect(getByText('filter-modal-open')).toBeTruthy();

    const nearbyTab = getAllByText('nearby')[0]!;
    expect(nearbyTab).toBeTruthy();
    await fireEvent.press(nearbyTab);
    expect(mockShowConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'matches.nearby_location_enable_title',
      })
    );

    await fireEvent.press(getByText('match-view'));
    await fireEvent.press(getByText('match-primary'));
    await fireEvent.press(getByText('match-reject'));
    await fireEvent.press(getByText('match-dismiss'));
    await fireEvent.press(getByText('match-shortlist'));

    expect(mockNavigate).toHaveBeenCalledWith('MatchDetails', {
      userId: 'match-1',
    });
    expect(mockHandlePrimaryAction).toHaveBeenCalledWith(matchItem);
    expect(mockHandleRejectRequest).toHaveBeenCalledWith(matchItem);
    expect(mockHandleDismissCurated).toHaveBeenCalledWith(matchItem);
    expect(mockHandleShortlist).toHaveBeenCalledWith(matchItem);
    expect(mockSetPage).not.toHaveBeenCalled();
  });
});
