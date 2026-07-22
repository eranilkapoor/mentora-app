import React, { useCallback } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { onboardingStyles } from '../Onboarding.styles';
import { ErrorText } from '../components/ErrorText';
import { DropdownPicker } from '@/core/components/DropdownPicker';
import {
  BasicData,
  Gender,
  Qualification,
  ProfileFor,
  Genders,
  Countries,
  ProfileFors,
  Qualifications,
} from '@/core/types';
import { useEnumOptions } from '@/core/hooks/useEnumOptions';
import { SingleSelectPill } from '@/core/components/SingleSelectPill';
import { DatePicker } from '@/features/EditProfile/components/DateOfBirthPicker';
import { RequiredAsterisk } from '@/core/components/RequiredAsterisk';
import { sanitizeDigits } from '@/core/utils/inputSanitizers';
import {
  INDIA_COUNTRY_OPTIONS,
  INDIA_STATE_OPTIONS,
} from '@/core/constants/locationOptions';

interface Props {
  basic: BasicData;
  errors: Record<string, string>;
  onSetField: <K extends keyof BasicData>(key: K, value: BasicData[K]) => void;
  onClearError: (field: string) => void;
}

function RequiredTextLabel({
  children,
}: {
  children: string;
}): React.ReactElement {
  const styles = useThemedStyles(onboardingStyles);

  return (
    <View style={basicStepStyles.requiredLabelRow}>
      <Text style={styles.label}>{children}</Text>
      <RequiredAsterisk />
    </View>
  );
}

export function BasicStep({
  basic,
  errors,
  onSetField,
  onClearError,
}: Props): React.ReactElement {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useThemedStyles(onboardingStyles);

  const GenderOptions = useEnumOptions(Genders, 'options.gender');
  const ProfileForOptions = useEnumOptions(ProfileFors, 'options.profile_for');
  const QualificationOptions = useEnumOptions(
    Qualifications,
    'options.qualifications'
  );
  const inputStyle = useCallback(
    (field: string) =>
      errors[field] ? [styles.input, styles.inputError] : [styles.input],
    [errors, styles]
  );

  const handleDateChange = useCallback(
    (value: string) => {
      onSetField('dateOfBirth', value);
      onClearError('dateOfBirth');
    },
    [onClearError, onSetField]
  );

  return (
    <View>
      <Text style={styles.stepTitle}>{t('onboarding.basic.title')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.basic.subtitle')}</Text>

      <DropdownPicker
        label={t('onboarding.fields.account_type')}
        options={ProfileForOptions}
        value={basic.profileFor}
        onChange={(val) => onSetField('profileFor', val as ProfileFor)}
        required
      />
      <ErrorText field="profileFor" errors={errors} />

      <RequiredTextLabel>{t('onboarding.fields.first_name')}</RequiredTextLabel>
      <TextInput
        placeholder={t('onboarding.placeholders.first_name')}
        placeholderTextColor={theme.colors.textMuted}
        value={basic.firstName}
        onChangeText={(v) => onSetField('firstName', v)}
        style={inputStyle('firstName')}
        autoCapitalize="words"
        accessibilityLabel={t('onboarding.fields.first_name')}
      />
      <ErrorText field="firstName" errors={errors} />

      <Text style={styles.label}>{t('onboarding.fields.last_name')}</Text>
      <TextInput
        placeholder={t('onboarding.placeholders.last_name')}
        placeholderTextColor={theme.colors.textMuted}
        value={basic.lastName ?? ''}
        onChangeText={(v) => onSetField('lastName', v)}
        style={styles.input}
        autoCapitalize="words"
        accessibilityLabel={t('onboarding.fields.last_name')}
      />

      <SingleSelectPill
        label={t('onboarding.fields.student_gender')}
        options={GenderOptions}
        value={basic.gender}
        onChange={(v) => onSetField('gender', v as Gender)}
        i18nPrefix="options.gender"
        required
      />
      <ErrorText field="gender" errors={errors} />

      <DatePicker
        label={t('onboarding.fields.student_date_of_birth')}
        value={basic.dateOfBirth}
        onChange={handleDateChange}
        {...(errors.dateOfBirth ? { error: errors.dateOfBirth } : {})}
        required
        placeholder={t('onboarding.placeholders.select_date')}
        modalTitle={t('onboarding.date_picker.title')}
      />

      <DropdownPicker
        label={t('onboarding.fields.country')}
        options={INDIA_COUNTRY_OPTIONS}
        value={basic.country}
        onChange={() => onSetField('country', Countries.INDIA)}
        maxHeight={320}
        required
      />
      <ErrorText field="country" errors={errors} />

      <DropdownPicker
        label={t('onboarding.fields.state')}
        options={INDIA_STATE_OPTIONS}
        value={basic.state ?? ''}
        onChange={(val) => onSetField('state', val)}
        placeholder={t('onboarding.placeholders.state')}
        searchable
        maxHeight={320}
        required
      />
      <ErrorText field="state" errors={errors} />

      <RequiredTextLabel>{t('onboarding.fields.city')}</RequiredTextLabel>
      <TextInput
        placeholder={t('onboarding.placeholders.city')}
        placeholderTextColor={theme.colors.textMuted}
        value={basic.city ?? ''}
        onChangeText={(v) => onSetField('city', v)}
        style={inputStyle('city')}
        autoCapitalize="words"
        accessibilityLabel={t('onboarding.fields.city')}
      />
      <ErrorText field="city" errors={errors} />

      <DropdownPicker
        label={t('onboarding.fields.academic_level')}
        options={QualificationOptions}
        value={basic.qualification}
        onChange={(val) => onSetField('qualification', val as Qualification)}
        searchable
        maxHeight={340}
        required
      />
      <ErrorText field="qualification" errors={errors} />

      <RequiredTextLabel>
        {t('onboarding.fields.institution')}
      </RequiredTextLabel>
      <TextInput
        placeholder={t('onboarding.placeholders.institution')}
        placeholderTextColor={theme.colors.textMuted}
        value={basic.occupation}
        onChangeText={(v) => onSetField('occupation', v)}
        style={inputStyle('occupation')}
        accessibilityLabel={t('onboarding.fields.institution')}
      />
      <ErrorText field="occupation" errors={errors} />

      <RequiredTextLabel>{t('onboarding.fields.grade')}</RequiredTextLabel>
      <TextInput
        placeholder={t('onboarding.placeholders.grade')}
        placeholderTextColor={theme.colors.textMuted}
        value={basic.height}
        onChangeText={(v) => onSetField('height', sanitizeDigits(v))}
        style={inputStyle('height')}
        keyboardType="numeric"
        accessibilityLabel={t('onboarding.fields.grade')}
      />
      <ErrorText field="height" errors={errors} />
    </View>
  );
}

const basicStepStyles = StyleSheet.create({
  requiredLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
