import React, { memo, useCallback, useMemo } from 'react';

import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/core/theme/ThemeProvider';
import { applyAccessibilityToStyles } from '@/core/theme/accessibilityStyles';

import { FormInput } from './FormInput';
import { NumberStepper } from '../../../core/components/NumberStepper';

import { INITIAL_SIBLINGS } from '../EditProfile.constants';

import {
  SiblingDetail,
  Siblings,
  SiblingsEditorProps,
} from '../EditProfile.types';
import { Theme } from '@/core/theme/types';

type SiblingType = 'brother' | 'sister';

interface IndexedSibling {
  detail: SiblingDetail;
  index: number;
}

export const SiblingsEditor = memo(function SiblingsEditor({
  value,
  onChange,
}: SiblingsEditorProps): React.ReactElement {
  const { theme, fontScale, accessibility } = useTheme();
  const { t } = useTranslation();

  const siblings = value ?? INITIAL_SIBLINGS;

  const styles = useMemo(
    () =>
      applyAccessibilityToStyles(
        createStyles(theme),
        fontScale,
        accessibility.boldText
      ),
    [accessibility.boldText, fontScale, theme]
  );

  const updateSiblings = useCallback(
    (patch: Partial<Siblings>): void => {
      onChange({
        ...siblings,
        ...patch,
      });
    },
    [onChange, siblings]
  );

  /**
   * Generic sibling count updater
   */
  const updateSiblingCount = useCallback(
    (type: SiblingType, count: number): void => {
      const currentDetails = siblings.details ?? [];

      const sameType = currentDetails.filter((item) => item.type === type);

      const otherType = currentDetails.filter((item) => item.type !== type);

      const nextSameType =
        count > sameType.length
          ? [
              ...sameType,
              ...Array.from(
                {
                  length: count - sameType.length,
                },
                (): SiblingDetail => ({
                  type,
                  married: false,
                  occupation: '',
                })
              ),
            ]
          : sameType.slice(0, count);

      const details = [...nextSameType, ...otherType];

      const isBrother = type === 'brother';

      updateSiblings({
        details,
        brothersCount: isBrother ? count : siblings.brothersCount,
        sistersCount: isBrother ? siblings.sistersCount : count,

        /**
         * Prevent invalid values
         */
        marriedBrothersCount: Math.min(
          siblings.marriedBrothersCount,
          isBrother ? count : siblings.brothersCount
        ),

        marriedSistersCount: Math.min(
          siblings.marriedSistersCount,
          isBrother ? siblings.sistersCount : count
        ),
      });
    },
    [siblings, updateSiblings]
  );

  const updateDetail = useCallback(
    (index: number, patch: Partial<SiblingDetail>): void => {
      const updated = (siblings.details ?? []).map((item, i) =>
        i === index
          ? {
              ...item,
              ...patch,
            }
          : item
      );

      updateSiblings({
        details: updated,
      });
    },
    [siblings.details, updateSiblings]
  );

  const groupedDetails = useMemo(() => {
    const details = siblings.details ?? [];

    const brothers: IndexedSibling[] = [];

    const sisters: IndexedSibling[] = [];

    details.forEach((detail, index) => {
      if (detail.type === 'brother') {
        brothers.push({
          detail,
          index,
        });
      } else {
        sisters.push({
          detail,
          index,
        });
      }
    });

    return {
      brothers,
      sisters,
    };
  }, [siblings.details]);

  const totalSiblings = siblings.brothersCount + siblings.sistersCount;

  return (
    <View>
      <Text style={styles.sectionLabel}>
        {t('edit_profile.family.siblings_title')}
      </Text>

      <NumberStepper
        label={t('edit_profile.family.brothers')}
        value={siblings.brothersCount}
        onChange={(count) => updateSiblingCount('brother', count)}
        suffix=""
        step={1}
      />

      <NumberStepper
        label={t('edit_profile.family.sisters')}
        value={siblings.sistersCount}
        onChange={(count) => updateSiblingCount('sister', count)}
        suffix=""
        step={1}
      />

      <NumberStepper
        label={t('edit_profile.family.married_brothers')}
        value={siblings.marriedBrothersCount}
        max={siblings.brothersCount}
        onChange={(count) =>
          updateSiblings({
            marriedBrothersCount: count,
          })
        }
        suffix=""
        step={1}
      />

      <NumberStepper
        label={t('edit_profile.family.married_sisters')}
        value={siblings.marriedSistersCount}
        max={siblings.sistersCount}
        onChange={(count) =>
          updateSiblings({
            marriedSistersCount: count,
          })
        }
        suffix=""
        step={1}
      />

      {totalSiblings > 0 ? (
        <View style={styles.detailsSection}>
          <View style={styles.headerRow}>
            <Feather color={theme.colors.primary} name="users" size={14} />

            <Text style={styles.headerText}>
              {t('edit_profile.family.sibling_details_title')}
            </Text>
          </View>

          {groupedDetails.brothers.map(({ detail, index }, displayIndex) => (
            <SiblingCard
              key={`brother-${index}`}
              detail={detail}
              displayIndex={displayIndex + 1}
              index={index}
              onUpdate={updateDetail}
            />
          ))}

          {groupedDetails.sisters.map(({ detail, index }, displayIndex) => (
            <SiblingCard
              key={`sister-${index}`}
              detail={detail}
              displayIndex={displayIndex + 1}
              index={index}
              onUpdate={updateDetail}
            />
          ))}
        </View>
      ) : null}

      <FormInput
        label={t('edit_profile.family.siblings_note')}
        multiline
        placeholder={t('edit_profile.family.siblings_note_placeholder')}
        value={siblings.note ?? ''}
        onChange={(note) => updateSiblings({ note })}
      />
    </View>
  );
});

