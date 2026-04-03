import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../store/hooks';
import { setProfileCompleted } from '../../store/slices/authSlice';
import { Colors } from '../../core/constants/colors';
import {
  PROFILE_FOR_OPTIONS,
  RELIGIONS,
  QUALIFICATIONS,
  BODY_TYPES,
  COMPLEXIONS,
  FAMILY_TYPES,
  FAMILY_STATUSES,
} from '../../core/constants';
import {
  type PersonalData,
  type EducationData,
  type PhysicalData,
  type FamilyData,
  type PreferencesData,
} from '../../core/types/onboarding.types';
import { useOnboardingProfileMutation } from '../../store/services/authApi';
import {
  DropdownPickerProps,
  ErrorTextProps,
  Gender,
  RegistrationStep,
} from './Auth.types';
import { onboardingStyles } from './OnboardingScreen.styles';
import { useThemedStyles } from '../../core/theme/useThemedStyles';

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS: RegistrationStep[] = [
  'personal',
  'physical',
  'education',
  'family',
  'preferences',
  'review',
];

const STEP_LABELS: Record<RegistrationStep, string> = {
  personal: 'Personal',
  physical: 'Physical',
  education: 'Education',
  family: 'Family',
  preferences: 'Preferences',
  review: 'Review',
};

const STEP_ICONS: Record<RegistrationStep, string> = {
  personal: 'user',
  physical: 'activity',
  education: 'book',
  family: 'home',
  preferences: 'heart',
  review: 'check-circle',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function ErrorText({
  field,
  errors,
}: ErrorTextProps): React.ReactElement | null {
  const styles = useThemedStyles(onboardingStyles);
  if (errors[field] === undefined) return null;
  return <Text style={styles.error}>{errors[field]}</Text>;
}

function DropdownPicker({
  label,
  options,
  value,
  onChange,
  field,
  errors,
  onClearError,
  showDropdown,
  onSetShowDropdown,
}: DropdownPickerProps): React.ReactElement {
  const isOpen = showDropdown === field;
  const styles = useThemedStyles(onboardingStyles);

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.input,
          styles.dropdownTrigger,
          errors[field] !== undefined && styles.inputError,
        ]}
        onPress={() => onSetShowDropdown(isOpen ? null : field)}
        accessibilityRole="button"
        accessibilityLabel={`Select ${label}`}
        accessibilityState={{ expanded: isOpen }}
      >
        <Text
          style={value ? styles.dropdownValueText : styles.dropdownPlaceholder}
        >
          {value !== '' ? value : `Select ${label}`}
        </Text>
        <Feather
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={Colors.textMuted}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdown}>
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {options.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.dropdownItem,
                  value === item && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  onChange(item);
                  onClearError(field);
                  onSetShowDropdown(null);
                }}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    value === item && styles.dropdownItemTextActive,
                  ]}
                >
                  {item}
                </Text>
                {value === item && (
                  <Feather name="check" size={14} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function StepIndicator({
  currentStep,
}: {
  currentStep: RegistrationStep;
}): React.ReactElement {
  const currentIndex = STEPS.indexOf(currentStep);
  const styles = useThemedStyles(onboardingStyles);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.stepIndicatorContent}
      style={styles.stepIndicatorContainer}
    >
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;

        return (
          <View key={step} style={styles.stepIndicatorItem}>
            <View
              style={[
                styles.stepDot,
                isCompleted && styles.stepDotCompleted,
                isActive && styles.stepDotActive,
              ]}
            >
              {isCompleted ? (
                <Feather name="check" size={12} color={Colors.white} />
              ) : (
                <Feather
                  name={STEP_ICONS[step]}
                  size={12}
                  color={isActive ? Colors.white : Colors.textMuted}
                />
              )}
            </View>
            <Text
              style={[
                styles.stepDotLabel,
                isActive && styles.stepDotLabelActive,
                isCompleted && styles.stepDotLabelCompleted,
              ]}
            >
              {STEP_LABELS[step]}
            </Text>
            {index < STEPS.length - 1 && (
              <View
                style={[
                  styles.stepConnector,
                  isCompleted && styles.stepConnectorCompleted,
                ]}
              />
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.ReactElement {
  const styles = useThemedStyles(onboardingStyles);
  return (
    <View style={styles.reviewSection}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value}</Text>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function OnboardingScreen(): React.ReactElement {
  const dispatch = useAppDispatch();
  const styles = useThemedStyles(onboardingStyles);

  const [currentStep, setCurrentStep] = useState<RegistrationStep>('personal');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  const [personal, setPersonal] = useState<PersonalData>({
    profileFor: '',
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'other',
    religion: '',
    caste: '',
    country: '',
    state: '',
    city: '',
    motherTongue: '',
    maritalStatus: 'never_married',
    aboutMe: '',
  });

  const [physical, setPhysical] = useState<PhysicalData>({
    height: '',
    weight: '',
    bodyType: '',
    complexion: '',
  });

  const [education, setEducation] = useState<EducationData>({
    qualification: '',
    field: '',
    university: '',
    occupation: '',
    annualIncome: '',
  });

  const [family, setFamily] = useState<FamilyData>({
    fatherName: '',
    motherName: '',
    fatherOccupation: '',
    motherOccupation: '',
    familyType: '',
    familyStatus: '',
    familyValues: '',
    siblings: {
      brothers: 0,
      sisters: 0,
      marriedBrothers: 0,
      marriedSisters: 0,
    },
  });

  const [preferences, setPreferences] = useState<PreferencesData>({
    partnerPreference: {
      ageRange: { min: 18, max: 32 },
      heightRange: { min: 155, max: 170 },
      maritalStatus: [],
      religion: [],
      caste: [],
      country: [],
      state: [],
      city: [],
      qualification: [],
      occupation: [],
      annualIncomeRange: { min: 100000, max: 1000000 },
      bodyType: [],
      complexion: [],
      smoking: [],
      drinking: [],
      diet: [],
      languagesKnown: [],
      aboutPartner: '',
    },
    hobbies: [],
    smoking: 'non_smoker',
    drinking: 'non_drinker',
    diet: 'vegetarian',
    music: [],
    movies: [],
    sports: [],
    languagesKnown: [],
  });
  const [onboardingProfile] = useOnboardingProfileMutation();

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const clearError = useCallback((field: string): void => {
    setErrors((prev) => {
      if (prev[field] === undefined) return prev;
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  }, []);

  const getInputStyle = useCallback(
    (field: string) => [
      styles.input,
      errors[field] !== undefined ? styles.inputError : null,
    ],
    [errors, styles]
  );

  // ─── Validators ──────────────────────────────────────────────────────────

  const validatePersonal = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!personal.profileFor.trim()) e.profileFor = 'Selection required';
    if (!personal.firstName.trim()) e.firstName = 'First name required';
    if (!personal.dob) e.dob = 'Date of birth required';
    if (!personal.gender) e.gender = 'Gender required';
    if (!personal.religion) e.religion = 'Religion required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [personal]);

  const validatePhysical = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!physical.height.trim()) e.height = 'Height required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [physical]);

  const validateEducation = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!education.qualification) e.qualification = 'Qualification required';
    if (!education.occupation.trim()) e.occupation = 'Occupation required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [education]);

  const validateFamily = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!family.familyType) e.familyType = 'Family type required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [family]);

  const validatePreferences = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!preferences.partnerPreference?.ageRange?.min)
      e.minAgeRange = 'Min age required';
    if (!preferences.partnerPreference?.ageRange?.max)
      e.maxAgeRange = 'Max age required';
    if (!preferences.partnerPreference?.country?.length)
      e.country = 'Location preference required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [preferences]);

  // ─── Navigation ──────────────────────────────────────────────────────────

  const handleNext = useCallback((): void => {
    const validators: Partial<Record<RegistrationStep, () => boolean>> = {
      personal: validatePersonal,
      physical: validatePhysical,
      education: validateEducation,
      family: validateFamily,
      preferences: validatePreferences,
    };

    const validator = validators[currentStep];
    if (validator !== undefined && !validator()) return;

    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
      setErrors({});
      setShowDropdown(null);
    }
  }, [
    currentStep,
    validatePersonal,
    validatePhysical,
    validateEducation,
    validateFamily,
    validatePreferences,
  ]);

  const handlePrevious = useCallback((): void => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
      setErrors({});
      setShowDropdown(null);
    }
  }, [currentStep]);

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await onboardingProfile({
        personal,
        education,
        physical,
        family,
        preferences,
      }).unwrap();

      if (!response.success as boolean) {
        Alert.alert('Error', 'Onboarding profile creation failed.');
        return;
      }

      dispatch(setProfileCompleted(true));
    } catch (error) {
      const err = error as { message?: string };
      Alert.alert('Error', err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [
    personal,
    education,
    physical,
    family,
    preferences,
    dispatch,
    onboardingProfile,
  ]);

  // ─── Step Content ─────────────────────────────────────────────────────────

  const dropdownProps = {
    errors,
    onClearError: clearError,
    showDropdown,
    onSetShowDropdown: setShowDropdown,
  };

  const renderPersonal = (): React.ReactElement => (
    <View>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.subtitle}>
        Basic details to create your matrimonial profile
      </Text>

      <Text style={styles.label}>Profile For *</Text>
      <DropdownPicker
        label="Profile For"
        options={PROFILE_FOR_OPTIONS}
        value={personal.profileFor}
        onChange={(val) => {
          setPersonal((p) => ({ ...p, profileFor: val }));
          clearError('profileFor');
        }}
        field="profileFor"
        {...dropdownProps}
      />
      <ErrorText field="profileFor" errors={errors} />

      <Text style={styles.label}>First Name *</Text>
      <TextInput
        placeholder="John"
        value={personal.firstName}
        onChangeText={(t) => {
          setPersonal((p) => ({ ...p, firstName: t }));
          clearError('firstName');
        }}
        style={getInputStyle('firstName')}
        accessibilityLabel="First name"
      />
      <ErrorText field="firstName" errors={errors} />

      <Text style={styles.label}>Last Name</Text>
      <TextInput
        placeholder="Doe"
        value={personal.lastName}
        onChangeText={(t) => setPersonal((p) => ({ ...p, lastName: t }))}
        style={styles.input}
        accessibilityLabel="Last name"
      />

      <Text style={styles.label}>Date of Birth *</Text>
      <TextInput
        placeholder="YYYY-MM-DD"
        value={personal.dob}
        onChangeText={(t) => {
          setPersonal((p) => ({ ...p, dob: t }));
          clearError('dob');
        }}
        style={getInputStyle('dob')}
        accessibilityLabel="Date of birth"
      />
      <ErrorText field="dob" errors={errors} />

      <Text style={styles.label}>Gender *</Text>
      <View style={styles.chipRow}>
        {(['male', 'female', 'other'] as Gender[]).map((g) => (
          <TouchableOpacity
            key={g}
            style={[
              styles.chip,
              personal.gender === g && styles.chipActive,
              errors.gender !== undefined && styles.inputError,
            ]}
            onPress={() => {
              setPersonal((p) => ({ ...p, gender: g }));
              clearError('gender');
            }}
            accessibilityRole="radio"
            accessibilityState={{ checked: personal.gender === g }}
          >
            <Text
              style={[
                styles.chipText,
                personal.gender === g && styles.chipTextActive,
              ]}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ErrorText field="gender" errors={errors} />

      <Text style={styles.label}>Religion *</Text>
      <DropdownPicker
        label="Religion"
        options={RELIGIONS}
        value={personal.religion}
        onChange={(val) => {
          setPersonal((p) => ({ ...p, religion: val }));
          clearError('religion');
        }}
        field="religion"
        {...dropdownProps}
      />
      <ErrorText field="religion" errors={errors} />

      <Text style={styles.label}>Country</Text>
      <TextInput
        placeholder="Country"
        value={personal.country}
        onChangeText={(t) => setPersonal((p) => ({ ...p, country: t }))}
        style={styles.input}
        accessibilityLabel="Country"
      />

      <Text style={styles.label}>State</Text>
      <TextInput
        placeholder="State"
        value={personal.state}
        onChangeText={(t) => setPersonal((p) => ({ ...p, state: t }))}
        style={styles.input}
        accessibilityLabel="State"
      />

      <Text style={styles.label}>City</Text>
      <TextInput
        placeholder="City"
        value={personal.city}
        onChangeText={(t) => setPersonal((p) => ({ ...p, city: t }))}
        style={styles.input}
        accessibilityLabel="City"
      />
    </View>
  );

  const renderPhysical = (): React.ReactElement => (
    <View>
      <Text style={styles.stepTitle}>Physical Details</Text>
      <Text style={styles.subtitle}>
        Basic details about your physical attributes
      </Text>

      <Text style={styles.label}>Height (cm) *</Text>
      <TextInput
        placeholder="e.g. 165"
        value={physical.height}
        onChangeText={(t) => {
          setPhysical((p) => ({ ...p, height: t }));
          clearError('height');
        }}
        style={getInputStyle('height')}
        keyboardType="numeric"
        accessibilityLabel="Height in centimeters"
      />
      <ErrorText field="height" errors={errors} />

      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        placeholder="e.g. 60"
        value={physical.weight}
        onChangeText={(t) => setPhysical((p) => ({ ...p, weight: t }))}
        style={styles.input}
        keyboardType="numeric"
        accessibilityLabel="Weight in kilograms"
      />

      <Text style={styles.label}>Body Type</Text>
      <DropdownPicker
        label="Body Type"
        options={BODY_TYPES}
        value={physical.bodyType}
        onChange={(val) => setPhysical((p) => ({ ...p, bodyType: val }))}
        field="bodyType"
        {...dropdownProps}
      />

      <Text style={styles.label}>Complexion</Text>
      <DropdownPicker
        label="Complexion"
        options={COMPLEXIONS}
        value={physical.complexion}
        onChange={(val) => setPhysical((p) => ({ ...p, complexion: val }))}
        field="complexion"
        {...dropdownProps}
      />
    </View>
  );

  const renderEducation = (): React.ReactElement => (
    <View>
      <Text style={styles.stepTitle}>Education & Occupation</Text>
      <Text style={styles.subtitle}>
        Details about your education and career
      </Text>

      <Text style={styles.label}>Qualification *</Text>
      <DropdownPicker
        label="Qualification"
        options={QUALIFICATIONS}
        value={education.qualification}
        onChange={(val) => {
          setEducation((e) => ({ ...e, qualification: val }));
          clearError('qualification');
        }}
        field="qualification"
        {...dropdownProps}
      />
      <ErrorText field="qualification" errors={errors} />

      <Text style={styles.label}>Field of Study</Text>
      <TextInput
        placeholder="e.g. Computer Science"
        value={education.field}
        onChangeText={(t) => setEducation((e) => ({ ...e, field: t }))}
        style={styles.input}
        accessibilityLabel="Field of study"
      />

      <Text style={styles.label}>University / College</Text>
      <TextInput
        placeholder="e.g. Delhi University"
        value={education.university}
        onChangeText={(t) => setEducation((e) => ({ ...e, university: t }))}
        style={styles.input}
        accessibilityLabel="University or college name"
      />

      <Text style={styles.label}>Occupation *</Text>
      <TextInput
        placeholder="e.g. Software Engineer"
        value={education.occupation}
        onChangeText={(t) => {
          setEducation((e) => ({ ...e, occupation: t }));
          clearError('occupation');
        }}
        style={getInputStyle('occupation')}
        accessibilityLabel="Occupation"
      />
      <ErrorText field="occupation" errors={errors} />

      <Text style={styles.label}>Annual Income</Text>
      <TextInput
        placeholder="e.g. 800000"
        value={education.annualIncome}
        onChangeText={(t) => setEducation((e) => ({ ...e, annualIncome: t }))}
        style={styles.input}
        keyboardType="numeric"
        accessibilityLabel="Annual income"
      />
    </View>
  );

  const renderFamily = (): React.ReactElement => (
    <View>
      <Text style={styles.stepTitle}>Family Background</Text>
      <Text style={styles.subtitle}>Tell us about your family</Text>

      <Text style={styles.label}>Father's Name</Text>
      <TextInput
        placeholder="Father's Name"
        value={family.fatherName}
        onChangeText={(t) => setFamily((f) => ({ ...f, fatherName: t }))}
        style={styles.input}
        accessibilityLabel="Father name"
      />

      <Text style={styles.label}>Mother's Name</Text>
      <TextInput
        placeholder="Mother's Name"
        value={family.motherName}
        onChangeText={(t) => setFamily((f) => ({ ...f, motherName: t }))}
        style={styles.input}
        accessibilityLabel="Mother name"
      />

      <Text style={styles.label}>Father's Occupation</Text>
      <TextInput
        placeholder="e.g. Business"
        value={family.fatherOccupation}
        onChangeText={(t) => setFamily((f) => ({ ...f, fatherOccupation: t }))}
        style={styles.input}
        accessibilityLabel="Father occupation"
      />

      <Text style={styles.label}>Mother's Occupation</Text>
      <TextInput
        placeholder="e.g. Homemaker"
        value={family.motherOccupation}
        onChangeText={(t) => setFamily((f) => ({ ...f, motherOccupation: t }))}
        style={styles.input}
        accessibilityLabel="Mother occupation"
      />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>Brothers</Text>
          <TextInput
            placeholder="0"
            value={
              (family.siblings?.brothers ?? 0) > 0
                ? String(family.siblings?.brothers)
                : ''
            }
            onChangeText={(t) =>
              setFamily((f) => ({
                ...f,
                siblings: { ...f.siblings, brothers: parseInt(t) || 0 },
              }))
            }
            style={styles.input}
            keyboardType="numeric"
            accessibilityLabel="Number of brothers"
          />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.label}>Sisters</Text>
          <TextInput
            placeholder="0"
            value={
              (family.siblings?.sisters ?? 0) > 0
                ? String(family.siblings?.sisters)
                : ''
            }
            onChangeText={(t) =>
              setFamily((f) => ({
                ...f,
                siblings: { ...f.siblings, sisters: parseInt(t) || 0 },
              }))
            }
            style={styles.input}
            keyboardType="numeric"
            accessibilityLabel="Number of sisters"
          />
        </View>
      </View>

      <Text style={styles.label}>Family Type *</Text>
      <DropdownPicker
        label="Family Type"
        options={FAMILY_TYPES}
        value={family.familyType ?? ''}
        onChange={(val) => {
          setFamily((f) => ({ ...f, familyType: val }));
          clearError('familyType');
        }}
        field="familyType"
        {...dropdownProps}
      />
      <ErrorText field="familyType" errors={errors} />

      <Text style={styles.label}>Family Status</Text>
      <DropdownPicker
        label="Family Status"
        options={FAMILY_STATUSES}
        value={family.familyStatus ?? ''}
        onChange={(val) => setFamily((f) => ({ ...f, familyStatus: val }))}
        field="familyStatus"
        {...dropdownProps}
      />

      <Text style={styles.label}>Family Values</Text>
      <TextInput
        placeholder="e.g. Traditional, Modern"
        value={family.familyValues}
        onChangeText={(t) => setFamily((f) => ({ ...f, familyValues: t }))}
        style={styles.input}
        accessibilityLabel="Family values"
      />
    </View>
  );

  const renderPreferences = (): React.ReactElement => (
    <View>
      <Text style={styles.stepTitle}>Partner Preferences</Text>
      <Text style={styles.subtitle}>
        Specify your preferences for a potential partner
      </Text>

      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>Min Age *</Text>
          <TextInput
            placeholder="18"
            value={String(preferences.partnerPreference?.ageRange?.min ?? 18)}
            onChangeText={(t) => {
              setPreferences((p) => ({
                ...p,
                partnerPreference: {
                  ...p.partnerPreference,
                  ageRange: {
                    max: p?.partnerPreference?.ageRange?.max ?? 35,
                    min: parseInt(t) ?? 18,
                  },
                },
              }));
              clearError('minAgeRange');
            }}
            style={getInputStyle('minAgeRange')}
            keyboardType="numeric"
            accessibilityLabel="Minimum age preference"
          />
          <ErrorText field="minAgeRange" errors={errors} />
        </View>

        <View style={styles.halfField}>
          <Text style={styles.label}>Max Age *</Text>
          <TextInput
            placeholder="35"
            value={String(preferences.partnerPreference?.ageRange?.max ?? 35)}
            onChangeText={(t) => {
              setPreferences((p) => ({
                ...p,
                partnerPreference: {
                  ...p.partnerPreference,
                  ageRange: {
                    min: p?.partnerPreference?.ageRange?.min ?? 18,
                    max: parseInt(t) ?? 35,
                  },
                },
              }));
              clearError('maxAgeRange');
            }}
            style={getInputStyle('maxAgeRange')}
            keyboardType="numeric"
            accessibilityLabel="Maximum age preference"
          />
          <ErrorText field="maxAgeRange" errors={errors} />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>Min Height (cm)</Text>
          <TextInput
            placeholder="150"
            value={String(
              preferences.partnerPreference?.heightRange?.min ?? ''
            )}
            onChangeText={(t) =>
              setPreferences((p) => ({
                ...p,
                partnerPreference: {
                  ...p.partnerPreference,
                  heightRange: {
                    max: p?.partnerPreference?.heightRange?.max ?? 0,
                    min: parseInt(t) ?? 0,
                  },
                },
              }))
            }
            style={styles.input}
            keyboardType="numeric"
            accessibilityLabel="Minimum height preference"
          />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.label}>Max Height (cm)</Text>
          <TextInput
            placeholder="180"
            value={String(
              preferences.partnerPreference?.heightRange?.max ?? ''
            )}
            onChangeText={(t) =>
              setPreferences((p) => ({
                ...p,
                partnerPreference: {
                  ...p.partnerPreference,
                  heightRange: {
                    min: p?.partnerPreference?.heightRange?.min ?? 0,
                    max: parseInt(t) ?? 0,
                  },
                },
              }))
            }
            style={styles.input}
            keyboardType="numeric"
            accessibilityLabel="Maximum height preference"
          />
        </View>
      </View>

      <Text style={styles.label}>Religion Preference</Text>
      <TextInput
        placeholder="e.g. Hindu, Sikh"
        value={preferences.partnerPreference?.religion?.join(', ') ?? ''}
        onChangeText={(t) =>
          setPreferences((p) => ({
            ...p,
            partnerPreference: {
              ...p.partnerPreference,
              religion: t
                .split(',')
                .map((r) => r.trim())
                .filter(Boolean),
            },
          }))
        }
        style={styles.input}
        accessibilityLabel="Religion preference"
      />

      <Text style={styles.label}>Location Preference *</Text>
      <TextInput
        placeholder="e.g. India, UAE"
        value={preferences.partnerPreference?.country?.join(', ') ?? ''}
        onChangeText={(t) => {
          setPreferences((p) => ({
            ...p,
            partnerPreference: {
              ...p.partnerPreference,
              country: t
                .split(',')
                .map((c) => c.trim())
                .filter(Boolean),
            },
          }));
          clearError('country');
        }}
        style={getInputStyle('country')}
        accessibilityLabel="Location preference"
      />
      <ErrorText field="country" errors={errors} />

      <Text style={styles.label}>About Partner</Text>
      <TextInput
        placeholder="Describe your ideal partner..."
        value={preferences.partnerPreference?.aboutPartner ?? ''}
        onChangeText={(t) =>
          setPreferences((p) => ({
            ...p,
            partnerPreference: { ...p.partnerPreference, aboutPartner: t },
          }))
        }
        style={styles.textArea}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        accessibilityLabel="About partner"
      />
    </View>
  );

  const renderReview = (): React.ReactElement => (
    <View>
      <Text style={styles.stepTitle}>Review Your Profile</Text>
      <Text style={styles.subtitle}>
        Please review your details before submitting
      </Text>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewSectionTitle}>Personal</Text>
        <ReviewRow
          label="Name"
          value={`${personal.firstName} ${personal.lastName}`.trim()}
        />
        <ReviewRow
          label="Gender"
          value={
            personal.gender.charAt(0).toUpperCase() + personal.gender.slice(1)
          }
        />
        <ReviewRow label="Date of Birth" value={personal.dob} />
        <ReviewRow label="Religion" value={personal.religion} />
        <ReviewRow
          label="Location"
          value={
            [personal.city, personal.state, personal.country]
              .filter(Boolean)
              .join(', ') || 'Not specified'
          }
        />
      </View>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewSectionTitle}>Physical</Text>
        <ReviewRow label="Height" value={`${physical.height} cm`} />
        <ReviewRow
          label="Body Type"
          value={physical.bodyType || 'Not specified'}
        />
        <ReviewRow
          label="Complexion"
          value={physical.complexion || 'Not specified'}
        />
      </View>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewSectionTitle}>Education</Text>
        <ReviewRow label="Qualification" value={education.qualification} />
        <ReviewRow label="Occupation" value={education.occupation} />
        <ReviewRow
          label="Annual Income"
          value={education.annualIncome || 'Not specified'}
        />
      </View>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewSectionTitle}>Family</Text>
        <ReviewRow label="Family Type" value={family.familyType ?? ''} />
        <ReviewRow
          label="Family Status"
          value={family.familyStatus ?? 'Not specified'}
        />
      </View>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewSectionTitle}>Partner Preferences</Text>
        <ReviewRow
          label="Age Range"
          value={`${preferences.partnerPreference?.ageRange?.min ?? '?'} – ${preferences.partnerPreference?.ageRange?.max ?? '?'} yrs`}
        />
        <ReviewRow
          label="Location"
          value={
            preferences.partnerPreference?.country?.join(', ') ??
            'Not specified'
          }
        />
        <ReviewRow
          label="Religion"
          value={
            preferences.partnerPreference?.religion?.join(', ') ??
            'Not specified'
          }
        />
      </View>
    </View>
  );

  const renderStepContent = (): React.ReactElement | null => {
    switch (currentStep) {
      case 'personal':
        return renderPersonal();
      case 'physical':
        return renderPhysical();
      case 'education':
        return renderEducation();
      case 'family':
        return renderFamily();
      case 'preferences':
        return renderPreferences();
      case 'review':
        return renderReview();
      default:
        return null;
    }
  };

  const progressPercent =
    ((STEPS.indexOf(currentStep) + 1) / STEPS.length) * 100;

  const isFirstStep = currentStep === STEPS[0];
  const isLastStep = currentStep === 'review';

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        style={styles.container}
      >
        {/* Progress Bar */}
        <View style={styles.progressBarWrapper}>
          <View
            style={[styles.progressFill, { width: `${progressPercent}%` }]}
          />
        </View>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} />

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderStepContent()}

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {!isFirstStep && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handlePrevious}
                accessibilityRole="button"
                accessibilityLabel="Go to previous step"
              >
                <Feather name="arrow-left" size={16} color={Colors.primary} />
                <Text style={styles.secondaryButtonText}>Previous</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={
                isLastStep
                  ? () => {
                      void handleSubmit();
                    }
                  : handleNext
              }
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={
                isLastStep ? 'Submit profile' : 'Go to next step'
              }
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>
                    {isLastStep ? 'Create Profile' : 'Next'}
                  </Text>
                  {!isLastStep && (
                    <Feather
                      name="arrow-right"
                      size={16}
                      color={Colors.white}
                    />
                  )}
                  {isLastStep && (
                    <Feather name="check" size={16} color={Colors.white} />
                  )}
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
