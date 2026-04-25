import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/core/theme/ThemeProvider';
import { Theme } from '@/core/theme/types'; // use the single source of truth

interface Props {
  children: React.ReactNode;
  fallback?: (error: Error, onRetry: () => void) => React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  // Single displayName declaration — don't set it again after the class
  static displayName = 'ErrorBoundary';

  public state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    this.props.onError?.(error, info);

    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) return children;

    if (fallback && error) {
      return fallback(error, this.handleRetry);
    }

    return <DefaultFallback onRetry={this.handleRetry} error={error} />;
  }
}

export default ErrorBoundary;

// ─── Default Fallback ─────────────────────────────────────────────────────────

interface FallbackProps {
  onRetry: () => void;
  error: Error | null;
}

const DefaultFallback: React.FC<FallbackProps> = ({ onRetry, error }) => {
  const { theme } = useTheme();

  // Pass the full theme — not three separate args
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.subtitle}>
          An unexpected error occurred. Please try again.
        </Text>

        {/* Only show raw error message in dev builds */}
        {__DEV__ && error?.message ? (
          <Text style={styles.debugText}>{error.message}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.button}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry"
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

DefaultFallback.displayName = 'DefaultFallback';

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    content: {
      alignItems: 'center',
      maxWidth: 320,
    },
    title: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: theme.typography.h3.fontWeight as '600',
      color: theme.colors.textPrimary,
      fontFamily: theme.typography.fontFamily.medium,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
      lineHeight: 20,
    },
    debugText: {
      fontSize: 12,
      color: theme.colors.error,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    button: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary,
      minWidth: 140,
      alignItems: 'center',
    },
    buttonText: {
      fontSize: theme.typography.button.fontSize,
      fontWeight: theme.typography.button.fontWeight as '600',
      // Fixed: was colors.primary — text on a primary button must be white
      color: theme.colors.white,
    },
  });
