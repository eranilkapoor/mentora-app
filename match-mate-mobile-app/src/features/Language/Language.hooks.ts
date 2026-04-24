import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setLanguage, Language } from '../../store/slices/settingsSlice';
import { getLanguageOptions } from './Language.constants';

export const useLanguageScreen = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const currentLang = useAppSelector((s) => s.settings.language);

  const languages = getLanguageOptions(t);

  const onSelectLanguage = (lang: Language) => {
    dispatch(setLanguage(lang));
  };

  return {
    t,
    languages,
    currentLang,
    onSelectLanguage,
  };
};
