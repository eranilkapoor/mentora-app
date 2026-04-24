import React, { useCallback, useMemo } from 'react';
import {
  I18nManager,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/core/theme/ThemeProvider';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/navigation/types';

// 👉 Ideally import from a central routes file
const ROOT_ROUTE = 'Tabs';

export const BackButton = (): React.ReactElement => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { theme } = useTheme();

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack(); // ✅ safer than pop()
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: ROOT_ROUTE }],
      });
    }
  }, [navigation]);

  const containerStyle = useMemo(
    () => [
      styles.container,
      {
        backgroundColor: theme.colors.backgroundLight,
        marginLeft: Platform.OS === 'android' ? 4 : 0,
      },
    ],
    [theme.colors.backgroundLight]
  );

  return (
    <TouchableOpacity
      onPress={handleBack}
      style={containerStyle}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      accessibilityHint="Navigates to the previous screen"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Feather
        name={I18nManager.isRTL ? 'arrow-right' : 'arrow-left'}
        size={18}
        color={theme.colors.textPrimary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
