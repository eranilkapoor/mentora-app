import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTheme } from '@/core/theme/ThemeProvider';
import Header from '@/core/components/Header';
import Loader from '@/core/components/Loader';
import { SettingsStackParamList } from '@/navigation/types';
import {
  useGetMyPreferenceQuery,
  useUpdatePreferenceFiltersMutation,
  useUpdatePreferenceSettingsMutation,
  useUpdatePreferenceWeightsMutation,
  useUpdateAboutPartnerMutation,
} from '@/store/services/preferenceApi.service';
import { editPreferenceStyles } from './EditPreference.styles';
import {
  MatchSettings,
  MatchWeights,
  PartnerFilters,
  PreferenceData,
  PreferenceSectionKey,
} from './EditPreference.types';
import {
  AGE_RANGE,
  HEIGHT_RANGE,
  INCOME_RANGE,
  MATCH_SCORE_RANGE,
  WEIGHT_KEYS,
  ABOUT_PARTNER_MAX,
} from '@/core/constants';
import { PreferenceSectionCard } from './components/PreferenceSectionCard';
import { WeightSlider } from './components/WeightSlider';
import {
  EatingHabits,
  DrinkingHabits,
  MaritalStatuses,
  SmokingHabits,
  BodyTypes,
  Complexions,
  Religions,
  Castes,
  ChildPreferences,
  ResidencyPreferences,
  OccupationTypes,
  ManglikStatuses,
  Qualifications,
  Countries,
  ChildPreference,
  ResidencyPreference,
  ManglikStatus,
  BodyType,
  Complexion,
  SmokingHabit,
  DrinkingHabit,
  EatingHabit,
  OccupationType,
} from '@/core/types';
import { useEnumOptions } from '@/core/hooks/useEnumOptions';
import { showError, showSuccess } from '@/core/utils/toast';
import { SearchMultiSelect } from '@/core/components/SearchMultiSelect';
import { TagInput } from '@/core/components/TagInput';
import { MultiSelectPill } from '@/core/components/MultiSelectPill';
import { SingleSelectPill } from '@/core/components/SingleSelectPill';
import { NumberStepper } from '@/core/components/NumberStepper';
import { ToggleRow } from '@/core/components/ToggleRow';
import {
  formatRangeInputValue,
  getIncompleteRangeLabel,
  getRangeFieldLabelKey,
  hasCompleteRange,
  normalizeFilterRanges,
  normalizeRange,
  RangeBound,
  RangeFilterKey,
  parseRangeInputValue,
} from './utils/preferenceRanges.utils';

const DEFAULT_AGE_RANGE = { min: AGE_RANGE.min, max: 25 } as const;
const DEFAULT_HEIGHT_RANGE = { min: HEIGHT_RANGE.min, max: 170 } as const;
const DEFAULT_INCOME_RANGE = {
  min: INCOME_RANGE.min,
  max: 1000000,
} as const;

const INITIAL_PREFERENCE: PreferenceData = {
  filters: {
    age: { ...DEFAULT_AGE_RANGE },
    height: { ...DEFAULT_HEIGHT_RANGE },
    annualIncome: { ...DEFAULT_INCOME_RANGE },
    maritalStatus: ['never_married'],
    religion: [],
    caste: [],
    subCaste: [],
    manglikStatus: [],
    childPreference: 'does_not_matter',
    residencyPreference: 'does_not_matter',
    country: [],
    state: [],
    city: [],
    qualification: [],
    occupationType: [],
    occupation: [],
    bodyType: [],
    complexion: [],
    smoking: [],
    drinking: [],
    eating: [],
    languages: [],
  },
  settings: {
    isStrict: false,
    allowPartialMatches: true,
    horoscopeRequired: false,
    profileVerificationRequired: false,
    minimumMatchScore: 50,
  },
  weights: {
    age: 10,
    height: 10,
    religion: 15,
    caste: 10,
    location: 10,
    education: 10,
    occupation: 10,
    lifestyle: 10,
    horoscope: 15,
  },
  aboutPartner: '',
};

type Props = {
  navigation: NativeStackNavigationProp<
    SettingsStackParamList,
    'EditPreference'
  >;
};

