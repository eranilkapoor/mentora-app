import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import Feather from 'react-native-vector-icons/Feather';

import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';

import { accountSettingsStyles } from '../styles/accountSettings.styles';

interface Props {
  provider: string;
  connected: boolean;

  onConnect: () => void;
  onDisconnect: () => void;
}

export function LinkedAccountCard({
  provider,
  connected,
  onConnect,
  onDisconnect,
}: Props): React.ReactElement {
  const styles = useThemedStyles(accountSettingsStyles);

  const { theme } = useTheme();

  return (
    <View style={styles.linkedCard}>
      <View style={styles.linkedLeft}>
        <View style={styles.iconWrapper}>
          <Feather name="link" size={18} color={theme.colors.primary} />
        </View>

        <Text style={styles.linkedTitle}>{provider}</Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={connected ? onDisconnect : onConnect}
        style={[styles.connectButton, connected && styles.disconnectButton]}
      >
        <Text
          style={[
            styles.connectButtonText,
            connected && styles.disconnectButtonText,
          ]}
        >
          {connected ? 'Disconnect' : 'Connect'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
