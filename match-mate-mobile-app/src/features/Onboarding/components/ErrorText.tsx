import React from 'react';
import { Text } from 'react-native';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { ErrorTextProps } from '../Onboarding.types';
import { onboardingStyles } from '../Onboarding.styles';

export function ErrorText({
  field,
  errors,
}: ErrorTextProps): React.ReactElement | null {
  const styles = useThemedStyles(onboardingStyles);

  if (!errors[field]) return null;

  return <Text style={styles.error}>{errors[field]}</Text>;
}
