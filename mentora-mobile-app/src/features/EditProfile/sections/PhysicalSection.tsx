import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '../components/SectionCard';
import {
  PhysicalSection as PhysicalSectionType,
  SectionKey,
} from '../EditProfile.types';
import { TagInput } from '@/core/components/TagInput';

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
  const { t } = useTranslation();

  return (
    <SectionCard
      title={t('edit_profile.sections.accessibility')}
      icon="activity"
      sectionKey="physical"
      loadingKey={sectionLoading}
      onSave={onSave}
    >
      <TagInput
        label={t('edit_profile.fields.accessibility_needs')}
        value={physical.accessibilityNeeds ?? []}
        onChange={(values) => onSet('accessibilityNeeds', values)}
        placeholder={t('edit_profile.placeholders.accessibility_needs')}
      />
    </SectionCard>
  );
}
