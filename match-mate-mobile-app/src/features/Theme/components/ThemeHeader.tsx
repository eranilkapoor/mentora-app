import React from 'react';
import { View, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';
import { TFunction } from 'i18next';

type Styles = {
  headerCard: StyleProp<ViewStyle>;
  headerIconWrapper: StyleProp<ViewStyle>;
  headerTitle: StyleProp<TextStyle>;
  headerSubtitle: StyleProp<TextStyle>;
};

type Props = {
  styles: Styles;
  t: TFunction;
};

export const ThemeHeader = React.memo(
  ({ styles, t }: Props): React.ReactElement => {
    const { theme } = useTheme();

    return (
      <View style={styles.headerCard}>
        <View style={styles.headerIconWrapper}>
          <Feather name="sun" size={22} color={theme.colors.primary} />
        </View>

        <Text style={styles.headerTitle}>{t('theme.select_theme')}</Text>

        <Text style={styles.headerSubtitle}>{t('theme.theme_subtitle')}</Text>
      </View>
    );
  }
);

ThemeHeader.displayName = 'ThemeHeader';
