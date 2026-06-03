import React from 'react';

import { View, Text, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/core/theme/ThemeProvider';

import { useThemedStyles } from '@/core/theme/useThemedStyles';

import { communicationSettingsStyles } from '../CommunicationSettings.styles';

interface Props {
  value: string;

  onChangeText: (value: string) => void;

  onSubmitEditing?: () => void;
}

export function AutoReplyInput({
  value,
  onChangeText,
  onSubmitEditing,
}: Props): React.ReactElement {
  const styles = useThemedStyles(communicationSettingsStyles);

  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>
        {t('settings.communication.auto_reply_message')}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={t('settings.communication.auto_reply_placeholder')}
        placeholderTextColor={theme.colors.textMuted}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        style={styles.input}
        onBlur={onSubmitEditing}
      />
    </View>
  );
}
