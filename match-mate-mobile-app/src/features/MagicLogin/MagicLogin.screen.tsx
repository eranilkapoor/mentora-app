import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { authSharedStyles } from '@/features/Auth/shared/auth.styles';
import { useVerifyMagicLinkMutation } from '@/store/services/authApi.service';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/auth.slice';
import { baseApi, setRefreshToken } from '@/store/services/baseApi.service';
import { User } from '@/core/types';
import {
  getApiErrorMessage,
  getApiResponseMessage,
} from '@/core/utils/apiMessage';
import { MagicLoginScreenProps } from './MagicLogin.types';

export default function MagicLoginScreen({
  navigation,
  route,
}: MagicLoginScreenProps): React.ReactElement {
  const styles = useThemedStyles(authSharedStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [verifyMagicLink] = useVerifyMagicLinkMutation();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const token = route.params?.token ?? '';

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      if (!token) {
        setError(t('auth.magic_link.invalid'));
        return;
      }

      try {
        const response = await verifyMagicLink({ token }).unwrap();

        if (
          !response.success ||
          !response.data?.accessToken ||
          !response.data.user
        ) {
          setError(getApiResponseMessage(t, response));
          return;
        }

        dispatch(baseApi.util.resetApiState());
        dispatch(
          setCredentials({
            accessToken: response.data.accessToken,
            user: response.data.user as User,
          })
        );

        if (response.data.refreshToken) {
          await setRefreshToken(response.data.refreshToken);
        }

        if (isMounted) {
          setDone(true);
        }
      } catch (err) {
        if (isMounted) {
          setError(getApiErrorMessage(t, err, 'auth.magic_link.invalid'));
        }
      }
    };

    void verify();

    return () => {
      isMounted = false;
    };
  }, [dispatch, t, token, verifyMagicLink]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.scrollContent}>
          <Text style={styles.title}>{t('auth.magic_link.title')}</Text>
          <Text style={styles.subtitle}>
            {done
              ? t('auth.magic_link.success')
              : t('auth.magic_link.verifying')}
          </Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Feather
                name="alert-circle"
                size={14}
                color={theme.colors.error}
              />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          {!error && !done ? (
            <ActivityIndicator color={theme.colors.primary} size="large" />
          ) : null}

          {error ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>
                {t('auth.actions.back_to_sign_in')}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}
