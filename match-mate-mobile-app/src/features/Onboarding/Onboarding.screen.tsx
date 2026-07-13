import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { ONBOARDING_STEPS, OnboardingSteps } from './Onboarding.types';
import { onboardingStyles } from './Onboarding.styles';
import { useState } from 'react';
import { StepIndicator } from './components/StepIndicator';
import { BasicStep } from './steps/BasicStep';
import { PreferencesStep } from './steps/PreferencesStep';
import { PhotosStep } from './steps/PhotosStep';
import { useOnboardingForm } from './hooks/useOnboardingForm';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '@/navigation/types';

export default function OnboardingScreen(): React.ReactElement {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useThemedStyles(onboardingStyles);
  const navigation = useNavigation<RootNavigationProp>();

  const [currentStep, setCurrentStep] = useState<OnboardingSteps>('basic');

  const {
    basic,
    preferences,
    photos,
    errors,
    loading,
    completionReady,
    setBasicField,
    setPreferenceField,
    pickImage,
    setPrimaryPhoto,
    removePhoto,
    validateBasic,
    validatePreferences,
    handleSubmit,
    finalizeOnboarding,
    clearError,
    clearAllErrors,
  } = useOnboardingForm();

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

  // ─── Navigation ───────────────────────────────────────────────────────────

  const handleNext = useCallback((): void => {
    const validators: Partial<Record<OnboardingSteps, () => boolean>> = {
      basic: validateBasic,
      preferences: validatePreferences,
    };

    const validator = validators[currentStep];
    if (validator && !validator()) return;

    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      const nextStep = ONBOARDING_STEPS[currentIndex + 1];
      if (nextStep) {
        setCurrentStep(nextStep);
        clearAllErrors();
      }
    }
  }, [currentStep, validateBasic, validatePreferences, clearAllErrors]);

  const handlePrevious = useCallback((): void => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      const previousStep = ONBOARDING_STEPS[currentIndex - 1];
      if (previousStep) {
        setCurrentStep(previousStep);
        clearAllErrors();
      }
    }
  }, [currentStep, clearAllErrors]);

  // ─── Derived ──────────────────────────────────────────────────────────────

  const progressPercent =
    ((ONBOARDING_STEPS.indexOf(currentStep) + 1) / ONBOARDING_STEPS.length) *
    100;

  const isFirstStep = currentStep === ONBOARDING_STEPS[0];
  const isLastStep =
    currentStep === ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1];

  const navigateAfterOnboarding = useCallback(
    (targetTab: 'Profile' | 'Matches'): void => {
      finalizeOnboarding();
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'App',
            params: {
              screen: 'Tabs',
              params: {
                screen: targetTab,
              },
            },
          },
        ],
      });
    },
    [finalizeOnboarding, navigation]
  );

  // ─── Step renderer ────────────────────────────────────────────────────────

  const renderStep = (): React.ReactElement => {
    switch (currentStep) {
      case 'basic':
        return (
          <BasicStep
            basic={basic}
            errors={errors}
            onSetField={setBasicField}
            onClearError={clearError}
          />
        );
      case 'preferences':
        return (
          <PreferencesStep
            preferences={preferences}
            errors={errors}
            onSetField={setPreferenceField}
            onClearError={clearError}
          />
        );
      case 'photos':
        return (
          <PhotosStep
            photos={photos}
            onPickImage={() => {
              void pickImage();
            }}
            onSetPrimary={setPrimaryPhoto}
            onRemove={removePhoto}
          />
        );
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        style={styles.container}
      >
        {/* Progress bar */}
        <View style={styles.progressBarWrapper}>
          <View
            style={[styles.progressFill, { width: `${progressPercent}%` }]}
          />
        </View>

        <StepIndicator currentStep={currentStep} />

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderStep()}

          {/* Navigation buttons */}
          <View style={styles.buttonContainer}>
            {!isFirstStep && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handlePrevious}
                accessibilityRole="button"
                accessibilityLabel={t('onboarding.nav.previous')}
              >
                <Feather
                  name="arrow-left"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text style={styles.secondaryButtonText}>
                  {t('onboarding.nav.previous')}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={
                isLastStep
                  ? () => {
                      void handleSubmit().then((completed) => {
                        if (completed) {
                          // The completion modal below now owns the next step.
                        }
                      });
                    }
                  : handleNext
              }
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={
                isLastStep
                  ? t('onboarding.nav.submit')
                  : t('onboarding.nav.next')
              }
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>
                    {isLastStep
                      ? t('onboarding.nav.submit')
                      : t('onboarding.nav.next')}
                  </Text>
                  <Feather
                    name={isLastStep ? 'check' : 'arrow-right'}
                    size={16}
                    color={theme.colors.white}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Modal
          visible={completionReady}
          animationType="fade"
          transparent
          statusBarTranslucent
          onRequestClose={() => navigateAfterOnboarding('Matches')}
        >
          <View style={styles.successOverlay}>
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
                      <Text style={styles.successGuideItemTitle}>
                        {item.title}
                      </Text>
                      <Text style={styles.successGuideItemDescription}>
                        {item.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.successPrimaryButton}
                onPress={() => navigateAfterOnboarding('Profile')}
                accessibilityRole="button"
                accessibilityLabel={t(
                  'onboarding.success.cta_complete_profile'
                )}
              >
                <Text style={styles.successPrimaryButtonText}>
                  {t('onboarding.success.cta_complete_profile')}
                </Text>
                <Feather
                  name="arrow-right"
                  size={16}
                  color={theme.colors.white}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.successSecondaryButton}
                onPress={() => navigateAfterOnboarding('Matches')}
                accessibilityRole="button"
                accessibilityLabel={t('onboarding.success.cta_matches')}
              >
                <Text style={styles.successSecondaryButtonText}>
                  {t('onboarding.success.cta_matches')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
