import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getThemeOptions } from './Theme.constants';
import { setTheme, ThemeMode } from '@/store/slices/settingsSlice';

export const useThemeScreen = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const currentTheme = useAppSelector((s) => s.settings.theme);

  const themes = getThemeOptions(t);

  const onSelectTheme = (theme: ThemeMode) => {
    dispatch(setTheme(theme));
  };

  return {
    t,
    themes,
    currentTheme,
    onSelectTheme,
  };
};
