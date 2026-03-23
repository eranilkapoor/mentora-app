import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    TouchableOpacity,
    Alert,
    ScrollView,
    StatusBar,
    Platform,
} from 'react-native';
import { useAppDispatch } from '../../store';
import { logout } from '../../store/authSlice';

export default function SettingsScreen({ navigation }: any) {
    const dispatch = useAppDispatch();

    const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState<boolean>(false);
    const [locationSharing, setLocationSharing] = useState<boolean>(false);

    const handleSignOut = () => {
        if(Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to sign out?')) {
                dispatch(logout());
            }
            return;
        }

        Alert.alert('Sign out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: () => {
                    dispatch(logout());
                    navigation?.reset?.({
                        index: 0,
                        routes: [{ name: 'Login' }],
                    });
                }
            },
        ]);
    };

    const goto = (screen: string) => {
        navigation?.navigate?.(screen);
    };

    return (
        <SafeAreaProvider style={styles.safe}>
            <StatusBar barStyle={darkModeEnabled ? 'light-content' : 'dark-content'} />
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <TouchableOpacity style={styles.row} onPress={() => goto('EditProfile')}>
                        <Text style={styles.rowLabel}>Edit Profile</Text>
                        <Text style={styles.rowAction}>{'>'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.row} onPress={() => goto('ChangePassword')}>
                        <Text style={styles.rowLabel}>Change Password</Text>
                        <Text style={styles.rowAction}>{'>'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Dark Mode</Text>
                        <Switch
                            value={darkModeEnabled}
                            onValueChange={setDarkModeEnabled}
                            trackColor={{ false: '#ccc', true: '#4f46e5' }}
                            thumbColor={darkModeEnabled ? '#fff' : '#fff'} />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Share Location</Text>
                        <Switch
                            value={locationSharing}
                            onValueChange={setLocationSharing}
                            trackColor={{ false: '#ccc', true: '#4f46e5' }} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notifications</Text>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>App Notifications</Text>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: '#ccc', true: '#4f46e5' }} />
                    </View>

                    <TouchableOpacity style={styles.row} onPress={() => goto('NotificationSettings')}>
                        <Text style={styles.rowLabel}>Notification Settings</Text>
                        <Text style={styles.rowAction}>{'>'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    <TouchableOpacity style={styles.row} onPress={() => goto('HelpSupport')}>
                        <Text style={styles.rowLabel}>Help & Support</Text>
                        <Text style={styles.rowAction}>{'>'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.row} onPress={() => goto('PrivacyPolicy')}>
                        <Text style={styles.rowLabel}>Privacy Policy</Text>
                        <Text style={styles.rowAction}>{'>'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.signOutSection}>
                    <TouchableOpacity style={[styles.signOutButton]} onPress={handleSignOut}>
                        <Text style={styles.signOutText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingVertical: 18,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#e6e9ef',
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#0f172a',
    },
    container: {
        padding: 16,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 8,
        overflow: 'hidden',
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
        paddingHorizontal: 12,
        paddingVertical: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    row: {
        height: 56,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#eef2f7',
    },
    rowLabel: {
        fontSize: 16,
        color: '#0f172a',
    },
    rowAction: {
        fontSize: 18,
        color: '#9aa4b2',
    },
    signOutSection: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 8,
        overflow: 'hidden',
    },
    signOutButton: {
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signOutText: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: 16,
    },
});