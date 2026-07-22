import React, { useCallback, useMemo } from 'react';
import {
  I18nManager,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useTranslation } from 'react-i18next';

// Fallback route when there is no screen to go back to
const FALLBACK_ROUTE = 'App' as const;

export const BackButton = (): React.ReactElement => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({ index: 0, routes: [{ name: FALLBACK_ROUTE }] });
    }
  }, [navigation]);

  const containerStyle = useMemo(
    () => [
      styles.container,
      {
        backgroundColor: theme.colors.backgroundLight,
        marginLeft: Platform.OS === 'android' ? 4 : 0,
      },
    ],
    [theme.colors.backgroundLight]
  );

  return (
    <TouchableOpacity
      onPress={handleBack}
      style={containerStyle}
      accessibilityRole="button"
      accessibilityLabel={t('common.go_back')}
      accessibilityHint={t('common.go_back_hint')}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      activeOpacity={0.7}
    >
      <Feather
        name={I18nManager.isRTL ? 'arrow-right' : 'arrow-left'}
        size={18}
        color={theme.colors.textPrimary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
