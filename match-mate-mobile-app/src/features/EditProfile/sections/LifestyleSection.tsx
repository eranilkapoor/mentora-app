import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  EatingHabits,
  DrinkingHabits,
  SmokingHabits,
} from '@/core/types';
import { SectionCard } from '../components/SectionCard';
import { PersonalSection, SectionKey } from '../EditProfile.types';
import { SelectPill } from '@/core/components/SelectPill';
import { TagInput } from '@/core/components/TagInput';
import { useEnumOptions } from '@/core/hooks/useEnumOptions';

interface Props {
  personal: PersonalSection;
  sectionLoading: SectionKey | null;
  onSave: (key: SectionKey) => void;
  onSet: <K extends keyof PersonalSection>(
    key: K,
    value: PersonalSection[K]
  ) => void;
}

export function LifestyleSection({
  personal,
  sectionLoading,
  onSave,
  onSet,
}: Props): React.ReactElement {
  const { t } = useTranslation();
  const SmokingHabitsOptions = useEnumOptions(SmokingHabits, 'options.smoking');
  const DrinkingHabitsOptions = useEnumOptions(DrinkingHabits, 'options.drinking');
  const EatingHabitsOptions = useEnumOptions(EatingHabits, 'options.eating');

  return (
    <SectionCard
      title={t('edit_profile.sections.lifestyle')}
      icon="coffee"
      sectionKey="personal"
      loadingKey={sectionLoading}
      onSave={onSave}
    >
      <SelectPill
        label={t('edit_profile.fields.smoking')}
        options={SmokingHabitsOptions}
        value={personal.smoking}
        onChange={(v) => onSet('smoking', v as PersonalSection['smoking'])}
        i18nPrefix="options.smoking"
      />
      <SelectPill
        label={t('edit_profile.fields.drinking')}
        options={DrinkingHabitsOptions}
        value={personal.drinking}
        onChange={(v) => onSet('drinking', v as PersonalSection['drinking'])}
        i18nPrefix="options.drinking"
      />
      <SelectPill
        label={t('edit_profile.fields.eating')}
        options={EatingHabitsOptions}
        value={personal.eating}
        onChange={(v) => onSet('eating', v as PersonalSection['eating'])}
        i18nPrefix="options.eating"
      />
      <TagInput
        label={t('edit_profile.fields.hobbies')}
        value={personal.hobbies}
        onChange={(v) => onSet('hobbies', v)}
        placeholder={t('edit_profile.placeholders.hobbies')}
      />
      <TagInput
        label={t('edit_profile.fields.languages_known')}
        value={personal.languages}
        onChange={(v) => onSet('languages', v)}
        placeholder={t('edit_profile.placeholders.languages_known')}
      />
    </SectionCard>
  );
}