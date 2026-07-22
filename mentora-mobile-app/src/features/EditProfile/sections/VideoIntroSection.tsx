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
  locked?: boolean;
  onLockedPress?: () => void;
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
  locked = false,
  onLockedPress,
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
  const videoTitle = isPendingVideo
    ? t('edit_profile.video_intro.new_intro_selected')
    : t('edit_profile.video_intro.video_intro');

  return (
    <SectionCard
      title={t('edit_profile.sections.video_intro')}
      icon="video"
      sectionKey="videos"
      loadingKey={sectionLoading}
      onSave={locked ? undefined : onSave}
      hideSaveButton={locked}
    >
      {locked ? (
        <TouchableOpacity
          style={styles.lockedFeature}
          onPress={onLockedPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t('edit_profile.video_intro.upgrade_required', {
            defaultValue: 'Upgrade to unlock video introduction',
          })}
        >
          <View style={styles.lockedFeatureIcon}>
            <Feather name="lock" size={18} color={theme.colors.primary} />
          </View>
          <View style={styles.lockedFeatureCopy}>
            <Text style={styles.lockedFeatureTitle}>
              {t('edit_profile.video_intro.premium_title', {
                defaultValue: 'Video introduction',
              })}
            </Text>
            <Text style={styles.lockedFeatureText}>
              {t('edit_profile.video_intro.premium_subtitle', {
                defaultValue:
                  'Upgrade your plan to upload a video introduction.',
              })}
            </Text>
          </View>
          <Feather
            name="chevron-right"
            size={18}
            color={theme.colors.textMuted}
          />
        </TouchableOpacity>
      ) : videosLoading ? (
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
              placeholderText={t('edit_profile.video_intro.uploaded')}
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
                ? t('edit_profile.video_intro.pending_subtitle')
                : t('edit_profile.video_intro.published_subtitle')}
            </Text>
            {video.isPrimary && (
              <View style={styles.videoIntroBadge}>
                <Feather name="star" size={11} color={theme.colors.accent} />
                <Text style={styles.videoIntroBadgeText}>
                  {t('edit_profile.video_intro.primary_intro')}
                </Text>
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
              <Text style={styles.videoIntroActionText}>
                {t('edit_profile.video_intro.primary')}
              </Text>
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
                {t('common.delete')}
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
          accessibilityLabel={t('edit_profile.video_intro.upload')}
        >
          {videoUploading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <>
              <Feather name="video" size={28} color={theme.colors.textMuted} />
              <Text style={styles.addPhotoText}>
                {t('edit_profile.video_intro.add_intro')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
      {!video && !videosLoading ? (
        <Text style={styles.photoHint}>
          {t('edit_profile.video_intro.add_hint')}
        </Text>
      ) : null}
    </SectionCard>
  );
}
