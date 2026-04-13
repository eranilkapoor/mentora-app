import React, { useCallback } from 'react';
import { TouchableOpacity, Platform } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/core/theme/ThemeProvider';

export const BackButton = (): React.ReactElement => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.pop();
    } else {
      navigation.navigate('Tabs');
    }
  }, [navigation]);

  return (
    <TouchableOpacity
      onPress={handleBack}
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.backgroundLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: Platform.OS === 'android' ? 4 : 0,
      }}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <Feather name="arrow-left" size={18} color={theme.colors.textPrimary} />
    </TouchableOpacity>
  );
};
