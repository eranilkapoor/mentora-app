import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockNavigate = jest.fn();
const mockPrintToFileAsync = jest.fn();
const mockShareAsync = jest.fn();
const mockDeleteAsync = jest.fn();
const mockCopyAsync = jest.fn();
const mockShowUpgradePrompt = jest.fn();
const mockShowError = jest.fn();

jest.mock('expo-print', () => ({
  printToFileAsync: (...args: unknown[]) => mockPrintToFileAsync(...args),
  printAsync: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: (...args: unknown[]) => mockShareAsync(...args),
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///docs/',
  deleteAsync: (...args: unknown[]) => mockDeleteAsync(...args),
  copyAsync: (...args: unknown[]) => mockCopyAsync(...args),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string; count?: number }) =>
      options?.defaultValue ??
      (options?.count !== undefined ? `${key}:${options.count}` : key),
  }),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

jest.mock('react-native-vector-icons/Feather', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

jest.mock('@/core/theme/useThemedStyles', () => ({
  useThemedStyles: () => new Proxy({}, { get: () => ({}) }),
}));

jest.mock('@/core/theme/ThemeProvider', () => ({
  useTheme: () => ({
    theme: { colors: new Proxy({}, { get: () => '#111827' }) },
  }),
}));

jest.mock('../../core/components/Header', () => {
  const { Pressable, Text, View } = require('react-native');
  return {
    __esModule: true,
    default: ({
      title,
      actions,
    }: {
      title: string;
      actions?: Array<{ icon: string; onPress: () => void }>;
    }) => (
      <View>
        <Text>{title}</Text>
        {actions?.map((action) => (
          <Pressable key={action.icon} onPress={action.onPress}>
            <Text>{action.icon}</Text>
          </Pressable>
        ))}
      </View>
    ),
  };
});

jest.mock('@/core/components/media/InlineVideoPlayer', () => {
  const { Text } = require('react-native');
  return { InlineVideoPlayer: () => <Text>inline-video</Text> };
});

jest.mock('@/features/MediaSettings/useMediaSettings', () => ({
  useMediaSettings: () => ({ imageResizeMethod: 'resize' }),
}));

jest.mock('@/features/Membership/hooks/usePlanFeatureAccess', () => ({
  usePlanFeatureAccess: () => ({ hasFeature: false }),
}));

jest.mock('@/features/Membership/hooks/useUpgradePrompt', () => ({
  useUpgradePrompt: () => mockShowUpgradePrompt,
}));

jest.mock('@/core/utils/toast', () => ({
  showError: (...args: unknown[]) => mockShowError(...args),
}));

jest.mock('@/core/utils/config', () => ({
  resolveApiUrl: (url: string) => `https://cdn.test${url}`,
}));

jest.mock('@/core/utils/personalityBadges', () => ({
  getPersonalityBadgeIcon: () => 'star',
  getPersonalityBadgeLabel: (value: string) => value,
}));

jest.mock('../../core/utils/device', () => ({
  getResponsiveMediaWidth: () => 320,
}));

jest.mock('../../core/utils/format', () => ({
  annualIncomeFormat: (value: unknown) => `income:${String(value)}`,
  cmToFeetInches: (value: unknown) => `${String(value)}cm`,
  formatEnumLabel: (
    _t: unknown,
    _ns: string,
    value: unknown,
    fallback: string
  ) => (value ? String(value) : fallback),
  formatAboutMe: (value: string) => value,
  formatCamelCase: (value: string) => value,
  formatWeight: (value: unknown) => `${String(value)}kg`,
  getAgeFromDOB: () => '31',
  getFullName: (first: string, last: string) =>
    [first, last].filter(Boolean).join(' '),
}));

jest.mock('./components/ProfileSkeleton', () => {
  const { Text } = require('react-native');
  return { ProfileSkeleton: () => <Text>profile-skeleton</Text> };
});

jest.mock('./components/Section', () => {
  const { Text, View } = require('react-native');
  return {
    Section: ({
      titleKey,
      children,
    }: {
      titleKey: string;
      children: React.ReactNode;
    }) => (
      <View>
        <Text>{titleKey}</Text>
        {children}
      </View>
    ),
  };
});

jest.mock('./components/Row', () => {
  const { Text, View } = require('react-native');
  return {
    Row: ({ labelKey, value }: { labelKey: string; value: string }) => (
      <View>
        <Text>{labelKey}</Text>
        <Text>{value}</Text>
      </View>
    ),
  };
});

jest.mock('./components/TagList', () => {
  const { Text, View } = require('react-native');
  return {
    TagList: ({ items }: { items: Array<string | { label?: string }> }) => (
      <View>
        {items.map((item, index) => {
          const label =
            typeof item === 'string' ? item : (item.label ?? `tag-${index}`);
          return <Text key={label}>{label}</Text>;
        })}
      </View>
    ),
  };
});

const profile = {
  profileFor: 'self',
  personal: {
    firstName: 'Asha',
    lastName: 'Sharma',
    gender: 'female',
    dateOfBirth: '1995-01-01',
    religion: 'hindu',
    religiousDetails: { caste: 'brahmin' },
    country: 'India',
    state: 'Delhi',
    city: 'Delhi',
    maritalStatus: 'never_married',
    aboutMe: 'Kind and curious',
    smoking: 'non_smoker',
    drinking: 'non_drinker',
    eating: 'vegetarian',
    hobbies: ['Music'],
    personalityBadges: ['creative'],
    languagesKnown: ['Hindi', 'English'],
  },
  physical: { height: 164, weight: 55 },
  education: {
    qualification: 'masters',
    occupation: 'Designer',
    annualIncomeAmount: 1200000,
  },
  family: { fatherName: 'Raj', motherName: 'Nita' },
  preferences: { languagesKnown: ['Hindi'] },
  images: [{ url: '/asha.jpg', isPrimary: true, isActive: true }],
  videoIntro: null,
  profileCompletionPercentage: 86,
  profileScore: 74,
  visibilityScore: 80,
  status: 'active',
  isPremium: true,
  verification: { status: 'approved' },
  contactDetails: {
    phone: { countryCode: '+91', number: '9876543210' },
    email: { address: 'asha@example.com' },
  },
};

jest.mock('../../store/services/profileApi.service', () => ({
  useGetMyProfileQuery: () => ({
    data: { success: true, data: profile },
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: jest.fn(),
  }),
}));

jest.mock('@/store/services/privacySettingsApi.service', () => ({
  useGetPrivacySettingsQuery: () => ({
    data: {
      success: true,
      privacy: {
        showPhone: true,
        showEmail: true,
        showPhotosTo: 'everyone',
        blurPhotosForUnmatched: false,
      },
    },
  }),
}));

import ProfileScreen from './Profile.screen';

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrintToFileAsync.mockResolvedValue({ uri: 'file:///tmp/profile.pdf' });
    mockShareAsync.mockResolvedValue(undefined);
    mockDeleteAsync.mockResolvedValue(undefined);
    mockCopyAsync.mockResolvedValue(undefined);
  });

  it('renders profile contact details and wires settings, video upgrade, and PDF actions', async () => {
    const { getByLabelText, getByText } = await render(
      <ProfileScreen navigation={{ navigate: mockNavigate } as never} />
    );

    expect(getByText('Asha Sharma')).toBeTruthy();
    expect(getByText('+91 9876543210')).toBeTruthy();
    expect(getByText('asha@example.com')).toBeTruthy();

    await fireEvent.press(getByText('settings'));
    await fireEvent.press(getByText('profile.video_intro_available'));
    await fireEvent.press(getByLabelText('profile.download_pdf_label'));

    await waitFor(() => {
      expect(mockShareAsync).toHaveBeenCalled();
    });
    expect(mockNavigate).toHaveBeenCalledWith('Settings');
    expect(mockShowUpgradePrompt).toHaveBeenCalledWith(
      'profile.section_video_intro'
    );
    expect(mockPrintToFileAsync).toHaveBeenCalledWith(
      expect.objectContaining({ base64: false, html: expect.any(String) })
    );
    expect(mockCopyAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'file:///tmp/profile.pdf',
        to: expect.stringContaining('asha-sharma-profile.pdf'),
      })
    );
    expect(mockShowError).not.toHaveBeenCalled();
  });
});
