import React from 'react';
import { SocialButtonProps } from '../Login.types';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { loginStyles } from '../Login.styles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { TouchableOpacity, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export const SocialButton = React.memo<SocialButtonProps>(
  ({ label, onPress, disabled = false, icon, iconColor }) => {
    const styles = useThemedStyles(loginStyles);
    const { theme } = useTheme();
    return (
      <TouchableOpacity
        style={[styles.socialButton, disabled && styles.disabledButton]}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Feather
          name={icon}
          size={20}
          color={iconColor ?? theme.colors.textSecondary}
          style={styles.socialIcon}
        />
        <Text style={styles.socialLabel}>{label}</Text>
      </TouchableOpacity>
    );
  }
);
SocialButton.displayName = 'SocialButton';
