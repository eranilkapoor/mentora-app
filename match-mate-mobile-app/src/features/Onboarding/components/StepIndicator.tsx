import React from 'react';
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

export function StepIndicator({ currentStep }: Props): React.ReactElement {
  const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
  const styles = useThemedStyles(onboardingStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.stepIndicatorContent}
      style={styles.stepIndicatorContainer}
    >
      {ONBOARDING_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;

        return (
          <View key={step} style={styles.stepIndicatorItem}>
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
            >
              {t(`onboarding.steps.${step}`)}
            </Text>

            {index < ONBOARDING_STEPS.length - 1 && (
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
