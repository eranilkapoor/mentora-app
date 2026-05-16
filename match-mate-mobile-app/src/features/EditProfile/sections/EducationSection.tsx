import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '../components/SectionCard';
import { FormInput } from '../components/FormInput';
import { EducationSection as EducationSectionType, SectionKey } from '../EditProfile.types';
import { SelectPill } from '@/core/components/SelectPill';
import { useEnumOptions } from '@/core/hooks/useEnumOptions';
import { OccupationTypes } from '@/core/types';

interface Props {
  education: EducationSectionType;
  sectionLoading: SectionKey | null;
  onSave: (key: SectionKey) => void;
  onSet: <K extends keyof EducationSectionType>(
    key: K,
    value: EducationSectionType[K]
  ) => void;
}

export function EducationSection({
  education,
  sectionLoading,
  onSave,
  onSet,
}: Props): React.ReactElement {
  const { t } = useTranslation();
  const OccupationTypeOptions = useEnumOptions(OccupationTypes, 'options.occupation_types');

  return (
    <SectionCard
      title={t('edit_profile.sections.education')}
      icon="book"
      sectionKey="education"
      loadingKey={sectionLoading}
      onSave={onSave}
    >
      <FormInput
        label={t('edit_profile.fields.qualification')}
        value={education.qualification}
        onChange={(v) => onSet('qualification', v)}
        placeholder={t('edit_profile.placeholders.qualification')}
      />
      <FormInput
        label={t('edit_profile.fields.field_of_study')}
        value={education.field}
        onChange={(v) => onSet('field', v)}
        placeholder={t('edit_profile.placeholders.field_of_study')}
      />
      <FormInput
        label={t('edit_profile.fields.university')}
        value={education.university}
        onChange={(v) => onSet('university', v)}
        placeholder={t('edit_profile.placeholders.university')}
      />

      <SelectPill
        label={t('edit_profile.fields.occupation_type')}
        options={OccupationTypeOptions}
        value={education.occupationType}
        onChange={(v) => onSet('occupationType', v as EducationSectionType['occupationType'])}
        i18nPrefix="options.occupation_type"
      />

      <FormInput
        label={t('edit_profile.fields.occupation')}
        value={education.occupation}
        onChange={(v) => onSet('occupation', v)}
        placeholder={t('edit_profile.placeholders.occupation')}
      />
      <FormInput
        label={t('edit_profile.fields.company_name')}
        value={education.companyName}
        onChange={(v) => onSet('companyName', v)}
        placeholder={t('edit_profile.placeholders.company_name')}
      />
      <FormInput
        label={t('edit_profile.fields.job_role')}
        value={education.jobRole}
        onChange={(v) => onSet('jobRole', v)}
        placeholder={t('edit_profile.placeholders.job_role')}
      />
      <FormInput
        label={t('edit_profile.fields.annual_income')}
        value={education.annualIncomeAmount}
        onChange={(v) => onSet('annualIncomeAmount', v)}
        keyboardType="numeric"
        placeholder={t('edit_profile.placeholders.annual_income')}
      />
    </SectionCard>
  );
}