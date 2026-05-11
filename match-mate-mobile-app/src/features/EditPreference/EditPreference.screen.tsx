import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
  //   useUpdatePreferenceFiltersMutation,
  //   useUpdatePreferenceSettingsMutation,
  //   useUpdatePreferenceWeightsMutation,
  //   useUpdateAboutPartnerMutation,
} from '@/store/services/preferenceApi';
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
  INCOME_STEP,
  INITIAL_PREFERENCE,
  MATCH_SCORE_RANGE,
  WEIGHT_KEYS,
} from './EditPreference.constants';
import { PreferenceSectionCard } from './components/PreferenceSectionCard';
import { RangeInput } from './components/RangeInput';
import { MultiSelectPill } from './components/MultiSelectPill';
import { SingleSelectPill } from './components/SingleSelectPill';
import { PreferenceTagInput } from './components/PreferenceTagInput';
import { PreferenceToggleRow } from './components/PreferenceToggleRow';
import { WeightSlider } from './components/WeightSlider';
import { ScoreStepper } from './components/ScoreStepper';
import {
  BodyTypeOptions,
  CasteOptions,
  ChildPreference,
  ChildPreferenceOptions,
  ComplexionOptions,
  DietTypeOptions,
  DrinkingOptions,
  ManglikStatusOptions,
  MaritalStatusOptions,
  OccupationTypeOptions,
  ReligionOptions,
  ResidencyPreference,
  ResidencyPreferenceOptions,
  SmokingOptions,
} from '@/core/types';

