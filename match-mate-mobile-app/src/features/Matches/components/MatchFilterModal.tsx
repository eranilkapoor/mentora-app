import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { matchListStyles } from '../MatchList.styles';
import {
  ActivityFilterKey,
  AgeRangeKey,
  CasteFilterKey,
  EducationFilterKey,
  FilterState,
  HeightFilterKey,
  MaritalStatusFilterKey,
} from '../MatchList.types';
import {
  ACTIVITY_FILTERS,
  AGE_FILTERS,
  CASTE_FILTERS,
  EDUCATION_FILTERS,
  HEIGHT_FILTERS,
  MARITAL_STATUS_FILTERS,
  QUICK_TOGGLES,
} from '../MatchList.constants';
import { FilterSection } from './FilterSection';

interface Props {
  visible: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (v: string) => void;
  filters: FilterState;
  onFiltersChange: (patch: Partial<FilterState>) => void;
  onApply: () => void;
  onClear: () => void;
}

export function MatchFilterModal({
  visible,
  onClose,
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  onApply,
  onClear,
}: Props): React.ReactElement {
  const styles = useThemedStyles(matchListStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ): void => {
    onFiltersChange({ [key]: value } as Partial<FilterState>);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      hardwareAccelerated
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.filterModalOverlay}
      >
        <View style={styles.filterModalSheet}>
          {/* Handle */}
          <View style={styles.filterModalHandle} />

          {/* Header */}
          <View style={styles.filterModalHeader}>
            <View style={styles.matchToolbarLeft}>
              <Text style={styles.filterModalTitle}>
                {t('matches.filter_modal_title')}
              </Text>
              <Text style={styles.filterModalSubtitle}>
                {t('matches.filter_modal_subtitle')}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              style={styles.filterCloseBtn}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
            >
              <Feather name="x" size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Search */}
            <View style={styles.filterSearchBox}>
              <Feather name="search" size={18} color={theme.colors.textMuted} />
              <TextInput
                placeholder={t('matches.filter_search_placeholder')}
                placeholderTextColor={theme.colors.textMuted}
                value={query}
                onChangeText={onQueryChange}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                style={styles.filterSearchInput}
                accessibilityLabel={t('matches.filter_search_placeholder')}
              />
              {query.length > 0 ? (
                <TouchableOpacity
                  onPress={() => onQueryChange('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.clear')}
                >
                  <Feather
                    name="x-circle"
                    size={18}
                    color={theme.colors.textMuted}
                  />
                </TouchableOpacity>
              ) : null}
            </View>

            <FilterSection
              titleKey="matches.filter_section_age"
              items={AGE_FILTERS}
              value={filters.ageFilter}
              onChange={(v) => updateFilter('ageFilter', v as AgeRangeKey)}
            />
            <FilterSection
              titleKey="matches.filter_section_height"
              items={HEIGHT_FILTERS}
              value={filters.heightFilter}
              onChange={(v) =>
                updateFilter('heightFilter', v as HeightFilterKey)
              }
            />
            <FilterSection
              titleKey="matches.filter_section_marital"
              items={MARITAL_STATUS_FILTERS}
              value={filters.maritalStatusFilter}
              onChange={(v) =>
                updateFilter('maritalStatusFilter', v as MaritalStatusFilterKey)
              }
            />
            <FilterSection
              titleKey="matches.filter_section_caste"
              items={CASTE_FILTERS}
              value={filters.casteFilter}
              onChange={(v) => updateFilter('casteFilter', v as CasteFilterKey)}
            />
            <FilterSection
              titleKey="matches.filter_section_education"
              items={EDUCATION_FILTERS}
              value={filters.educationFilter}
              onChange={(v) =>
                updateFilter('educationFilter', v as EducationFilterKey)
              }
            />
            <FilterSection
              titleKey="matches.filter_section_activity"
              items={ACTIVITY_FILTERS}
              value={filters.activityFilter}
              onChange={(v) =>
                updateFilter('activityFilter', v as ActivityFilterKey)
              }
            />

            {/* Quick toggles */}
            <View style={styles.filterQuickToggleGroup}>
              {QUICK_TOGGLES.map((toggle) => (
                <QuickToggle
                  key={toggle.key}
                  labelKey={toggle.labelKey}
                  icon={toggle.icon}
                  value={Boolean(filters[toggle.key])}
                  onPress={() => updateFilter(toggle.key, !filters[toggle.key])}
                />
              ))}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.filterModalFooter}>
            <TouchableOpacity
              onPress={onClear}
              activeOpacity={0.85}
              style={styles.filterClearButton}
              accessibilityRole="button"
            >
              <Text style={styles.filterClearButtonText}>
                {t('matches.filter_clear')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onApply}
              activeOpacity={0.85}
              style={styles.filterApplyButton}
              accessibilityRole="button"
            >
              <Text style={styles.filterApplyButtonText}>
                {t('matches.filter_apply')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── QuickToggle — local to this file ────────────────────────────────────────

interface QuickToggleProps {
  labelKey: string;
  icon: string;
  value: boolean;
  onPress: () => void;
}

function QuickToggle({
  labelKey,
  icon,
  value,
  onPress,
}: QuickToggleProps): React.ReactElement {
  const styles = useThemedStyles(matchListStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      style={[
        styles.filterQuickToggle,
        value && styles.filterQuickToggleActive,
      ]}
    >
      <Feather
        name={(value ? 'check-circle' : icon) as never}
        size={18}
        color={value ? theme.colors.primary : theme.colors.textMuted}
      />
      <Text
        style={[
          styles.filterQuickToggleText,
          value && styles.filterQuickToggleTextActive,
        ]}
      >
        {t(labelKey)}
      </Text>
    </TouchableOpacity>
  );
}
