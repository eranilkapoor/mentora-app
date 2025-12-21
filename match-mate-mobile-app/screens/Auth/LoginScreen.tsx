import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthService } from '../../services/authService';
import { useAppDispatch } from '../../store';
import { setCredentials } from '../../store/authSlice';

export default function LoginScreen ({ navigation }: any) {
    const dispatch = useAppDispatch();

    const [activeTab, setActiveTab] = useState<"email" | "phone">("email");

    // Email / password
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Phone / OTP
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateEmail = (value: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const validatePhone = (value: string) =>
        /^\+?\d{6,15}$/.test(value);

    const handleEmailLogin = async () => {
        setError(null);
        if (!email || !password) {
            setError("Please enter email and password.");
            return;
        }
        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        setLoading(true);
        try {
            await fakeNetworkDelay();
            //const response = await AuthService.login({ email, password });
            dispatch(setCredentials({ token: "fake-jwt-token", user: { email } }));
        } catch (e) {
            setError("Failed to sign in. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGetOtp = async () => {
        setError(null);
        if (!phone) {
            setError("Please enter phone number.");
            return;
        }
        if (!validatePhone(phone)) {
            setError("Please enter a valid phone number (digits only, include country code).");
            return;
        }
        setLoading(true);
        try {
            await fakeNetworkDelay(1000);
            // In real app, send OTP here and handle errors
            setOtpSent(true);
        } catch (e) {
            setError("Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setError(null);
        if (!otp) {
            setError("Please enter the OTP.");
            return;
        }
        setLoading(true);
        try {
            await fakeNetworkDelay(800);
            // In real app, verify OTP here
            // navigation?.replace?.("Home");
            // setIsAuthenticated(true);
            dispatch(setCredentials({ token: "fake-jwt-token", user: { phone } }));
        } catch (e) {
            setError("Failed to verify OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: "google" | "apple" | "facebook") => {
        setLoading(true);
        setError(null);
        try {
            await fakeNetworkDelay();
            //navigation?.navigate?.("AppNavigator", { screen: "Home" });
            // setIsAuthenticated(true);
            dispatch(setCredentials({ token: "fake-jwt-token", user: { provider } }));
        } catch (e) {
            setError(`Failed to sign in with ${provider}.`);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        navigation?.navigate?.("ForgotPassword");
    };

    const handleCreateAccount = () => {
        navigation?.navigate?.("Register");
    };

    return (
        <SafeAreaProvider style={styles.safe}>
            <KeyboardAvoidingView
                behavior={Platform.select({ ios: "padding", android: undefined })}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.title}>Match Mate</Text>
                    <Text style={styles.subtitle}>Sign in to continue</Text>

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    {/* Tabs */}
                    <View style={styles.tabRow}>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === "email" && styles.tabActive]}
                            onPress={() => {
                                setActiveTab("email");
                                setOtpSent(false);
                                setError(null);
                            }}
                            disabled={loading}
                            accessibilityLabel="tab-email"
                        >
                            <Text style={[styles.tabText, activeTab === "email" && styles.tabTextActive]}>
                                Email
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === "phone" && styles.tabActive]}
                            onPress={() => {
                                setActiveTab("phone");
                                setError(null);
                            }}
                            disabled={loading}
                            accessibilityLabel="tab-phone"
                        >
                            <Text style={[styles.tabText, activeTab === "phone" && styles.tabTextActive]}>
                                Phone (OTP)
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form container */}
                    <View style={styles.form}>
                        {activeTab === "email" ? (
                            <>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="you@example.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    value={email}
                                    onChangeText={setEmail}
                                    editable={!loading}
                                    textContentType="username"
                                    accessibilityLabel="email-input"
                                />

                                <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="••••••••"
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={setPassword}
                                        editable={!loading}
                                        textContentType="password"
                                    />

                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeIcon}
                                        disabled={loading}
                                    >
                                        <Feather 
                                            name={showPassword ? "eye-off" : "eye"} 
                                            size={20} 
                                            color="#666" 
                                        />
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity
                                    onPress={handleForgotPassword}
                                    disabled={loading}
                                    style={styles.forgot}
                                >
                                    <Text style={styles.forgotText}>Forgot password?</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.primaryButton, loading && styles.disabledButton]}
                                    onPress={handleEmailLogin}
                                    disabled={loading}
                                    accessibilityLabel="email-login-button"
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.primaryButtonText}>Sign in</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={styles.label}>Phone number</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="+1234567890"
                                    keyboardType="phone-pad"
                                    autoCapitalize="none"
                                    value={phone}
                                    onChangeText={setPhone}
                                    editable={!loading && !otpSent}
                                    accessibilityLabel="phone-input"
                                />

                                {!otpSent ? (
                                    <TouchableOpacity
                                        style={[styles.primaryButton, loading && styles.disabledButton]}
                                        onPress={handleGetOtp}
                                        disabled={loading}
                                        accessibilityLabel="get-otp-button"
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.primaryButtonText}>Get OTP</Text>
                                        )}
                                    </TouchableOpacity>
                                ) : (
                                    <>
                                        <Text style={[styles.label, { marginTop: 12 }]}>Enter OTP</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="123456"
                                            keyboardType="number-pad"
                                            value={otp}
                                            onChangeText={setOtp}
                                            editable={!loading}
                                            accessibilityLabel="otp-input"
                                        />
                                        <TouchableOpacity
                                            style={[styles.primaryButton, loading && styles.disabledButton]}
                                            onPress={handleVerifyOtp}
                                            disabled={loading}
                                            accessibilityLabel="verify-otp-button"
                                        >
                                            {loading ? (
                                                <ActivityIndicator color="#fff" />
                                            ) : (
                                                <Text style={styles.primaryButtonText}>Submit OTP</Text>
                                            )}
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.linkRow]}
                                            onPress={() => {
                                                setOtpSent(false);
                                                setOtp("");
                                            }}
                                            disabled={loading}
                                        >
                                            <Text style={styles.linkSmall}>Resend / change number</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </>
                        )}
                    </View>

                    <View style={styles.dividerRow}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.divider} />
                    </View>

                    <View style={styles.socialContainer}>
                        {Platform.OS !== "ios" ? (
                            <SocialButton
                                label="Continue with Google"
                                onPress={() => handleSocialLogin("google")}
                                disabled={loading}
                                emoji="g"
                            />
                        ) : null}
                        {Platform.OS === "ios" ? (
                            <SocialButton
                                label="Continue with Apple"
                                onPress={() => handleSocialLogin("apple")}
                                disabled={loading}
                                emoji=""
                            />
                        ) : null}
                        <SocialButton
                            label="Continue with Facebook"
                            onPress={() => handleSocialLogin("facebook")}
                            disabled={loading}
                            emoji="f"
                        />
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account?</Text>
                        <TouchableOpacity onPress={handleCreateAccount} disabled={loading}>
                            <Text style={styles.linkText}> Create account</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaProvider>
    );
};

