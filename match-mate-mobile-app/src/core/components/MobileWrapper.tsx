import React from 'react';
import { View } from 'react-native';
import { isWeb } from '../utils/device';
import { useThemedStyles } from '../theme/useThemedStyles';
import { mobileStyles } from './MobileWrapper.styles';

export default function MobileWrapper({ children }: any) {
  const styles = useThemedStyles(mobileStyles);

  if (!isWeb) return children;

  return (
    <View style={styles.outer}>
      <View style={styles.mobileFrame}>{children}</View>
    </View>
  );
}
