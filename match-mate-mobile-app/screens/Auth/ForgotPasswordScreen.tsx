import React, { useState, useCallback } from "react";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    ActivityIndicator, 
    KeyboardAvoidingView, 
    Platform, 
    StyleSheet, 
    Alert 
} from "react-native";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen ({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const validate = useCallback(() => {
        if (!email.trim()) return "Email is required";
        if (!EMAIL_REGEX.test(email.trim())) return "Enter a valid email";
        return null;
    }, [email]);

    const onSubmit = useCallback(async () => {
        const validationError = validate();
        setError(validationError);
        if (validationError) return;

        setLoading(true);
        try {
            // Replace URL with your backend endpoint
            const res = await fetch("https://api.example.com/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });

            // Accept both 200 and 202 as success depending on API design
            if (res.ok) {
                Alert.alert(
                    "Email Sent",
                    "If an account with that email exists, instructions to reset your password have been sent."
                );
                navigation.goBack();
            } else {
                const json = await res.json().catch(() => ({}));
                const msg = json?.message || "Unable to send reset email. Please try again.";
                Alert.alert("Error", msg);
            }
        } catch (e) {
            Alert.alert("Network error", "Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    }, [email, navigation, validate]);

    return (
        <SafeAreaProvider style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={styles.flex}>
                <View style={styles.inner}>
                    <Text style={styles.title}>Forgot password</Text>
                    <Text style={styles.subtitle}>
                        Enter the email associated with your account and we'll send a link to reset your
                        password.
                    </Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            value={email}
                            onChangeText={(t) => {
                                setEmail(t);
                                if (error) setError(null);
                            }}
                            placeholder="you@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            style={[styles.input, error ? styles.inputError : null]}
                            editable={!loading}
                            returnKeyType="send"
                            onSubmitEditing={onSubmit}
                        />
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading ? styles.buttonDisabled : null]}
                        onPress={onSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Send reset link</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkContainer}
                        onPress={() => navigation.goBack()}
                        disabled={loading}
                    >
                        <Text style={styles.linkText}>Back to sign in</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    flex: { flex: 1 },
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    inner: {
        padding: 20,
        flex: 1,
        justifyContent: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 8,
        color: "#111",
    },
    subtitle: {
        color: "#666",
        marginBottom: 24,
        lineHeight: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        color: "#333",
        marginBottom: 6,
        fontSize: 13,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: "#e2e2e2",
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: "#fff",
    },
    inputError: {
        borderColor: "#d9534f",
    },
    errorText: {
        color: "#d9534f",
        marginTop: 6,
        fontSize: 12,
    },
    button: {
        height: 48,
        backgroundColor: "#3b82f6",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
    },
    linkContainer: {
        marginTop: 16,
        alignItems: "center",
    },
    linkText: {
        color: "#3b82f6",
        fontWeight: "500",
    }
});