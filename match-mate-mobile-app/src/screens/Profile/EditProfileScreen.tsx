import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { ProfileService } from '../../services/profileService';
// import { PersonalData } from '../../types/profile.types';

// ─── TYPES ─────────────────────────────────────────────

interface ProfileImage {
  uri: string;
  isPrimary?: boolean;
}

interface ProfileData {
  personal: {
    firstName: string;
    aboutMe?: string;
    gender: string;
  };
  education: {
    education?: string;
    occupation?: string;
  };
  family: {
    fatherName?: string;
  };
  preferences: {
    hobbies?: string[];
    languagesKnown?: string[];
  };
  images?: ProfileImage[];
}

interface ApiResponse<T> {
  data: T;
}

interface ProfileApiResponse {
  data: ProfileData;
}

// ─── INITIAL STATE ─────────────────────────────────────

const INITIAL_PROFILE: ProfileData = {
  personal: { firstName: '', aboutMe: '', gender: '' },
  education: { education: '', occupation: '' },
  family: { fatherName: '' },
  preferences: { hobbies: [], languagesKnown: [] },
  images: [],
};

// ─── SCREEN ────────────────────────────────────────────

export default function EditProfileScreen(): React.ReactElement {
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [sectionLoading, setSectionLoading] = useState<
    keyof ProfileData | 'images' | null
  >(null);

  // Load profile
  const loadProfile = useCallback(async (): Promise<void> => {
    try {
      const res: ApiResponse<ProfileApiResponse> =
        await ProfileService.getMyProfile();
      setProfile(res.data.data);
    } catch {
      Alert.alert('Error', 'Failed to load profile');
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  // Profile completion
  const profileCompletion = useMemo(() => {
    let total = 0;
    let filled = 0;

    const check = (val: unknown) => {
      total++;
      if (val && val !== '') filled++;
    };

    check(profile.personal.firstName);
    check(profile.personal.gender);
    check(profile.education.education);
    check(profile.education.occupation);
    check(profile.family.fatherName);
    check(profile.preferences.hobbies?.length);
    check(profile.preferences.languagesKnown?.length);
    check(profile.images?.length);

    return Math.round((filled / total) * 100);
  }, [profile]);

  // Image Picker
  const pickImage = async (): Promise<void> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const newImage: ProfileImage = { uri: result.assets[0].uri };
      setProfile((p) => ({
        ...p,
        images: [...(p.images ?? []), newImage],
      }));
    }
  };

  const setPrimary = (index: number): void => {
    setProfile((p) => ({
      ...p,
      images: (p.images ?? []).map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    }));
  };

  // Update API
  const updateSection = async (
    section: keyof ProfileData | 'images'
  ): Promise<void> => {
    setSectionLoading(section);
    try {
      // const payload =
      //   section === 'images'
      //     ? { images: profile.images }
      //     : { [section]: profile[section as keyof ProfileData] };

      //await ProfileService.updatePersonalInfo(payload as PersonalData);
      Alert.alert('Success', `${section} updated`);
    } catch {
      Alert.alert('Error', `Failed to update ${section}`);
    } finally {
      setSectionLoading(null);
    }
  };

  // ─── UI ───────────────────────────────────────────────

  return (
    <SafeAreaProvider style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* COMPLETION */}
          <Section title="Profile Completion">
            <Text style={styles.completionText}>
              {profileCompletion}% Complete
            </Text>
          </Section>

          {/* IMAGES */}
          <Section title="Profile Photos">
            <ScrollView horizontal>
              {(profile.images ?? []).map((img, index) => (
                <TouchableOpacity
                  key={img.uri}
                  onPress={() => setPrimary(index)}
                >
                  <Image source={{ uri: img.uri }} style={styles.image} />
                  {img.isPrimary && <Text style={styles.primary}>Primary</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.addBtn} onPress={pickImage}>
              <Text style={styles.saveText}>Add Photo</Text>
            </TouchableOpacity>

            <SaveButton
              loading={sectionLoading === 'images'}
              onPress={() => void updateSection('images')}
            />
          </Section>

          {/* PERSONAL */}
          <Section title="Personal Info">
            <FormInput
              label="First Name"
              value={profile.personal.firstName}
              onChange={(v) =>
                setProfile((p) => ({
                  ...p,
                  personal: { ...p.personal, firstName: v },
                }))
              }
            />

            <FormInput
              label="About Me"
              value={profile.personal.aboutMe ?? ''}
              multiline
              onChange={(v) =>
                setProfile((p) => ({
                  ...p,
                  personal: { ...p.personal, aboutMe: v },
                }))
              }
            />

            <SelectPill
              options={['male', 'female', 'other']}
              value={profile.personal.gender}
              onChange={(v) =>
                setProfile((p) => ({
                  ...p,
                  personal: { ...p.personal, gender: v },
                }))
              }
            />

            <SaveButton
              loading={sectionLoading === 'personal'}
              onPress={() => void updateSection('personal')}
            />
          </Section>

          {/* EDUCATION */}
          <Section title="Education & Career">
            <FormInput
              label="Education"
              value={profile.education.education ?? ''}
              onChange={(v) =>
                setProfile((p) => ({
                  ...p,
                  education: { ...p.education, education: v },
                }))
              }
            />

            <FormInput
              label="Occupation"
              value={profile.education.occupation ?? ''}
              onChange={(v) =>
                setProfile((p) => ({
                  ...p,
                  education: { ...p.education, occupation: v },
                }))
              }
            />

            <SaveButton
              loading={sectionLoading === 'education'}
              onPress={() => void updateSection('education')}
            />
          </Section>

          {/* FAMILY */}
          <Section title="Family Details">
            <FormInput
              label="Father Name"
              value={profile.family.fatherName ?? ''}
              onChange={(v) =>
                setProfile((p) => ({
                  ...p,
                  family: { ...p.family, fatherName: v },
                }))
              }
            />

            <SaveButton
              loading={sectionLoading === 'family'}
              onPress={() => void updateSection('family')}
            />
          </Section>

          {/* PREFERENCES */}
          <Section title="Preferences">
            <TagInput
              label="Hobbies"
              items={profile.preferences.hobbies ?? []}
              setItems={(items) =>
                setProfile((p) => ({
                  ...p,
                  preferences: { ...p.preferences, hobbies: items },
                }))
              }
            />

            <TagInput
              label="Languages"
              items={profile.preferences.languagesKnown ?? []}
              setItems={(items) =>
                setProfile((p) => ({
                  ...p,
                  preferences: {
                    ...p.preferences,
                    languagesKnown: items,
                  },
                }))
              }
            />

            <SaveButton
              loading={sectionLoading === 'preferences'}
              onPress={() => void updateSection('preferences')}
            />
          </Section>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
}

// ─── REUSABLE COMPONENTS ───────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function SaveButton({
  loading,
  onPress,
}: {
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.saveBtn} onPress={onPress}>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.saveText}>Save</Text>
      )}
    </TouchableOpacity>
  );
}

