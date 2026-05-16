import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
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
  sectionLoading: SectionKey | null;
  onSave: (key: SectionKey) => void;
  onPickImage: () => void;
  onSetPrimary: (index: number) => void;
  onRemove: (index: number) => void;
}

export function PhotosSection({
  images,
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.photoRow}
      >
        {images.map((img, index) => (
          <View key={`${img.url}-${index}`} style={styles.photoWrapper}>
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
                style={styles.photoActionBtn}
                onPress={() => onSetPrimary(index)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={t('edit_profile.photos.set_primary')}
              >
                <Feather name="star" size={12} color={theme.colors.accent} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.photoActionBtn, styles.photoActionBtnDanger]}
                onPress={() => onRemove(index)}
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
        ))}

        {images.length < MAX_PHOTOS && (
          <TouchableOpacity
            style={styles.addPhotoBtn}
            onPress={onPickImage}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('edit_profile.photos.add')}
          >
            <Feather name="plus" size={28} color={theme.colors.textMuted} />
            <Text style={styles.addPhotoText}>
              {t('edit_profile.photos.add')}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Text style={styles.photoHint}>{t('edit_profile.photos.hint')}</Text>
    </SectionCard>
  );
}