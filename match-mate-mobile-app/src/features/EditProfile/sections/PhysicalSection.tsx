import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { BloodGroups, BodyTypes, Complexions } from '@/core/types';
import { SectionCard } from '../components/SectionCard';
import { FormInput } from '../components/FormInput';
import { editProfileStyles } from '../EditProfile.styles';
import {
  PhysicalSection as PhysicalSectionType,
  SectionKey,
} from '../EditProfile.types';
import { ToggleRow } from '@/core/components/ToggleRow';
import { useEnumOptions } from '@/core/hooks/useEnumOptions';
import { SingleSelectPill } from '@/core/components/SingleSelectPill';

interface Props {
  physical: PhysicalSectionType;
  sectionLoading: SectionKey | null;
  onSave: (key: SectionKey) => void;
  onSet: <K extends keyof PhysicalSectionType>(
    key: K,
    value: PhysicalSectionType[K]
  ) => void;
}

export function PhysicalSection({
  physical,
  sectionLoading,
  onSave,
  onSet,
}: Props): React.ReactElement {
  const styles = useThemedStyles(editProfileStyles);
  const { t } = useTranslation();
  const BodyTypeOptions = useEnumOptions(BodyTypes, 'options.body_types');
  const ComplexionOptions = useEnumOptions(Complexions, 'options.complexion');
  const BloodGroupOptions = useEnumOptions(BloodGroups, 'options.blood_groups');

  return (
    <SectionCard
      title={t('edit_profile.sections.physical')}
      icon="activity"
      sectionKey="physical"
      loadingKey={sectionLoading}
      onSave={onSave}
    >
      <View style={styles.row}>
        <View style={styles.halfField}>
          <FormInput
            label={t('edit_profile.fields.height')}
            value={physical.height}
            onChange={(v) => onSet('height', v)}
            keyboardType="numeric"
            placeholder={t('edit_profile.placeholders.height')}
          />
        </View>
        <View style={styles.halfField}>
          <FormInput
            label={t('edit_profile.fields.weight')}
            value={physical.weight ?? ''}
            onChange={(v) => onSet('weight', v)}
            keyboardType="numeric"
            placeholder={t('edit_profile.placeholders.weight')}
          />
        </View>
      </View>

      <SingleSelectPill
        label={t('edit_profile.fields.blood_group')}
        options={BloodGroupOptions}
        value={physical.bloodGroup ?? BloodGroups.APLUS}
        onChange={(v) =>
          onSet('bloodGroup', v as PhysicalSectionType['bloodGroup'])
        }
      />

      <SingleSelectPill
        label={t('edit_profile.fields.body_type')}
        options={BodyTypeOptions}
        value={physical.bodyType ?? BodyTypes.AVERAGE}
        onChange={(v) =>
          onSet('bodyType', v as PhysicalSectionType['bodyType'])
        }
        i18nPrefix="options.body_types"
      />

      <SingleSelectPill
        label={t('edit_profile.fields.complexion')}
        options={ComplexionOptions}
        value={physical.complexion ?? Complexions.FAIR}
        onChange={(v) =>
          onSet('complexion', v as PhysicalSectionType['complexion'])
        }
        i18nPrefix="options.complexion"
      />

      <ToggleRow
        label={t('edit_profile.fields.disability_status')}
        value={physical.disabilityStatus}
        onChange={(v) => onSet('disabilityStatus', v)}
      />

      {physical.disabilityStatus && (
        <FormInput
          label={t('edit_profile.fields.disability_note')}
          value={physical.disabilityNote ?? ''}
          onChange={(v) => onSet('disabilityNote', v)}
          multiline
          placeholder={t('edit_profile.placeholders.disability_note')}
        />
      )}
    </SectionCard>
  );
}
