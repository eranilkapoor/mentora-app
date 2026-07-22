import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { StyleSheet, View } from 'react-native';
import { SocialButton } from './SocialButton';

const styles = StyleSheet.create({
  storyContainer: {
    width: '100%',
    maxWidth: 360,
    padding: 16,
  },
});

const meta = {
  title: 'Auth/SocialButton',
  component: SocialButton,
  decorators: [
    (Story) => (
      <View style={styles.storyContainer}>
        <Story />
      </View>
    ),
  ],
  args: {
    label: 'Continue with Google',
    icon: 'chrome',
    iconColor: '#4285F4',
    disabled: false,
    onPress: () => undefined,
  },
} satisfies Meta<typeof SocialButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Google: Story = {};

export const Facebook: Story = {
  args: {
    label: 'Continue with Facebook',
    icon: 'facebook',
    iconColor: '#1877F2',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
