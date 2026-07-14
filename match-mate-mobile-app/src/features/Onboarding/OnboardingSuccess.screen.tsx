import React, { useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useAppDispatch } from '@/store/hooks';
import { baseApi } from '@/store/services/baseApi.service';
import {
  setPostOnboardingTarget,
  setOnboardingCompletionPending,
  setProfileCompleted,
} from '@/store/slices/auth.slice';
import { onboardingStyles } from './Onboarding.styles';

type PostOnboardingTarget = 'EditProfile' | 'Matches';

export default function OnboardingSuccessScreen(): React.ReactElement {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useThemedStyles(onboardingStyles);
  const dispatch = useAppDispatch();

  const onboardingGuide = [
    {
      icon: 'user-check' as const,
      title: t('onboarding.success.guide.complete_profile.title'),
      description: t('onboarding.success.guide.complete_profile.description'),
    },
    {
      icon: 'heart' as const,
      title: t('onboarding.success.guide.matches.title'),
      description: t('onboarding.success.guide.matches.description'),
    },
    {
      icon: 'shield' as const,
      title: t('onboarding.success.guide.safe_connect.title'),
      description: t('onboarding.success.guide.safe_connect.description'),
    },
  ];

  const finishOnboarding = useCallback((): void => {
    dispatch(setProfileCompleted(true));
    dispatch(setOnboardingCompletionPending(false));
    dispatch(baseApi.util.invalidateTags(['Auth', 'Profile', 'Preference']));
  }, [dispatch]);

  const enterTarget = useCallback(
    (target: PostOnboardingTarget): void => {
      dispatch(setPostOnboardingTarget(target));
      finishOnboarding();
    },
    [dispatch, finishOnboarding]
  );

  const enterMatches = useCallback((): void => {
    enterTarget('Matches');
  }, [enterTarget]);

  const enterEditProfile = useCallback((): void => {
    enterTarget('EditProfile');
  }, [enterTarget]);

  const enterApp = useCallback(
    (target: PostOnboardingTarget): void => {
      if (target === 'EditProfile') {
        enterEditProfile();
        return;
      }

      enterMatches();
    },
    [enterEditProfile, enterMatches]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.successOverlay}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.successCard}>
          <View style={styles.successIconCircle}>
            <Feather name="check" size={30} color={theme.colors.white} />
          </View>

          <Text style={styles.successEyebrow}>
            {t('onboarding.success.eyebrow')}
          </Text>
          <Text style={styles.successTitle}>
            {t('onboarding.success.title')}
          </Text>
          <Text style={styles.successSubtitle}>
            {t('onboarding.success.subtitle')}
          </Text>

          <View style={styles.successGuideCard}>
            <Text style={styles.successGuideTitle}>
              {t('onboarding.success.guide_title')}
            </Text>
            {onboardingGuide.map((item) => (
              <View key={item.title} style={styles.successGuideItem}>
                <View style={styles.successGuideIcon}>
                  <Feather
                    name={item.icon}
                    size={17}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.successGuideText}>
                  <Text style={styles.successGuideItemTitle}>{item.title}</Text>
                  <Text style={styles.successGuideItemDescription}>
                    {item.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.successPrimaryButton}
            onPress={() => enterApp('EditProfile')}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.success.cta_complete_profile')}
            activeOpacity={0.86}
          >
            <Text style={styles.successPrimaryButtonText}>
              {t('onboarding.success.cta_complete_profile')}
            </Text>
            <Feather name="arrow-right" size={16} color={theme.colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.successSecondaryButton}
            onPress={() => enterApp('Matches')}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.success.cta_matches')}
            activeOpacity={0.86}
          >
            <Text style={styles.successSecondaryButtonText}>
              {t('onboarding.success.cta_matches')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
