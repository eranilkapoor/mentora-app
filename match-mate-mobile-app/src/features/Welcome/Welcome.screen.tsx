import React from 'react';
import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '@/navigation/types';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { authMethodConfig } from '@/features/Auth/shared/authMethodConfig';
import { SocialButton } from '@/features/Auth/shared/components/SocialButton';
import { useLoginForm } from '@/features/Login/hooks/useLoginForm';
import { welcomeStyles } from './Welcome.styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const appIcon = require('../../assets/icon.png') as ImageSourcePropType;

export default function WelcomeScreen({
  navigation,
}: Props): React.ReactElement {
  const { t } = useTranslation();
  const styles = useThemedStyles(welcomeStyles);
  const { theme } = useTheme();
  const { height } = useWindowDimensions();
  const { loading, errors, handleSocialLogin } = useLoginForm((challenge) => {
    navigation.navigate('TwoFactorChallenge', challenge);
  });

  const hasSocialAuth =
    authMethodConfig.social.google ||
    authMethodConfig.social.apple ||
    authMethodConfig.social.facebook;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={[styles.panel, height < 720 ? styles.compactPanel : null]}>
          <View style={styles.logoWrap}>
            <Image source={appIcon} style={styles.logo} resizeMode="contain" />
          </View>

          <Text style={styles.eyebrow}>{t('auth.welcome.eyebrow')}</Text>
          <Text style={styles.title}>{t('auth.welcome.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.welcome.subtitle')}</Text>

          {errors.error ? (
            <View style={styles.errorBanner}>
              <Feather
                name="alert-circle"
                size={16}
                color={theme.colors.error}
              />
              <Text style={styles.errorText}>{errors.error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.86}
            accessibilityRole="button"
            accessibilityLabel={t('auth.actions.create_account')}
          >
            <Feather name="user-plus" size={18} color={theme.colors.white} />
            <Text style={styles.primaryButtonText}>
              {t('auth.actions.create_account')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.86}
            accessibilityRole="button"
            accessibilityLabel={t('auth.actions.sign_in')}
          >
            <Feather name="log-in" size={18} color={theme.colors.primary} />
            <Text style={styles.secondaryButtonText}>
              {t('auth.actions.sign_in')}
            </Text>
          </TouchableOpacity>

          {hasSocialAuth ? (
            <>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>
                  {t('auth.welcome.or_continue')}
                </Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialList}>
                {authMethodConfig.social.google ? (
                  <SocialButton
                    label={t('auth.social.google')}
                    icon="chrome"
                    iconColor="#DB4437"
                    disabled={loading}
                    onPress={() => {
                      void handleSocialLogin('google');
                    }}
                  />
                ) : null}

                {authMethodConfig.social.apple ? (
                  <SocialButton
                    label={t('auth.social.apple')}
                    icon="command"
                    iconColor={theme.colors.textPrimary}
                    disabled={loading}
                    onPress={() => {
                      void handleSocialLogin('apple');
                    }}
                  />
                ) : null}

                {authMethodConfig.social.facebook ? (
                  <SocialButton
                    label={t('auth.social.facebook')}
                    icon="facebook"
                    iconColor="#1877F2"
                    disabled={loading}
                    onPress={() => {
                      void handleSocialLogin('facebook');
                    }}
                  />
                ) : null}
              </View>
            </>
          ) : null}

          <Text style={styles.legalText}>
            {t('auth.welcome.legal_prefix')}{' '}
            <Text
              style={styles.legalLink}
              onPress={() => navigation.navigate('TermsConditions')}
            >
              {t('auth.welcome.terms')}
            </Text>{' '}
            {t('auth.welcome.and')}{' '}
            <Text
              style={styles.legalLink}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            >
              {t('auth.welcome.privacy')}
            </Text>
            .
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
