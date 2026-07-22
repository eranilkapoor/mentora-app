import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SectionCard } from '../components/SectionCard';
import { FormInput } from '../components/FormInput';
import { editProfileStyles } from '../EditProfile.styles';
import {
  PersonalSection,
  ReligiousDetails,
  SectionKey,
} from '../EditProfile.types';
import { useEnumOptions } from '@/core/hooks/useEnumOptions';
import {
  Castes,
  Countries,
  Country,
  ManglikStatuses,
  Religions,
} from '@/core/types';
import { DropdownPicker } from '@/core/components/DropdownPicker';
import { SingleSelectPill } from '@/core/components/SingleSelectPill';
import {
  INDIA_COUNTRY_OPTIONS,
  INDIA_STATE_OPTIONS,
} from '@/core/constants/locationOptions';

type ReligiousTextField = {
  key: Extract<keyof ReligiousDetails, string>;
  label: string;
  placeholder: string;
};

const RELIGIOUS_TEXT_FIELDS: Partial<Record<string, ReligiousTextField[]>> = {
  [Religions.MUSLIM]: [
    { key: 'sect', label: 'Sect', placeholder: 'e.g. Sunni, Shia' },
    {
      key: 'subSect',
      label: 'Sub Sect',
      placeholder: 'e.g. Bohra, Ismaili',
    },
    {
      key: 'community',
      label: 'Community',
      placeholder: 'e.g. Syed, Sheikh, Pathan',
    },
    { key: 'maslak', label: 'Maslak', placeholder: 'e.g. Barelvi' },
    {
      key: 'namaazPracticing',
      label: 'Namaaz Practice',
      placeholder: 'e.g. Regular, sometimes',
    },
    {
      key: 'hijabPreference',
      label: 'Hijab Preference',
      placeholder: 'Optional preference',
    },
  ],
  [Religions.CHRISTIAN]: [
    {
      key: 'denomination',
      label: 'Denomination',
      placeholder: 'e.g. Catholic, Protestant',
    },
    { key: 'churchName', label: 'Church Name', placeholder: 'Church name' },
    {
      key: 'churchAttendance',
      label: 'Church Attendance',
      placeholder: 'e.g. Weekly, occasional',
    },
    {
      key: 'baptismStatus',
      label: 'Baptism Status',
      placeholder: 'e.g. Baptized',
    },
    {
      key: 'confirmationStatus',
      label: 'Confirmation Status',
      placeholder: 'e.g. Confirmed',
    },
  ],
  [Religions.SIKH]: [
    {
      key: 'sikhCommunity',
      label: 'Sikh Community',
      placeholder: 'e.g. Jat Sikh, Khatri',
    },
    {
      key: 'amritdhariStatus',
      label: 'Religious Practice',
      placeholder: 'e.g. Amritdhari, Keshdhari',
    },
    {
      key: 'nativeVillage',
      label: 'Native Village',
      placeholder: 'Native village',
    },
    {
      key: 'gurudwaraName',
      label: 'Gurudwara',
      placeholder: 'Gurudwara name',
    },
  ],
  [Religions.JAIN]: [
    { key: 'jainSect', label: 'Jain Sect', placeholder: 'e.g. Digambar' },
    {
      key: 'jainCommunity',
      label: 'Jain Community',
      placeholder: 'Community',
    },
    {
      key: 'foodStrictness',
      label: 'Food Preference',
      placeholder: 'e.g. Jain food, no onion/garlic',
    },
  ],
  [Religions.BUDDHIST]: [
    {
      key: 'buddhistTradition',
      label: 'Tradition',
      placeholder: 'e.g. Theravada, Navayana',
    },
    {
      key: 'buddhistCommunity',
      label: 'Community',
      placeholder: 'Community',
    },
  ],
  [Religions.JEWISH]: [
    {
      key: 'jewishDenomination',
      label: 'Denomination',
      placeholder: 'e.g. Orthodox, Reform',
    },
    {
      key: 'jewishCommunity',
      label: 'Community',
      placeholder: 'Community',
    },
    {
      key: 'kosherPractice',
      label: 'Kosher Practice',
      placeholder: 'e.g. Strict, at home',
    },
  ],
  [Religions.PARSI]: [
    {
      key: 'parsiCommunity',
      label: 'Parsi Community',
      placeholder: 'e.g. Parsi, Irani',
    },
    {
      key: 'fireTempleAssociation',
      label: 'Fire Temple Association',
      placeholder: 'Fire temple association',
    },
  ],
  [Religions.OTHER]: [
    {
      key: 'otherReligionDetails',
      label: 'Religious Details',
      placeholder: 'Share relevant religious or community details',
    },
  ],
};

const RELIGIOUS_BOOLEAN_FIELDS: Partial<Record<string, ReligiousTextField[]>> =
  {
    [Religions.MUSLIM]: [
      {
        key: 'halalLifestyle',
        label: 'Halal Lifestyle',
        placeholder: '',
      },
    ],
    [Religions.CHRISTIAN]: [
      {
        key: 'bornAgain',
        label: 'Born Again',
        placeholder: '',
      },
    ],
    [Religions.SIKH]: [
      {
        key: 'wearsTurban',
        label: 'Wears Turban',
        placeholder: '',
      },
    ],
    [Religions.PARSI]: [
      {
        key: 'navjoteDone',
        label: 'Navjote Done',
        placeholder: '',
      },
    ],
  };

const yesNoOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
];

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
  const ManglikStatusOptions = useEnumOptions(
    ManglikStatuses,
    'options.manglik_status'
  );
  const ReligionOptions = useEnumOptions(Religions, 'options.religion');
  const CasteOptions = useEnumOptions(Castes, 'options.caste');
  const religiousDetails = personal.religiousDetails ?? {};

  const fieldText = (
    group: 'fields' | 'placeholders',
    key: string,
    fallback: string
  ) => t(`edit_profile.${group}.${key}`, { defaultValue: fallback });

  const setReligiousDetail = <K extends keyof ReligiousDetails>(
    key: K,
    value: ReligiousDetails[K]
  ) => {
    onSet('religiousDetails', {
      ...religiousDetails,
      [key]: value,
    });
  };

  const handleReligionChange = (religion: PersonalSection['religion']) => {
    onSet('religion', religion);
    onSet('religiousDetails', {});
  };

  const renderTextField = ({ key, label, placeholder }: ReligiousTextField) => (
    <FormInput
      key={String(key)}
      label={fieldText('fields', String(key), label)}
      value={(religiousDetails[key] as string | undefined) ?? ''}
      onChange={(v) => setReligiousDetail(key, v)}
      placeholder={fieldText('placeholders', String(key), placeholder)}
    />
  );

  const renderBooleanField = ({ key, label }: ReligiousTextField) => (
    <SingleSelectPill
      key={String(key)}
      label={fieldText('fields', String(key), label)}
      options={yesNoOptions}
      value={
        religiousDetails[key] === true
          ? 'yes'
          : religiousDetails[key] === false
            ? 'no'
            : ''
      }
      onChange={(v) => setReligiousDetail(key, (v === 'yes') as never)}
    />
  );

  const renderReligiousDetails = () => {
    if (personal.religion === Religions.HINDU) {
      return (
        <>
          <SingleSelectPill
            label={t('edit_profile.fields.caste')}
            options={CasteOptions}
            value={religiousDetails.caste ?? ''}
            onChange={(v) =>
              setReligiousDetail('caste', v as ReligiousDetails['caste'])
            }
            i18nPrefix="options.caste"
          />
          <View style={styles.row}>
            <View style={styles.halfField}>
              <FormInput
                label={t('edit_profile.fields.sub_cast')}
                value={religiousDetails.subCaste ?? ''}
                onChange={(v) => setReligiousDetail('subCaste', v)}
                placeholder={t('edit_profile.placeholders.sub_cast')}
              />
            </View>
            <View style={styles.halfField}>
              <FormInput
                label={t('edit_profile.fields.gotra')}
                value={religiousDetails.gotra ?? ''}
                onChange={(v) => setReligiousDetail('gotra', v)}
                placeholder={t('edit_profile.placeholders.gotra')}
              />
            </View>
          </View>
          <SingleSelectPill
            label={t('edit_profile.fields.manglik_status')}
            options={ManglikStatusOptions}
            value={
              religiousDetails.manglikStatus ?? ManglikStatuses.NON_MANGLIK
            }
            onChange={(v) =>
              setReligiousDetail(
                'manglikStatus',
                v as ReligiousDetails['manglikStatus']
              )
            }
            i18nPrefix="options.manglik_status"
          />
          <View style={styles.row}>
            <View style={styles.halfField}>
              <FormInput
                label={t('edit_profile.fields.rashi')}
                value={religiousDetails.rashi ?? ''}
                onChange={(v) => setReligiousDetail('rashi', v)}
                placeholder={t('edit_profile.placeholders.rashi')}
              />
            </View>
            <View style={styles.halfField}>
              <FormInput
                label={t('edit_profile.fields.nakshatra')}
                value={religiousDetails.nakshatra ?? ''}
                onChange={(v) => setReligiousDetail('nakshatra', v)}
                placeholder={t('edit_profile.placeholders.nakshatra')}
              />
            </View>
          </View>
        </>
      );
    }

    const textFields = RELIGIOUS_TEXT_FIELDS[personal.religion] ?? [];
    const booleanFields = RELIGIOUS_BOOLEAN_FIELDS[personal.religion] ?? [];

    return (
      <>
        {textFields.map(renderTextField)}
        {booleanFields.map(renderBooleanField)}
      </>
    );
  };

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
        options={INDIA_COUNTRY_OPTIONS}
        value={personal.placeOfBirth?.country ?? Countries.INDIA}
        onChange={(val) =>
          onSet('placeOfBirth', {
            ...personal.placeOfBirth,
            country: val as Country,
          })
        }
        placeholder={t('edit_profile.placeholders.country')}
        required
      />
      <View style={styles.row}>
        <View style={styles.halfField}>
          <DropdownPicker
            label={t('edit_profile.fields.birth_state')}
            options={INDIA_STATE_OPTIONS}
            value={personal.placeOfBirth?.state ?? ''}
            onChange={(v) =>
              onSet('placeOfBirth', { ...personal.placeOfBirth, state: v })
            }
            placeholder={t('edit_profile.placeholders.state')}
            searchable
            maxHeight={320}
          />
        </View>
        <View style={styles.halfField}>
          <FormInput
            label={t('edit_profile.fields.birth_city')}
            value={personal.placeOfBirth?.city ?? ''}
            onChange={(v) =>
              onSet('placeOfBirth', { ...personal.placeOfBirth, city: v })
            }
            placeholder={t('edit_profile.placeholders.city')}
          />
        </View>
      </View>
      <SingleSelectPill
        label={t('edit_profile.fields.religion')}
        options={ReligionOptions}
        value={personal.religion ?? ''}
        onChange={(v) => handleReligionChange(v as PersonalSection['religion'])}
        i18nPrefix="options.religion"
      />
      {renderReligiousDetails()}
    </SectionCard>
  );
}
