import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import {
  Countries,
  Country,
  Genders,
  MaritalStatuses,
  PersonalityBadges,
} from '@/core/types';
import { SectionCard } from '../components/SectionCard';
import { FormInput } from '../components/FormInput';
import { NumberStepper } from '../../../core/components/NumberStepper';
import { TimeOfBirthPicker } from '../components/TimeOfBirthPicker';
import { editProfileStyles } from '../EditProfile.styles';
import {
  PersonalSection as PersonalSectionType,
  SectionKey,
  TimeOfBirth,
} from '../EditProfile.types';
import { ToggleRow } from '@/core/components/ToggleRow';
import { DatePicker } from '../components/DateOfBirthPicker';
import { useEnumOptions } from '@/core/hooks/useEnumOptions';
import { DropdownPicker } from '@/core/components/DropdownPicker';
import { SingleSelectPill } from '@/core/components/SingleSelectPill';
import { MultiSelectPill } from '@/core/components/MultiSelectPill';

const PERSONALITY_BADGE_OPTIONS = Object.values(PersonalityBadges).map(
  (value) => ({
    value,
    label: value
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
  })
);

interface Props {
  personal: PersonalSectionType;
  sectionLoading: SectionKey | null;
  onSave: (key: SectionKey) => void;
  onSet: <K extends keyof PersonalSectionType>(
    key: K,
    value: PersonalSectionType[K]
  ) => void;
}

export function PersonalSection({
  personal,
  sectionLoading,
  onSave,
  onSet,
}: Props): React.ReactElement {
  const styles = useThemedStyles(editProfileStyles);
  const { t } = useTranslation();
  const GenderOptions = useEnumOptions(Genders, 'options.gender');
  const MaritalStatusOptions = useEnumOptions(
    MaritalStatuses,
    'options.marital_status'
  );
  const CountryOptions = useEnumOptions(Countries, 'options.countries');

  return (
    <SectionCard
      title={t('edit_profile.sections.personal')}
      icon="user"
      sectionKey="personal"
      loadingKey={sectionLoading}
      onSave={onSave}
    >
      <View style={styles.row}>
        <View style={styles.halfField}>
          <FormInput
            label={t('edit_profile.fields.first_name')}
            value={personal.firstName}
            onChange={(v) => onSet('firstName', v)}
            placeholder={t('edit_profile.placeholders.first_name')}
          />
        </View>
        <View style={styles.halfField}>
          <FormInput
            label={t('edit_profile.fields.last_name')}
            value={personal.lastName ?? ''}
            onChange={(v) => onSet('lastName', v)}
            placeholder={t('edit_profile.placeholders.last_name')}
          />
        </View>
      </View>

      <SingleSelectPill
        label={t('edit_profile.fields.gender')}
        options={GenderOptions}
        value={personal.gender}
        onChange={(v) => onSet('gender', v as PersonalSectionType['gender'])}
        i18nPrefix="options.gender"
      />

      <DatePicker
        label={t('edit_profile.fields.dob')}
        value={personal.dateOfBirth}
        onChange={(v) => onSet('dateOfBirth', v)}
      />

      <TimeOfBirthPicker
        value={personal.timeOfBirth as TimeOfBirth}
        onChange={(val) => onSet('timeOfBirth', val)}
      />

      <SingleSelectPill
        label={t('edit_profile.fields.marital_status')}
        options={MaritalStatusOptions}
        value={personal.maritalStatus}
        onChange={(v) =>
          onSet('maritalStatus', v as PersonalSectionType['maritalStatus'])
        }
        i18nPrefix="options.marital_status"
      />

      <ToggleRow
        label={t('edit_profile.fields.has_children')}
        value={personal.hasChildren}
        onChange={(v) => onSet('hasChildren', v)}
      />

      {personal.hasChildren && (
        <>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <NumberStepper
                label={t('edit_profile.fields.sons_count')}
                value={personal.sonsCount ?? 0}
                onChange={(v) => onSet('sonsCount', v)}
                suffix=""
                step={1}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <NumberStepper
                label={t('edit_profile.fields.daughters_count')}
                value={personal.daughtersCount ?? 0}
                onChange={(v) => onSet('daughtersCount', v)}
                suffix=""
                step={1}
              />
            </View>
          </View>
        </>
      )}

      <FormInput
        label={t('edit_profile.fields.mother_tongue')}
        value={personal.motherTongue ?? ''}
        onChange={(v) => onSet('motherTongue', v)}
        placeholder={t('edit_profile.placeholders.mother_tongue')}
      />
      <DropdownPicker
        label={t('onboarding.fields.country')}
        options={CountryOptions}
        value={personal.country}
        onChange={(val) => onSet('country', val as Country)}
        required
      />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <FormInput
            label={t('edit_profile.fields.state')}
            value={personal.state ?? ''}
            onChange={(v) => onSet('state', v)}
            placeholder={t('edit_profile.placeholders.state')}
          />
        </View>
        <View style={styles.halfField}>
          <FormInput
            label={t('edit_profile.fields.city')}
            value={personal.city ?? ''}
            onChange={(v) => onSet('city', v)}
            placeholder={t('edit_profile.placeholders.city')}
          />
        </View>
      </View>

      <FormInput
        label={t('edit_profile.fields.citizenship')}
        value={personal.citizenship ?? ''}
        onChange={(v) => onSet('citizenship', v)}
        placeholder={t('edit_profile.placeholders.citizenship')}
      />

      <ToggleRow
        label="NRI profile"
        value={personal.isNri ?? false}
        onChange={(v) => onSet('isNri', v)}
      />

      {personal.isNri ? (
        <>
          <DropdownPicker
            label="Residency country"
            options={CountryOptions}
            value={personal.residencyCountry ?? personal.country}
            onChange={(val) => onSet('residencyCountry', val as Country)}
          />
          <View style={styles.row}>
            <View style={styles.halfField}>
              <FormInput
                label="Visa status"
                value={personal.visaStatus ?? ''}
                onChange={(v) => onSet('visaStatus', v)}
                placeholder="Work visa, PR, citizen"
              />
            </View>
            <View style={styles.halfField}>
              <FormInput
                label="Abroad since"
                value={personal.abroadSince ?? ''}
                onChange={(v) => onSet('abroadSince', v)}
                placeholder="YYYY"
              />
            </View>
          </View>
        </>
      ) : null}

      <ToggleRow
        label={t('edit_profile.fields.willing_to_relocate')}
        value={personal.willingToRelocate}
        onChange={(v) => onSet('willingToRelocate', v)}
      />

      <FormInput
        label={t('edit_profile.fields.about_me')}
        value={personal.aboutMe ?? ''}
        onChange={(v) => onSet('aboutMe', v)}
        multiline
        placeholder={t('edit_profile.placeholders.about_me')}
      />

      <MultiSelectPill
        label="Personality badges"
        options={PERSONALITY_BADGE_OPTIONS}
        value={personal.personalityBadges ?? []}
        onChange={(v) =>
          onSet(
            'personalityBadges',
            v as PersonalSectionType['personalityBadges']
          )
        }
        minSelection={3}
        maxSelection={10}
        showSelectedCount
        helperText="Select 3 to 10 badges that describe you."
      />
    </SectionCard>
  );
}
