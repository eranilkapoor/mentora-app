import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { matchDetailStyles } from '../MatchDetail.styles';
import { PrimaryAction } from '../MatchDetail.types';

interface Props {
  primaryAction: PrimaryAction;
  onBack: () => void;
}

export function MatchDetailCta({
  primaryAction,
  onBack,
}: Props): React.ReactElement {
  const styles = useThemedStyles(matchDetailStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const safeBottomPadding = Math.max(insets.bottom, 12) + 12;

  return (
    <View style={[styles.cta, { paddingBottom: safeBottomPadding }]}>
      <TouchableOpacity
        style={styles.ctaOutline}
        onPress={onBack}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
      >
        <Feather name="arrow-left" size={16} color={theme.colors.primary} />
        <Text style={styles.ctaOutlineText}>{t('common.back')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.ctaPrimary,
          primaryAction.disabled && styles.ctaPrimaryDisabled,
        ]}
        onPress={() => {
          void primaryAction.onPress();
        }}
        disabled={primaryAction.disabled}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={t(primaryAction.labelKey)}
      >
        <Feather
          name={primaryAction.icon as never}
          size={16}
          color={theme.colors.white}
        />
        <Text style={styles.ctaPrimaryText}>{t(primaryAction.labelKey)}</Text>
      </TouchableOpacity>
    </View>
  );
}
