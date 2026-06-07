import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { sharedSettingsStyles } from '../Settings/shared.settings.styles';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import { SettingsToggleItem } from '@/core/components/settings/SettingsToggleItem';
import {
  SettingsOption,
  SettingsOptionSheet,
} from '@/core/components/settings/SettingsOptionSheet';
import {
  useGetLocalizationSettingsQuery,
  useUpdateLocalizationSettingsMutation,
} from '@/store/services/localizationSettingsApi.service';
import Loader from '@/core/components/Loader';
import {
  LocalizationSettings,
  LocalizationSettingsScreenProps,
  SelectKey,
} from './LocalizationSettings.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setLocationSharing } from '@/store/slices/settings.slice';

const formatValue = <T extends string>(
  options: SettingsOption<T>[],
  value?: T
): string => options.find((option) => option.value === value)?.label ?? '';

export default function LocalizationSettingsScreen({
  navigation,
}: LocalizationSettingsScreenProps): React.ReactElement {
  const styles = useThemedStyles(sharedSettingsStyles);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const locationSharing = useAppSelector(
    (state) => state.settings.locationSharing
  );
  const currentLanguage = useAppSelector((state) => state.settings.language);
  const { data, isLoading } = useGetLocalizationSettingsQuery();
  const [updateLocalizationSettings] = useUpdateLocalizationSettingsMutation();
  const [activeSelect, setActiveSelect] = useState<SelectKey | null>(null);

  const settings = data?.localization;

  const regionOptions = useMemo<SettingsOption<string>[]>(
    () => [
      { value: 'IN', label: t('settings.options.india') },
      { value: 'US', label: t('settings.options.united_states') },
      { value: 'GB', label: t('settings.options.united_kingdom') },
      { value: 'GLOBAL', label: t('settings.options.global') },
    ],
    [t]
  );

  const timezoneOptions = useMemo<SettingsOption<string>[]>(
    () => [
      { value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
      { value: 'UTC', label: 'UTC' },
      { value: 'America/New_York', label: 'America/New_York' },
      { value: 'Europe/London', label: 'Europe/London' },
    ],
    []
  );

  const dateFormatOptions = useMemo<
    SettingsOption<LocalizationSettings['dateFormat']>[]
  >(
    () => [
      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
    ],
    []
  );

  const currencyOptions = useMemo<SettingsOption<string>[]>(
    () => [
      { value: 'INR', label: 'INR' },
      { value: 'USD', label: 'USD' },
      { value: 'GBP', label: 'GBP' },
    ],
    []
  );

  const handleUpdate = useCallback(
    <K extends keyof LocalizationSettings>(
      key: K,
      value: LocalizationSettings[K]
    ) => {
      void updateLocalizationSettings({ [key]: value });
    },
    [updateLocalizationSettings]
  );

  useEffect(() => {
    if (settings?.shareLocation !== undefined) {
      dispatch(setLocationSharing(Boolean(settings.shareLocation)));
    }
  }, [dispatch, settings?.shareLocation]);

  const handleLocationSharingChange = useCallback(
    (value: boolean) => {
      const previousValue = locationSharing;
      dispatch(setLocationSharing(value));

      void updateLocalizationSettings({ shareLocation: value })
        .unwrap()
        .then((response) => {
          dispatch(
            setLocationSharing(Boolean(response.localization.shareLocation))
          );
        })
        .catch(() => {
          dispatch(setLocationSharing(previousValue));
        });
    },
    [dispatch, locationSharing, updateLocalizationSettings]
  );

  if (isLoading || !settings) {
    return <Loader fullScreen size="large" />;
  }

  const currentLanguageLabel =
    currentLanguage === 'en' ? t('language.english') : t('language.hindi');

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.localization.title')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Language */}
        <SettingsCard
          icon="globe"
          title={t('settings.localization.language')}
          subtitle={t('settings.localization.language_subtitle')}
        >
          <SettingsSelectItem
            icon="message-square"
            label={t('settings.localization.app_language')}
            sublabel={t('settings.localization.app_language_sub', {
              defaultValue:
                'Change the language used for labels, messages, and app content.',
            })}
            value={currentLanguageLabel}
            isLast
            onPress={() => navigation.navigate('Languages')}
          />
        </SettingsCard>

        {/* Region */}
        <SettingsCard
          icon="map-pin"
          title={t('settings.localization.region')}
          subtitle={t('settings.localization.region_subtitle')}
        >
          <SettingsToggleItem
            icon="map-pin"
            label={t('settings.share_location')}
            sublabel={t('settings.share_location_sub')}
            value={locationSharing}
            onChange={handleLocationSharingChange}
          />
          <SettingsSelectItem
            icon="map"
            label={t('settings.localization.region_label')}
            sublabel={t('settings.localization.region_label_sub', {
              defaultValue:
                'Used to personalize defaults such as location, currency, and content.',
            })}
            value={formatValue(regionOptions, settings.region)}
            onPress={() => setActiveSelect('region')}
          />
          <SettingsSelectItem
            icon="clock"
            label={t('settings.localization.timezone')}
            sublabel={t('settings.localization.timezone_sub', {
              defaultValue:
                'Used for quiet hours, notifications, and activity timestamps.',
            })}
            value={settings?.timezone}
            isLast
            onPress={() => setActiveSelect('timezone')}
          />
        </SettingsCard>

        {/* Format */}
        <SettingsCard
          icon="calendar"
          title={t('settings.localization.format')}
          subtitle={t('settings.localization.format_subtitle')}
        >
          <SettingsSelectItem
            icon="calendar"
            label={t('settings.localization.date_format')}
            sublabel={t('settings.localization.date_format_sub', {
              defaultValue:
                'Choose how dates appear across profile, billing, and activity screens.',
            })}
            value={settings?.dateFormat ?? 'YYYY-MM-DD'}
            onPress={() => setActiveSelect('dateFormat')}
          />
          <SettingsSelectItem
            icon="dollar-sign"
            label={t('settings.localization.currency')}
            sublabel={t('settings.localization.currency_sub', {
              defaultValue:
                'Choose the currency used for plans, billing, and rewards.',
            })}
            value={settings?.currency?.toUpperCase() ?? 'INR'}
            isLast
            onPress={() => setActiveSelect('currency')}
          />
        </SettingsCard>

        <View style={styles.footer} />
      </ScrollView>

      <SettingsOptionSheet
        visible={activeSelect === 'region'}
        title={t('settings.localization.region_label')}
        options={regionOptions}
        selectedValue={settings.region ?? 'GLOBAL'}
        onSelect={(value) => handleUpdate('region', value)}
        onClose={() => setActiveSelect(null)}
      />
      <SettingsOptionSheet
        visible={activeSelect === 'timezone'}
        title={t('settings.localization.timezone')}
        options={timezoneOptions}
        selectedValue={settings.timezone ?? 'UTC'}
        onSelect={(value) => handleUpdate('timezone', value)}
        onClose={() => setActiveSelect(null)}
      />
      <SettingsOptionSheet
        visible={activeSelect === 'dateFormat'}
        title={t('settings.localization.date_format')}
        options={dateFormatOptions}
        selectedValue={settings.dateFormat ?? 'YYYY-MM-DD'}
        onSelect={(value) => handleUpdate('dateFormat', value)}
        onClose={() => setActiveSelect(null)}
      />
      <SettingsOptionSheet
        visible={activeSelect === 'currency'}
        title={t('settings.localization.currency')}
        options={currencyOptions}
        selectedValue={settings.currency ?? 'INR'}
        onSelect={(value) => handleUpdate('currency', value)}
        onClose={() => setActiveSelect(null)}
      />
    </SafeAreaView>
  );
}
