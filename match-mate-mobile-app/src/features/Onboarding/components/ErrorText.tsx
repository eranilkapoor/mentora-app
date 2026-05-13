import { useTheme } from '@/core/theme/ThemeProvider';
import React from 'react';
import { Text, StyleSheet } from 'react-native';

export interface ErrorTextProps {
  field: string;
  errors: Record<string, string>;
}

export function ErrorText({
  field,
  errors,
}: ErrorTextProps): React.ReactElement | null {
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    error: {
      color: theme.colors.error,
      marginBottom: 10,
      marginTop: -6,
      fontSize: 12,
    },
  });

  if (!errors[field]) return null;

  return <Text style={styles.error}>{errors[field]}</Text>;
}
