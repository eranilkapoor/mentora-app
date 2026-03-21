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
import { profile_for_options, religions, qualifications, body_types, complexions, family_types, family_statuses } from "../../constants";
import { useAppDispatch } from "../../store";
import { setProfileCompleted } from '../../store/authSlice';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthService } from "../../services/authService";

type RegistrationStep = "personal" | "education" | "physical" | "family" | "preferences" | "review";

interface PersonalData {
    profileFor: string;
    firstName: string;
    lastName: string;
    dob: string;
    gender: "male" | "female" | "other";
    religion: string;
    country: string;
    state: string;
    city: string;
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

export default function OnboardingScreen({ navigation }: any) {
    const [currentStep, setCurrentStep] = useState<RegistrationStep>("personal");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showDropdown, setShowDropdown] = useState<string | null>(null);

    const dispatch = useAppDispatch();

    const getInputStyle = (field: string) => [
        styles.input,
        errors[field] ? styles.inputError : null,
    ];

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    const [personal, setPersonal] = useState<PersonalData>({
        profileFor: "",
        firstName: "",
        lastName: "",
        dob: "",
        gender: "other",
        religion: "",
        city: "",
        state: "",
        country: ""
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

    const validatePersonal = () => {
        const e: Record<string, string> = {};

        if (!personal.profileFor.trim()) e.profileFor = "Selction required";
        if (!personal.firstName.trim()) e.firstName = "First name required";
        if (!personal.dob) e.dob = "Date Of Birth required";
        if (!personal.gender) e.gender = "Gender required";
        if (!personal.religion) e.religion = "Religion required";

        setErrors(e);

        return Object.keys(e).length === 0;
    };

    const validateEducation = () => {
        const e: Record<string, string> = {};

        if (!education.qualification) e.qualification = "Qualification required";
        if (!education.occupation.trim()) e.occupation = "Occupation required";

        setErrors(e);

        return Object.keys(e).length === 0;
    };

    const validatePhysical = () => {
        const e: Record<string, string> = {};

        if (!physical.height.trim()) e.height = "Height required";

        setErrors(e);

        return Object.keys(e).length === 0;
    };

    const validateFamily = () => {
        const e: Record<string, string> = {};

        if (!family.familyType) e.familyType = "Family type required";

        setErrors(e);

        return Object.keys(e).length === 0;
    };

    const validatePreferences = () => {
        const e: Record<string, string> = {};

        if (!preferences.ageRange.trim()) e.ageRange = "Age range required";
        if (!preferences.locationPref.trim()) e.locationPref = "Location preference required";

        setErrors(e);

        return Object.keys(e).length === 0;
    };

    const handleNext = () => {
        const steps: RegistrationStep[] = ["personal", "education", "physical", "family", "preferences", "review"];
        const currentIndex = steps.indexOf(currentStep);

        switch (currentStep) {
            case "personal":
                if (!validatePersonal()) return;
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
        const steps: RegistrationStep[] = ["personal", "education", "physical", "family", "preferences", "review"];

        const currentIndex = steps.indexOf(currentStep);

        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
            setErrors({});
        }
    };

    const handleRegister = async () => {
        setLoading(true);
        try {
            const payload = {
                personal,
                education,
                physical,
                family,
                preferences,
            };

            const res = await AuthService.onboardingProfile(payload).then(res => res.data);
            
            if (!res.success) {
                setErrors({ otp: "Onboarding profile creation failed" });
                return;
            }

            dispatch(setProfileCompleted(true));
        } catch (err: any) {
            Alert.alert("Error", err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

//    {
//   "personal": {
//     "profileFor": "Self",
//     "firstName": "Anil",
//     "lastName": "Kapoor",
//     "dob": "1990-08-25",
//     "gender": "male",
//     "religion": "Hindu",
//     "city": "New Delhi",
//     "state": "Delhi",
//     "country": "India"
//   },
//   "education": {
//     "qualification": "BE/BTech",
//     "field": "Computer Science",
//     "university": "A.K.T.U",
//     "occupation": "Software Engineer",
//     "annualIncome": "35 LPA"
//   },
//   "physical": {
//     "height": "168",
//     "weight": "78",
//     "bodyType": "Average",
//     "complexion": "Wheatish",
//   },
//   "family": {
//     "fatherName": "Suresh Chandra",
//     "motherName": "Munni Devi",
//     "fatherOccupation": "Farmer",
//     "motherOccupation": "Home Maker",
//     "siblings": "5",
//     "familyType": "Joint Family",
//     "familyStatus": "Middle Class",
//     "familyValues": "Modern"
//   },
//   "preferences": {
//     "ageRange": "25-30",
//     "heightRange": "160-168",
//     "qualificationRequired": "Graduate",
//     "religionPref": "Hindu",
//     "castePref": "Jatav",
//     "locationPref": "Delhi",
//     "incomePref": "10-25",
//     "otherPreferences": "Working Women"
//   }
// }

    const DropdownPicker = ({ label, options, value, onChange, field }: any) => (
        <View>
            <TouchableOpacity
                style={[
                    styles.input,
                    errors[field] && styles.inputError,
                    { justifyContent: "space-between", flexDirection: "row", alignItems: "center" },
                ]}
                onPress={() => setShowDropdown(showDropdown === label ? null : label)}
            >
                <Text style={{ color: value ? "#000" : "#999" }}>{value || `Select ${label}`}</Text>
                <Text style={{ fontSize: 16, color: "#666" }}>
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
                                    clearError(field);
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

    const ErrorText = ({ field }: { field: string }) => errors[field] ? <Text style={styles.error}>{errors[field]}</Text> : null;

    const renderStepContent = () => {
        switch (currentStep) {
            case "personal":
                return (
                    <View>
                        <Text style={styles.stepTitle}>Personal Information</Text>
                        <Text style={styles.subtitle}>
                            Basic details to create your matrimonial profile
                        </Text>
                        <Text style={styles.label}>Profile For</Text>
                        <DropdownPicker
                            label="profile for"
                            options={profile_for_options}
                            value={personal.profileFor}
                            onChange={(val: string) => {
                                setPersonal({ ...personal, profileFor: val });
                                clearError("profileFor");
                            }}
                            field="profileFor"
                        />
                        <ErrorText field="profileFor" />

                        <Text style={styles.label}>First Name (*)</Text>
                        <TextInput
                            placeholder="John"
                            value={personal.firstName}
                            onChangeText={(text) => {
                                setPersonal({ ...personal, firstName: text })
                                clearError("firstName");
                            }}
                            style={[styles.input, getInputStyle("firstName")]}
                        />
                        <ErrorText field="firstName" />

                        <Text style={styles.label}>Last Name (Optional)</Text>
                        <TextInput
                            placeholder="Doe"
                            value={personal.lastName}
                            onChangeText={(text) => setPersonal({ ...personal, lastName: text })}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
                        <TextInput
                            placeholder="Date of Birth (YYYY-MM-DD)"
                            value={personal.dob}
                            onChangeText={(text) => {
                                setPersonal({ ...personal, dob: text });
                                clearError("dob");
                            }}
                            style={[styles.input, getInputStyle("dob")]}
                        />
                        <ErrorText field="dob" />

                        <Text style={styles.label}>Gender</Text>
                        <View style={styles.genderRow}>
                            {["male", "female", "other"].map((g) => (
                                <TouchableOpacity
                                    key={g}
                                    style={[
                                        styles.genderBtn,
                                        personal.gender === g && styles.genderBtnActive,
                                        errors.gender && styles.inputError,
                                    ]}
                                    onPress={() => {
                                        setPersonal({ ...personal, gender: g as any });
                                        clearError("gender");
                                    }}
                                >
                                    <Text>{g.charAt(0).toUpperCase() + g.slice(1)}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <ErrorText field="gender" />

                        <Text style={styles.label}>Religion</Text>
                        <DropdownPicker
                            label="religion"
                            options={religions}
                            value={personal.religion}
                            onChange={(val: string) => {
                                setPersonal({ ...personal, religion: val });
                                clearError("religion");
                            }}
                            field="religion"
                        />
                        <ErrorText field="religion" />

                        <Text style={styles.label}>Country</Text>
                        <TextInput
                            placeholder="Country"
                            value={personal.country}
                            onChangeText={(text) => setPersonal({ ...personal, country: text })}
                            style={styles.input}
                        />

                        <Text style={styles.label}>State</Text>
                        <TextInput
                            placeholder="State"
                            value={personal.state}
                            onChangeText={(text) => setPersonal({ ...personal, state: text })}
                            style={styles.input}
                        />

                        <Text style={styles.label}>City</Text>
                        <TextInput
                            placeholder="City"
                            value={personal.city}
                            onChangeText={(text) => setPersonal({ ...personal, city: text })}
                            style={styles.input}
                        />
                    </View>
                );

            case "education":
                return (
                    <View>
                        <Text style={styles.stepTitle}>Education & Occupation</Text>
                        <Text style={styles.subtitle}>
                            Basic details about your education and occupation
                        </Text>
                        <Text style={styles.label}>Qualification</Text>
                        <DropdownPicker
                            label="qualification"
                            options={qualifications}
                            value={education.qualification}
                            onChange={(val: string) => {
                                setEducation({ ...education, qualification: val });
                                clearError("qualification");
                            }}
                            field="qualification"
                        />
                        <ErrorText field="qualification" />

                        <Text style={styles.label}>Field of Study</Text>
                        <TextInput
                            placeholder="Field of Study"
                            value={education.field}
                            onChangeText={(text) => setEducation({ ...education, field: text })}
                            style={styles.input}
                        />

                        <Text style={styles.label}>University/College</Text>
                        <TextInput
                            placeholder="University/College"
                            value={education.university}
                            onChangeText={(text) => setEducation({ ...education, university: text })}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Occupation</Text>
                        <TextInput
                            placeholder="Occupation"
                            value={education.occupation}
                            onChangeText={(text) => {
                                setEducation({ ...education, occupation: text });
                                clearError("occupation");
                            }}
                            style={[styles.input, getInputStyle("occupation")]}
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
                    </View>
                );

            case "physical":
                return (
                    <View>
                        <Text style={styles.stepTitle}>Physical Details</Text>
                        <Text style={styles.subtitle}>
                            Basic details about your physical attributes
                        </Text>
                        <Text style={styles.label}>Height (in cm)</Text>
                        <TextInput
                            placeholder="Height (in cm)"
                            value={physical.height}
                            onChangeText={(text) => {
                                setPhysical({ ...physical, height: text });
                                clearError("height");
                            }}
                            style={[styles.input, getInputStyle("height")]}
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

                        <Text style={styles.label}>Body Type</Text>
                        <DropdownPicker
                            label="bodyType"
                            options={body_types}
                            value={physical.bodyType}
                            onChange={(val: string) => setPhysical({ ...physical, bodyType: val })}
                            field="bodyType"
                        />

                        <Text style={styles.label}>Complexion</Text>
                        <DropdownPicker
                            label="complexion"
                            options={complexions}
                            value={physical.complexion}
                            onChange={(val: string) => setPhysical({ ...physical, complexion: val })}
                            field="complexion"
                        />
                    </View>
                );

            case "family":
                return (
                    <View>
                        <Text style={styles.stepTitle}>Family Background</Text>
                        <Text style={styles.subtitle}>
                            Basic details about your family
                        </Text>
                        <Text style={styles.label}>Father's Name</Text>
                        <TextInput
                            placeholder="Father's Name"
                            value={family.fatherName}
                            onChangeText={(text) => setFamily({ ...family, fatherName: text })}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Mother's Name</Text>
                        <TextInput
                            placeholder="Mother's Name"
                            value={family.motherName}
                            onChangeText={(text) => setFamily({ ...family, motherName: text })}
                            style={styles.input}
                        />

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
                            onChange={(val: string) => {
                                setFamily({ ...family, familyType: val });
                                clearError("familyType");
                            }}
                            field="familyType"
                        />
                        <ErrorText field="familyType" />

                        <Text style={styles.label}>Family Status</Text>
                        <DropdownPicker
                            label="familyStatus"
                            options={family_statuses}
                            value={family.familyStatus}
                            onChange={(val: string) => setFamily({ ...family, familyStatus: val })}
                            field="familyStatus"
                        />

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
                        <Text style={styles.subtitle}>
                            Specify your preferences for a potential partner
                        </Text>
                        <Text style={styles.label}>Age Range (e.g., 25-32)</Text>
                        <TextInput
                            placeholder="Age Range (e.g., 25-32)"
                            value={preferences.ageRange}
                            onChangeText={(text) => {
                                setPreferences({ ...preferences, ageRange: text });
                                clearError("ageRange");
                            }}
                            style={[styles.input, getInputStyle("ageRange")]}
                        />
                        <ErrorText field="ageRange" />

                        <Text style={styles.label}>Height Range (e.g., 160-180 cm)</Text>
                        <TextInput
                            placeholder="Height Range (e.g., 160-180 cm)"
                            value={preferences.heightRange}
                            onChangeText={(text) => setPreferences({ ...preferences, heightRange: text })}
                            style={styles.input}
                        />

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
                            onChangeText={(text) => {
                                setPreferences({ ...preferences, locationPref: text });
                                clearError("locationPref");
                            }}
                            style={[styles.input, getInputStyle("locationPref")]}
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
                            <Text>{personal.firstName} {personal.lastName}</Text>
                        </View>
                        <View style={styles.reviewSection}>
                            <Text style={styles.reviewLabel}>Personal:</Text>
                            <Text>{personal.gender.charAt(0).toUpperCase() + personal.gender.slice(1)} | {personal.dob}</Text>
                        </View>
                        <View style={styles.reviewSection}>
                            <Text style={styles.reviewLabel}>Religion:</Text>
                            <Text>{personal.religion}</Text>
                        </View>
                        <View style={styles.reviewSection}>
                            <Text style={styles.reviewLabel}>Education:</Text>
                            <Text>{education.qualification} in {education.occupation}</Text>
                        </View>
                        <View style={styles.reviewSection}>
                            <Text style={styles.reviewLabel}>Physical:</Text>
                            <Text>{physical.height} cm</Text>
                        </View>
                        <View style={styles.reviewSection}>
                            <Text style={styles.reviewLabel}>Family:</Text>
                            <Text>{family.familyType}</Text>
                        </View>
                        <View style={styles.reviewSection}>
                            <Text style={styles.reviewLabel}>Preferences:</Text>
                            <Text>Age: {preferences.ageRange} | Location: {preferences.locationPref}</Text>
                        </View>
                    </ScrollView>
                );

            default:
                return null;
        }
    };

    const getStepPercentage = () => {
        const allSteps: RegistrationStep[] = ["personal", "education", "physical", "family", "preferences", "review"];
        const currentIndex = allSteps.indexOf(currentStep);
        return ((currentIndex + 1) / allSteps.length) * 100;
    };

    return (
        <SafeAreaProvider style={styles.safe}>
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
            style={styles.container}
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
                    {!["personal"].includes(currentStep) && (
                        <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevious}>
                            <Text style={styles.secondaryButtonText}>Previous</Text>
                        </TouchableOpacity>
                    )}

                    {currentStep !== "review" ? (
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
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#fff" },
    container: { flex: 1 },
    content: { 
        flexGrow: 1,
        paddingVertical: 30,
        paddingHorizontal: 20, 
        justifyContent: "space-between" 
    },
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
        fontSize: 16,
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
    footer: { flexDirection: "row", justifyContent: "flex-start", marginTop: 24, marginBottom: 24 },
    footerText: { color: "#666" },
    linkText: { color: "#007AFF", fontWeight: "700" },
    inputError: {
        borderColor: "#d04545",
        backgroundColor: "#fff5f5",
    },
    dropdownError: {
        borderColor: "#d04545",
    },
});

