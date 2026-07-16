import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
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
import { OnboardingNavigationProp } from '@/navigation/types';

export default function OnboardingScreen(): React.ReactElement {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useThemedStyles(onboardingStyles);
  const navigation = useNavigation<OnboardingNavigationProp>();

  const [currentStep, setCurrentStep] = useState<OnboardingSteps>('basic');

  const {
    basic,
    preferences,
    photos,
    errors,
    loading,
    setBasicField,
    setPreferenceField,
    pickImage,
    setPrimaryPhoto,
    removePhoto,
    validateBasic,
    validatePreferences,
    handleSubmit,
    clearError,
    clearAllErrors,
  } = useOnboardingForm();

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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
          keyboardDismissMode="interactive"
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
                          navigation.navigate('OnboardingSuccess');
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
