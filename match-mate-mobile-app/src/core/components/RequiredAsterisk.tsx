import React from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';
import { useTheme } from '@/core/theme/ThemeProvider';

interface RequiredAsteriskProps {
  style?: StyleProp<TextStyle>;
}

export function RequiredAsterisk({
  style,
}: RequiredAsteriskProps): React.ReactElement {
  const { theme } = useTheme();

  return (
    <Text
      accessibilityLabel="required"
      style={[styles.asterisk, { color: theme.colors.error }, style]}
    >
      *
    </Text>
  );
}

RequiredAsterisk.displayName = 'RequiredAsterisk';

const styles = StyleSheet.create({
  asterisk: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '700',
  },
});
