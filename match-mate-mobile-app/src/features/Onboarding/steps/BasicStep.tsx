import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
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
  Days,
  Months,
  YearOptions,
} from '@/core/types';
import { useEnumOptions } from '@/core/hooks/useEnumOptions';
import { showError } from '@/core/utils/toast';
import { SingleSelectPill } from '@/core/components/SingleSelectPill';

interface Props {
  basic: BasicData;
  errors: Record<string, string>;
  onSetField: <K extends keyof BasicData>(key: K, value: BasicData[K]) => void;
  onClearError: (field: string) => void;
}

// ─── Date picker sub-component — isolated state ───────────────────────────────

interface DatePickerModalProps {
  currentValue: string;
  onConfirm: (formatted: string) => void;
  onCancel: () => void;
}

function DatePickerModal({
  currentValue,
  onConfirm,
  onCancel,
}: DatePickerModalProps): React.ReactElement {
  const { t } = useTranslation();
  const styles = useThemedStyles(onboardingStyles);
  const DayOptions = useEnumOptions(Days, 'options.days');
  const MonthOptions = useEnumOptions(Months, 'options.months');

  const initialParts = currentValue ? currentValue.split('-') : [];
  const [day, setDay] = useState(initialParts[2] ?? '');
  const [month, setMonth] = useState(initialParts[1] ?? '');
  const [year, setYear] = useState(initialParts[0] ?? '');

  const handleConfirm = useCallback(() => {
    if (!day || !month || !year) {
      showError({
        title: t('common.error'),
        message: t('onboarding.errors.date_incomplete'),
      });
      return;
    }
    onConfirm(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  }, [day, month, year, onConfirm, t]);

  return (
    <Modal transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableOpacity
        style={styles.datePickerOverlay}
        activeOpacity={1}
        onPress={onCancel}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}}
          style={styles.datePickerContainer}
        >
          <Text style={styles.stepTitle}>
            {t('onboarding.date_picker.title')}
          </Text>

          <DropdownPicker
            label={t('onboarding.date_picker.day')}
            options={DayOptions}
            value={day}
            onChange={setDay}
            required
          />
          <DropdownPicker
            label={t('onboarding.date_picker.month')}
            options={MonthOptions}
            value={month}
            onChange={setMonth}
            required
          />
          <DropdownPicker
            label={t('onboarding.date_picker.year')}
            options={YearOptions}
            value={year}
            onChange={setYear}
            required
          />

          <View style={styles.datePickerActions}>
            <TouchableOpacity
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel={t('common.cancel')}
            >
              <Text style={styles.datePickerCancelText}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              accessibilityRole="button"
              accessibilityLabel={t('common.confirm')}
            >
              <Text style={styles.datePickerConfirmText}>
                {t('common.confirm')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── BasicStep ────────────────────────────────────────────────────────────────

export function BasicStep({
  basic,
  errors,
  onSetField,
  onClearError,
}: Props): React.ReactElement {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useThemedStyles(onboardingStyles);

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const GenderOptions = useEnumOptions(Genders, 'options.gender');
  const ProfileForOptions = useEnumOptions(ProfileFors, 'options.profile_for');
  const MaritalStatusOptions = useEnumOptions(MaritalStatuses, 'options.marital_status');
  const ReligionOptions = useEnumOptions(Religions, 'options.religion');
  const QualificationOptions = useEnumOptions(Qualifications, 'options.qualifications');
  const CountryOptions = useEnumOptions(Countries, 'options.countries');
  
  const inputStyle = useCallback(
    (field: string) =>
      errors[field] ? [styles.input, styles.inputError] : [styles.input],
    [errors, styles]
  );

  const handleDateConfirm = useCallback(
    (formatted: string) => {
      onSetField('dateOfBirth', formatted);
      onClearError('dateOfBirth');
      setDatePickerVisible(false);
    },
    [onSetField, onClearError]
  );

  return (
    <View>
      <Text style={styles.stepTitle}>{t('onboarding.basic.title')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.basic.subtitle')}</Text>

      {/* Profile For */}
      <DropdownPicker
        label={t('onboarding.fields.profile_for')}
        options={ProfileForOptions}
        value={basic.profileFor}
        onChange={(val) => onSetField('profileFor', val as ProfileFor)}
        required
      />
      <ErrorText field="profileFor" errors={errors} />

      {/* First Name */}
      <Text style={styles.label}>{t('onboarding.fields.first_name')} *</Text>
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

      {/* Last Name */}
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

      {/* Gender */}
      <SingleSelectPill
        label={t('onboarding.fields.gender')}
        options={GenderOptions}
        value={basic.gender}
        onChange={(v) => onSetField('gender', v as Gender)}
        i18nPrefix="options.gender"
      />
      <ErrorText field="gender" errors={errors} />

      {/* Date of Birth */}
      <Text style={styles.label}>{t('onboarding.fields.date_of_birth')} *</Text>
      <TouchableOpacity
        onPress={() => setDatePickerVisible(true)}
        style={inputStyle('dateOfBirth')}
        accessibilityRole="button"
        accessibilityLabel={t('onboarding.fields.date_of_birth')}
      >
        <Text
          style={
            basic.dateOfBirth
              ? styles.dropdownValueText
              : styles.dropdownPlaceholder
          }
        >
          {basic.dateOfBirth || t('onboarding.placeholders.select_date')}
        </Text>
      </TouchableOpacity>
      <ErrorText field="dateOfBirth" errors={errors} />

      {/* Marital Status */}
      <SingleSelectPill
        label={t('onboarding.fields.marital_status')}
        options={MaritalStatusOptions}
        value={basic.maritalStatus}
        onChange={(v) => onSetField('maritalStatus', v as MaritalStatus)}
        i18nPrefix="options.marital_status"
      />
      <ErrorText field="maritalStatus" errors={errors} />

      {/* Religion */}
      <DropdownPicker
        label={t('onboarding.fields.religion')}
        options={ReligionOptions}
        value={basic.religion}
        onChange={(val) => onSetField('religion', val as Religion)}
        required
      />
      <ErrorText field="religion" errors={errors} />

      {/* Country */}
      <DropdownPicker
        label={t('onboarding.fields.country')}
        options={CountryOptions}
        value={basic.country}
        onChange={(val) => onSetField('country', val as Country)}
        required
      />
      <ErrorText field="country" errors={errors} />

      {/* Qualification */}
      <DropdownPicker
        label={t('onboarding.fields.qualification')}
        options={QualificationOptions}
        value={basic.qualification}
        onChange={(val) => onSetField('qualification', val as Qualification)}
        required
      />
      <ErrorText field="qualification" errors={errors} />

      {/* Occupation */}
      <Text style={styles.label}>{t('onboarding.fields.occupation')} *</Text>
      <TextInput
        placeholder={t('onboarding.placeholders.occupation')}
        placeholderTextColor={theme.colors.textMuted}
        value={basic.occupation}
        onChangeText={(v) => onSetField('occupation', v)}
        style={inputStyle('occupation')}
        accessibilityLabel={t('onboarding.fields.occupation')}
      />
      <ErrorText field="occupation" errors={errors} />

      {/* Height */}
      <Text style={styles.label}>{t('onboarding.fields.height')} *</Text>
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

      {/* Date picker modal — self-contained, no external state needed */}
      {datePickerVisible && (
        <DatePickerModal
          currentValue={basic.dateOfBirth}
          onConfirm={handleDateConfirm}
          onCancel={() => setDatePickerVisible(false)}
        />
      )}
    </View>
  );
}
