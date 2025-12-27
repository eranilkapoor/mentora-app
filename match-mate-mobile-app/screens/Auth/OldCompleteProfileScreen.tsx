import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from "react-native";
import { religions, qualifications, body_types, complexions, blood_groups, family_types, family_statuses } from "../../constants";

type RegistrationStep = "auth" | "otp" | "personal" | "address" | "education" | "physical" | "family" | "preferences" | "review";

interface AuthData {
    firstName: string;
    lastName: string;
    countryCode: string;
    mobile: string;
    email: string;
}

interface PersonalData {
    password: string;
    confirmPassword: string;
    dob: string;
    gender: "male" | "female" | "";
    religion: string;
    caste: string;
    motherTongue: string;
}

interface AddressData {
    city: string;
    state: string;
    country: string;
    zipCode: string;
}

interface EducationData {
    qualification: string;
    field: string;
    university: string;
    occupation: string;
    annualIncome: string;
}

interface PhysicalData {
    height: string;
    weight: string;
    bodyType: string;
    complexion: string;
    bloodGroup: string;
}

interface FamilyData {
    fatherName: string;
    motherName: string;
    fatherOccupation: string;
    motherOccupation: string;
    siblings: string;
    familyType: string;
    familyStatus: string;
    familyValues: string;
}

interface PreferencesData {
    ageRange: string;
    heightRange: string;
    qualificationRequired: string;
    religionPref: string;
    castePref: string;
    locationPref: string;
    incomePref: string;
    otherPreferences: string;
}

const COUNTRY_CODES = ["+1", "+44", "+91", "+86", "+81", "+33", "+39", "+34", "+49"];

