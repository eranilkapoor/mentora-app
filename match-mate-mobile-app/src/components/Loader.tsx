import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

type LoaderProps = {
  fullScreen?: boolean;
  size?: 'small' | 'large';
};

export default function Loader({
  fullScreen = true,
  size = 'large',
}: LoaderProps): React.ReactElement {
  return (
    <View style={fullScreen ? styles.fullScreen : styles.inline}>
      <ActivityIndicator size={size} color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundPage, // ✅ use theme background
  },
  inline: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
