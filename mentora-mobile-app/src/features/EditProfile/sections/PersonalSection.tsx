import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { Countries, Country, Genders } from '@/core/types';
import { SectionCard } from '../components/SectionCard';
import { FormInput } from '../components/FormInput';
import { editProfileStyles } from '../EditProfile.styles';
import {
  PersonalSection as PersonalSectionType,
  SectionKey,
} from '../EditProfile.types';
import { DatePicker } from '../components/DateOfBirthPicker';
import { useEnumOptions } from '@/core/hooks/useEnumOptions';
import { DropdownPicker } from '@/core/components/DropdownPicker';
import { SingleSelectPill } from '@/core/components/SingleSelectPill';
import { MultiSelectPill } from '@/core/components/MultiSelectPill';
import { getPersonalityBadgeOptions } from '@/core/utils/personalityBadges';
import {
  INDIA_COUNTRY_OPTIONS,
  INDIA_STATE_OPTIONS,
  NRI_COUNTRY_OPTIONS,
} from '@/core/constants/locationOptions';

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
  const genderOptions = useEnumOptions(Genders, 'options.gender');
  const personalityBadgeOptions = getPersonalityBadgeOptions(t);

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
        options={genderOptions}
        value={personal.gender}
        onChange={(v) => onSet('gender', v as PersonalSectionType['gender'])}
        i18nPrefix="options.gender"
        disabled
        helperText={t('edit_profile.fields.identity_locked_helper')}
      />

      <DatePicker
        label={t('edit_profile.fields.dob')}
        value={personal.dateOfBirth}
        onChange={() => undefined}
        disabled
      />

      <FormInput
        label={t('edit_profile.fields.mother_tongue')}
        value={personal.motherTongue ?? ''}
        onChange={(v) => onSet('motherTongue', v)}
        placeholder={t('edit_profile.placeholders.mother_tongue')}
      />

      <DropdownPicker
        label={t('onboarding.fields.country')}
        options={INDIA_COUNTRY_OPTIONS}
        value={personal.country}
        onChange={() => onSet('country', Countries.INDIA)}
        maxHeight={320}
        required
      />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <DropdownPicker
            label={t('edit_profile.fields.state')}
            options={INDIA_STATE_OPTIONS}
            value={personal.state ?? ''}
            onChange={(v) => onSet('state', v)}
            placeholder={t('edit_profile.placeholders.state')}
            searchable
            maxHeight={320}
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

      <DropdownPicker
        label={t('edit_profile.fields.residency_country')}
        options={NRI_COUNTRY_OPTIONS}
        value={personal.residencyCountry ?? personal.country}
        onChange={(val) => onSet('residencyCountry', val as Country)}
        searchable
        maxHeight={320}
      />

      <FormInput
        label={t('edit_profile.fields.about_me')}
        value={personal.aboutMe ?? ''}
        onChange={(v) => onSet('aboutMe', v)}
        multiline
        placeholder={t('edit_profile.placeholders.about_me')}
      />

      <MultiSelectPill
        label={t('edit_profile.fields.personality_badges')}
        options={personalityBadgeOptions}
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
        helperText={t('edit_profile.fields.personality_badges_helper')}
      />
    </SectionCard>
  );
}
