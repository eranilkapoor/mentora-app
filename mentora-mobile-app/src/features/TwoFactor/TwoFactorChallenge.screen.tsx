import React, { useCallback, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { AuthStackParamList } from '@/navigation/types';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { authSharedStyles } from '@/features/Auth/shared/auth.styles';
import { useVerifyTwoFactorMutation } from '@/store/services/authApi.service';
import { useAppDispatch } from '@/store/hooks';
import { baseApi, setRefreshToken } from '@/store/services/baseApi.service';
import { setCredentials } from '@/store/slices/auth.slice';
import { User } from '@/core/types';
import { showError } from '@/core/utils/toast';

type Route = RouteProp<AuthStackParamList, 'TwoFactorChallenge'>;

export default function TwoFactorChallengeScreen(): React.ReactElement {
  const { t } = useTranslation();
  const route = useRoute<Route>();
  const styles = useThemedStyles(authSharedStyles);
  const dispatch = useAppDispatch();
  const [verifyTwoFactor, { isLoading }] = useVerifyTwoFactorMutation();
  const [code, setCode] = useState('');
  const [useRecovery, setUseRecovery] = useState(false);

  const submit = useCallback(async () => {
    try {
      const response = await verifyTwoFactor({
        challengeId: route.params.challengeId,
        ...(useRecovery ? { recoveryCode: code } : { code }),
      }).unwrap();

      if (
        !response.success ||
        !response.data?.accessToken ||
        !response.data.user
      ) {
        showError({
          title: t('auth.two_factor.verification_failed'),
          ...(response.message ? { message: response.message } : {}),
        });
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
    } catch {
      showError({
        title: t('auth.two_factor.verification_failed'),
        message: t('auth.two_factor.check_code_message'),
      });
    }
  }, [
    code,
    dispatch,
    route.params.challengeId,
    t,
    useRecovery,
    verifyTwoFactor,
  ]);

  return (
    <SafeAreaView style={styles.safe}>
      <Header title={t('auth.two_factor.title')} />
      <View style={styles.container}>
        <Text style={styles.title}>{t('auth.two_factor.enter_code')}</Text>
        <Text style={styles.subtitle}>
          {route.params.method === 'sms'
            ? t('auth.two_factor.sms_subtitle')
            : t('auth.two_factor.authenticator_subtitle')}
        </Text>

        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder={
            useRecovery
              ? t('auth.two_factor.recovery_code')
              : t('auth.two_factor.six_digit_code')
          }
          autoCapitalize="characters"
          keyboardType={useRecovery ? 'default' : 'number-pad'}
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={submit}
          disabled={isLoading || !code.trim()}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading
              ? t('auth.two_factor.verifying')
              : t('auth.two_factor.verify')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendRow}
          onPress={() => setUseRecovery((value) => !value)}
        >
          <Text style={styles.resendText}>
            {useRecovery
              ? t('auth.two_factor.use_authenticator_code')
              : t('auth.two_factor.use_recovery_code')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
