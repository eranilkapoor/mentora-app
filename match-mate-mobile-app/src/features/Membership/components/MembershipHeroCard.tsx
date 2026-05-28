import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { membershipStyles } from '../Membership.styles';
import { HERO_STATS } from '../Membership.constants';

interface Props {
  activePlanName?: string;
}

export function MembershipHeroCard({
  activePlanName,
}: Props): React.ReactElement {
  const styles = useThemedStyles(membershipStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.heroCard}>
      <View style={styles.heroBadge}>
        <Feather name="star" size={11} color={theme.colors.white} />
        <Text style={styles.heroBadgeText}>
          {t('membership.hero_badge').toUpperCase()}
        </Text>
      </View>

      <Text style={styles.heroTitle}>{t('membership.hero_title')}</Text>
      <Text style={styles.heroSubtitle}>
        {activePlanName
          ? t('membership.hero_active_plan', { plan: activePlanName })
          : t('membership.hero_subtitle')}
      </Text>

      <View style={styles.heroStats}>
        {HERO_STATS.map((stat) => (
          <View key={stat.labelKey} style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{t(stat.valueKey)}</Text>
            <Text style={styles.heroStatLabel}>{t(stat.labelKey)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