function FormInput({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        style={[styles.input, multiline ? styles.multiline : null]}
        multiline={multiline}
      />
    </View>
  );
}

function SelectPill({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.pills}>
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            style={[styles.pill, selected ? styles.pillSelected : null]}
            onPress={() => onChange(opt)}
          >
            <Text style={selected ? styles.pillTextSelected : styles.pillText}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function TagInput({
  label,
  items,
  setItems,
}: {
  label: string;
  items: string[];
  setItems: (v: string[]) => void;
}) {
  const [text, setText] = useState('');

  const add = () => {
    const t = text.trim();
    if (!t || items.includes(t)) return;
    setItems([...items, t]);
    setText('');
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <TextInput
          value={text}
          onChangeText={setText}
          style={[styles.input, styles.flex]}
          onSubmitEditing={add}
        />
        <TouchableOpacity style={styles.addBtn} onPress={add}>
          <Text style={styles.saveText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chips}>
        {items.map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.chip}
            onPress={() => setItems(items.filter((i) => i !== item))}
          >
            <Text style={styles.chipText}>{item} ×</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.backgroundPage },
  flex: { flex: 1 },
  container: { padding: 16, paddingBottom: 40 },

  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  sectionTitle: { fontWeight: '700', marginBottom: 10 },

  completionText: { fontSize: 16, fontWeight: '600' },

  image: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
  primary: { fontSize: 10, color: Colors.primary },

  field: { marginBottom: 12 },
  label: { marginBottom: 6, fontWeight: '600' },

  input: {
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 8,
    padding: 10,
  },
  multiline: { minHeight: 80 },

  pills: { flexDirection: 'row' },
  pill: { padding: 8, borderWidth: 1, borderRadius: 20, marginRight: 8 },
  pillSelected: { backgroundColor: Colors.primary },
  pillText: { color: Colors.primary },
  pillTextSelected: { color: Colors.white },

  row: { flexDirection: 'row', alignItems: 'center' },
  addBtn: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 8,
    marginLeft: 8,
  },

  chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  chip: {
    backgroundColor: Colors.primaryLight,
    padding: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: { color: Colors.primary },

  saveBtn: {
    marginTop: 10,
    padding: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: { color: Colors.white, fontWeight: '600' },
});
