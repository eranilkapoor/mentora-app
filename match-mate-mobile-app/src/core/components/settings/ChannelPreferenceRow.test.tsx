import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ChannelPreferenceRow } from './ChannelPreferenceRow';

jest.mock('@/core/theme/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        border: '#E5E7EB',
        divider: '#E5E7EB',
        primary: '#7C3AED',
        switchTrackOff: '#D1D5DB',
        textMuted: '#6B7280',
        textPrimary: '#111827',
        white: '#FFFFFF',
      },
    },
    fontScale: 1,
    accessibility: { boldText: false },
  }),
}));

jest.mock('@/core/theme/accessibilityStyles', () => ({
  applyAccessibilityToStyles: (styles: unknown) => styles,
}));

describe('ChannelPreferenceRow', () => {
  const value = {
    inApp: true,
    push: true,
    email: false,
    sms: false,
  };

  it('updates enabled channel switches', async () => {
    const onChange = jest.fn();

    const { getByTestId } = await render(
      <ChannelPreferenceRow
        label="Profile Viewed"
        value={value}
        onChange={onChange}
      />
    );

    await fireEvent(
      getByTestId('Profile Viewed-push-notification-channel'),
      'valueChange',
      false
    );

    expect(onChange).toHaveBeenCalledWith('push', false);
  }, 10_000);

  it('opens locked-channel handler when a disabled paid channel is tapped', async () => {
    const onChange = jest.fn();
    const onDisabledChannelPress = jest.fn();

    const { getByTestId } = await render(
      <ChannelPreferenceRow
        label="Profile Viewed"
        value={value}
        disabledChannels={{ email: true, sms: true }}
        onChange={onChange}
        onDisabledChannelPress={onDisabledChannelPress}
      />
    );

    await fireEvent.press(
      getByTestId('Profile Viewed-email-notification-channel-locked')
    );
    await fireEvent.press(
      getByTestId('Profile Viewed-sms-notification-channel-locked')
    );

    expect(onChange).not.toHaveBeenCalled();
    expect(onDisabledChannelPress).toHaveBeenNthCalledWith(1, 'email');
    expect(onDisabledChannelPress).toHaveBeenNthCalledWith(2, 'sms');
  }, 10_000);
});
