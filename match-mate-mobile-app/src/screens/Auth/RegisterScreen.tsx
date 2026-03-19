import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Modal,
    KeyboardAvoidingView,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthService } from "../../services/authService";
import { useAppDispatch } from "../../store";
import { setCredentials } from "../../store/authSlice";
import { country_codes } from "../../constants";
import { fakeApi } from "../../services/fakeApi";

type FormErrors = {
  email?: string;
  password?: string;
  phone?: string;
  otp?: string;
  error?: string;
};

export default function RegisterScreen({ navigation }: any) {
    const dispatch = useAppDispatch();

    const [activeTab, setActiveTab] = useState<"email" | "phone">("email");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [showCountryCodeDropdown, setShowCountryCodeDropdown] = useState(false);
    const [countryCode, setCountryCode] = useState(country_codes[2]);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const clearError = (field: keyof FormErrors) => {
        setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const validatePhone = (value: string) => /^\+?\d{6,15}$/.test(value);

    const handleEmailRegister = async () => {
        const newErrors: FormErrors = {};

        if (!email.trim())
            newErrors.email = "Email is required";
        else if (!validateEmail(email))
            newErrors.email = "Enter a valid email address";

        if (!password)
            newErrors.password = "Password is required";
        else if (password.length < 6)
            newErrors.password = "Minimum 6 characters";

        setErrors(newErrors);
        
        if (Object.keys(newErrors).length !== 0) return;

        setLoading(true);
        try {
            const res = await AuthService.register({ email, password }).then(res => res.data);
                        
            if (!res.success) {
                setErrors({ email: "Email already registered. Please try login!" });
                return;
            }

            dispatch(setCredentials(res.data!));

            if(res.data?.user?.isProfileCompleted === false) {
                navigation?.navigate?.("Onboarding");
                return;
            }
        } catch (e) {
            setErrors({"error": "Registration failed. Please try again."});
        } finally {
            setLoading(false);
        }
    };

    const handleGetOtp = async () => {
        const newErrors: FormErrors = {};

        if (!phone)
            newErrors.phone = "Phone number is required";
        else if (!validatePhone(phone))
            newErrors.phone = "Enter a valid phone number";

        setErrors(newErrors);

        if (Object.keys(newErrors).length !== 0) return;
                
        setLoading(true);
        try {
            const res = await AuthService.sendOtp({ country_code: countryCode, phone }).then(res => res.data);
            
            if (!res.success) {
                setErrors({ error: "Failed to send OTP. Please try again." });
                return;
            }

            setOtpSent(true);
        } catch (e) {
            setErrors({ error: "Failed to send OTP. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        const newErrors: FormErrors = {};

        if (otpSent && !otp)
            newErrors.otp = "OTP is required";

        setErrors(newErrors);
        
        if (Object.keys(newErrors).length !== 0) return;

        setLoading(true);
        try {
            const res = await AuthService.verifyOtp({ country_code: countryCode, phone, otp }).then(res => res.data);
                        
            if (!res.success) {
                setErrors({ otp: "Invalid OTP" });
                return;
            }

            dispatch(setCredentials(res.data!));

            if(res.data?.user?.isProfileCompleted === false) {
                navigation?.navigate?.("Onboarding");
                return;
            }
        } catch (e) {
            setErrors({"error": "Failed to verify OTP. Please try again."});
        } finally {
            setLoading(false);
        }
    };

    const handleSocialRegister = async (provider: "google" | "apple" | "facebook") => {
        setLoading(true);
        setErrors({});
        try {
            await fakeApi({ success: true }, 1000);
            //dispatch(setCredentials({ token: "fake-jwt-token", user: { provider, isProfileComplete: false } }));
            navigation.navigate("Onboarding");
        } catch (e) {
            setErrors({ error: `Failed to sign up with ${provider}.` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaProvider style={styles.safe}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.title}>Create an account</Text>
                    <Text style={styles.subtitle}>Start your journey to find your perfect match</Text>

                    {errors.error && <Text style={styles.error}>{errors.error}</Text>}

                    {/* Tabs */}
                    <View style={styles.tabRow}>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === "email" && styles.tabActive]}
                            onPress={() => {
                                setActiveTab("email");
                                setOtpSent(false);
                                setErrors({});
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
                                setErrors({});
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
                                    style={[styles.input, errors.email && styles.inputError]}
                                    placeholder="you@example.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    value={email}
                                    onChangeText={(t) => {
                                        setEmail(t);
                                        if (errors) clearError("email");
                                    }}
                                    editable={!loading}
                                    textContentType="username"
                                    accessibilityLabel="email-input"
                                />
                                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                                <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
                                <View style={[styles.passwordContainer, errors.password && styles.inputError]}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="••••••••"
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={(t) => {
                                            setPassword(t);
                                            if (errors) clearError("password");
                                        }}
                                        accessibilityLabel="password-input"
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
                                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                                <TouchableOpacity
                                    style={[styles.primaryButton, loading && styles.disabledButton]}
                                    onPress={handleEmailRegister}
                                    disabled={loading}
                                    accessibilityLabel="email-login-button"
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.primaryButtonText}>Continue</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={styles.label}>Phone Number</Text>
                                <View style={[styles.phoneRow, errors.phone && styles.inputError]}>
                                    <TouchableOpacity
                                        style={styles.countryCodeBtn}
                                        onPress={() => setShowCountryCodeDropdown(!showCountryCodeDropdown)}
                                    >
                                        <Text style={styles.countryCodeText}>+{countryCode}</Text>
                                        <Text style={{ fontSize: 16, color: "#666" }}>▼</Text>
                                    </TouchableOpacity>
                                    <Modal
                                        visible={showCountryCodeDropdown}
                                        transparent
                                        animationType="fade"
                                        onRequestClose={() => setShowCountryCodeDropdown(false)}
                                    >
                                        <TouchableOpacity
                                            style={styles.modalOverlay}
                                            activeOpacity={1}
                                            onPress={() => setShowCountryCodeDropdown(false)}
                                        >
                                            <View style={styles.modalDropdown}>
                                                <ScrollView>
                                                    {country_codes.map((code) => (
                                                        <TouchableOpacity
                                                            key={code}
                                                            style={styles.countryCodeItem}
                                                            onPress={() => {
                                                                setCountryCode(code);
                                                                setShowCountryCodeDropdown(false);
                                                            }}
                                                        >
                                                            <Text>+{code}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </ScrollView>
                                            </View>
                                        </TouchableOpacity>
                                    </Modal>
                                    <TextInput
                                        style={[styles.input, styles.phoneInput]}
                                        placeholder="9911002233"
                                        keyboardType="phone-pad"
                                        autoCapitalize="none"
                                        value={phone}
                                        onChangeText={(t) => {
                                            setPhone(t.slice(0, 10));
                                            if (errors) clearError("phone");
                                        }}
                                        editable={!loading && !otpSent}
                                        maxLength={10}
                                        accessibilityLabel="phone-input"
                                    />
                                </View>
                                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

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
                                            style={[styles.input, styles.otpInput, errors.otp && styles.inputError]}
                                            placeholder="123456"
                                            keyboardType="number-pad"
                                            value={otp}
                                            onChangeText={(t) => {
                                                setOtp(t.slice(0, 6));
                                                if (errors) clearError("otp");
                                            }}
                                            editable={!loading}
                                            maxLength={6}
                                            accessibilityLabel="otp-input"
                                        />
                                        {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
                                        
                                        <TouchableOpacity
                                            style={[styles.primaryButton, loading && styles.disabledButton]}
                                            onPress={handleVerifyOtp}
                                            disabled={loading}
                                            accessibilityLabel="verify-otp-button"
                                        >
                                            {loading ? (
                                                <ActivityIndicator color="#fff" />
                                            ) : (
                                                <Text style={styles.primaryButtonText}>Verify & Continue</Text>
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
                                onPress={() => handleSocialRegister("google")}
                                disabled={loading}
                                emoji="g"
                            />
                        ) : null}
                        {Platform.OS === "ios" ? (
                            <SocialButton
                                label="Continue with Apple"
                                onPress={() => handleSocialRegister("apple")}
                                disabled={loading}
                                emoji=""
                            />
                        ) : null}
                        <SocialButton
                            label="Continue with Facebook"
                            onPress={() => handleSocialRegister("facebook")}
                            disabled={loading}
                            emoji="f"
                        />
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading}>
                            <Text style={styles.linkText}> Sign In</Text>
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
        color: "#000",
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
    phoneRow: {
        flexDirection: "row",
        marginBottom: 12,
    },
    phoneInput: {
        flex: 1,
        marginLeft: 8,
        marginBottom: 0,
    },
    otpInput: {
        fontSize: 24,
        letterSpacing: 8,
        textAlign: "center",
    },
    countryCodeBtn: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        minWidth: 80,
    },
    countryCodeText: {
        fontWeight: "600",
        marginRight: 4,
    },
    countryCodeItem: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f7f7f8",
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "transparent",
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
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalDropdown: {
        width: 120,
        maxHeight: 300,
        backgroundColor: "#fff",
        borderRadius: 8,
        elevation: 10,        // ANDROID
        // shadowColor: "#000",  // IOS
        // shadowOpacity: 0.25,
        // shadowRadius: 6,
    },
    inputError: {
        borderWidth: 1,
        borderColor: "#d9534f",
    },
    errorText: {
        color: "#d9534f",
        marginTop: 6,
        fontSize: 12,
    },
});