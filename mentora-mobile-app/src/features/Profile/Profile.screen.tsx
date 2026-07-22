import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useAppSelector } from '@/store/hooks';
import { useGetMyProfileQuery } from '@/store/services/profileApi.service';
import { useGetPrivacySettingsQuery } from '@/store/services/privacySettingsApi.service';
import { profileStyles } from './Profile.styles';
import { ProfileScreenProps } from './Profile.types';

const EMPTY_VALUE = '-';

const asText = (value: unknown): string => {
  if (value === undefined || value === null) return EMPTY_VALUE;
  const text = String(value).trim();
  return text.length > 0 ? text : EMPTY_VALUE;
};

export default function ProfileScreen({
  navigation,
}: ProfileScreenProps): React.ReactElement {
  const styles = useThemedStyles(profileStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.auth.user);
  const { data: profileResponse } = useGetMyProfileQuery();
  const { data: privacyResponse } = useGetPrivacySettingsQuery();

  const profile = profileResponse?.success ? profileResponse.data : undefined;
  const privacy = privacyResponse?.privacy;
  const fullName =
    [
      user?.firstName ?? profile?.personal?.firstName,
      user?.lastName ?? profile?.personal?.lastName,
    ]
      .filter(Boolean)
      .join(' ') || t('profile.learner_name');
  const completion = Math.min(
    100,
    Math.max(0, Math.round(profile?.profileCompletionPercentage ?? 0))
  );
  const profileMode = t('profile.mode_student_learning');

  const openSettings = (screen: string) => {
    navigation.navigate('Settings', { screen } as never);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Header
        title={t('profile.title')}
        actions={[
          {
            icon: 'settings',
            onPress: () => navigation.navigate('Settings'),
          },
        ]}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mentoraProfileHero}>
          <View style={styles.mentoraAvatar}>
            <Feather name="user" size={30} color={theme.colors.primary} />
          </View>
          <View style={styles.mentoraHeroCopy}>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.subText}>{profileMode}</Text>
            <Text style={styles.locationText}>
              {[profile?.personal?.city, profile?.personal?.state]
                .filter(Boolean)
                .join(', ') || t('profile.location_not_set')}
            </Text>
          </View>
        </View>

        <View style={styles.profileMetaGrid}>
          <Metric value={`${completion}%`} label={t('profile.meta_complete')} />
          <Metric value="2" label={t('profile.meta_students')} />
          <Metric value="4" label={t('profile.meta_sessions')} />
          <Metric value="Active" label={t('profile.meta_status')} />
        </View>

        <ProfileSection title={t('profile.section_account')} icon="shield">
          <InfoRow label={t('profile.row_email')} value={asText(user?.email)} />
          <InfoRow
            label={t('profile.row_phone')}
            value={asText(user?.phone?.phone)}
          />
          <InfoRow
            label={t('profile.row_privacy')}
            value={privacy?.profileVisibility ?? 'private'}
          />
        </ProfileSection>

        <ProfileSection
          title={t('profile.section_learning_profile')}
          icon="book"
        >
          <InfoRow
            label={t('profile.row_academic_level')}
            value={asText(profile?.education?.qualification)}
          />
          <InfoRow
            label={t('profile.row_subject_focus')}
            value={asText(profile?.education?.field)}
          />
          <InfoRow
            label={t('profile.row_institution')}
            value={asText(profile?.education?.university)}
          />
          <InfoRow
            label={t('profile.row_learning_goal')}
            value={asText(profile?.personal?.aboutMe)}
          />
        </ProfileSection>

        <ProfileSection title={t('profile.section_students')} icon="users">
          <StudentSummary
            name={t('profile.primary_student')}
            grade="Grade 10"
            focus="Mathematics"
          />
          <StudentSummary
            name={t('profile.second_student')}
            grade="Grade 7"
            focus="Science"
          />
        </ProfileSection>

        <ProfileSection title={t('profile.section_access')} icon="cpu">
          <InfoRow
            label={t('profile.row_subscription')}
            value={profile?.isPremium ? t('profile.active') : t('profile.free')}
          />
          <InfoRow
            label={t('profile.row_ai_guard')}
            value={t('profile.ai_guard_value')}
          />
          <InfoRow
            label={t('profile.row_parent_controls')}
            value={t('profile.parent_controls_value')}
          />
        </ProfileSection>

        <View style={styles.mentoraActions}>
          <ActionButton
            icon="edit-3"
            label={t('profile.edit_profile')}
            onPress={() => openSettings('EditProfile')}
          />
          <ActionButton
            icon="cpu"
            label={t('settings.ai_settings')}
            onPress={() => openSettings('AiSettings')}
          />
          <ActionButton
            icon="lock"
            label={t('profile.privacy_controls')}
            onPress={() => openSettings('PrivacySettings')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  const styles = useThemedStyles(profileStyles);

  return (
    <View style={styles.profileMetaItem}>
      <Text style={styles.profileMetaValue}>{value}</Text>
      <Text style={styles.profileMetaLabel}>{label}</Text>
    </View>
  );
}

function ProfileSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  children: React.ReactNode;
}) {
  const styles = useThemedStyles(profileStyles);
  const { theme } = useTheme();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrapper}>
          <Feather name={icon} size={14} color={theme.colors.primary} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const styles = useThemedStyles(profileStyles);

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function StudentSummary({
  name,
  grade,
  focus,
}: {
  name: string;
  grade: string;
  focus: string;
}) {
  const styles = useThemedStyles(profileStyles);
  const { theme } = useTheme();

  return (
    <View style={styles.mentoraStudentRow}>
      <View style={styles.mentoraStudentIcon}>
        <Feather name="book-open" size={16} color={theme.colors.primary} />
      </View>
      <View style={styles.mentoraStudentCopy}>
        <Text style={styles.siblingTitle}>{name}</Text>
        <Text style={styles.siblingMeta}>
          {grade} · {focus}
        </Text>
      </View>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
}) {
  const styles = useThemedStyles(profileStyles);
  const { theme } = useTheme();

  return (
    <Pressable style={styles.mentoraActionButton} onPress={onPress}>
      <Feather name={icon} size={18} color={theme.colors.primary} />
      <Text style={styles.mentoraActionText}>{label}</Text>
      <Feather name="chevron-right" size={18} color={theme.colors.textMuted} />
    </Pressable>
  );
}
