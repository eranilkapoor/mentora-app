import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { changePasswordStyles } from '../ChangePassword.styles';

type StylesType = ReturnType<typeof changePasswordStyles>;

interface Props {
  styles: StylesType;
}

export const InfoBanner = ({ styles }: Props): React.ReactElement => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View style={styles.infoBanner}>
      <Feather name="shield" size={18} color={theme.colors.primary} />
      <Text style={styles.infoBannerText}>{t('change_password.info')}</Text>
    </View>
  );
};

InfoBanner.displayName = 'InfoBanner';
