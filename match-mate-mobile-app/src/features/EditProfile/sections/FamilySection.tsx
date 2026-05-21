import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import {
  FamilyStatuses,
  FamilyTypes,
  FamilyValues,
} from '@/core/types';
import { SectionCard } from '../components/SectionCard';
import { FormInput } from '../components/FormInput';
import { SiblingsEditor } from '../components/SiblingsEditor';
import { editProfileStyles } from '../EditProfile.styles';
import { FamilySection as FamilySectionType, SectionKey } from '../EditProfile.types';
import { useEnumOptions } from '@/core/hooks/useEnumOptions';
import { SingleSelectPill } from '@/core/components/SingleSelectPill';

interface Props {
  family: FamilySectionType;
  sectionLoading: SectionKey | null;
  onSave: (key: SectionKey) => void;
  onSet: <K extends keyof FamilySectionType>(
    key: K,
    value: FamilySectionType[K]
  ) => void;
}

export function FamilySection({
  family,
  sectionLoading,
  onSave,
  onSet,
}: Props): React.ReactElement {
  const styles = useThemedStyles(editProfileStyles);
  const { t } = useTranslation();
  const FamilyTypeOptions = useEnumOptions(FamilyTypes, 'options.family_types');
  const FamilyStatusOptions = useEnumOptions(FamilyStatuses, 'options.family_status');
  const FamilyValueOptions = useEnumOptions(FamilyValues, 'options.family_values');

  return (
    <SectionCard
      title={t('edit_profile.sections.family')}
      icon="home"
      sectionKey="family"
      loadingKey={sectionLoading}
      onSave={onSave}
    >
      <View style={styles.row}>
        <View style={styles.halfField}>
          <FormInput
            label={t('edit_profile.fields.father_name')}
            value={family.fatherName}
            onChange={(v) => onSet('fatherName', v)}
          />
        </View>
        <View style={styles.halfField}>
          <FormInput
            label={t('edit_profile.fields.mother_name')}
            value={family.motherName}
            onChange={(v) => onSet('motherName', v)}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.halfField}>
          <FormInput
            label={t('edit_profile.fields.father_occupation')}
            value={family.fatherOccupation}
            onChange={(v) => onSet('fatherOccupation', v)}
          />
        </View>
        <View style={styles.halfField}>
          <FormInput
            label={t('edit_profile.fields.mother_occupation')}
            value={family.motherOccupation}
            onChange={(v) => onSet('motherOccupation', v)}
          />
        </View>
      </View>

      <SingleSelectPill
        label={t('edit_profile.fields.family_type')}
        options={FamilyTypeOptions}
        value={family.familyType}
        onChange={(v) => onSet('familyType', v as FamilySectionType['familyType'])}
        i18nPrefix="options.family_types"
      />
      <SingleSelectPill
        label={t('edit_profile.fields.family_status')}
        options={FamilyStatusOptions}
        value={family.familyStatus}
        onChange={(v) => onSet('familyStatus', v as FamilySectionType['familyStatus'])}
        i18nPrefix="options.family_status"
      />
      <SingleSelectPill
        label={t('edit_profile.fields.family_values')}
        options={FamilyValueOptions}
        value={family.familyValues}
        onChange={(v) => onSet('familyValues', v as FamilySectionType['familyValues'])}
        i18nPrefix="options.family_values"
      />

      <SiblingsEditor
        value={family.siblings}
        onChange={(v) => onSet('siblings', v)}
      />
    </SectionCard>
  );
}