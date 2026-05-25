import React from 'react';

import { View, Text, TextInput } from 'react-native';

import { useTheme } from '@/core/theme/ThemeProvider';

import { useThemedStyles } from '@/core/theme/useThemedStyles';

import { communicationSettingsStyles } from '../CommunicationSettings.styles';

interface Props {
  value: string;

  onChangeText: (value: string) => void;
}

export function AutoReplyInput({
  value,
  onChangeText,
}: Props): React.ReactElement {
  const styles = useThemedStyles(communicationSettingsStyles);

  const { theme } = useTheme();

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>Auto Reply Message</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="I'm currently unavailable. Will reply soon."
        placeholderTextColor={theme.colors.textMuted}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        style={styles.input}
      />
    </View>
  );
}
