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
  MaritalStatus,
  Religion,
  Country,
  Qualification,
  ProfileFor,
  Genders,
  ProfileFors,
  MaritalStatuses,
  Religions,
  Qualifications,
  Countries,
} from '@/core/types';
import { useEnumOptions } from '@/core/hooks/useEnumOptions';
import { SingleSelectPill } from '@/core/components/SingleSelectPill';
import { DatePicker } from '@/features/EditProfile/components/DateOfBirthPicker';
import { RequiredAsterisk } from '@/core/components/RequiredAsterisk';

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
  const MaritalStatusOptions = useEnumOptions(
    MaritalStatuses,
    'options.marital_status'
  );
  const ReligionOptions = useEnumOptions(Religions, 'options.religion');
  const QualificationOptions = useEnumOptions(
    Qualifications,
    'options.qualifications'
  );
  const CountryOptions = useEnumOptions(Countries, 'options.countries');

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
        label={t('onboarding.fields.profile_for')}
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
        label={t('onboarding.fields.gender')}
        options={GenderOptions}
        value={basic.gender}
        onChange={(v) => onSetField('gender', v as Gender)}
        i18nPrefix="options.gender"
      />
      <ErrorText field="gender" errors={errors} />

      <DatePicker
        label={t('onboarding.fields.date_of_birth')}
        value={basic.dateOfBirth}
        onChange={handleDateChange}
        {...(errors.dateOfBirth ? { error: errors.dateOfBirth } : {})}
        required
        placeholder={t('onboarding.placeholders.select_date')}
        modalTitle={t('onboarding.date_picker.title')}
      />

      <SingleSelectPill
        label={t('onboarding.fields.marital_status')}
        options={MaritalStatusOptions}
        value={basic.maritalStatus}
        onChange={(v) => onSetField('maritalStatus', v as MaritalStatus)}
        i18nPrefix="options.marital_status"
      />
      <ErrorText field="maritalStatus" errors={errors} />

      <DropdownPicker
        label={t('onboarding.fields.religion')}
        options={ReligionOptions}
        value={basic.religion}
        onChange={(val) => onSetField('religion', val as Religion)}
        searchable
        maxHeight={320}
        required
      />
      <ErrorText field="religion" errors={errors} />

      <DropdownPicker
        label={t('onboarding.fields.country')}
        options={CountryOptions}
        value={basic.country}
        onChange={(val) => onSetField('country', val as Country)}
        searchable
        maxHeight={320}
        required
      />
      <ErrorText field="country" errors={errors} />

      <DropdownPicker
        label={t('onboarding.fields.qualification')}
        options={QualificationOptions}
        value={basic.qualification}
        onChange={(val) => onSetField('qualification', val as Qualification)}
        searchable
        maxHeight={340}
        required
      />
      <ErrorText field="qualification" errors={errors} />

      <RequiredTextLabel>{t('onboarding.fields.occupation')}</RequiredTextLabel>
      <TextInput
        placeholder={t('onboarding.placeholders.occupation')}
        placeholderTextColor={theme.colors.textMuted}
        value={basic.occupation}
        onChangeText={(v) => onSetField('occupation', v)}
        style={inputStyle('occupation')}
        accessibilityLabel={t('onboarding.fields.occupation')}
      />
      <ErrorText field="occupation" errors={errors} />

      <RequiredTextLabel>{t('onboarding.fields.height')}</RequiredTextLabel>
      <TextInput
        placeholder={t('onboarding.placeholders.height')}
        placeholderTextColor={theme.colors.textMuted}
        value={basic.height}
        onChangeText={(v) => onSetField('height', v)}
        style={inputStyle('height')}
        keyboardType="numeric"
        accessibilityLabel={t('onboarding.fields.height')}
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
