import React from 'react';

import { View, Text, TouchableOpacity } from 'react-native';

import Feather from 'react-native-vector-icons/Feather';

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

  const hasFilters = activeFilterCount > 0;

  return (
    <View style={[styles.matchToolbar, styles.matchToolbarRow]}>
      {/* Left Content */}
      <View style={styles.safe}>
        <Text style={styles.matchToolbarTitle}>
          {resultCount} Profiles Found
        </Text>

        {hasFilters ? (
          <View style={styles.hasFilterContainer}>
            <View style={styles.hasFilterContent}>
              <Feather name="sliders" size={12} color={theme.colors.primary} />

              <Text style={styles.hasFilterText}>
                {activeFilterCount} filters applied
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.matchToolbarSubtitle}>
            Discover your best matches
          </Text>
        )}
      </View>

      {/* Right Action */}
      {hasFilters ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onClearFilters}
          accessibilityRole="button"
          accessibilityLabel="Clear filters"
          style={styles.clearFilterBtn}
        >
          <Text style={styles.clearFilterBtnText}>Clear</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
