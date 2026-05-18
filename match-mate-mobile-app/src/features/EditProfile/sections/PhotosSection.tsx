import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { ProfileImage } from '@/core/types';
import { MAX_PHOTOS } from '@/core/constants';
import { SectionCard } from '../components/SectionCard';
import { editProfileStyles } from '../EditProfile.styles';
import { SectionKey } from '../EditProfile.types';

interface Props {
  images: ProfileImage[];
  imagesLoading: boolean;
  imageUploading: boolean;
  sectionLoading: SectionKey | null;
  onSave: (key: SectionKey) => void;
  onPickImage: () => void;
  onSetPrimary: (mediaId: string) => void;
  onRemove: (mediaId: string) => void;
}

export function PhotosSection({
  images,
  imagesLoading,
  imageUploading,
  sectionLoading,
  onSave,
  onPickImage,
  onSetPrimary,
  onRemove,
}: Props): React.ReactElement {
  const styles = useThemedStyles(editProfileStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <SectionCard
      title={t('edit_profile.sections.photos')}
      icon="camera"
      sectionKey="images"
      loadingKey={sectionLoading}
      onSave={onSave}
    >
      {imagesLoading ? (
        <ActivityIndicator
          size="small"
          color={theme.colors.primary}
          style={{ marginVertical: 16 }}
        />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photoRow}
        >
          {images.map((img) => {
            const mediaId = img._id;

            return (
              <View key={mediaId ?? img.url} style={styles.photoWrapper}>
                <Image source={{ uri: img.url }} style={styles.photo} />

                {img.isPrimary && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>
                      {t('edit_profile.photos.primary')}
                    </Text>
                  </View>
                )}

                <View style={styles.photoActions}>
                  <TouchableOpacity
                    style={[
                      styles.photoActionBtn,
                      img.isPrimary && styles.photoActionBtnDisabled,
                    ]}
                    onPress={() => {
                      if (mediaId) {
                        onSetPrimary(mediaId);
                      }
                    }}
                    disabled={img.isPrimary}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={t('edit_profile.photos.set_primary')}
                    accessibilityState={{ disabled: img.isPrimary }}
                  >
                    <Feather
                      name="star"
                      size={12}
                      color={
                        img.isPrimary
                          ? theme.colors.accent
                          : theme.colors.textMuted
                      }
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.photoActionBtn, styles.photoActionBtnDanger]}
                    onPress={() => {
                      if (mediaId) {
                        onRemove(mediaId);
                      }
                    }}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={t('edit_profile.photos.remove')}
                  >
                    <Feather
                      name="trash-2"
                      size={12}
                      color={theme.colors.danger}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {/* Add photo button — shows spinner while uploading */}
          {images.length < MAX_PHOTOS && (
            <TouchableOpacity
              style={styles.addPhotoBtn}
              onPress={onPickImage}
              disabled={imageUploading}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('edit_profile.photos.add')}
            >
              {imageUploading ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary}
                />
              ) : (
                <>
                  <Feather
                    name="plus"
                    size={28}
                    color={theme.colors.textMuted}
                  />
                  <Text style={styles.addPhotoText}>
                    {t('edit_profile.photos.add')}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      <Text style={styles.photoHint}>{t('edit_profile.photos.hint')}</Text>
    </SectionCard>
  );
}