const ABOUT_PARTNER_MAX = 500;

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

  const [preference, setPreference] =
    useState<PreferenceData>(INITIAL_PREFERENCE);
  const [sectionLoading, setSectionLoading] =
    useState<PreferenceSectionKey | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const { data, error, isLoading } = useGetMyPreferenceQuery();
  //   const [updateFilters] = useUpdatePreferenceFiltersMutation();
  //   const [updateSettings] = useUpdatePreferenceSettingsMutation();
  //   const [updateWeights] = useUpdatePreferenceWeightsMutation();
  //   const [updateAboutPartner] = useUpdateAboutPartnerMutation();

  // ─── Load ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (isLoading) return;

    if (error) {
      Alert.alert(t('common.error'), t('preference.errors.load_failed'));
      setPageLoading(false);
      return;
    }

    if (data?.success && data?.data) {
      setPreference((prev) => ({ ...prev, ...data.data }));
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
            // await updateFilters(preference.filters).unwrap();
            break;
          case 'settings':
            // await updateSettings(preference.settings).unwrap();
            break;
          case 'weights':
            if (weightsTotal !== 100) {
              Alert.alert(
                t('preference.weights.invalid_title'),
                t('preference.weights.invalid_message', { total: weightsTotal })
              );
              return;
            }
            // await updateWeights(preference.weights).unwrap();
            break;
          case 'about':
            // await updateAboutPartner({
            //   aboutPartner: preference.aboutPartner ?? '',
            // }).unwrap();
            break;
        }
        Alert.alert(t('common.saved'), t('preference.success.section_saved'));
      } catch {
        Alert.alert(t('common.error'), t('preference.errors.save_failed'));
      } finally {
        setSectionLoading(null);
      }
    },
    [
      // preference,
      weightsTotal,
      //   updateFilters,
      //   updateSettings,
      //   updateWeights,
      //   updateAboutPartner,
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
            <RangeInput
              label={t('preference.fields.age')}
              value={preference.filters.age}
              onChange={(v) => setFilters('age', v)}
              min={AGE_RANGE.min}
              max={AGE_RANGE.max}
              unit={t('preference.units.years')}
            />

            <RangeInput
              label={t('preference.fields.height')}
              value={preference.filters.heightCm}
              onChange={(v) => setFilters('heightCm', v)}
              min={HEIGHT_RANGE.min}
              max={HEIGHT_RANGE.max}
              unit="cm"
            />

            <RangeInput
              label={t('preference.fields.annual_income')}
              value={preference.filters.annualIncome}
              onChange={(v) => setFilters('annualIncome', v)}
              min={INCOME_RANGE.min}
              max={INCOME_RANGE.max}
              step={INCOME_STEP}
              unit={t('preference.units.currency')}
            />

            <MultiSelectPill
              label={t('preference.fields.marital_status')}
              options={MaritalStatusOptions}
              value={preference.filters.maritalStatus ?? []}
              onChange={(v) => setFilters('maritalStatus', v)}
              i18nPrefix="options.marital"
            />

            <SingleSelectPill
              label={t('preference.fields.child_preference')}
              options={ChildPreferenceOptions}
              value={preference.filters.childPreference}
              onChange={(v) =>
                setFilters('childPreference', v as ChildPreference)
              }
              i18nPrefix="options.child_preference"
            />

            <SingleSelectPill
              label={t('preference.fields.residency_preference')}
              options={ResidencyPreferenceOptions}
              value={preference.filters.residencyPreference}
              onChange={(v) =>
                setFilters('residencyPreference', v as ResidencyPreference)
              }
              i18nPrefix="options.residency_preference"
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
              value={preference.filters.caste}
              onChange={(v) => setFilters('caste', v)}
              i18nPrefix="options.caste"
            />

            <PreferenceTagInput
              label={t('preference.fields.sub_caste')}
              items={preference.filters.subCaste}
              setItems={(v) => setFilters('subCaste', v)}
              placeholder={t('preference.placeholders.sub_caste')}
            />

            <MultiSelectPill
              label={t('preference.fields.manglik_status')}
              options={ManglikStatusOptions}
              value={preference.filters.manglikStatus}
              onChange={(v) => setFilters('manglikStatus', v)}
              i18nPrefix="options.manglik"
            />
          </PreferenceSectionCard>

          {/* ── Location ────────────────────────────────────────────────── */}
          <PreferenceSectionCard
            title={t('preference.sections.location')}
            icon="map-pin"
            sectionKey="filters"
            {...sectionProps}
          >
            <PreferenceTagInput
              label={t('preference.fields.country')}
              items={preference.filters.country}
              setItems={(v) => setFilters('country', v)}
              placeholder={t('preference.placeholders.country')}
            />

            <PreferenceTagInput
              label={t('preference.fields.state')}
              items={preference.filters.state}
              setItems={(v) => setFilters('state', v)}
              placeholder={t('preference.placeholders.state')}
            />

            <PreferenceTagInput
              label={t('preference.fields.city')}
              items={preference.filters.city}
              setItems={(v) => setFilters('city', v)}
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
            <PreferenceTagInput
              label={t('preference.fields.qualification')}
              items={preference.filters.qualification}
              setItems={(v) => setFilters('qualification', v)}
              placeholder={t('preference.placeholders.qualification')}
            />

            <MultiSelectPill
              label={t('preference.fields.occupation_type')}
              options={OccupationTypeOptions}
              value={preference.filters.occupationType}
              onChange={(v) => setFilters('occupationType', v)}
              i18nPrefix="options.occupation_type"
            />

            <PreferenceTagInput
              label={t('preference.fields.occupation')}
              items={preference.filters.occupation}
              setItems={(v) => setFilters('occupation', v)}
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
              value={preference.filters.bodyType}
              onChange={(v) => setFilters('bodyType', v)}
              i18nPrefix="options.body_type"
            />

            <MultiSelectPill
              label={t('preference.fields.complexion')}
              options={ComplexionOptions}
              value={preference.filters.complexion}
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
              options={SmokingOptions}
              value={preference.filters.smoking}
              onChange={(v) => setFilters('smoking', v)}
              i18nPrefix="options.smoking"
            />

            <MultiSelectPill
              label={t('preference.fields.drinking')}
              options={DrinkingOptions}
              value={preference.filters.drinking}
              onChange={(v) => setFilters('drinking', v)}
              i18nPrefix="options.drinking"
            />

            <MultiSelectPill
              label={t('preference.fields.diet')}
              options={DietTypeOptions}
              value={preference.filters.diet}
              onChange={(v) => setFilters('diet', v)}
              i18nPrefix="options.diet"
            />

            <PreferenceTagInput
              label={t('preference.fields.languages')}
              items={preference.filters.languages}
              setItems={(v) => setFilters('languages', v)}
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
            <PreferenceToggleRow
              label={t('preference.settings.strict_mode')}
              sublabel={t('preference.settings.strict_mode_hint')}
              value={preference.settings.isStrict}
              onChange={(v) => setSettings('isStrict', v)}
            />

            <PreferenceToggleRow
              label={t('preference.settings.allow_partial')}
              sublabel={t('preference.settings.allow_partial_hint')}
              value={preference.settings.allowPartialMatches}
              onChange={(v) => setSettings('allowPartialMatches', v)}
            />

            <PreferenceToggleRow
              label={t('preference.settings.horoscope_required')}
              sublabel={t('preference.settings.horoscope_required_hint')}
              value={preference.settings.horoscopeRequired}
              onChange={(v) => setSettings('horoscopeRequired', v)}
            />

            <PreferenceToggleRow
              label={t('preference.settings.verification_required')}
              sublabel={t('preference.settings.verification_required_hint')}
              value={preference.settings.profileVerificationRequired}
              onChange={(v) => setSettings('profileVerificationRequired', v)}
            />

            <ScoreStepper
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
