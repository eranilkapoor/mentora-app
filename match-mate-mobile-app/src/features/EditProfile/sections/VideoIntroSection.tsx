import React from 'react';
import {
  ActivityIndicator,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { ProfileImage } from '@/core/types';
import { resolveApiUrl } from '@/core/utils/config';
import { SectionCard } from '../components/SectionCard';
import { editProfileStyles } from '../EditProfile.styles';
import { SectionKey } from '../EditProfile.types';

interface Props {
  videos: ProfileImage[];
  videosLoading: boolean;
  videoUploading: boolean;
  sectionLoading: SectionKey | null;
  onSave: (key: SectionKey) => void;
  onPickVideo: () => void;
  onSetPrimary: (mediaId: string) => void;
  onRemove: (mediaId: string) => void;
}

export function VideoIntroSection({
  videos,
  videosLoading,
  videoUploading,
  sectionLoading,
  onSave,
  onPickVideo,
  onSetPrimary,
  onRemove,
}: Props): React.ReactElement {
  const styles = useThemedStyles(editProfileStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const video = videos[0];
  const videoUrl = video?.url
    ? (resolveApiUrl(video.url) ?? video.url)
    : undefined;

  return (
    <SectionCard
      title={t('edit_profile.sections.video_intro')}
      icon="video"
      sectionKey="images"
      loadingKey={sectionLoading}
      onSave={onSave}
    >
      {videosLoading ? (
        <ActivityIndicator
          size="small"
          color={theme.colors.primary}
          style={styles.activityIndicator}
        />
      ) : video ? (
        <View style={styles.photoWrapper}>
          <TouchableOpacity
            style={[styles.addPhotoBtn, styles.photo]}
            onPress={() => {
              if (videoUrl) {
                void Linking.openURL(videoUrl);
              }
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Open video intro"
          >
            <Feather
              name="play-circle"
              size={34}
              color={theme.colors.primary}
            />
            <Text style={styles.addPhotoText}>Open intro</Text>
          </TouchableOpacity>

          {video.isPrimary && (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryBadgeText}>Intro</Text>
            </View>
          )}

          <View style={styles.photoActions}>
            <TouchableOpacity
              style={[
                styles.photoActionBtn,
                video.isPrimary && styles.photoActionBtnDisabled,
              ]}
              onPress={() => {
                if (video._id) onSetPrimary(video._id);
              }}
              disabled={video.isPrimary}
              activeOpacity={0.7}
              accessibilityRole="button"
            >
              <Feather
                name="star"
                size={12}
                color={
                  video.isPrimary ? theme.colors.accent : theme.colors.textMuted
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.photoActionBtn, styles.photoActionBtnDanger]}
              onPress={() => {
                if (video._id) onRemove(video._id);
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
            >
              <Feather name="trash-2" size={12} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addPhotoBtn}
          onPress={onPickVideo}
          disabled={videoUploading}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Upload video intro"
        >
          {videoUploading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <>
              <Feather name="video" size={28} color={theme.colors.textMuted} />
              <Text style={styles.addPhotoText}>Add intro</Text>
            </>
          )}
        </TouchableOpacity>
      )}
      <Text style={styles.photoHint}>
        Add one short video introduction so visitors can know you better.
      </Text>
    </SectionCard>
  );
}
