import React, { useMemo } from 'react';
import { ScrollView, View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import {
  ONBOARDING_STEPS,
  ONBOARDING_STEPS_ICONS,
  OnboardingSteps,
} from '../Onboarding.types';
import { onboardingStyles } from '../Onboarding.styles';

interface Props {
  currentStep: OnboardingSteps;
}

const STEP_LABEL_KEYS: Record<OnboardingSteps, string> = {
  basic: 'onboarding.steps.basic',
  preferences: 'onboarding.steps.preferences',
  photos: 'onboarding.steps.photos',
};

function StepIndicatorComponent({ currentStep }: Props): React.ReactElement {
  const styles = useThemedStyles(onboardingStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const currentIndex = useMemo(() => {
    const index = ONBOARDING_STEPS.indexOf(currentStep);
    return index === -1 ? 0 : index;
  }, [currentStep]);

  const totalSteps = ONBOARDING_STEPS.length;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.stepIndicatorContent}
      style={styles.stepIndicatorContainer}
      accessibilityRole="progressbar"
      accessibilityLabel={t('onboarding.step_indicator.label', {
        current: currentIndex + 1,
        total: totalSteps,
      })}
      accessibilityValue={{
        min: 1,
        max: totalSteps,
        now: currentIndex + 1,
        text: t(STEP_LABEL_KEYS[currentStep]),
      }}
    >
      {ONBOARDING_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;
        const stepLabel = t(STEP_LABEL_KEYS[step]);

        return (
          <View
            key={step}
            style={styles.stepIndicatorItem}
            accessibilityRole="text"
            accessibilityLabel={
              isCompleted
                ? t('onboarding.step_indicator.completed', { step: stepLabel })
                : isActive
                  ? t('onboarding.step_indicator.current', { step: stepLabel })
                  : t('onboarding.step_indicator.upcoming', { step: stepLabel })
            }
          >
            <View
              style={[
                styles.stepDot,
                isCompleted && styles.stepDotCompleted,
                isActive && styles.stepDotActive,
              ]}
            >
              {isCompleted ? (
                <Feather name="check" size={12} color={theme.colors.white} />
              ) : (
                <Feather
                  name={ONBOARDING_STEPS_ICONS[step]}
                  size={12}
                  color={isActive ? theme.colors.white : theme.colors.textMuted}
                />
              )}
            </View>

            <Text
              style={[
                styles.stepDotLabel,
                isActive && styles.stepDotLabelActive,
                isCompleted && styles.stepDotLabelCompleted,
              ]}
              numberOfLines={1}
            >
              {stepLabel}
            </Text>

            {index < totalSteps - 1 && (
              <View
                style={[
                  styles.stepConnector,
                  isCompleted && styles.stepConnectorCompleted,
                ]}
              />
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

export const StepIndicator = React.memo(StepIndicatorComponent);
