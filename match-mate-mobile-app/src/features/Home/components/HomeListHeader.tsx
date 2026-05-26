import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { homeStyles } from '../Home.styles';
import { HomeMatchProfile } from '../Home.types';

interface StatItem {
  icon: React.ComponentProps<typeof Feather>['name'];
  value: string;
  labelKey: string;
}

interface Props {
  profiles: HomeMatchProfile[];
  matchCount: number;
  onSeeAll: () => void;
}

export function HomeListHeader({
  profiles,
  matchCount,
  onSeeAll,
}: Props): React.ReactElement {
  const styles = useThemedStyles(homeStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const stats: StatItem[] = [
    {
      icon: 'heart',
      value: String(profiles.length),
      labelKey: 'home.stat_suggested',
    },
    {
      icon: 'message-circle',
      value: String(matchCount),
      labelKey: 'home.stat_accepted',
    },
    {
      icon: 'wifi',
      value: String(profiles.filter((p) => p.isOnline).length),
      labelKey: 'home.stat_online',
    },
    {
      icon: 'star',
      value: String(profiles.filter((p) => p.isNew).length),
      labelKey: 'home.stat_new',
    },
  ];

  return (
    <>
      <View style={styles.statsRow}>
        {stats.map((stat) => (
          <View key={stat.labelKey} style={styles.statCard}>
            <Feather name={stat.icon} size={16} color={theme.colors.primary} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{t(stat.labelKey)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('home.suggested')}</Text>
        <TouchableOpacity
          style={styles.seeAllBtn}
          onPress={onSeeAll}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Text style={styles.seeAllText}>{t('common.see_all')}</Text>
          <Feather
            name="chevron-right"
            size={14}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>
    </>
  );
}
