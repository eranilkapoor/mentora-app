import { StyleSheet } from 'react-native';
import { windowHeight } from '../utils/device';
import { Theme } from '../theme/types';

export const mobileStyles = (theme: Theme) =>
  StyleSheet.create({
    outer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.black,
    },
    mobileFrame: {
      width: 390,
      maxWidth: 420,
      height: windowHeight,
      backgroundColor: theme.colors.white,
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: '0px 8px 30px rgba(0,0,0,0.2)',
    },
  });
