import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { ProfileImage } from '@/core/types';
import { InlineVideoPlayer } from '@/core/components/media/InlineVideoPlayer';
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
  const thumbnailUrl = video?.thumbnailUrl
    ? (resolveApiUrl(video.thumbnailUrl) ?? video.thumbnailUrl)
    : undefined;
  const isPendingVideo = video?._id?.startsWith('pending-') ?? false;
  const videoTitle = isPendingVideo ? 'New intro selected' : 'Video intro';

  return (
    <SectionCard
      title={t('edit_profile.sections.video_intro')}
      icon="video"
      sectionKey="videos"
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
        <View style={styles.videoIntroCard}>
          {videoUrl ? (
            <InlineVideoPlayer
              videoUrl={videoUrl}
              thumbnailUrl={thumbnailUrl}
              placeholderText="Intro video uploaded"
              previewStyle={styles.videoIntroPreview}
              thumbnailStyle={styles.videoIntroThumbnail}
              thumbnailImageStyle={styles.videoIntroThumbnailImage}
              overlayStyle={styles.videoIntroOverlay}
              placeholderStyle={styles.videoIntroPlaceholder}
              playButtonStyle={styles.videoIntroPlayButton}
              placeholderTextStyle={styles.videoIntroPlaceholderText}
            />
          ) : null}

          <View style={styles.videoIntroMeta}>
            <View style={styles.videoIntroTitleRow}>
              <Feather name="video" size={16} color={theme.colors.primary} />
              <Text style={styles.videoIntroTitle} numberOfLines={1}>
                {videoTitle}
              </Text>
            </View>
            <Text style={styles.videoIntroSubtitle}>
              {isPendingVideo
                ? 'Save this section to publish your new introduction.'
                : 'Visitors will see this as your profile introduction.'}
            </Text>
            {video.isPrimary && (
              <View style={styles.videoIntroBadge}>
                <Feather name="star" size={11} color={theme.colors.accent} />
                <Text style={styles.videoIntroBadgeText}>Primary intro</Text>
              </View>
            )}
          </View>

          <View style={styles.videoIntroActions}>
            <TouchableOpacity
              style={[
                styles.videoIntroActionBtn,
                video.isPrimary && styles.videoIntroActionBtnDisabled,
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
                size={14}
                color={
                  video.isPrimary ? theme.colors.accent : theme.colors.textMuted
                }
              />
              <Text style={styles.videoIntroActionText}>Primary</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.videoIntroActionBtn,
                styles.videoIntroActionBtnDanger,
              ]}
              onPress={() => {
                if (video._id) onRemove(video._id);
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
            >
              <Feather name="trash-2" size={14} color={theme.colors.danger} />
              <Text
                style={[
                  styles.videoIntroActionText,
                  styles.videoIntroActionTextDanger,
                ]}
              >
                Remove
              </Text>
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
      {!video && !videosLoading ? (
        <Text style={styles.photoHint}>
          Add one short video introduction so visitors can know you better.
        </Text>
      ) : null}
    </SectionCard>
  );
}
