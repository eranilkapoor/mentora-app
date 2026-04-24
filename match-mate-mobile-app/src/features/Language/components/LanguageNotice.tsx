import React from 'react';
import { View, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';
import { TFunction } from 'i18next';

type Styles = {
  noticeCard: StyleProp<ViewStyle>;
  noticeText: StyleProp<TextStyle>;
};

type Props = {
  styles: Styles;
  t: TFunction;
};

export const LanguageNotice = React.memo(
  ({ styles, t }: Props): React.ReactElement => {
    const { theme } = useTheme();

    return (
      <View style={styles.noticeCard}>
        <Feather name="info" size={15} color={theme.colors.primary} />
        <Text style={styles.noticeText}>{t('language.language_notice')}</Text>
      </View>
    );
  }
);

LanguageNotice.displayName = 'LanguageNotice';