function SocialButton({
    label,
    onPress,
    disabled,
    emoji,
}: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    emoji?: string;
}) {
    return (
        <TouchableOpacity
            style={[styles.socialButton, disabled && styles.disabledButton]}
            onPress={onPress}
            disabled={disabled}
            accessibilityLabel={`social-${label}`}
        >
            <Text style={styles.socialEmoji}>{emoji}</Text>
            <Text style={styles.socialLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

// small helper to simulate network latency
const fakeNetworkDelay = (ms = 800) => new Promise((res) => setTimeout(res, ms));

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#fff" },
    container: { flex: 1 },
    scrollContent: {
        padding: 20,
        paddingTop: 100,
        justifyContent: "flex-start",
    },
    title: {
        fontSize: 28,
        fontWeight: "900",
        marginBottom: 26,
        color: "#dd68c0ff",
        textAlign: "center",
        fontFamily: "clebri-bold",
    },
    subtitle: { fontSize: 14, color: "#666", marginBottom: 18 },
    tabRow: {
        flexDirection: "row",
        borderRadius: 10,
        backgroundColor: "#f2f2f2",
        padding: 4,
        marginBottom: 12,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        borderRadius: 8,
    },
    tabActive: {
        backgroundColor: "#111",
    },
    tabText: {
        color: "#444",
        fontWeight: "600",
    },
    tabTextActive: {
        color: "#fff",
    },
    form: { marginTop: 8 },
    label: { fontSize: 13, color: "#444", marginBottom: 6 },
    input: {
        backgroundColor: "#f7f7f8",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 12,
        fontSize: 16,
        color: "#111",
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f7f7f8",
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: "#111",
    },
    eyeIcon: {
        paddingHorizontal: 6,
        paddingVertical: 4,
    },
    forgot: { alignSelf: "flex-end", marginTop: 8 },
    forgotText: { color: "#007AFF", fontSize: 13 },
    primaryButton: {
        marginTop: 18,
        backgroundColor: "#111",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    disabledButton: {
        opacity: 0.6,
    },
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 20,
    },
    divider: { flex: 1, height: 1, backgroundColor: "#e6e6e6" },
    dividerText: { marginHorizontal: 12, color: "#888", fontWeight: "600" },
    socialContainer: { gap: 10 },
    socialButton: {
        flexDirection: "row",
        alignItems: "center",
        borderColor: "#e6e6e6",
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: "#fff",
        marginBottom: 8,
    },
    socialEmoji: { fontSize: 18, marginRight: 10 },
    socialLabel: { fontSize: 15, color: "#111", fontWeight: "600" },
    footer: { flexDirection: "row", justifyContent: "flex-start", marginTop: 24 },
    footerText: { color: "#666" },
    linkText: { color: "#007AFF", fontWeight: "700" },
    linkRow: { alignItems: "center", marginTop: 10 },
    linkSmall: { color: "#007AFF", fontSize: 13 },
    error: { color: "#b00020", marginBottom: 10 },
});