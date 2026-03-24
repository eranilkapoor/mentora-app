import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Button,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';

// If you want image picking, install react-native-image-picker and uncomment below:
// import { launchImageLibrary } from "react-native-image-picker";

const mockUpdateProfile = async (payload: any) => {
  // replace with real API call
  return new Promise<void>((resolve) => setTimeout(resolve, 1000));
};

export default function EditProfileScreen({ navigation }: any) {
  const [name, setName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [interestText, setInterestText] = useState<string>('');
  const [interests, setInterests] = useState<string[]>([]);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const validate = () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Name is required.');
      return false;
    }
    const n = Number(age);
    if (!age || Number.isNaN(n) || n < 18 || n > 120) {
      Alert.alert('Validation', 'Please enter a valid age (18-120).');
      return false;
    }
    return true;
  };

  const onSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        bio: bio.trim(),
        age: Number(age),
        gender,
        interests,
        avatarUri,
      };
      await mockUpdateProfile(payload);
      Alert.alert('Success', 'Profile updated.');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => navigation.goBack();

  const addInterest = () => {
    const t = interestText.trim();
    if (!t) return;
    if (interests.includes(t)) {
      setInterestText('');
      return;
    }
    setInterests((prev) => [...prev, t]);
    setInterestText('');
  };

  const removeInterest = (item: string) =>
    setInterests((prev) => prev.filter((i) => i !== item));

  const pickImage = async () => {
    // To enable image picking, install react-native-image-picker:
    // yarn add react-native-image-picker
    // and uncomment import at top.
    // Then use the code below (uncomment) to open gallery.

    // try {
    //   const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 });
    //   if (result.didCancel) return;
    //   const asset = result.assets && result.assets[0];
    //   if (asset && asset.uri) setAvatarUri(asset.uri);
    // } catch (err) {
    //   console.warn(err);
    //   Alert.alert('Image error', 'Could not pick image.');
    // }

    // Placeholder behavior for apps without image picker:
    Alert.alert(
      'Image picker',
      Platform.select({
        ios: 'Install react-native-image-picker and enable pickImage in this screen.',
        android:
          'Install react-native-image-picker and enable pickImage in this screen.',
        default: 'Enable image picker to choose avatar.',
      }) as string
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>Tap to add photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.field}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          style={styles.input}
          returnKeyType="done"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Short bio"
          style={[styles.input, styles.multiline]}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.flex]}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            value={age}
            onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))}
            placeholder="Age"
            keyboardType="numeric"
            style={styles.input}
            maxLength={3}
          />
        </View>

        <View style={[styles.field, styles.flex, { marginLeft: 12 }]}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.pills}>
            {(['male', 'female', 'other'] as const).map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.pill, gender === g && styles.pillSelected]}
                onPress={() => setGender(g)}
              >
                <Text
                  style={[
                    styles.pillText,
                    gender === g && styles.pillTextSelected,
                  ]}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Interests</Text>
        <View style={styles.interestsRow}>
          <TextInput
            value={interestText}
            onChangeText={setInterestText}
            placeholder="Add interest"
            style={[styles.input, { flex: 1 }]}
            onSubmitEditing={addInterest}
            returnKeyType="done"
          />
          <View style={{ width: 8 }} />
          <Button title="Add" onPress={addInterest} />
        </View>

        <View style={styles.chips}>
          {interests.map((it) => (
            <TouchableOpacity
              key={it}
              style={styles.chip}
              onPress={() => removeInterest(it)}
            >
              <Text style={styles.chipText}>{it} ×</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton]}
          onPress={onCancel}
          disabled={loading}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.saveButton]}
          onPress={onSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    color: '#666',
    fontSize: 12,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    color: '#333',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fafafa',
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  flex: {
    flex: 1,
  },
  pills: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  pillSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  pillText: {
    color: '#333',
    fontSize: 13,
  },
  pillTextSelected: {
    color: '#fff',
  },
  interestsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelText: {
    color: '#333',
    fontWeight: '600',
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
  },
});
