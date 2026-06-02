import React, { useCallback, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
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
          title: 'Verification failed',
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
        title: 'Verification failed',
        message: 'Please check the code and try again.',
      });
    }
  }, [code, dispatch, route.params.challengeId, useRecovery, verifyTwoFactor]);

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Two-factor verification" />
      <View style={styles.container}>
        <Text style={styles.title}>Enter your security code</Text>
        <Text style={styles.subtitle}>
          {route.params.method === 'sms'
            ? 'We sent a one-time code to your verified phone number.'
            : 'Use your authenticator app or a recovery code to continue.'}
        </Text>

        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder={useRecovery ? 'Recovery code' : '6-digit code'}
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
            {isLoading ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendRow}
          onPress={() => setUseRecovery((value) => !value)}
        >
          <Text style={styles.resendText}>
            {useRecovery ? 'Use authenticator code' : 'Use recovery code'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
