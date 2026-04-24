import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

interface Props {
  styles: any;
}

export const InfoBanner = ({ styles }: Props): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <View style={styles.infoBanner}>
      <Feather name="shield" size={18} color={styles.infoBannerText.color} />
      <Text style={styles.infoBannerText}>{t('change_password.info')}</Text>
    </View>
  );
};
