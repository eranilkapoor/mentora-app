import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SectionCard } from '../components/SectionCard';
import { FormInput } from '../components/FormInput';
import { editProfileStyles } from '../EditProfile.styles';
import {
  FamilySection as FamilySectionType,
  SectionKey,
} from '../EditProfile.types';

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

  return (
    <SectionCard
      title={t('edit_profile.sections.parents')}
      icon="home"
      sectionKey="family"
      loadingKey={sectionLoading}
      onSave={onSave}
    >
      <View style={styles.row}>
        <View style={styles.halfField}>
          <FormInput
            label={t('edit_profile.fields.father_name')}
            value={family.fatherName ?? ''}
            onChange={(v) => onSet('fatherName', v)}
            placeholder={t('edit_profile.placeholders.father_name')}
          />
        </View>
        <View style={styles.halfField}>
          <FormInput
            label={t('edit_profile.fields.mother_name')}
            value={family.motherName ?? ''}
            onChange={(v) => onSet('motherName', v)}
            placeholder={t('edit_profile.placeholders.mother_name')}
          />
        </View>
      </View>

      <FormInput
        label={t('edit_profile.fields.guardian_name')}
        value={family.guardianName ?? ''}
        onChange={(v) => onSet('guardianName', v)}
        placeholder={t('edit_profile.placeholders.guardian_name')}
      />
      <FormInput
        label={t('edit_profile.fields.guardian_relation')}
        value={family.guardianRelation ?? ''}
        onChange={(v) => onSet('guardianRelation', v)}
        placeholder={t('edit_profile.placeholders.guardian_relation')}
      />
      <FormInput
        label={t('edit_profile.fields.guardian_phone')}
        value={family.primaryGuardianPhone ?? ''}
        onChange={(v) => onSet('primaryGuardianPhone', v)}
        keyboardType="phone-pad"
        placeholder={t('edit_profile.placeholders.guardian_phone')}
      />
      <FormInput
        label={t('edit_profile.fields.guardian_email')}
        value={family.primaryGuardianEmail ?? ''}
        onChange={(v) => onSet('primaryGuardianEmail', v)}
        keyboardType="email-address"
        placeholder={t('edit_profile.placeholders.guardian_email')}
      />
    </SectionCard>
  );
}
