import React from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { onboardingStyles } from '../Onboarding.styles';
import { ErrorText } from '../components/ErrorText';
import { PreferencesData } from '@/core/types';
import { TagInput } from '@/core/components/TagInput';
import { RequiredAsterisk } from '@/core/components/RequiredAsterisk';
import { parseDigitsOrNull } from '@/core/utils/inputSanitizers';

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

      {/* Daily AI tutor session window */}
      <View style={styles.row}>
        <View style={styles.halfField}>
          <RequiredLabel>{t('onboarding.fields.session_min')}</RequiredLabel>
          <TextInput
            placeholder="30"
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
            accessibilityLabel={t('onboarding.fields.session_min')}
          />
          <ErrorText field="minAgeRange" errors={errors} />
        </View>

        <View style={styles.halfField}>
          <RequiredLabel>{t('onboarding.fields.session_max')}</RequiredLabel>
          <TextInput
            placeholder="60"
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
            accessibilityLabel={t('onboarding.fields.session_max')}
          />
          <ErrorText field="maxAgeRange" errors={errors} />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>{t('onboarding.fields.grade_from')}</Text>
          <TextInput
            placeholder="6"
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
            accessibilityLabel={t('onboarding.fields.grade_from')}
          />
        </View>

        <View style={styles.halfField}>
          <Text style={styles.label}>{t('onboarding.fields.grade_to')}</Text>
          <TextInput
            placeholder="10"
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
            accessibilityLabel={t('onboarding.fields.grade_to')}
          />
        </View>
      </View>

      <TagInput
        label={t('onboarding.fields.target_subjects')}
        value={preferences.city ?? []}
        onChange={(values) => {
          onSetField('city', values);
          onClearError('subjects');
        }}
        placeholder={t('onboarding.placeholders.target_subjects')}
      />
      <ErrorText field="subjects" errors={errors} />

      <TagInput
        label={t('onboarding.fields.learning_goals')}
        value={preferences.state ?? []}
        onChange={(values) => {
          onSetField('state', values);
          onClearError('goals');
        }}
        placeholder={t('onboarding.placeholders.learning_goals')}
      />
      <ErrorText field="goals" errors={errors} />
    </View>
  );
}

const preferencesStepStyles = StyleSheet.create({
  requiredLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
