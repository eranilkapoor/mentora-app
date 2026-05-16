import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { onboardingStyles } from '../Onboarding.styles';
import { ErrorText } from '../components/ErrorText';
import { SearchMultiSelect } from '@/core/components/SearchMultiSelect';
import {
  PreferencesData,
  MaritalStatus,
  Religion,
  Country,
  MaritalStatuses,
  Religions,
  Countries,
} from '@/core/types';
import { useEnumOptions } from '@/core/hooks/useEnumOptions';

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
  const MaritalStatusOptions = useEnumOptions(MaritalStatuses, 'options.marital');
  const ReligionOptions = useEnumOptions(Religions, 'options.religion');
  const CountryOptions = useEnumOptions(Countries, 'options.countries');

  const inputStyle = (field: string) =>
    errors[field] ? [styles.input, styles.inputError] : [styles.input];

  return (
    <View>
      <Text style={styles.stepTitle}>{t('onboarding.preferences.title')}</Text>
      <Text style={styles.subtitle}>
        {t('onboarding.preferences.subtitle')}
      </Text>

      {/* Age Range */}
      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>{t('onboarding.fields.min_age')} *</Text>
          <TextInput
            placeholder="18"
            placeholderTextColor={theme.colors.textMuted}
            value={String(preferences.ageRange?.min ?? '')}
            onChangeText={(text) => {
              const parsed = parseInt(text, 10);
              onSetField('ageRange', {
                max: preferences.ageRange?.max ?? 35,
                min: isNaN(parsed) ? 0 : parsed,
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
          <Text style={styles.label}>{t('onboarding.fields.max_age')} *</Text>
          <TextInput
            placeholder="35"
            placeholderTextColor={theme.colors.textMuted}
            value={String(preferences.ageRange?.max ?? '')}
            onChangeText={(text) => {
              const parsed = parseInt(text, 10);
              onSetField('ageRange', {
                min: preferences.ageRange?.min ?? 18,
                max: isNaN(parsed) ? 0 : parsed,
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
              const parsed = parseInt(text, 10);
              onSetField('heightRange', {
                max: preferences.heightRange?.max ?? 0,
                min: isNaN(parsed) ? 0 : parsed,
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
              const parsed = parseInt(text, 10);
              onSetField('heightRange', {
                min: preferences.heightRange?.min ?? 0,
                max: isNaN(parsed) ? 0 : parsed,
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
      />

      {/* Religion Preference */}
      <SearchMultiSelect
        label={t('onboarding.fields.religion_preference')}
        options={ReligionOptions}
        selected={preferences.religion ?? []}
        onChange={(values) => {
          onSetField('religion', values as Religion[]);
          onClearError('religionPreference');
        }}
        placeholder={t('onboarding.placeholders.religion_preference')}
        field="religionPreference"
        errors={errors}
      />

      {/* Location Preference */}
      <SearchMultiSelect
        label={t('onboarding.fields.location_preference')}
        options={CountryOptions}
        selected={preferences.country ?? []}
        onChange={(values) => {
          onSetField('country', values as Country[]);
          onClearError('locationPreference');
        }}
        placeholder={t('onboarding.placeholders.location_preference')}
        field="locationPreference"
        errors={errors}
      />
    </View>
  );
}
