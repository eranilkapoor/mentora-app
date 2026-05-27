import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { matchListStyles } from '../MatchList.styles';
import { AGE_FILTERS, CASTE_FILTERS } from '../MatchList.constants';
import { AgeRangeKey, CasteFilterKey, FilterState } from '../MatchList.types';

interface Props {
  query: string;
  onQueryChange: (v: string) => void;
  filters: FilterState;
  onFiltersChange: (patch: Partial<FilterState>) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  resultCount: number;
}

export function MatchListHeader({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  showFilters,
  onToggleFilters,
  onClearFilters,
  activeFilterCount,
  resultCount,
}: Props): React.ReactElement {
  const styles = useThemedStyles(matchListStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.searchWrapper}>
      {/* ── Search bar + filter toggle ─────────────────────────── */}
      <View style={styles.searchHeaderRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={theme.colors.textMuted} />
          <TextInput
            placeholder={t('matches.search_placeholder')}
            placeholderTextColor={theme.colors.textMuted}
            style={styles.searchInput}
            value={query}
            onChangeText={onQueryChange}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel={t('matches.search_placeholder')}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => onQueryChange('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={t('common.clear')}
            >
              <Feather name="x" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterToggle,
            showFilters && styles.filterToggleActive,
          ]}
          onPress={onToggleFilters}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t('matches.toggle_filters')}
          accessibilityState={{ expanded: showFilters }}
        >
          <Feather
            name="sliders"
            size={16}
            color={showFilters ? theme.colors.white : theme.colors.primary}
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterCountBadge}>
              <Text style={styles.filterCountText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Results count + clear ──────────────────────────────── */}
      <View style={styles.resultsBarCompact}>
        <Text style={styles.resultsText}>
          <Text style={styles.resultsHighlight}>{resultCount}</Text>{' '}
          {t('matches.profiles_found', { count: resultCount })}
        </Text>
        {activeFilterCount > 0 && (
          <TouchableOpacity onPress={onClearFilters} accessibilityRole="button">
            <Text style={styles.clearFiltersText}>
              {t('matches.clear_filters')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Filter panel ──────────────────────────────────────────── */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <View style={styles.filterPanelHeader}>
            <Text style={styles.filterPanelTitle}>
              {t('matches.filter_panel_title')}
            </Text>
            <Text style={styles.filterPanelSubtitle}>
              {t('matches.filter_panel_subtitle')}
            </Text>
          </View>

          {/* City */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>{t('matches.filter_city')}</Text>
            <View style={styles.filterInputBox}>
              <Feather
                name="map-pin"
                size={16}
                color={theme.colors.textMuted}
              />
              <TextInput
                placeholder={t('matches.filter_city_placeholder')}
                placeholderTextColor={theme.colors.textMuted}
                style={styles.searchInput}
                value={filters.cityFilter}
                onChangeText={(v) => onFiltersChange({ cityFilter: v })}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="search"
              />
              {filters.cityFilter.length > 0 && (
                <TouchableOpacity
                  onPress={() => onFiltersChange({ cityFilter: '' })}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="x" size={16} color={theme.colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Age */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>{t('matches.filter_age')}</Text>
            <View style={styles.filterChipRow}>
              {AGE_FILTERS.map((item) => {
                const selected = filters.ageFilter === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.filterChip,
                      selected && styles.filterChipActive,
                    ]}
                    onPress={() =>
                      onFiltersChange({ ageFilter: item.key as AgeRangeKey })
                    }
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selected && styles.filterChipTextActive,
                      ]}
                    >
                      {t(item.labelKey)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Caste */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>{t('matches.filter_caste')}</Text>
            <View style={styles.filterChipRow}>
              {CASTE_FILTERS.map((item) => {
                const selected = filters.casteFilter === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.filterChip,
                      selected && styles.filterChipActive,
                    ]}
                    onPress={() =>
                      onFiltersChange({
                        casteFilter: item.key as CasteFilterKey,
                      })
                    }
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selected && styles.filterChipTextActive,
                      ]}
                    >
                      {t(item.labelKey)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Verified only */}
          <TouchableOpacity
            style={[
              styles.verifiedToggle,
              filters.verifiedOnly && styles.verifiedToggleActive,
            ]}
            onPress={() =>
              onFiltersChange({ verifiedOnly: !filters.verifiedOnly })
            }
            activeOpacity={0.8}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: filters.verifiedOnly }}
          >
            <Feather
              name={filters.verifiedOnly ? 'check-circle' : 'circle'}
              size={16}
              color={
                filters.verifiedOnly
                  ? theme.colors.white
                  : theme.colors.textSecondary
              }
            />
            <Text
              style={[
                styles.verifiedToggleText,
                filters.verifiedOnly && styles.verifiedToggleTextActive,
              ]}
            >
              {t('matches.filter_verified_only')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
