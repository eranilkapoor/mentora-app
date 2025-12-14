import React, { useState } from "react";
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Image, 
    ScrollView, 
    KeyboardAvoidingView, 
    Platform, 
    Alert, 
    ActivityIndicator 
} from "react-native";

export default function RegisterScreen({ navigation }: any) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [dob, setDob] = useState(""); // expected YYYY-MM-DD
    const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
    const [photoUrl, setPhotoUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const e: Record<string, string> = {};
        if (!fullName.trim()) e.fullName = "Full name is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email";
        if (password.length < 6) e.password = "Password must be at least 6 characters";
        if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";
        if (dob) {
            const d = new Date(dob);
            if (Number.isNaN(d.getTime())) e.dob = "Invalid date (use YYYY-MM-DD)";
            else {
                const age = getAge(d);
                if (age < 13) e.dob = "You must be at least 13 years old";
            }
        } else {
            e.dob = "Date of birth is required";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const getAge = (birthDate: Date) => {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    };

    const handleRegister = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            // Replace with your API call. This is a placeholder.
            const payload = {
                fullName,
                email,
                password,
                dob,
                gender,
                photoUrl: photoUrl || null,
            };

            // Example fetch - change URL and handling to match your backend
            const res = await fetch("https://example.com/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message || "Registration failed");
            }

            // success
            Alert.alert("Account created", "You can now sign in.", [
                { text: "OK", onPress: () => navigation?.navigate?.("Login") || null },
            ]);
        } catch (err: any) {
            Alert.alert("Registration error", err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.select({ ios: "padding", android: undefined })}
        >
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.title}>Create account</Text>

                <View style={styles.avatarRow}>
                    <View style={styles.avatarWrapper}>
                        {photoUrl ? (
                            <Image source={{ uri: photoUrl }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>No Photo</Text>
                            </View>
                        )}
                    </View>
                    <View style={{ flex: 1 }}>
                        <TextInput
                            placeholder="Profile photo URL (optional)"
                            value={photoUrl}
                            onChangeText={setPhotoUrl}
                            style={styles.input}
                            autoCapitalize="none"
                            keyboardType="url"
                            accessibilityLabel="Profile photo URL"
                        />
                        <TouchableOpacity
                            onPress={() =>
                                Alert.alert(
                                    "Photo",
                                    "Camera/photo-picker integration is not included by default. Use a URL or add an image-picker library and implement here."
                                )
                            }
                        >
                            <Text style={styles.link}>How to add a photo?</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TextInput
                    placeholder="Full name"
                    value={fullName}
                    onChangeText={setFullName}
                    style={styles.input}
                    accessibilityLabel="Full name"
                />
                {errors.fullName ? <Text style={styles.error}>{errors.fullName}</Text> : null}

                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    accessibilityLabel="Email"
                />
                {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}

                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    secureTextEntry
                    accessibilityLabel="Password"
                />
                {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}

                <TextInput
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    style={styles.input}
                    secureTextEntry
                    accessibilityLabel="Confirm password"
                />
                {errors.confirmPassword ? <Text style={styles.error}>{errors.confirmPassword}</Text> : null}

                <TextInput
                    placeholder="Date of birth (YYYY-MM-DD)"
                    value={dob}
                    onChangeText={setDob}
                    style={styles.input}
                    accessibilityLabel="Date of birth"
                />
                {errors.dob ? <Text style={styles.error}>{errors.dob}</Text> : null}

                <View style={styles.genderRow}>
                    <TouchableOpacity
                        style={[styles.genderBtn, gender === "male" && styles.genderBtnActive]}
                        onPress={() => setGender("male")}
                    >
                        <Text style={styles.genderText}>Male</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.genderBtn, gender === "female" && styles.genderBtnActive]}
                        onPress={() => setGender("female")}
                    >
                        <Text style={styles.genderText}>Female</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.genderBtn, gender === "other" && styles.genderBtnActive]}
                        onPress={() => setGender("other")}
                    >
                        <Text style={styles.genderText}>Other</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleRegister}
                    disabled={loading}
                    accessibilityLabel="Create account"
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account?</Text>
                    <TouchableOpacity onPress={() => navigation?.navigate?.("Login")}>
                        <Text style={styles.link}> Sign in</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    content: { padding: 20, paddingTop: 40 },
    title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginTop: 12,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#0a84ff",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 18,
    },
    buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
    footer: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
    footerText: { color: "#666" },
    link: { color: "#0a84ff", marginTop: 6 },
    error: { color: "#d04545", marginTop: 6 },
    genderRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
    genderBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
        marginHorizontal: 4,
    },
    genderBtnActive: { backgroundColor: "#eef6ff", borderColor: "#0a84ff" },
    genderText: { fontSize: 14 },
    avatarRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
    avatarWrapper: { width: 64, height: 64, marginRight: 12 },
    avatar: { width: 64, height: 64, borderRadius: 32 },
    avatarPlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: { color: "#888", fontSize: 12 },
});