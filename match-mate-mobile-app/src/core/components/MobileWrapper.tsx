import React from 'react';
import { View } from 'react-native';
import { isWeb } from '@/core/utils/device';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { mobileStyles } from '../styles/MobileWrapper.styles';

interface Props {
  children: React.ReactNode;
}

export default function MobileWrapper({ children }: Props): React.ReactElement {
  const styles = useThemedStyles(mobileStyles);

  if (!isWeb) {
    // React Native — render children directly with no wrapper
    return <>{children}</>;
  }

  return (
    <View style={styles.outer}>
      <View style={styles.mobileFrame}>{children}</View>
    </View>
  );
}
