import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '../components/SectionCard';
import { FormInput } from '../components/FormInput';
import {
  EducationSection as EducationSectionType,
  SectionKey,
} from '../EditProfile.types';
import { useEnumOptions } from '@/core/hooks/useEnumOptions';
import { Qualifications } from '@/core/types';
import { DropdownPicker } from '@/core/components/DropdownPicker';
import { TagInput } from '@/core/components/TagInput';

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
  const qualificationOptions = useEnumOptions(
    Qualifications,
    'options.qualifications'
  );

  return (
    <SectionCard
      title={t('edit_profile.sections.academic')}
      icon="book"
      sectionKey="education"
      loadingKey={sectionLoading}
      onSave={onSave}
    >
      <DropdownPicker
        label={t('onboarding.fields.academic_level')}
        options={qualificationOptions}
        value={education.qualification}
        onChange={(val) => onSet('qualification', val)}
        searchable
        maxHeight={340}
        required
      />

      <FormInput
        label={t('onboarding.fields.grade')}
        value={education.field ?? ''}
        onChange={(v) => onSet('field', v)}
        placeholder={t('onboarding.placeholders.grade')}
      />
      <FormInput
        label={t('onboarding.fields.institution')}
        value={education.university ?? ''}
        onChange={(v) => onSet('university', v)}
        placeholder={t('onboarding.placeholders.institution')}
      />
      <FormInput
        label={t('onboarding.fields.learning_goal')}
        value={education.occupation ?? ''}
        onChange={(v) => onSet('occupation', v)}
        placeholder={t('onboarding.placeholders.learning_goal')}
      />
      <TagInput
        label={t('onboarding.fields.target_subjects')}
        value={education.preferredSubjects ?? []}
        onChange={(values) => onSet('preferredSubjects', values)}
        placeholder={t('onboarding.placeholders.target_subjects')}
      />
      <FormInput
        label={t('edit_profile.sections.previous_education')}
        value={education.previousEducationSummary ?? ''}
        onChange={(v) => onSet('previousEducationSummary', v)}
        multiline
        placeholder={t('edit_profile.placeholders.previous_education')}
      />
      <FormInput
        label={t('edit_profile.sections.exam_scores')}
        value={education.examScoreSummary ?? ''}
        onChange={(v) => onSet('examScoreSummary', v)}
        multiline
        placeholder={t('edit_profile.placeholders.exam_scores')}
      />
      <FormInput
        label={t('edit_profile.sections.course_preference')}
        value={education.coursePreference ?? ''}
        onChange={(v) => onSet('coursePreference', v)}
        multiline
        placeholder={t('edit_profile.placeholders.course_preference')}
      />
    </SectionCard>
  );
}
