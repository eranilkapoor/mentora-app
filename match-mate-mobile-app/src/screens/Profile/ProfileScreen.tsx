import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { ProfileService } from '../../services/profileService';
import {
  annualIncomeFormat,
  cmToFeetInches,
  formatAboutMe,
  formatAgeRange,
  formatLifestyleChoice,
  formatMaritalStatus,
  formatWeight,
  getAgeFromDOB,
  getFullName,
} from '../../utils/format';

const { width } = Dimensions.get('window');

const profile = {
  photos: [
    'https://ix-marketing.imgix.net/focalpoint.png?auto=format,compress&w=1446',
    'https://ix-marketing.imgix.net/case-study_2.png?auto=format,compress&w=1446',
    'https://ix-marketing.imgix.net/case-study_3.png?auto=format,compress&w=1446',
  ],
  basic: {
    name: 'Amit Sharma',
    age: 29,
    height: '5 ft 9 in',
    maritalStatus: 'Never Married',
  },
  religion: {
    religion: 'Hindu',
    caste: 'Brahmin',
    motherTongue: 'Hindi',
  },
  education: {
    education: 'B.Tech',
    college: 'IIT Delhi',
    profession: 'Software Engineer',
    income: '₹15 LPA',
  },
  location: {
    country: 'India',
    state: 'Maharashtra',
    city: 'Pune',
  },
  physical: {
    weight: '70 kg',
    bodyType: 'Athletic',
    complexion: 'Fair',
  },
  lifestyle: {
    smoking: 'No',
    drinking: 'Occasionally',
    diet: 'Vegetarian',
  },
  family: {
    fatherStatus: 'Retired',
    motherStatus: 'Homemaker',
    siblings: '1 Brother, 1 Sister',
    familyType: 'Joint Family',
    familyValues: 'Traditional',
  },
  about:
    'I am a calm and positive person who believes in mutual respect and family values. Looking for a compatible life partner.',
  partnerPreferences: {
    ageRange: '24 - 27 years',
    heightRange: '5 ft 2 in - 5 ft 6 in',
    religion: 'Hindu, Sikh',
    caste: 'Open',
    education: 'B.Tech, MBA, M.Tech',
    profession: 'Software Engineer, Doctor, MBA',
    maritalStatus: 'Never Married',
    location: 'India',
    bodyType: 'Slim, Athletic',
    complexion: 'Fair, Wheatish',
    diet: 'Vegetarian',
    smoking: 'No',
    drinking: 'No',
    familyType: 'Joint, Nuclear',
  },
  interests: {
    hobbies: 'Reading, Traveling, Cooking, Yoga',
    music: 'Classical, Bollywood',
    movies: 'Drama, Romance',
    sports: 'Cricket, Badminton',
  },
};

const Section = ({ title, children }: any) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.card}>{children}</View>
  </View>
);

const Row = ({ label, value }: any) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || '-'}</Text>
  </View>
);