interface SiblingCardProps {
  detail: SiblingDetail;
  displayIndex: number;
  index: number;
  onUpdate: (index: number, patch: Partial<SiblingDetail>) => void;
}

const SiblingCard = memo(function SiblingCard({
  detail,
  displayIndex,
  index,
  onUpdate,
}: SiblingCardProps): React.ReactElement {
  const { theme, fontScale, accessibility } = useTheme();
  const { t } = useTranslation();

  const styles = useMemo(
    () =>
      applyAccessibilityToStyles(
        createStyles(theme),
        fontScale,
        accessibility.boldText
      ),
    [accessibility.boldText, fontScale, theme]
  );

  const isBrother = detail.type === 'brother';

  const badgeColor = isBrother ? theme.colors.primary : theme.colors.accent;

  const badgeBackground = isBrother
    ? theme.colors.primaryLight
    : theme.colors.accentLight;

  const label = isBrother
    ? t('edit_profile.family.brother')
    : t('edit_profile.family.sister');

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: badgeBackground,
            },
          ]}
        >
          <Feather color={badgeColor} name="user" size={11} />

          <Text
            style={[
              styles.badgeText,
              {
                color: badgeColor,
              },
            ]}
          >
            {label} {displayIndex}
          </Text>
        </View>

        <TouchableOpacity
          accessibilityRole="switch"
          accessibilityState={{
            checked: detail.married,
          }}
          onPress={() =>
            onUpdate(index, {
              married: !detail.married,
            })
          }
          style={[
            styles.toggle,
            {
              backgroundColor: detail.married
                ? theme.colors.success
                : theme.colors.inputBackground,

              borderColor: detail.married
                ? theme.colors.success
                : theme.colors.border,
            },
          ]}
        >
          <Feather
            color={detail.married ? theme.colors.white : theme.colors.textMuted}
            name={detail.married ? 'check' : 'circle'}
            size={12}
          />

          <Text
            style={[
              styles.toggleText,
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

      <TextInput
        accessibilityLabel={`${label} occupation`}
        onChangeText={(occupation) =>
          onUpdate(index, {
            occupation,
          })
        }
        placeholder={t('edit_profile.family.sibling_occupation_placeholder')}
        placeholderTextColor={theme.colors.textMuted}
        style={styles.input}
        value={detail.occupation ?? ''}
      />
    </View>
  );
});

function createStyles(theme: Theme) {
  return StyleSheet.create({
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 12,
      color: theme.colors.textMuted,
    },

    detailsSection: {
      marginTop: 10,
      marginBottom: 12,
    },

    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 10,
    },

    headerText: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: theme.colors.textSecondary,
    },

    card: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundLight,
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
      gap: 10,
    },

    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
    },

    badgeText: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'capitalize',
    },

    toggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      borderWidth: 1,
    },

    toggleText: {
      fontSize: 12,
      fontWeight: '600',
    },

    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.inputBackground,
      color: theme.colors.textPrimary,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
    },
  });
}
