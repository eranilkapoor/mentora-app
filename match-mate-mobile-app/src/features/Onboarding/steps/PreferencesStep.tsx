import React from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { onboardingStyles } from '../Onboarding.styles';
import { ErrorText } from '../components/ErrorText';
import { SearchMultiSelect } from '@/core/components/SearchMultiSelect';
import {
  PreferencesData,
  Caste,
  MaritalStatus,
  ManglikStatus,
  Religion,
  Country,
  Castes,
  MaritalStatuses,
  ManglikStatuses,
  Religions,
} from '@/core/types';
import { useEnumOptions } from '@/core/hooks/useEnumOptions';
import { TagInput } from '@/core/components/TagInput';
import { RequiredAsterisk } from '@/core/components/RequiredAsterisk';
import { parseDigitsOrNull } from '@/core/utils/inputSanitizers';
import {
  INDIA_COUNTRY_OPTIONS,
  INDIA_STATE_OPTIONS,
} from '@/core/constants/locationOptions';

interface Props {
  preferences: PreferencesData;
  errors: Record<string, string>;
  onSetField: <K extends keyof PreferencesData>(
    key: K,
    value: PreferencesData[K]
  ) => void;
  onClearError: (field: string) => void;
}

export function PreferencesStep({
  preferences,
  errors,
  onSetField,
  onClearError,
}: Props): React.ReactElement {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useThemedStyles(onboardingStyles);
  const MaritalStatusOptions = useEnumOptions(
    MaritalStatuses,
    'options.marital_status'
  );
  const ReligionOptions = useEnumOptions(Religions, 'options.religion');
  const CasteOptions = useEnumOptions(Castes, 'options.caste');
  const ManglikStatusOptions = useEnumOptions(
    ManglikStatuses,
    'options.manglik_status'
  );
  const showHinduPreferences =
    preferences.religion?.includes(Religions.HINDU) ?? false;

  const inputStyle = (field: string) =>
    errors[field] ? [styles.input, styles.inputError] : [styles.input];

  const RequiredLabel = ({ children }: { children: string }) => (
    <View style={preferencesStepStyles.requiredLabelRow}>
      <Text style={styles.label}>{children}</Text>
      <RequiredAsterisk />
    </View>
  );

  return (
    <View>
      <Text style={styles.stepTitle}>{t('onboarding.preferences.title')}</Text>
      <Text style={styles.subtitle}>
        {t('onboarding.preferences.subtitle')}
      </Text>

      {/* Age Range */}
      <View style={styles.row}>
        <View style={styles.halfField}>
          <RequiredLabel>{t('onboarding.fields.min_age')}</RequiredLabel>
          <TextInput
            placeholder="18"
            placeholderTextColor={theme.colors.textMuted}
            value={String(preferences.ageRange?.min ?? '')}
            onChangeText={(text) => {
              const parsed = parseDigitsOrNull(text);
              onSetField('ageRange', {
                max: preferences.ageRange?.max ?? 35,
                min: parsed ?? 0,
              });
              onClearError('minAgeRange');
            }}
            style={inputStyle('minAgeRange')}
            keyboardType="numeric"
            accessibilityLabel={t('onboarding.fields.min_age')}
          />
          <ErrorText field="minAgeRange" errors={errors} />
        </View>

        <View style={styles.halfField}>
          <RequiredLabel>{t('onboarding.fields.max_age')}</RequiredLabel>
          <TextInput
            placeholder="35"
            placeholderTextColor={theme.colors.textMuted}
            value={String(preferences.ageRange?.max ?? '')}
            onChangeText={(text) => {
              const parsed = parseDigitsOrNull(text);
              onSetField('ageRange', {
                min: preferences.ageRange?.min ?? 18,
                max: parsed ?? 0,
              });
              onClearError('maxAgeRange');
            }}
            style={inputStyle('maxAgeRange')}
            keyboardType="numeric"
            accessibilityLabel={t('onboarding.fields.max_age')}
          />
          <ErrorText field="maxAgeRange" errors={errors} />
        </View>
      </View>

      {/* Height Range */}
      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>{t('onboarding.fields.min_height')}</Text>
          <TextInput
            placeholder="150"
            placeholderTextColor={theme.colors.textMuted}
            value={String(preferences.heightRange?.min ?? '')}
            onChangeText={(text) => {
              const parsed = parseDigitsOrNull(text);
              onSetField('heightRange', {
                max: preferences.heightRange?.max ?? 0,
                min: parsed ?? 0,
              });
            }}
            style={styles.input}
            keyboardType="numeric"
            accessibilityLabel={t('onboarding.fields.min_height')}
          />
        </View>

        <View style={styles.halfField}>
          <Text style={styles.label}>{t('onboarding.fields.max_height')}</Text>
          <TextInput
            placeholder="180"
            placeholderTextColor={theme.colors.textMuted}
            value={String(preferences.heightRange?.max ?? '')}
            onChangeText={(text) => {
              const parsed = parseDigitsOrNull(text);
              onSetField('heightRange', {
                min: preferences.heightRange?.min ?? 0,
                max: parsed ?? 0,
              });
            }}
            style={styles.input}
            keyboardType="numeric"
            accessibilityLabel={t('onboarding.fields.max_height')}
          />
        </View>
      </View>

      {/* Marital Status Preference */}
      <SearchMultiSelect
        label={t('onboarding.fields.marital_status_preference')}
        options={MaritalStatusOptions}
        selected={preferences.maritalStatus ?? []}
        onChange={(values) => {
          onSetField('maritalStatus', values as MaritalStatus[]);
          onClearError('maritalStatusPreference');
        }}
        placeholder={t('onboarding.placeholders.marital_status_preference')}
        field="maritalStatusPreference"
        errors={errors}
        required
      />

      {/* Religion Preference */}
      <SearchMultiSelect
        label={t('onboarding.fields.religion_preference')}
        options={ReligionOptions}
        selected={preferences.religion ?? []}
        onChange={(values) => {
          const nextReligions = values as Religion[];
          onSetField('religion', nextReligions);
          if (!nextReligions.includes(Religions.HINDU)) {
            onSetField('caste', []);
            onSetField('subCaste', []);
            onSetField('manglikStatus', []);
          }
          onClearError('religionPreference');
        }}
        placeholder={t('onboarding.placeholders.religion_preference')}
        field="religionPreference"
        errors={errors}
        required
      />

      {showHinduPreferences ? (
        <>
          <SearchMultiSelect
            label={t('preference.fields.caste')}
            options={CasteOptions}
            selected={preferences.caste ?? []}
            onChange={(values) => onSetField('caste', values as Caste[])}
            placeholder={t('preference.placeholders.caste', {
              defaultValue: t('preference.fields.caste'),
            })}
            field="castePreference"
          />

          <TagInput
            label={t('preference.fields.sub_caste')}
            value={preferences.subCaste ?? []}
            onChange={(values) => onSetField('subCaste', values)}
            placeholder={t('preference.placeholders.sub_caste')}
          />

          <SearchMultiSelect
            label={t('preference.fields.manglik_status')}
            options={ManglikStatusOptions}
            selected={preferences.manglikStatus ?? []}
            onChange={(values) =>
              onSetField('manglikStatus', values as ManglikStatus[])
            }
            placeholder={t('preference.fields.manglik_status')}
            field="manglikStatusPreference"
          />
        </>
      ) : null}

      {/* Location Preference */}
      <SearchMultiSelect
        label={t('onboarding.fields.location_preference')}
        options={INDIA_COUNTRY_OPTIONS}
        selected={preferences.country ?? []}
        onChange={(values) => {
          onSetField('country', values as Country[]);
          onClearError('locationPreference');
        }}
        placeholder={t('onboarding.placeholders.location_preference')}
        field="locationPreference"
        errors={errors}
        required
      />

      <SearchMultiSelect
        label={t('preference.fields.state')}
        options={INDIA_STATE_OPTIONS}
        selected={preferences.state ?? []}
        onChange={(values) => {
          onSetField('state', values);
        }}
        placeholder={t('preference.placeholders.state')}
        field="statePreference"
      />

      <TagInput
        label={t('preference.fields.city')}
        value={preferences.city ?? []}
        onChange={(values) => onSetField('city', values)}
        placeholder={t('preference.placeholders.city')}
      />
    </View>
  );
}

const preferencesStepStyles = StyleSheet.create({
  requiredLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
