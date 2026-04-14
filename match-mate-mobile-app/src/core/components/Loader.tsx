import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Colors } from '../constants/colors';

type LoaderProps = {
  fullScreen?: boolean;
  size?: 'small' | 'large';
  loadingText?: string;
};

export default function Loader({
  fullScreen = true,
  size = 'large',
  loadingText = '',
}: LoaderProps): React.ReactElement {
  return (
    <View style={fullScreen ? styles.fullScreen : styles.inline}>
      <ActivityIndicator size={size} color={Colors.primary} />
      {loadingText && <Text style={styles.loadingText}>Loading your profile...</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundPage,
  },
  inline: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});