export default function CompleteProfileScreen({ navigation }: any) {
    const [currentStep, setCurrentStep] = useState<RegistrationStep>("auth");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showDropdown, setShowDropdown] = useState<string | null>(null);
    const [otpCode, setOtpCode] = useState("");
    const [showCountryCodeDropdown, setShowCountryCodeDropdown] = useState(false);

    const [auth, setAuth] = useState<AuthData>({
        firstName: "",
        lastName: "",
        countryCode: "+91",
        mobile: "",
        email: "",
    });

    const [personal, setPersonal] = useState<PersonalData>({
        password: "",
        confirmPassword: "",
        dob: "",
        gender: "",
        religion: "",
        caste: "",
        motherTongue: "",
    });

    const [address, setAddress] = useState<AddressData>({
        city: "",
        state: "",
        country: "",
        zipCode: "",
    });

    const [education, setEducation] = useState<EducationData>({
        qualification: "",
        field: "",
        university: "",
        occupation: "",
        annualIncome: "",
    });

    const [physical, setPhysical] = useState<PhysicalData>({
        height: "",
        weight: "",
        bodyType: "",
        complexion: "",
        bloodGroup: "",
    });

    const [family, setFamily] = useState<FamilyData>({
        fatherName: "",
        motherName: "",
        fatherOccupation: "",
        motherOccupation: "",
        siblings: "",
        familyType: "",
        familyStatus: "",
        familyValues: "",
    });

    const [preferences, setPreferences] = useState<PreferencesData>({
        ageRange: "",
        heightRange: "",
        qualificationRequired: "",
        religionPref: "",
        castePref: "",
        locationPref: "",
        incomePref: "",
        otherPreferences: "",
    });

    const validateAuth = () => {
        const e: Record<string, string> = {};
        if (!auth.firstName.trim()) e.firstName = "First name required";
        if (!auth.mobile.trim() || auth.mobile.length < 10) e.mobile = "Valid mobile number required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validatePersonal = () => {
        const e: Record<string, string> = {};
        if (personal.password.length < 6) e.password = "Min 6 characters";
        if (personal.password !== personal.confirmPassword) e.confirmPassword = "Passwords don't match";
        if (!personal.dob) e.dob = "Date Of Birth required";
        if (!personal.gender) e.gender = "Gender required";
        if (!personal.religion) e.religion = "Religion required";
        if (!personal.caste.trim()) e.caste = "Caste required";
        if (!personal.motherTongue.trim()) e.motherTongue = "Mother tongue required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateAddress = () => {
        const e: Record<string, string> = {};
        if (!address.city.trim()) e.city = "City required";
        if (!address.state.trim()) e.state = "State required";
        if (!address.country.trim()) e.country = "Country required";
        if (!address.zipCode.trim()) e.zipCode = "Zip code required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateEducation = () => {
        const e: Record<string, string> = {};
        if (!education.qualification) e.qualification = "Qualification required";
        if (!education.field.trim()) e.field = "Field required";
        if (!education.university.trim()) e.university = "University required";
        if (!education.occupation.trim()) e.occupation = "Occupation required";
        if (!education.annualIncome.trim()) e.annualIncome = "Income required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validatePhysical = () => {
        const e: Record<string, string> = {};
        if (!physical.height.trim()) e.height = "Height required";
        if (!physical.weight.trim()) e.weight = "Weight required";
        if (!physical.bodyType) e.bodyType = "Body type required";
        if (!physical.complexion) e.complexion = "Complexion required";
        if (!physical.bloodGroup) e.bloodGroup = "Blood group required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateFamily = () => {
        const e: Record<string, string> = {};
        if (!family.fatherName.trim()) e.fatherName = "Father's name required";
        if (!family.motherName.trim()) e.motherName = "Mother's name required";
        if (!family.familyType) e.familyType = "Family type required";
        if (!family.familyStatus) e.familyStatus = "Family status required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validatePreferences = () => {
        const e: Record<string, string> = {};
        if (!preferences.ageRange.trim()) e.ageRange = "Age range required";
        if (!preferences.heightRange.trim()) e.heightRange = "Height range required";
        if (!preferences.locationPref.trim()) e.locationPref = "Location preference required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSendOTP = async () => {
        if (!validateAuth()) return;
        setLoading(true);
        try {
            // Call API to send OTP
            // const res = await fetch("https://localhost:3000/api/auth/send-otp", {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify({
            //         mobile: auth.countryCode + auth.mobile,
            //         email: auth.email,
            //     }),
            // });

            //if (!res.ok) throw new Error("Failed to send OTP");
            setCurrentStep("otp");
            setErrors({});
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otpCode.trim()) {
            setErrors({ otp: "OTP required" });
            return;
        }
        setLoading(true);
        try {
            // const res = await fetch("https://localhost:3000/api/auth/verify-otp", {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify({
            //         mobile: auth.countryCode + auth.mobile,
            //         otp: otpCode,
            //     }),
            // });

            // if (!res.ok) throw new Error("Invalid OTP");
            setCurrentStep("personal");
            setErrors({});
        } catch (err: any) {
            Alert.alert("Error", err.message || "OTP verification failed");
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        const steps: RegistrationStep[] = ["personal", "address", "education", "physical", "family", "preferences", "review"];
        const currentIndex = steps.indexOf(currentStep);

        switch (currentStep) {
            case "personal":
                if (!validatePersonal()) return;
                break;
            case "address":
                if (!validateAddress()) return;
                break;
            case "education":
                if (!validateEducation()) return;
                break;
            case "physical":
                if (!validatePhysical()) return;
                break;
            case "family":
                if (!validateFamily()) return;
                break;
            case "preferences":
                if (!validatePreferences()) return;
                break;
        }

        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
            setErrors({});
        }
    };

    const handlePrevious = () => {
        if (currentStep === "otp") {
            setCurrentStep("auth");
            setOtpCode("");
        } else {
            const steps: RegistrationStep[] = ["personal", "address", "education", "physical", "family", "preferences", "review"];
            const currentIndex = steps.indexOf(currentStep);
            if (currentIndex > 0) {
                setCurrentStep(steps[currentIndex - 1]);
                setErrors({});
            }
        }
    };

    const handleSignIn = () => {
        navigation?.navigate?.("Login") || null;
    };

    const handleRegister = async () => {
        setLoading(true);
        try {
            const payload = {
                auth,
                personal,
                address,
                education,
                physical,
                family,
                preferences,
            };

            const res = await fetch("https://localhost:3000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message || "Registration failed");
            }

            Alert.alert("Success", "Account created successfully!", [
                { text: "OK", onPress: () => navigation?.navigate?.("Login") || null },
            ]);
        } catch (err: any) {
            Alert.alert("Error", err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const DropdownPicker = ({ label, options, value, onChange }: any) => (
        <View>
            <TouchableOpacity
                style={[styles.input, { justifyContent: "space-between", flexDirection: "row", alignItems: "center" }]}
                onPress={() => setShowDropdown(showDropdown === label ? null : label)}
            >
                <Text style={{ color: value ? "#000" : "#999" }}>{value || `Select ${label}`}</Text>
                <Text style={{ fontSize: 18, color: "#666" }}>
                    {showDropdown === label ? "▲" : "▼"}
                </Text>
            </TouchableOpacity>
            {showDropdown === label && (
                <View style={[styles.dropdown, { maxHeight: 250 }]}>
                    <ScrollView scrollEnabled={options.length > 5}>
                        {options.map((item: string) => (
                            <TouchableOpacity
                                key={item}
                                style={styles.dropdownItem}
                                onPress={() => {
                                    onChange(item);
                                    setShowDropdown(null);
                                }}
                            >
                                <Text>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );

    const ErrorText = ({ field }: { field: string }) =>
        errors[field] ? <Text style={styles.error}>{errors[field]}</Text> : null;

    const renderStepContent = () => {
        switch (currentStep) {
            case "auth":
                return (
                    <>
                        <View>
                            <Text style={styles.stepTitle}>Create Your Account</Text>
                            <Text style={styles.subtitle}>Enter your basic details to get started</Text>

                            <Text style={styles.label}>First Name (*)</Text>
                            <TextInput
                                placeholder="John"
                                value={auth.firstName}
                                onChangeText={(text) => setAuth({ ...auth, firstName: text })}
                                style={styles.input}
                            />
                            <ErrorText field="firstName" />

                            <Text style={styles.label}>Last Name (Optional)</Text>
                            <TextInput
                                placeholder="Doe"
                                value={auth.lastName}
                                onChangeText={(text) => setAuth({ ...auth, lastName: text })}
                                style={styles.input}
                            />

                            <Text style={styles.label}>Mobile Number (*)</Text>
                            <View style={styles.phoneRow}>
                                <TouchableOpacity
                                    style={styles.countryCodeBtn}
                                    onPress={() => setShowCountryCodeDropdown(!showCountryCodeDropdown)}
                                >
                                    <Text style={styles.countryCodeText}>{auth.countryCode}</Text>
                                    <Text style={{ fontSize: 16, color: "#666" }}>▼</Text>
                                </TouchableOpacity>
                                {showCountryCodeDropdown && (
                                    <View style={styles.countryCodeDropdown}>
                                        <ScrollView scrollEnabled={COUNTRY_CODES.length > 4}>
                                            {COUNTRY_CODES.map((code) => (
                                                <TouchableOpacity
                                                    key={code}
                                                    style={styles.countryCodeItem}
                                                    onPress={() => {
                                                        setAuth({ ...auth, countryCode: code });
                                                        setShowCountryCodeDropdown(false);
                                                    }}
                                                >
                                                    <Text>{code}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                                <TextInput
                                    placeholder="9999999999"
                                    value={auth.mobile}
                                    onChangeText={(text) => setAuth({ ...auth, mobile: text })}
                                    style={[styles.input, styles.phoneInput]}
                                    keyboardType="phone-pad"
                                />
                            </View>
                            <ErrorText field="mobile" />
                            
                            <Text style={styles.label}>Email (Optional)</Text>
                            <TextInput
                                placeholder="your@email.com"
                                value={auth.email}
                                onChangeText={(text) => setAuth({ ...auth, email: text })}
                                style={styles.input}
                                keyboardType="email-address"
                            />
                        </View>
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account?</Text>
                            <TouchableOpacity onPress={handleSignIn} disabled={loading}>
                                <Text style={styles.linkText}>SignIn</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                );

            case "otp":
                return (
                    <View>
                        <Text style={styles.stepTitle}>Verify Your Identity</Text>
                        <Text style={styles.label}>
                            Enter the OTP sent to {auth.countryCode} {auth.mobile}
                        </Text>
                        <TextInput
                            placeholder="Enter OTP"
                            value={otpCode}
                            onChangeText={setOtpCode}
                            style={[styles.input, styles.otpInput]}
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                        <ErrorText field="otp" />

                        <TouchableOpacity style={styles.resendLink}>
                            <Text style={styles.resendText}>Didn't receive OTP? Resend</Text>
                        </TouchableOpacity>
                    </View>
                );

            case "personal":
                return (
                    <View>
                        <Text style={styles.stepTitle}>Personal Information</Text>

                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            placeholder="Password"
                            value={personal.password}
                            onChangeText={(text) => setPersonal({ ...personal, password: text })}
                            style={styles.input}
                            secureTextEntry
                        />
                        <ErrorText field="password" />

                        <Text style={styles.label}>Confirm Password</Text>
                        <TextInput
                            placeholder="Confirm Password"
                            value={personal.confirmPassword}
                            onChangeText={(text) => setPersonal({ ...personal, confirmPassword: text })}
                            style={styles.input}
                            secureTextEntry
                        />
                        <ErrorText field="confirmPassword" />

                        <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
                        <TextInput
                            placeholder="Date of Birth (YYYY-MM-DD)"
                            value={personal.dob}
                            onChangeText={(text) => setPersonal({ ...personal, dob: text })}
                            style={styles.input}
                        />
                        <ErrorText field="dob" />

                        <Text style={styles.label}>Gender</Text>
                        <View style={styles.genderRow}>
                            <TouchableOpacity
                                style={[styles.genderBtn, personal.gender === "male" && styles.genderBtnActive]}
                                onPress={() => setPersonal({ ...personal, gender: "male" })}
                            >
                                <Text>Male</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.genderBtn, personal.gender === "female" && styles.genderBtnActive]}
                                onPress={() => setPersonal({ ...personal, gender: "female" })}
                            >
                                <Text>Female</Text>
                            </TouchableOpacity>
                        </View>
                        <ErrorText field="gender" />

                        <Text style={styles.label}>Religion</Text>
                        <DropdownPicker
                            label="religion"
                            options={religions}
                            value={personal.religion}
                            onChange={(val: string) => setPersonal({ ...personal, religion: val })}
                        />
                        <ErrorText field="religion" />

                        <Text style={styles.label}>Caste</Text>
                        <TextInput
                            placeholder="Caste"
                            value={personal.caste}
                            onChangeText={(text) => setPersonal({ ...personal, caste: text })}
                            style={styles.input}
                        />
                        <ErrorText field="caste" />

                        <Text style={styles.label}>Mother Tongue</Text>
                        <TextInput
                            placeholder="Mother Tongue"
                            value={personal.motherTongue}
                            onChangeText={(text) => setPersonal({ ...personal, motherTongue: text })}
                            style={styles.input}
                        />
                        <ErrorText field="motherTongue" />
                    </View>
                );

            case "address":
                return (
                    <View>
                        <Text style={styles.stepTitle}>Address Details</Text>

                        <Text style={styles.label}>City</Text>
                        <TextInput
                            placeholder="City"
                            value={address.city}
                            onChangeText={(text) => setAddress({ ...address, city: text })}
                            style={styles.input}
                        />
                        <ErrorText field="city" />

                        <Text style={styles.label}>State</Text>
                        <TextInput
                            placeholder="State"
                            value={address.state}
                            onChangeText={(text) => setAddress({ ...address, state: text })}
                            style={styles.input}
                        />
                        <ErrorText field="state" />

                        <Text style={styles.label}>Country</Text>
                        <TextInput
                            placeholder="Country"
                            value={address.country}
                            onChangeText={(text) => setAddress({ ...address, country: text })}
                            style={styles.input}
                        />
                        <ErrorText field="country" />

                        <Text style={styles.label}>Zip Code</Text>
                        <TextInput
                            placeholder="Zip Code"
                            value={address.zipCode}
                            onChangeText={(text) => setAddress({ ...address, zipCode: text })}
                            style={styles.input}
                            keyboardType="numeric"
                        />
                        <ErrorText field="zipCode" />
                    </View>
                );

            case "education":
                return (
                    <View>
                        <Text style={styles.stepTitle}>Education & Occupation</Text>

                        <Text style={styles.label}>Qualification</Text>
                        <DropdownPicker
                            label="qualification"
                            options={qualifications}
                            value={education.qualification}
                            onChange={(val: string) => setEducation({ ...education, qualification: val })}
                        />
                        <ErrorText field="qualification" />

                        <Text style={styles.label}>Field of Study</Text>
                        <TextInput
                            placeholder="Field of Study"
                            value={education.field}
                            onChangeText={(text) => setEducation({ ...education, field: text })}
                            style={styles.input}
                        />
                        <ErrorText field="field" />

                        <Text style={styles.label}>University/College</Text>
                        <TextInput
                            placeholder="University/College"
                            value={education.university}
                            onChangeText={(text) => setEducation({ ...education, university: text })}
                            style={styles.input}
                        />
                        <ErrorText field="university" />

                        <Text style={styles.label}>Occupation</Text>
                        <TextInput
                            placeholder="Occupation"
                            value={education.occupation}
                            onChangeText={(text) => setEducation({ ...education, occupation: text })}
                            style={styles.input}
                        />
                        <ErrorText field="occupation" />

                        <Text style={styles.label}>Annual Income (in LPA/USD)</Text>
                        <TextInput
                            placeholder="Annual Income (in LPA/USD)"
                            value={education.annualIncome}
                            onChangeText={(text) => setEducation({ ...education, annualIncome: text })}
                            style={styles.input}
                            keyboardType="numeric"
                        />
                        <ErrorText field="annualIncome" />
                    </View>
                );

            case "physical":
                return (
                    <View>
                        <Text style={styles.stepTitle}>Physical Details</Text>

                        <Text style={styles.label}>Height (in cm)</Text>
                        <TextInput
                            placeholder="Height (in cm)"
                            value={physical.height}
                            onChangeText={(text) => setPhysical({ ...physical, height: text })}
                            style={styles.input}
                            keyboardType="numeric"
                        />
                        <ErrorText field="height" />

                        <Text style={styles.label}>Weight (in kg)</Text>
                        <TextInput
                            placeholder="Weight (in kg)"
                            value={physical.weight}
                            onChangeText={(text) => setPhysical({ ...physical, weight: text })}
                            style={styles.input}
                            keyboardType="numeric"
                        />
                        <ErrorText field="weight" />

                        <Text style={styles.label}>Body Type</Text>
                        <DropdownPicker
                            label="bodyType"
                            options={body_types}
                            value={physical.bodyType}
                            onChange={(val: string) => setPhysical({ ...physical, bodyType: val })}
                        />
                        <ErrorText field="bodyType" />

                        <Text style={styles.label}>Complexion</Text>
                        <DropdownPicker
                            label="complexion"
                            options={complexions}
                            value={physical.complexion}
                            onChange={(val: string) => setPhysical({ ...physical, complexion: val })}
                        />
                        <ErrorText field="complexion" />

                        <Text style={styles.label}>Blood Group</Text>
                        <DropdownPicker
                            label="bloodGroup"
                            options={blood_groups}
                            value={physical.bloodGroup}
                            onChange={(val: string) => setPhysical({ ...physical, bloodGroup: val })}
                        />
                        <ErrorText field="bloodGroup" />
                    </View>
                );

            case "family":
                return (
                    <View>
                        <Text style={styles.stepTitle}>Family Background</Text>

                        <Text style={styles.label}>Father's Name</Text>
                        <TextInput
                            placeholder="Father's Name"
                            value={family.fatherName}
                            onChangeText={(text) => setFamily({ ...family, fatherName: text })}
                            style={styles.input}
                        />
                        <ErrorText field="fatherName" />

                        <Text style={styles.label}>Mother's Name</Text>
                        <TextInput
                            placeholder="Mother's Name"
                            value={family.motherName}
                            onChangeText={(text) => setFamily({ ...family, motherName: text })}
                            style={styles.input}
                        />
                        <ErrorText field="motherName" />

                        <Text style={styles.label}>Father's Occupation</Text>
                        <TextInput
                            placeholder="Father's Occupation"
                            value={family.fatherOccupation}
                            onChangeText={(text) => setFamily({ ...family, fatherOccupation: text })}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Mother's Occupation</Text>
                        <TextInput
                            placeholder="Mother's Occupation"
                            value={family.motherOccupation}
                            onChangeText={(text) => setFamily({ ...family, motherOccupation: text })}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Number of Siblings</Text>
                        <TextInput
                            placeholder="Number of Siblings"
                            value={family.siblings}
                            onChangeText={(text) => setFamily({ ...family, siblings: text })}
                            style={styles.input}
                            keyboardType="numeric"
                        />

                        <Text style={styles.label}>Family Type</Text>
                        <DropdownPicker
                            label="familyType"
                            options={family_types}
                            value={family.familyType}
                            onChange={(val: string) => setFamily({ ...family, familyType: val })}
                        />
                        <ErrorText field="familyType" />

                        <Text style={styles.label}>Family Status</Text>
                        <DropdownPicker
                            label="familyStatus"
                            options={family_statuses}
                            value={family.familyStatus}
                            onChange={(val: string) => setFamily({ ...family, familyStatus: val })}
                        />
                        <ErrorText field="familyStatus" />

                        <Text style={styles.label}>Family Values</Text>
                        <TextInput
                            placeholder="Family Values (e.g., Traditional, Modern)"
                            value={family.familyValues}
                            onChangeText={(text) => setFamily({ ...family, familyValues: text })}
                            style={styles.input}
                        />
                    </View>
                );

            case "preferences":
                return (
                    <View>
                        <Text style={styles.stepTitle}>Partner Preferences</Text>

                        <Text style={styles.label}>Age Range (e.g., 25-32)</Text>    
                        <TextInput
                            placeholder="Age Range (e.g., 25-32)"
                            value={preferences.ageRange}
                            onChangeText={(text) => setPreferences({ ...preferences, ageRange: text })}
                            style={styles.input}
                        />
                        <ErrorText field="ageRange" />

                        <Text style={styles.label}>Height Range (e.g., 160-180 cm)</Text>
                        <TextInput
                            placeholder="Height Range (e.g., 160-180 cm)"
                            value={preferences.heightRange}
                            onChangeText={(text) => setPreferences({ ...preferences, heightRange: text })}
                            style={styles.input}
                        />
                        <ErrorText field="heightRange" />

                        <Text style={styles.label}>Qualification Required</Text>
                        <TextInput
                            placeholder="Qualification Required"
                            value={preferences.qualificationRequired}
                            onChangeText={(text) => setPreferences({ ...preferences, qualificationRequired: text })}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Religion Preference</Text>
                        <TextInput
                            placeholder="Religion Preference"
                            value={preferences.religionPref}
                            onChangeText={(text) => setPreferences({ ...preferences, religionPref: text })}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Caste Preference</Text>
                        <TextInput
                            placeholder="Caste Preference (if any)"
                            value={preferences.castePref}
                            onChangeText={(text) => setPreferences({ ...preferences, castePref: text })}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Location Preference</Text>
                        <TextInput
                            placeholder="Location Preference"
                            value={preferences.locationPref}
                            onChangeText={(text) => setPreferences({ ...preferences, locationPref: text })}
                            style={styles.input}
                        />
                        <ErrorText field="locationPref" />

                        <Text style={styles.label}>Income Preference</Text>
                        <TextInput
                            placeholder="Income Preference"
                            value={preferences.incomePref}
                            onChangeText={(text) => setPreferences({ ...preferences, incomePref: text })}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Other Preferences</Text>
                        <TextInput
                            placeholder="Other Preferences"
                            value={preferences.otherPreferences}
                            onChangeText={(text) => setPreferences({ ...preferences, otherPreferences: text })}
                            style={[styles.input, { height: 100, textAlignVertical: "top" }]}
                            multiline
                        />
                    </View>
                );

            case "review":
                return (
                    <ScrollView>
                        <Text style={styles.stepTitle}>Review Your Profile</Text>
                        <View style={styles.reviewSection}>
                            <Text style={styles.reviewLabel}>Account:</Text>
                            <Text>{auth.firstName} {auth.lastName} | {auth.countryCode}{auth.mobile}</Text>
                        </View>
                        <View style={styles.reviewSection}>
                            <Text style={styles.reviewLabel}>Personal:</Text>
                            <Text>{personal.gender} | {personal.dob}</Text>
                        </View>
                        <View style={styles.reviewSection}>
                            <Text style={styles.reviewLabel}>Address:</Text>
                            <Text>{address.city}, {address.state}, {address.country}</Text>
                        </View>
                        <View style={styles.reviewSection}>
                            <Text style={styles.reviewLabel}>Education:</Text>
                            <Text>{education.qualification} in {education.field}</Text>
                        </View>
                        <View style={styles.reviewSection}>
                            <Text style={styles.reviewLabel}>Physical:</Text>
                            <Text>{physical.height} cm, {physical.weight} kg</Text>
                        </View>
                        <View style={styles.reviewSection}>
                            <Text style={styles.reviewLabel}>Family:</Text>
                            <Text>{family.fatherName} & {family.motherName}</Text>
                        </View>
                        <View style={styles.reviewSection}>
                            <Text style={styles.reviewLabel}>Preferences:</Text>
                            <Text>Age: {preferences.ageRange} | Height: {preferences.heightRange}</Text>
                        </View>
                    </ScrollView>
                );

            default:
                return null;
        }
    };

    const getStepPercentage = () => {
        const allSteps: RegistrationStep[] = ["auth", "otp", "personal", "address", "education", "physical", "family", "preferences", "review"];
        const currentIndex = allSteps.indexOf(currentStep);
        return ((currentIndex + 1) / allSteps.length) * 100;
    };

    const handleAuthNext = () => {
        handleSendOTP();
    };

    const handleOTPNext = () => {
        handleVerifyOTP();
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.select({ ios: "padding", android: undefined })}
        >
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${getStepPercentage()}%` }]} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                {renderStepContent()}

                <View style={styles.buttonContainer}>
                    {!["auth", "otp", "personal"].includes(currentStep) && (
                        <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevious}>
                            <Text style={styles.secondaryButtonText}>Previous</Text>
                        </TouchableOpacity>
                    )}

                    {currentStep === "auth" ? (
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleAuthNext}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Send OTP</Text>
                            )}
                        </TouchableOpacity>
                    ) : currentStep === "otp" ? (
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleOTPNext}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Verify OTP</Text>
                            )}
                        </TouchableOpacity>
                    ) : currentStep !== "review" ? (
                        <TouchableOpacity style={styles.button} onPress={handleNext}>
                            <Text style={styles.buttonText}>Next</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Create Account</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    content: { flex: 1, padding: 20, paddingTop: 80, paddingBottom: 30, justifyContent: "space-between" },
    progressBar: {
        height: 4,
        backgroundColor: "#e0e0e0",
    },
    progressFill: {
        height: 4,
        backgroundColor: "#0a84ff",
    },
    stepTitle: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 8,
        color: "#000",
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 20,
    },
    label: { fontSize: 13, color: "#444", marginBottom: 6 },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    phoneRow: {
        flexDirection: "row",
        marginBottom: 12,
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
    countryCodeDropdown: {
        position: "absolute",
        top: 50,
        left: 0,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        backgroundColor: "#fff",
        maxHeight: 200,
        minWidth: 80,
        zIndex: 100,
    },
    countryCodeItem: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
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
    resendLink: {
        alignItems: "center",
        marginTop: 16,
    },
    resendText: {
        color: "#0a84ff",
        fontWeight: "600",
    },
    dropdown: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: "#fff",
        maxHeight: 200,
    },
    dropdownItem: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    genderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    genderBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginHorizontal: 4,
    },
    genderBtnActive: {
        backgroundColor: "#eef6ff",
        borderColor: "#0a84ff",
    },
    error: {
        color: "#d04545",
        marginBottom: 12,
        fontSize: 12,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 20,
        paddingBottom: 20,
    },
    button: {
        flex: 1,
        backgroundColor: "#0a84ff",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    secondaryButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#0a84ff",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    secondaryButtonText: {
        color: "#0a84ff",
        fontWeight: "600",
        fontSize: 16,
    },
    reviewSection: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    reviewLabel: {
        fontWeight: "600",
        color: "#000",
        marginBottom: 4,
    },
    footer: { flexDirection: "row", justifyContent: "flex-start", marginTop: 24 },
    footerText: { color: "#666" },
    linkText: { color: "#007AFF", fontWeight: "700" },
});