export default function ProfileScreen() {
  const [profileData, setProfileData] = React.useState<any>(null);

  React.useEffect(() => {
    ProfileService.getMyProfile().then((response) => {
      console.log('Profile Data:', response.data?.data);
      setProfileData(response.data?.data);
    });
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Photo Carousel */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.carousel}
      >
        {profile?.photos.map((uri: string, index: number) => (
          <Image key={index} source={{ uri }} style={styles.photo} />
        ))}
      </ScrollView>

      {/* Basic Details */}
      <View style={styles.header}>
        <Text style={styles.name}>
          {getFullName(
            profileData?.personal.firstName,
            profileData?.personal.lastName
          )}
        </Text>
        <Text style={styles.subText}>
          {getAgeFromDOB(profileData?.personal.dob)} •{' '}
          {cmToFeetInches(profileData?.physical.height)} •{' '}
          {formatMaritalStatus(profileData?.personal.maritalStatus)}
        </Text>
      </View>

      {/* About */}
      <Section title="About Me">
        <Text style={styles.aboutText}>
          {formatAboutMe(profileData?.personal.aboutMe)}
        </Text>
      </Section>

      {/* Religious & Social */}
      <Section title="Religious & Social Background">
        <Row label="Religion" value={profileData?.personal.religion} />
        <Row label="Caste" value={profileData?.personal.caste} />
        <Row label="Mother Tongue" value={profileData?.personal.motherTongue} />
      </Section>

      {/* Education & Career */}
      <Section title="Education & Career">
        <Row label="Education" value={profileData?.education.education} />
        <Row label="College" value={profileData?.education.college} />
        <Row label="Profession" value={profileData?.education.occupation} />
        <Row
          label="Annual Income"
          value={annualIncomeFormat(profileData?.education.annualIncome)}
        />
      </Section>

      {/* Location */}
      <Section title="Location Details">
        <Row label="Country" value={profileData?.personal.country} />
        <Row label="State" value={profileData?.personal.state} />
        <Row label="City" value={profileData?.personal.city} />
      </Section>

      {/* Physical Attributes */}
      <Section title="Physical Attributes">
        <Row
          label="Height"
          value={cmToFeetInches(profileData?.physical.height)}
        />
        <Row
          label="Weight"
          value={formatWeight(profileData?.physical.weight)}
        />
        <Row label="Body Type" value={profileData?.physical.bodyType} />
        <Row label="Complexion" value={profileData?.physical.complexion} />
      </Section>

      {/* Lifestyle */}
      <Section title="Lifestyle">
        <Row
          label="Smoking"
          value={formatLifestyleChoice(profileData?.preferences.smoking)}
        />
        <Row
          label="Drinking"
          value={formatLifestyleChoice(profileData?.preferences.drinking)}
        />
        <Row
          label="Diet"
          value={formatLifestyleChoice(profileData?.preferences.diet)}
        />
      </Section>

      {/* Family Background */}
      <Section title="Family Background">
        <Row label="Father Name" value={profileData?.family.fatherName} />
        <Row label="Mother Name" value={profileData?.family.motherName} />
        <Row
          label="Father Occupation"
          value={profileData?.family.fatherOccupation}
        />
        <Row
          label="Mother Occupation"
          value={profileData?.family.motherOccupation}
        />
        <Row label="Family Type" value={profileData?.family.familyType} />
        <Row label="Family Status" value={profileData?.family.familyStatus} />
        <Row label="Family Values" value={profileData?.family.familyValues} />
      </Section>

      {/* Interests & Hobbies */}
      <Section title="Interests & Hobbies">
        <Row
          label="Languages Known"
          value={profileData?.preferences.languagesKnown}
        />
        <Row label="Hobbies" value={profileData?.preferences.hobbies} />
        <Row label="Music" value={profileData?.preferences.music} />
        <Row label="Movies" value={profileData?.preferences.movies} />
        <Row label="Sports" value={profileData?.preferences.sports} />
      </Section>

      {/* Partner Preferences */}
      <Section title="Partner Preferences">
        <Row
          label="Age Range"
          value={formatAgeRange(
            profileData?.preferences.partnerPreference.ageRange.min,
            profileData?.preferences.partnerPreference.ageRange.max
          )}
        />
        <Row
          label="Height Range"
          value={`${cmToFeetInches(profileData?.preferences.partnerPreference.heightRange.min)} - ${cmToFeetInches(profileData?.preferences.partnerPreference.heightRange.max)}`}
        />
        <Row
          label="Religion"
          value={profileData?.preferences.partnerPreference.religion}
        />
        <Row
          label="Caste"
          value={profileData?.preferences.partnerPreference.caste}
        />
        <Row
          label="Education"
          value={profileData?.preferences.partnerPreference.education}
        />
        <Row
          label="Profession"
          value={profileData?.preferences.partnerPreference.occupation}
        />
        <Row
          label="Marital Status"
          value={profileData?.preferences.partnerPreference.maritalStatus}
        />
        <Row
          label="Location"
          value={profileData?.preferences.partnerPreference.country}
        />
        <Row
          label="Body Type"
          value={profileData?.preferences.partnerPreference.bodyType}
        />
        <Row
          label="Complexion"
          value={profileData?.preferences.partnerPreference.complexion}
        />
        <Row
          label="Diet"
          value={profileData?.preferences.partnerPreference.diet}
        />
        <Row
          label="Smoking"
          value={profileData?.preferences.partnerPreference.smoking}
        />
        <Row
          label="Drinking"
          value={profileData?.preferences.partnerPreference.drinking}
        />
        <Row
          label="Family Type"
          value={profileData?.preferences.partnerPreference.familyType}
        />
      </Section>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f6fa',
  },
  carousel: {
    backgroundColor: '#000',
  },
  photo: {
    width,
    height: 420,
    resizeMode: 'cover',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  subText: {
    marginTop: 4,
    color: '#666',
    fontSize: 14,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    marginBottom: 6,
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
  },
  card: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: '#eee',
  },
  label: {
    color: '#777',
    fontSize: 14,
  },
  value: {
    color: '#111',
    fontSize: 14,
    fontWeight: '500',
    maxWidth: '55%',
    textAlign: 'right',
  },
  aboutText: {
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
  },
});
