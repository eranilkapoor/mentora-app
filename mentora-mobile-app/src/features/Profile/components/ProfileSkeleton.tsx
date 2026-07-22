import React from 'react';
import { View } from 'react-native';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { profileStyles } from '../Profile.styles';

export function ProfileSkeleton(): React.ReactElement {
  const styles = useThemedStyles(profileStyles);

  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonPhoto} />
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
      </View>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
        </View>
      ))}
    </View>
  );
}
