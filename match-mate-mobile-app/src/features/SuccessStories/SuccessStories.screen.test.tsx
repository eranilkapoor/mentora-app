import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockGoBack = jest.fn();
const mockRefetch = jest.fn();
const mockSubmitSuccessStory = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();

let mockStoriesData: unknown;
let mockStoriesLoading = false;
let mockStoriesFetching = false;
let mockSubmitting = false;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
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

jest.mock('@/core/theme/useThemedStyles', () => ({
  useThemedStyles: () => ({}),
}));

jest.mock('@/core/components/Header', () => {
  const { Pressable, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({
      title,
      onBackPress,
    }: {
      title: string;
      onBackPress: () => void;
    }) => (
      <Pressable onPress={onBackPress}>
        <Text>{title}</Text>
      </Pressable>
    ),
  };
});

jest.mock('@/core/components/Loader', () => {
  const { Text } = require('react-native');
  return { __esModule: true, default: () => <Text>loader</Text> };
});

jest.mock('@/core/components/settings/SettingsCard', () => {
  const { Text, View } = require('react-native');
  return {
    SettingsCard: ({
      title,
      children,
    }: {
      title: string;
      children: React.ReactNode;
    }) => (
      <View>
        <Text>{title}</Text>
        {children}
      </View>
    ),
  };
});

jest.mock('@/core/utils/toast', () => ({
  showError: (params: unknown) => mockShowError(params),
  showSuccess: (params: unknown) => mockShowSuccess(params),
}));

jest.mock('@/store/services/successStoryApi.service', () => ({
  useGetMySuccessStoriesQuery: () => ({
    data: mockStoriesData,
    isLoading: mockStoriesLoading,
    isFetching: mockStoriesFetching,
    refetch: mockRefetch,
  }),
  useSubmitSuccessStoryMutation: () => [
    mockSubmitSuccessStory,
    { isLoading: mockSubmitting },
  ],
}));

import SuccessStoriesScreen from './SuccessStories.screen';

describe('SuccessStoriesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStoriesLoading = false;
    mockStoriesFetching = false;
    mockSubmitting = false;
    mockStoriesData = {
      success: true,
      data: {
        items: [
          {
            _id: 'story-1',
            title: 'Our match story',
            status: 'approved',
          },
        ],
      },
    };
    mockSubmitSuccessStory.mockReturnValue({
      unwrap: () => Promise.resolve({ success: true }),
    });
  });

  it('submits a valid success story and renders history', async () => {
    const { getByPlaceholderText, getByText } = await render(
      <SuccessStoriesScreen navigation={{ goBack: mockGoBack } as never} />
    );

    await fireEvent.press(getByText('settings.success_stories.title'));
    await fireEvent.changeText(
      getByPlaceholderText('settings.success_stories.title_placeholder'),
      'A happy beginning'
    );
    await fireEvent.changeText(
      getByPlaceholderText('settings.success_stories.partnerName_placeholder'),
      'Rohan'
    );
    await fireEvent.changeText(
      getByPlaceholderText('settings.success_stories.marriageDate_placeholder'),
      '2026-01-12'
    );
    await fireEvent.changeText(
      getByPlaceholderText('settings.success_stories.story_placeholder'),
      'We met here and our families connected quickly. The conversations were thoughtful, the match suggestions were meaningful, and both families felt comfortable from the first meeting.'
    );
    await fireEvent.press(getByText('settings.success_stories.consent'));
    await fireEvent.press(getByText('settings.success_stories.submit'));

    expect(mockGoBack).toHaveBeenCalled();
    expect(getByText('Our match story')).toBeTruthy();
    await waitFor(() => {
      expect(mockSubmitSuccessStory).toHaveBeenCalled();
      expect(mockShowSuccess).toHaveBeenCalledWith({
        title: 'settings.success_stories.submitted',
      });
    });
  });
});
