import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { matchListStyles } from '../MatchList.styles';

interface Props {
  resultCount: number;
  activeFilterCount: number;
  onClearFilters: () => void;
}

export function MatchListToolbar({
  resultCount,
  activeFilterCount,
  onClearFilters,
}: Props): React.ReactElement {
  const styles = useThemedStyles(matchListStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const hasFilters = activeFilterCount > 0;

  return (
    <View style={styles.matchToolbar}>
      <View style={styles.matchToolbarRow}>
        {/* Left content */}
        <View style={styles.matchToolbarLeft}>
          <Text style={styles.matchToolbarTitle}>
            {t('matches.toolbar_profiles_found', { count: resultCount })}
          </Text>

          {hasFilters ? (
            <View style={styles.hasFilterContainer}>
              <View style={styles.hasFilterContent}>
                <Feather
                  name="sliders"
                  size={12}
                  color={theme.colors.primary}
                />
                <Text style={styles.hasFilterText}>
                  {t('matches.toolbar_filters_applied', {
                    count: activeFilterCount,
                  })}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.matchToolbarSubtitle}>
              {t('matches.toolbar_subtitle')}
            </Text>
          )}
        </View>

        {/* Right action */}
        {hasFilters ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClearFilters}
            accessibilityRole="button"
            accessibilityLabel={t('matches.clear_filters')}
            style={styles.clearFilterBtn}
          >
            <Text style={styles.clearFilterBtnText}>
              {t('matches.clear_filters')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
