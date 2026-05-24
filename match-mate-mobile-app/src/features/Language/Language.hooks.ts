import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setLanguage, Language } from '../../store/slices/settingsSlice';
import { getLanguageOptions } from './Language.constants';
import { useUpdateLocalizationSettingsMutation } from '@/store/services/localizationSettings.service';

export const useLanguageScreen = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const currentLang = useAppSelector((s) => s.settings.language);
  const [updateLocalizationSettings] = useUpdateLocalizationSettingsMutation();

  const languages = getLanguageOptions(t);

  const onSelectLanguage = (lang: Language) => {
    dispatch(setLanguage(lang));
    void updateLocalizationSettings({ appLanguage: lang }).catch(
      (error: unknown) => {
        console.error('Language update error:', error);
      }
    );
  };

  return {
    t,
    languages,
    currentLang,
    onSelectLanguage,
  };
};
