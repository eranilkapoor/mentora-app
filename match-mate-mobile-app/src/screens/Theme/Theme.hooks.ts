import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setTheme } from '../../store/slices/settingsSlice';
import { getThemeOptions } from './Theme.constants';

export const useThemeScreen = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const currentTheme = useAppSelector((s) => s.settings.theme);

  const themes = getThemeOptions(t);

  const onSelectTheme = (theme: any) => {
    dispatch(setTheme(theme));
  };

  return {
    t,
    themes,
    currentTheme,
    onSelectTheme,
  };
};
