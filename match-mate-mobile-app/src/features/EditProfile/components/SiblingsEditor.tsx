import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { NumberStepper } from './NumberStepper';
import { FormInput } from './FormInput';
import { SiblingsEditorProps, Siblings, SiblingDetail } from '../EditProfile.types';
import { editProfileStyles } from '../EditProfile.styles';
import { INITIAL_SIBLINGS } from '../EditProfile.constants';
import { Theme } from '@/core/theme/types';

export function SiblingsEditor({
  value,
  onChange,
}: SiblingsEditorProps): React.ReactElement {
  const styles = useThemedStyles(editProfileStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const siblings = value ?? INITIAL_SIBLINGS;
  const totalSiblings = siblings.brothersCount + siblings.sistersCount;

  const update = useCallback(
    (key: keyof Siblings, val: Siblings[keyof Siblings]) => {
      onChange({ ...siblings, [key]: val });
    },
    [siblings, onChange]
  );

  // ─── When counts change, sync the details array ──────────────────────────
  // Add missing entries or trim excess ones to match the new total

  const handleBrothersChange = useCallback(
    (count: number) => {
      const currentDetails = siblings.details ?? [];

      const brothers = currentDetails.filter((d) => d.type === 'brother');
      const sisters = currentDetails.filter((d) => d.type === 'sister');

      // Add or remove brother entries to match the new count
      const updatedBrothers: SiblingDetail[] =
        count > brothers.length
          ? [
              ...brothers,
              ...Array.from({ length: count - brothers.length }, () => ({
                type: 'brother' as const,
                married: false,
                occupation: '',
              })),
            ]
          : brothers.slice(0, count);

      onChange({
        ...siblings,
        brothersCount: count,
        details: [...updatedBrothers, ...sisters],
      });
    },
    [siblings, onChange]
  );

  const handleSistersChange = useCallback(
    (count: number) => {
      const currentDetails = siblings.details ?? [];

      const brothers = currentDetails.filter((d) => d.type === 'brother');
      const sisters = currentDetails.filter((d) => d.type === 'sister');

      const updatedSisters: SiblingDetail[] =
        count > sisters.length
          ? [
              ...sisters,
              ...Array.from({ length: count - sisters.length }, () => ({
                type: 'sister' as const,
                married: false,
                occupation: '',
              })),
            ]
          : sisters.slice(0, count);

      onChange({
        ...siblings,
        sistersCount: count,
        details: [...brothers, ...updatedSisters],
      });
    },
    [siblings, onChange]
  );

  // ─── Update a single sibling detail ──────────────────────────────────────

  const updateDetail = useCallback(
    (index: number, key: keyof SiblingDetail, val: string | boolean) => {
      const updatedDetails = (siblings.details ?? []).map((d, i) =>
        i === index ? { ...d, [key]: val } : d
      );
      update('details', updatedDetails);
    },
    [siblings.details, update]
  );

  // ─── Grouped for display ──────────────────────────────────────────────────

  const { brotherDetails, sisterDetails } = useMemo(() => {
    const details = siblings.details ?? [];
    return {
      brotherDetails: details
        .map((d, i) => ({ detail: d, index: i }))
        .filter(({ detail }) => detail.type === 'brother'),
      sisterDetails: details
        .map((d, i) => ({ detail: d, index: i }))
        .filter(({ detail }) => detail.type === 'sister'),
    };
  }, [siblings.details]);

  return (
    <View>
      {/* ── Heading ────────────────────────────────────────────────────── */}
      <Text style={[styles.subSectionLabel, { marginTop: 4 }]}>
        {t('edit_profile.family.siblings_title')}
      </Text>

      {/* ── Counts ─────────────────────────────────────────────────────── */}
      <NumberStepper
        label={t('edit_profile.family.brothers')}
        value={siblings.brothersCount}
        onChange={handleBrothersChange}
      />
      <NumberStepper
        label={t('edit_profile.family.sisters')}
        value={siblings.sistersCount}
        onChange={handleSistersChange}
      />
      <NumberStepper
        label={t('edit_profile.family.married_brothers')}
        value={siblings.marriedBrothersCount}
        onChange={(v) => update('marriedBrothersCount', v)}
        max={siblings.brothersCount}
      />
      <NumberStepper
        label={t('edit_profile.family.married_sisters')}
        value={siblings.marriedSistersCount}
        onChange={(v) => update('marriedSistersCount', v)}
        max={siblings.sistersCount}
      />

      {/* ── Sibling Details — only shown when total > 0 ─────────────────── */}
      {totalSiblings > 0 && (
        <View style={detailStyles.section}>
          <View style={detailStyles.sectionHeaderRow}>
            <Feather name="users" size={14} color={theme.colors.primary} />
            <Text style={[detailStyles.sectionHeading, { color: theme.colors.textSecondary }]}>
              {t('edit_profile.family.sibling_details_title')}
            </Text>
          </View>

          {/* Brothers */}
          {brotherDetails.map(({ detail, index }, displayIndex) => (
            <SiblingDetailCard
              key={`brother-${index}`}
              detail={detail}
              displayIndex={displayIndex + 1}
              globalIndex={index}
              onUpdate={updateDetail}
              theme={theme}
              t={t}
            />
          ))}

          {/* Sisters */}
          {sisterDetails.map(({ detail, index }, displayIndex) => (
            <SiblingDetailCard
              key={`sister-${index}`}
              detail={detail}
              displayIndex={displayIndex + 1}
              globalIndex={index}
              onUpdate={updateDetail}
              theme={theme}
              t={t}
            />
          ))}
        </View>
      )}

      {/* ── Note ───────────────────────────────────────────────────────── */}
      <FormInput
        label={t('edit_profile.family.siblings_note')}
        value={siblings.note}
        onChange={(v) => update('note', v)}
        multiline
        placeholder={t('edit_profile.family.siblings_note_placeholder')}
      />
    </View>
  );
}

// ─── Individual sibling detail card ──────────────────────────────────────────

interface SiblingDetailCardProps {
  detail: SiblingDetail;
  displayIndex: number;
  globalIndex: number;
  onUpdate: (index: number, key: keyof SiblingDetail, val: string | boolean) => void;
  theme: Theme;
  t: (key: string) => string;
}

function SiblingDetailCard({
  detail,
  displayIndex,
  globalIndex,
  onUpdate,
  theme,
  t,
}: SiblingDetailCardProps): React.ReactElement {
  const typeLabel =
    detail.type === 'brother'
      ? t('edit_profile.family.brother')
      : t('edit_profile.family.sister');

  return (
    <View
      style={[
        detailStyles.card,
        {
          backgroundColor: theme.colors.backgroundLight,
          borderColor: theme.colors.border,
        },
      ]}
    >
      {/* Header row — type + number */}
      <View style={detailStyles.cardHeader}>
        <View
          style={[
            detailStyles.typeBadge,
            {
              backgroundColor:
                detail.type === 'brother'
                  ? theme.colors.primaryLight
                  : theme.colors.accentLight,
            },
          ]}
        >
          <Feather
            name={detail.type === 'brother' ? 'user' : 'user'}
            size={11}
            color={
              detail.type === 'brother'
                ? theme.colors.primary
                : theme.colors.accent
            }
          />
          <Text
            style={[
              detailStyles.typeBadgeText,
              {
                color:
                  detail.type === 'brother'
                    ? theme.colors.primary
                    : theme.colors.accent,
              },
            ]}
          >
            {typeLabel} {displayIndex}
          </Text>
        </View>

        {/* Married toggle */}
        <TouchableOpacity
          style={[
            detailStyles.marriedToggle,
            {
              backgroundColor: detail.married
                ? theme.colors.success
                : theme.colors.inputBackground,
              borderColor: detail.married
                ? theme.colors.success
                : theme.colors.border,
            },
          ]}
          onPress={() => onUpdate(globalIndex, 'married', !detail.married)}
          accessibilityRole="switch"
          accessibilityState={{ checked: detail.married }}
          accessibilityLabel={t('edit_profile.family.married')}
        >
          <Feather
            name={detail.married ? 'check' : 'circle'}
            size={12}
            color={detail.married ? theme.colors.white : theme.colors.textMuted}
          />
          <Text
            style={[
              detailStyles.marriedToggleText,
              {
                color: detail.married
                  ? theme.colors.white
                  : theme.colors.textMuted,
              },
            ]}
          >
            {detail.married
              ? t('edit_profile.family.married')
              : t('edit_profile.family.unmarried')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Occupation input */}
      <TextInput
        value={detail.occupation ?? ''}
        onChangeText={(v) => onUpdate(globalIndex, 'occupation', v)}
        placeholder={t('edit_profile.family.sibling_occupation_placeholder')}
        placeholderTextColor={theme.colors.textMuted}
        style={[
          detailStyles.occupationInput,
          {
            color: theme.colors.textPrimary,
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.border,
          },
        ]}
        accessibilityLabel={`${typeLabel} ${displayIndex} ${t('edit_profile.fields.occupation')}`}
      />
    </View>
  );
}

// ─── Local styles (not themed — kept minimal) ─────────────────────────────────

const detailStyles = StyleSheet.create({
  section: {
    marginTop: 8,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  marriedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  marriedToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  occupationInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 14,
  },
});