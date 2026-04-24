import React from 'react';
import { View, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';
import { TFunction } from 'i18next';

type Styles = {
  infoCard: StyleProp<ViewStyle>;
  infoText: StyleProp<TextStyle>;
};

type Props = {
  styles: Styles;
  t: TFunction;
};

export const ThemeInfo = React.memo(
  ({ styles, t }: Props): React.ReactElement => {
    const { theme } = useTheme();

    return (
      <View style={styles.infoCard}>
        <Feather name="info" size={15} color={theme.colors.primary} />
        <Text style={styles.infoText}>{t('theme.theme_info')}</Text>
      </View>
    );
  }
);

ThemeInfo.displayName = 'ThemeInfo';