export default function EditPreferenceScreen({
  navigation,
}: Props): React.ReactElement {
  const styles = useThemedStyles(editPreferenceStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const MaritalStatusOptions = useEnumOptions(
    MaritalStatuses,
    'options.marital_status'
  );
  const SmokingHabitsOptions = useEnumOptions(SmokingHabits, 'options.smoking');
  const DrinkingHabitsOptions = useEnumOptions(
    DrinkingHabits,
    'options.drinking'
  );
  const EatingHabitsOptions = useEnumOptions(EatingHabits, 'options.eating');
  const BodyTypeOptions = useEnumOptions(BodyTypes, 'options.body_types');
  const ComplexionOptions = useEnumOptions(Complexions, 'options.complexion');
  const ManglikStatusOptions = useEnumOptions(
    ManglikStatuses,
    'options.manglik_status'
  );
  const ReligionOptions = useEnumOptions(Religions, 'options.religion');
  const CasteOptions = useEnumOptions(Castes, 'options.caste');
  const ChildPreferenceOptions = useEnumOptions(
    ChildPreferences,
    'options.child_preferences'
  );
  const ResidencyPreferenceOptions = useEnumOptions(
    ResidencyPreferences,
    'options.residency_preferences'
  );
  const OccupationTypeOptions = useEnumOptions(
    OccupationTypes,
    'options.occupation_types'
  );
  const QualificationOptions = useEnumOptions(
    Qualifications,
    'options.qualifications'
  );
  const CountryOptions = useEnumOptions(Countries, 'options.countries');

  const [preference, setPreference] =
    useState<PreferenceData>(INITIAL_PREFERENCE);
  const [sectionLoading, setSectionLoading] =
    useState<PreferenceSectionKey | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const { data, error, isLoading } = useGetMyPreferenceQuery();
  const [updateFilters] = useUpdatePreferenceFiltersMutation();
  const [updateSettings] = useUpdatePreferenceSettingsMutation();
  const [updateWeights] = useUpdatePreferenceWeightsMutation();
  const [updateAboutPartner] = useUpdateAboutPartnerMutation();

  // ─── Load ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (isLoading) return;

    if (error) {
      showError({
        title: t('common.error') || 'Error',
        message: t('preference.errors.load_failed'),
      });
      setPageLoading(false);
      return;
    }

    if (data?.success && data?.data) {
      const incoming = data.data as PreferenceData;
      const incomingFilters = incoming.filters ?? {};
      const incomingRanges: Partial<PartnerFilters> = {
        ...(incomingFilters.age
          ? {
              age: hasCompleteRange(incomingFilters.age)
                ? normalizeRange(incomingFilters.age, AGE_RANGE)
                : DEFAULT_AGE_RANGE,
            }
          : {}),
        ...(incomingFilters.height
          ? {
              height: hasCompleteRange(incomingFilters.height)
                ? normalizeRange(incomingFilters.height, HEIGHT_RANGE)
                : DEFAULT_HEIGHT_RANGE,
            }
          : {}),
        ...(incomingFilters.annualIncome
          ? {
              annualIncome: hasCompleteRange(incomingFilters.annualIncome)
                ? normalizeRange(incomingFilters.annualIncome, INCOME_RANGE)
                : DEFAULT_INCOME_RANGE,
            }
          : {}),
      };

      setPreference((prev) => ({
        ...prev,
        filters: {
          ...prev.filters,
          ...incomingFilters,
          ...incomingRanges,
        },
        settings: {
          ...prev.settings,
          ...(incoming.settings ?? {}),
        },
        weights: {
          ...prev.weights,
          ...(incoming.weights ?? {}),
        },
        aboutPartner: incoming.aboutPartner ?? prev.aboutPartner ?? '',
      }));
    }

    setPageLoading(false);
  }, [data, error, isLoading, t]);

  // ─── Weights total (must always sum to 100) ───────────────────────────────

  const weightsTotal: number = useMemo(
    () =>
      Object.values(preference.weights).reduce(
        (sum: number, v: number) => sum + v,
        0
      ) as number,
    [preference.weights]
  );

  const weightsTotalColor =
    weightsTotal === 100
      ? theme.colors.success
      : weightsTotal > 100
        ? theme.colors.error
        : theme.colors.warning;

  // ─── Save ─────────────────────────────────────────────────────────────────

  const updateSection = useCallback(
    async (section: PreferenceSectionKey): Promise<void> => {
      setSectionLoading(section);
      try {
        switch (section) {
          case 'filters':
            {
              const incompleteRange = getIncompleteRangeLabel(
                preference.filters
              );

              if (incompleteRange) {
                showError({
                  title: t('common.error'),
                  message: t('preference.errors.incomplete_range', {
                    field: t(getRangeFieldLabelKey(incompleteRange)),
                  }),
                });
                return;
              }
            }
            await updateFilters(
              normalizeFilterRanges(preference.filters)
            ).unwrap();
            break;
          case 'settings':
            await updateSettings(preference.settings as MatchSettings).unwrap();
            break;
          case 'weights':
            if (weightsTotal !== 100) {
              showError({
                title: t('preference.weights.invalid_title'),
                message: t('preference.weights.invalid_message', {
                  total: weightsTotal,
                }),
              });
              return;
            }
            await updateWeights(preference.weights as MatchWeights).unwrap();
            break;
          case 'about':
            await updateAboutPartner({
              aboutPartner: preference.aboutPartner ?? '',
            }).unwrap();
            break;
        }
        showSuccess({
          title: t('common.saved'),
          message: t('preference.success.section_saved'),
        });
      } catch {
        showError({
          title: t('common.error'),
          message: t('preference.errors.save_failed'),
        });
      } finally {
        setSectionLoading(null);
      }
    },
    [
      preference,
      weightsTotal,
      updateFilters,
      updateSettings,
      updateWeights,
      updateAboutPartner,
      t,
    ]
  );

  const handleSave = useCallback(
    (key: PreferenceSectionKey) => {
      void updateSection(key);
    },
    [updateSection]
  );

  // ─── Setters ──────────────────────────────────────────────────────────────

  const setFilters = useCallback(
    (
      key: keyof PartnerFilters,
      value: PartnerFilters[keyof PartnerFilters]
    ) => {
      setPreference((p) => ({
        ...p,
        filters: { ...p.filters, [key]: value },
      }));
    },
    []
  );

  const setSettings = useCallback(
    (key: keyof MatchSettings, value: MatchSettings[keyof MatchSettings]) => {
      setPreference((p) => ({
        ...p,
        settings: { ...p.settings, [key]: value },
      }));
    },
    []
  );

  const setWeight = useCallback((key: keyof MatchWeights, value: number) => {
    setPreference((p) => ({
      ...p,
      weights: { ...p.weights, [key]: value },
    }));
  }, []);

  const setRangeBound = useCallback(
    (key: RangeFilterKey, bound: RangeBound, text: string) => {
      const parsedValue = parseRangeInputValue(text);

      setPreference((p) => ({
        ...p,
        filters: {
          ...p.filters,
          [key]: {
            ...(p.filters[key] ?? {}),
            [bound]: parsedValue,
          },
        },
      }));
    },
    []
  );

  const renderRangeField = useCallback(
    ({
      key,
      label,
      unit,
      minPlaceholder,
      maxPlaceholder,
    }: {
      key: RangeFilterKey;
      label: string;
      unit: string;
      minPlaceholder: string;
      maxPlaceholder: string;
    }) => {
      const range = preference.filters[key] ?? {};

      return (
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Text style={styles.fieldSublabel}>
            {t('preference.range.unit_hint', { unit })}
          </Text>

          <View style={styles.rangeRow}>
            <View style={styles.rangeHalfWrapper}>
              <Text style={styles.rangeHalfLabel}>
                {t('preference.range.min')}
              </Text>
              <TextInput
                value={formatRangeInputValue(range.min)}
                onChangeText={(text) => setRangeBound(key, 'min', text)}
                placeholder={minPlaceholder}
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
                style={styles.rangeInput}
                accessibilityLabel={`${label} ${t('preference.range.min')}`}
              />
            </View>

            <Text style={styles.rangeSeparator}>-</Text>

            <View style={styles.rangeHalfWrapper}>
              <Text style={styles.rangeHalfLabel}>
                {t('preference.range.max')}
              </Text>
              <TextInput
                value={formatRangeInputValue(range.max)}
                onChangeText={(text) => setRangeBound(key, 'max', text)}
                placeholder={maxPlaceholder}
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
                style={styles.rangeInput}
                accessibilityLabel={`${label} ${t('preference.range.max')}`}
              />
            </View>
          </View>
        </View>
      );
    },
    [preference.filters, setRangeBound, styles, t, theme.colors.textMuted]
  );

  const sectionProps = { sectionLoading, onSave: handleSave };

  if (pageLoading) {
    return (
      <Loader fullScreen size="large" loadingText={t('preference.loading')} />
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <Header
          showBack
          onBackPress={navigation.goBack}
          title={t('preference.title')}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Info Banner ─────────────────────────────────────────────── */}
          <View style={styles.infoBanner}>
            <Feather name="info" size={16} color={theme.colors.primary} />
            <Text style={styles.infoBannerText}>
              {t('preference.info_banner')}
            </Text>
          </View>

          {/* ── About Partner ───────────────────────────────────────────── */}
          <PreferenceSectionCard
            title={t('preference.sections.about')}
            icon="edit-3"
            sectionKey="about"
            saveButtonStyle={styles.aboutSaveButton}
            {...sectionProps}
          >
            <Text style={styles.fieldLabel}>
              {t('preference.fields.about_partner')}
            </Text>
            <TextInput
              style={styles.textArea}
              value={preference.aboutPartner ?? ''}
              onChangeText={(v) =>
                setPreference((p) => ({
                  ...p,
                  aboutPartner: v.slice(0, ABOUT_PARTNER_MAX),
                }))
              }
              placeholder={t('preference.placeholders.about_partner')}
              placeholderTextColor={theme.colors.textMuted}
              multiline
              maxLength={ABOUT_PARTNER_MAX}
              accessibilityLabel={t('preference.fields.about_partner')}
            />
            <Text style={styles.charCount}>
              {(preference.aboutPartner ?? '').length}/{ABOUT_PARTNER_MAX}
            </Text>
          </PreferenceSectionCard>

          {/* ── Basic Filters ────────────────────────────────────────────── */}
          <PreferenceSectionCard
            title={t('preference.sections.basic')}
            icon="sliders"
            sectionKey="filters"
            {...sectionProps}
          >
            {renderRangeField({
              key: 'age',
              label: t('preference.fields.age'),
              unit: t('preference.units.years'),
              minPlaceholder: String(DEFAULT_AGE_RANGE.min),
              maxPlaceholder: String(DEFAULT_AGE_RANGE.max),
            })}

            {renderRangeField({
              key: 'height',
              label: t('preference.fields.height'),
              unit: 'cm',
              minPlaceholder: String(DEFAULT_HEIGHT_RANGE.min),
              maxPlaceholder: String(DEFAULT_HEIGHT_RANGE.max),
            })}

            {renderRangeField({
              key: 'annualIncome',
              label: t('preference.fields.annual_income'),
              unit: t('preference.units.currency'),
              minPlaceholder: String(DEFAULT_INCOME_RANGE.min),
              maxPlaceholder: String(DEFAULT_INCOME_RANGE.max),
            })}

            <MultiSelectPill
              label={t('preference.fields.marital_status')}
              options={MaritalStatusOptions}
              value={preference.filters.maritalStatus ?? []}
              onChange={(v) => setFilters('maritalStatus', v)}
              i18nPrefix="options.marital_status"
            />

            <SingleSelectPill
              label={t('preference.fields.child_preference')}
              options={ChildPreferenceOptions}
              value={preference.filters.childPreference}
              onChange={(v) =>
                setFilters('childPreference', v as ChildPreference)
              }
              i18nPrefix="options.child_preferences"
            />

            <SingleSelectPill
              label={t('preference.fields.residency_preference')}
              options={ResidencyPreferenceOptions}
              value={preference.filters.residencyPreference}
              onChange={(v) =>
                setFilters('residencyPreference', v as ResidencyPreference)
              }
              i18nPrefix="options.residency_preferences"
            />
          </PreferenceSectionCard>

          {/* ── Religion & Culture ──────────────────────────────────────── */}
          <PreferenceSectionCard
            title={t('preference.sections.religion')}
            icon="star"
            sectionKey="filters"
            {...sectionProps}
          >
            <MultiSelectPill
              label={t('preference.fields.religion')}
              options={ReligionOptions}
              value={preference.filters.religion ?? []}
              onChange={(v) => setFilters('religion', v)}
              i18nPrefix="options.religion"
            />

            <MultiSelectPill
              label={t('preference.fields.caste')}
              options={CasteOptions}
              value={preference.filters.caste ?? []}
              onChange={(v) => setFilters('caste', v)}
              i18nPrefix="options.caste"
            />

            <TagInput
              label={t('preference.fields.sub_caste')}
              value={preference.filters.subCaste as string[]}
              onChange={(v) => setFilters('subCaste', v)}
              placeholder={t('preference.placeholders.sub_caste')}
            />

            <MultiSelectPill
              label={t('preference.fields.manglik_status')}
              options={ManglikStatusOptions}
              value={preference.filters.manglikStatus as ManglikStatus[]}
              onChange={(v) => setFilters('manglikStatus', v)}
              i18nPrefix="options.manglik_status"
            />
          </PreferenceSectionCard>

          {/* ── Location ────────────────────────────────────────────────── */}
          <PreferenceSectionCard
            title={t('preference.sections.location')}
            icon="map-pin"
            sectionKey="filters"
            {...sectionProps}
          >
            <SearchMultiSelect
              label={t('preference.fields.country')}
              options={CountryOptions}
              selected={preference.filters.country ?? []}
              onChange={(values) => {
                setFilters('country', values);
              }}
              placeholder={t('preference.placeholders.country')}
              field="country"
            />

            <TagInput
              label={t('preference.fields.state')}
              value={preference.filters.state as string[]}
              onChange={(v) => setFilters('state', v)}
              placeholder={t('preference.placeholders.state')}
            />

            <TagInput
              label={t('preference.fields.city')}
              value={preference.filters.city as string[]}
              onChange={(v) => setFilters('city', v)}
              placeholder={t('preference.placeholders.city')}
            />
          </PreferenceSectionCard>

          {/* ── Education & Career ──────────────────────────────────────── */}
          <PreferenceSectionCard
            title={t('preference.sections.education')}
            icon="book"
            sectionKey="filters"
            {...sectionProps}
          >
            <SearchMultiSelect
              label={t('preference.fields.qualification')}
              options={QualificationOptions}
              selected={preference.filters.qualification ?? []}
              onChange={(values) => {
                setFilters('qualification', values);
              }}
              placeholder={t('preference.placeholders.qualification')}
              field="qualification"
            />

            <MultiSelectPill
              label={t('preference.fields.occupation_type')}
              options={OccupationTypeOptions}
              value={preference.filters.occupationType as OccupationType[]}
              onChange={(v) => setFilters('occupationType', v)}
              i18nPrefix="options.occupation_types"
            />

            <TagInput
              label={t('preference.fields.occupation')}
              value={preference.filters.occupation as string[]}
              onChange={(v) => setFilters('occupation', v)}
              placeholder={t('preference.placeholders.occupation')}
            />
          </PreferenceSectionCard>

          {/* ── Physical ────────────────────────────────────────────────── */}
          <PreferenceSectionCard
            title={t('preference.sections.physical')}
            icon="activity"
            sectionKey="filters"
            {...sectionProps}
          >
            <MultiSelectPill
              label={t('preference.fields.body_type')}
              options={BodyTypeOptions}
              value={preference.filters.bodyType as BodyType[]}
              onChange={(v) => setFilters('bodyType', v)}
              i18nPrefix="options.body_types"
            />

            <MultiSelectPill
              label={t('preference.fields.complexion')}
              options={ComplexionOptions}
              value={preference.filters.complexion as Complexion[]}
              onChange={(v) => setFilters('complexion', v)}
              i18nPrefix="options.complexion"
            />
          </PreferenceSectionCard>

          {/* ── Lifestyle ───────────────────────────────────────────────── */}
          <PreferenceSectionCard
            title={t('preference.sections.lifestyle')}
            icon="coffee"
            sectionKey="filters"
            {...sectionProps}
          >
            <MultiSelectPill
              label={t('preference.fields.smoking')}
              options={SmokingHabitsOptions}
              value={preference.filters.smoking as SmokingHabit[]}
              onChange={(v) => setFilters('smoking', v)}
              i18nPrefix="options.smoking"
            />

            <MultiSelectPill
              label={t('preference.fields.drinking')}
              options={DrinkingHabitsOptions}
              value={preference.filters.drinking as DrinkingHabit[]}
              onChange={(v) => setFilters('drinking', v)}
              i18nPrefix="options.drinking"
            />

            <MultiSelectPill
              label={t('preference.fields.eating')}
              options={EatingHabitsOptions}
              value={preference.filters.eating as EatingHabit[]}
              onChange={(v) => setFilters('eating', v)}
              i18nPrefix="options.eating"
            />

            <TagInput
              label={t('preference.fields.languages')}
              value={preference.filters.languages as string[]}
              onChange={(v) => setFilters('languages', v)}
              placeholder={t('preference.placeholders.languages')}
            />
          </PreferenceSectionCard>

          {/* ── Match Settings ───────────────────────────────────────────── */}
          <PreferenceSectionCard
            title={t('preference.sections.settings')}
            icon="settings"
            sectionKey="settings"
            {...sectionProps}
          >
            <ToggleRow
              label={t('preference.settings.strict_mode')}
              sublabel={t('preference.settings.strict_mode_hint')}
              value={preference.settings.isStrict}
              onChange={(v) => setSettings('isStrict', v)}
            />

            <ToggleRow
              label={t('preference.settings.allow_partial')}
              sublabel={t('preference.settings.allow_partial_hint')}
              value={preference.settings.allowPartialMatches}
              onChange={(v) => setSettings('allowPartialMatches', v)}
            />

            <ToggleRow
              label={t('preference.settings.horoscope_required')}
              sublabel={t('preference.settings.horoscope_required_hint')}
              value={preference.settings.horoscopeRequired}
              onChange={(v) => setSettings('horoscopeRequired', v)}
            />

            <ToggleRow
              label={t('preference.settings.verification_required')}
              sublabel={t('preference.settings.verification_required_hint')}
              value={preference.settings.profileVerificationRequired}
              onChange={(v) => setSettings('profileVerificationRequired', v)}
            />

            <NumberStepper
              label={t('preference.settings.min_match_score')}
              sublabel={t('preference.settings.min_match_score_hint')}
              value={preference.settings.minimumMatchScore}
              onChange={(v) => setSettings('minimumMatchScore', v)}
              min={MATCH_SCORE_RANGE.min}
              max={MATCH_SCORE_RANGE.max}
              step={5}
            />
          </PreferenceSectionCard>

          {/* ── Match Weights ────────────────────────────────────────────── */}
          <PreferenceSectionCard
            title={t('preference.sections.weights')}
            icon="bar-chart-2"
            sectionKey="weights"
            {...sectionProps}
          >
            <View style={styles.infoBanner}>
              <Feather name="info" size={14} color={theme.colors.primary} />
              <Text style={styles.infoBannerText}>
                {t('preference.weights.info')}
              </Text>
            </View>

            {WEIGHT_KEYS.map((key) => (
              <WeightSlider
                key={key}
                label={t(`preference.weights.${key}`)}
                value={preference.weights[key]}
                onChange={(v) => setWeight(key, v)}
                unit="%"
              />
            ))}

            {/* Running total */}
            <View style={styles.weightsTotalRow}>
              <Text style={styles.weightsTotalLabel}>
                {t('preference.weights.total')}
              </Text>
              <Text
                style={[styles.weightsTotalValue, { color: weightsTotalColor }]}
              >
                {weightsTotal}/100
              </Text>
            </View>
          </PreferenceSectionCard>

          <View style={styles.footer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
