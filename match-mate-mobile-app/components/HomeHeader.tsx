import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function HomeHeader() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 8 },
      ]}
    >
      {/* LEFT: Profile */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => navigation.navigate('Profile')}
        accessibilityLabel="profile-button"
      >
        <Ionicons name="person-circle-outline" size={30} color="#111" />
      </TouchableOpacity>

      {/* CENTER: Title */}
      <Text style={styles.title}>MatchMate</Text>

      {/* RIGHT: Notifications & Settings */}
      <View style={styles.rightContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Notifications')}
          accessibilityLabel="notifications-button"
        >
          <Ionicons name="notifications-outline" size={24} color="#111" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Settings')}
          accessibilityLabel="settings-button"
        >
          <Ionicons name="settings-outline" size={24} color="#111" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  iconButton: {
    padding: 6,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});