import React from 'react';

import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';

import { useTheme } from '@/core/theme/ThemeProvider';
import {
  ActivityFilterKey,
  AgeRangeKey,
  CasteFilterKey,
  EducationFilterKey,
  FilterState,
  HeightFilterKey,
  MaritalStatusFilterKey,
} from '../MatchList.types';

import { AGE_FILTERS, CASTE_FILTERS } from '../MatchList.constants';

import { FilterSection } from './FilterSection';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { matchListStyles } from '../MatchList.styles';

const HEIGHT_FILTERS = [
  { key: 'any', labelKey: 'Any' },
  { key: 'short', labelKey: 'Below 5ft 4in' },
  { key: 'medium', labelKey: '5ft 4in - 5ft 10in' },
  { key: 'tall', labelKey: 'Above 5ft 10in' },
];

const MARITAL_STATUS_FILTERS = [
  { key: 'any', labelKey: 'Any' },
  { key: 'never_married', labelKey: 'Never Married' },
  { key: 'divorced', labelKey: 'Divorced' },
  { key: 'widowed', labelKey: 'Widowed' },
];

const EDUCATION_FILTERS = [
  { key: 'any', labelKey: 'Any' },
  { key: 'graduate', labelKey: 'Graduate' },
  { key: 'post_graduate', labelKey: 'Post Graduate' },
  { key: 'doctorate', labelKey: 'Doctorate' },
];

const ACTIVITY_FILTERS = [
  { key: 'any', labelKey: 'Any' },
  { key: 'online', labelKey: 'Online Now' },
  { key: 'recently_active', labelKey: 'Recently Active' },
  { key: 'new_profiles', labelKey: 'New Profiles' },
];

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

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ): void => {
    onFiltersChange({
      [key]: value,
    } as Partial<FilterState>);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      hardwareAccelerated
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.filterModalOverlay}
      >
        <View style={styles.filterModalSheet}>
          <View style={styles.filterModalHandle} />

          <View style={styles.filterModalHeader}>
            <View>
              <Text style={styles.filterModalTitle}>Search & Filters</Text>

              <Text style={styles.filterModalSubtitle}>
                Refine matches by profile, activity and preferences
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              style={styles.filterCloseBtn}
            >
              <Feather name="x" size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.filterSearchBox}>
              <Feather name="search" size={18} color={theme.colors.textMuted} />

              <TextInput
                placeholder="Search by name, city or profession"
                placeholderTextColor={theme.colors.textMuted}
                value={query}
                onChangeText={onQueryChange}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                style={styles.filterSearchInput}
              />

              {query.length > 0 ? (
                <TouchableOpacity onPress={() => onQueryChange('')}>
                  <Feather
                    name="x-circle"
                    size={18}
                    color={theme.colors.textMuted}
                  />
                </TouchableOpacity>
              ) : null}
            </View>

            <FilterSection
              title="Age"
              items={AGE_FILTERS}
              value={filters.ageFilter}
              onChange={(value) =>
                updateFilter('ageFilter', value as AgeRangeKey)
              }
            />

            <FilterSection
              title="Height"
              items={HEIGHT_FILTERS}
              value={filters.heightFilter ?? 'any'}
              onChange={(value) =>
                updateFilter('heightFilter', value as HeightFilterKey)
              }
            />

            <FilterSection
              title="Marital Status"
              items={MARITAL_STATUS_FILTERS}
              value={filters.maritalStatusFilter ?? 'any'}
              onChange={(value) =>
                updateFilter(
                  'maritalStatusFilter',
                  value as MaritalStatusFilterKey
                )
              }
            />

            <FilterSection
              title="Caste"
              items={CASTE_FILTERS}
              value={filters.casteFilter}
              onChange={(value) =>
                updateFilter('casteFilter', value as CasteFilterKey)
              }
            />

            <FilterSection
              title="Education"
              items={EDUCATION_FILTERS}
              value={filters.educationFilter ?? 'any'}
              onChange={(value) =>
                updateFilter('educationFilter', value as EducationFilterKey)
              }
            />

            <FilterSection
              title="Activity"
              items={ACTIVITY_FILTERS}
              value={filters.activityFilter ?? 'any'}
              onChange={(value) =>
                updateFilter('activityFilter', value as ActivityFilterKey)
              }
            />

            <View style={styles.filterQuickToggleGroup}>
              <QuickToggle
                label="Verified profiles only"
                icon="check-circle"
                value={filters.verifiedOnly}
                onPress={() =>
                  updateFilter('verifiedOnly', !filters.verifiedOnly)
                }
              />

              <QuickToggle
                label="Profiles with photo"
                icon="image"
                value={Boolean(filters.withPhotoOnly)}
                onPress={() =>
                  updateFilter('withPhotoOnly', !filters.withPhotoOnly)
                }
              />

              <QuickToggle
                label="Premium members"
                icon="award"
                value={Boolean(filters.premiumOnly)}
                onPress={() =>
                  updateFilter('premiumOnly', !filters.premiumOnly)
                }
              />
            </View>
          </ScrollView>

          <View style={styles.filterModalFooter}>
            <TouchableOpacity
              onPress={onClear}
              activeOpacity={0.85}
              style={styles.filterClearButton}
            >
              <Text style={styles.filterClearButtonText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onApply}
              activeOpacity={0.85}
              style={styles.filterApplyButton}
            >
              <Text style={styles.filterApplyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function QuickToggle({
  label,
  icon,
  value,
  onPress,
}: {
  label: string;
  icon: string;
  value: boolean;
  onPress: () => void;
}): React.ReactElement {
  const styles = useThemedStyles(matchListStyles);
  const { theme } = useTheme();

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
        name={value ? 'check-circle' : icon}
        size={18}
        color={value ? theme.colors.primary : theme.colors.textMuted}
      />

      <Text
        style={[
          styles.filterQuickToggleText,
          value && styles.filterQuickToggleTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
