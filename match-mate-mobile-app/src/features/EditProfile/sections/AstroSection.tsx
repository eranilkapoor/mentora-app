import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SectionCard } from '../components/SectionCard';
import { FormInput } from '../components/FormInput';
import { editProfileStyles } from '../EditProfile.styles';
import { PersonalSection, SectionKey } from '../EditProfile.types';
import { SelectPill } from '@/core/components/SelectPill';
import { useEnumOptions } from '@/core/hooks/useEnumOptions';
import { Countries, Country, ManglikStatuses } from '@/core/types';
import { DropdownPicker } from '@/core/components/DropdownPicker';

interface Props {
  personal: PersonalSection;
  sectionLoading: SectionKey | null;
  onSave: (key: SectionKey) => void;
  onSet: <K extends keyof PersonalSection>(
    key: K,
    value: PersonalSection[K]
  ) => void;
}

export function AstroSection({
  personal,
  sectionLoading,
  onSave,
  onSet,
}: Props): React.ReactElement {
  const styles = useThemedStyles(editProfileStyles);
  const { t } = useTranslation();
  const ManglikStatusOptions = useEnumOptions(ManglikStatuses, 'options.manglik_status');
  const CountryOptions = useEnumOptions(Countries, 'options.countries');

  return (
    <SectionCard
      title={t('edit_profile.sections.astro')}
      icon="moon"
      sectionKey="personal"
      loadingKey={sectionLoading}
      onSave={onSave}
    >
      <Text style={styles.subSectionLabel}>
        {t('edit_profile.fields.place_of_birth')}
      </Text>
      <DropdownPicker
        label={t('edit_profile.fields.birth_country')}
        options={CountryOptions}
        value={personal.placeOfBirth?.country}
        onChange={(val) => onSet('placeOfBirth', { ...personal.placeOfBirth, country: val as Country})}
        placeholder={t('edit_profile.placeholders.country')}
        required
      />
      <View style={styles.row}>
        <View style={styles.halfField}>
          <FormInput
            label={t('edit_profile.fields.birth_state')}
            value={personal.placeOfBirth?.state}
            onChange={(v) =>
              onSet('placeOfBirth', { ...personal.placeOfBirth, state: v })
            }
            placeholder={t('edit_profile.placeholders.state')}
          />
        </View>
        <View style={styles.halfField}>
          <FormInput
            label={t('edit_profile.fields.birth_city')}
            value={personal.placeOfBirth?.city}
            onChange={(v) =>
              onSet('placeOfBirth', { ...personal.placeOfBirth, city: v })
            }
            placeholder={t('edit_profile.placeholders.city')}
          />
        </View>
      </View>
      <SelectPill
        label={t('edit_profile.fields.manglik_status')}
        options={ManglikStatusOptions}
        value={personal.manglikStatus}
        onChange={(v) => onSet('manglikStatus', v as PersonalSection['manglikStatus'])}
        i18nPrefix="options.manglik_status"
      />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <FormInput
            label={t('edit_profile.fields.rashi')}
            value={personal.rashi}
            onChange={(v) => onSet('rashi', v)}
          />
        </View>
        <View style={styles.halfField}>
          <FormInput
            label={t('edit_profile.fields.nakshatra')}
            value={personal.nakshatra}
            onChange={(v) => onSet('nakshatra', v)}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.halfField}>
          <FormInput
            label={t('edit_profile.fields.sub_cast')}
            value={personal.subCast}
            onChange={(v) => onSet('subCast', v)}
          />
        </View>
        <View style={styles.halfField}>
          <FormInput
            label={t('edit_profile.fields.gotra')}
            value={personal.gotra}
            onChange={(v) => onSet('gotra', v)}
          />
        </View>
      </View>
    </SectionCard>
  );
}