import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { NumberStepper } from './NumberStepper';
import { FormInput } from './FormInput';
import { SiblingsEditorProps, Siblings } from '../EditProfile.types';
import { INITIAL_SIBLINGS } from '../EditProfile.constants';

export function SiblingsEditor({
  value,
  onChange,
}: SiblingsEditorProps): React.ReactElement {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const siblings = value ?? INITIAL_SIBLINGS;

  const update = useCallback(
    (key: keyof Siblings, val: Siblings[keyof Siblings]) => {
      onChange({ ...siblings, [key]: val });
    },
    [siblings, onChange]
  );

  return (
    <View>
      <Text style={[styles.subheading, { color: theme.colors.textMuted }]}>
        {t('edit_profile.family.siblings_title')}
      </Text>

      <NumberStepper
        label={t('edit_profile.family.brothers')}
        value={siblings.brothersCount}
        onChange={(v) => update('brothersCount', v)}
      />
      <NumberStepper
        label={t('edit_profile.family.sisters')}
        value={siblings.sistersCount}
        onChange={(v) => update('sistersCount', v)}
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

const styles = StyleSheet.create({
  subheading: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 4,
  },
});