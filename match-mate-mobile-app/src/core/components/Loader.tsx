import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/core/theme/ThemeProvider';

type LoaderProps = {
  fullScreen?: boolean;
  size?: 'small' | 'large';
  /**
   * When provided, this exact text is shown below the spinner.
   * When omitted, a default "Loading..." message is shown.
   * Pass an empty string to suppress all text.
   */
  loadingText?: string;
};

const DEFAULT_LOADING_TEXT = 'Loading...';

export default function Loader({
  fullScreen = true,
  size = 'large',
  loadingText,
}: LoaderProps): React.ReactElement {
  const { theme } = useTheme();

  const displayText = loadingText ?? DEFAULT_LOADING_TEXT;

  return (
    <View
      style={[
        fullScreen ? styles.fullScreen : styles.inline,
        fullScreen && { backgroundColor: theme.colors.backgroundPage },
      ]}
    >
      <ActivityIndicator size={size} color={theme.colors.primary} />
      {displayText.length > 0 && (
        <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>
          {displayText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inline: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
});
