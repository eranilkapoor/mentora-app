import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    ScrollView,
    Alert,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { fakeApi } from "../../services/fakeApi";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormErrors = {
  email?: string;
  error?: string;
};

export default function ForgotPasswordScreen({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    const clearError = (field: keyof FormErrors) => {
        setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const validate = useCallback(() => {
        const newErrors: FormErrors = {};
        if (!email.trim())
            newErrors.email = "Email is required";
        else if (!EMAIL_REGEX.test(email.trim()))
            newErrors.email = "Enter a valid email address";

        return Object.keys(newErrors).length ? newErrors : {};

    }, [email]);

    const onSubmit = useCallback(async () => {
        const validationError = validate();
        setErrors(validationError);
        if (validationError) return;

        setLoading(true);
        try {
            const res = await fakeApi(
                { success: true },
                800,
                email === "notfound@example.com"
            );

            if (res.success) {
                Alert.alert(
                    "Reset link sent",
                    "If an account exists with this email, you’ll receive a password reset link shortly."
                );
                navigation.goBack();
            } else {
                setErrors({ error: res.error || "Failed to send reset link. Please try again." });
            }
        } catch (e) {
            Alert.alert(
                "Network error",
                "Please check your internet connection and try again."
            );
        } finally {
            setLoading(false);
        }
    }, [email, navigation, validate]);

    return (
        <SafeAreaProvider style={styles.safe}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.title}>Forgot password</Text>
                    <Text style={styles.subtitle}>
                        Enter the email associated with your account and we’ll
                        send you instructions to reset your password.
                    </Text>

                    <View style={styles.form}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            value={email}
                            onChangeText={(t) => {
                                setEmail(t);
                                if (errors) clearError("email");
                            }}
                            placeholder="you@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            style={[styles.input, errors.email && styles.inputError]}
                            editable={!loading}
                            returnKeyType="send"
                            onSubmitEditing={onSubmit}
                        />
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                loading && styles.disabledButton,
                            ]}
                            onPress={onSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.primaryButtonText}>
                                    Send reset link
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.backLink}
                            onPress={() => navigation.goBack()}
                            disabled={loading}
                        >
                            <Text style={styles.backLinkText}>
                                Back to sign in
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#fff",
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 120,
    },
    title: {
        fontSize: 28,
        fontWeight: "900",
        color: "#000",
        marginBottom: 12,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 20,
    },
    form: {
        marginTop: 8,
    },
    label: {
        fontSize: 13,
        color: "#444",
        marginBottom: 6,
    },
    input: {
        backgroundColor: "#f7f7f8",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 12,
        fontSize: 16,
        color: "#111",
    },
    primaryButton: {
        marginTop: 18,
        backgroundColor: "#111",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    primaryButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
    disabledButton: {
        opacity: 0.6,
    },
    backLink: {
        marginTop: 20,
        alignItems: "center",
    },
    backLinkText: {
        color: "#007AFF",
        fontSize: 14,
        fontWeight: "600",
    },
    error: {
        color: "#b00020",
        marginBottom: 12,
        textAlign: "center",
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