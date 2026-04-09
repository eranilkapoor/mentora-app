import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { RootStackParamList } from '@/navigation/types';

export default function Header(): React.ReactElement {
  const insets = useSafeAreaInsets();

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // 🔹 Handlers (avoid inline functions)
  const goToProfile = (): void => {
    navigation.navigate('Profile');
  };

  const goToNotifications = (): void => {
    navigation.navigate('Notifications');
  };

  const goToSettings = (): void => {
    navigation.navigate('Settings');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 1 }]}>
      {/* LEFT: Profile */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={goToProfile}
        accessibilityRole="button"
        accessibilityLabel="Profile"
      >
        <Ionicons name="person-circle-outline" size={30} color={Colors.black} />
      </TouchableOpacity>

      {/* CENTER: Title */}
      <Text style={styles.title}>MatchMate</Text>

      {/* RIGHT */}
      <View style={styles.rightContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={goToNotifications}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Ionicons
            name="notifications-outline"
            size={24}
            color={Colors.black}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={goToSettings}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Ionicons name="settings-outline" size={24} color={Colors.black} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconButton: {
    padding: 6,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: Colors.black,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
