import React, { useEffect } from 'react';
import { ImageBackground, ImageSourcePropType, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'AppSplash'>;
const splashImage =
  require('../../assets/splash-screen.png') as ImageSourcePropType;

export default function AppSplashScreen({ navigation }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ImageBackground
      source={splashImage}
      style={styles.container}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
