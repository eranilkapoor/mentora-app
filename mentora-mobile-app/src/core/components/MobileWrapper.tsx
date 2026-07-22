import React, { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { CONTENT_WIDTH, isWeb } from '@/core/utils/device';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { mobileStyles } from '../styles/MobileWrapper.styles';

interface Props {
  children: React.ReactNode;
}

export default function MobileWrapper({ children }: Props): React.ReactElement {
  const styles = useThemedStyles(mobileStyles);
  const { width, height } = useWindowDimensions();
  const frameWidth = Math.min(width, CONTENT_WIDTH.phone);
  const isFramed = width > CONTENT_WIDTH.phone + 40;
  const frameStyle = useMemo(
    () =>
      StyleSheet.create({
        value: {
          width: frameWidth,
          height,
          borderRadius: isFramed ? 20 : 0,
        },
      }).value,
    [frameWidth, height, isFramed]
  );

  if (!isWeb) {
    return <>{children}</>;
  }

  return (
    <View style={styles.outer}>
      <View style={[styles.mobileFrame, frameStyle]}>{children}</View>
    </View>
  );
}
