import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { onboardingStyles } from '../Onboarding.styles';
import { ProfileImage } from '@/core/types';
import { MAX_PHOTOS } from '@/core/constants';

interface Props {
  photos: ProfileImage[];
  onPickImage: () => void;
  onSetPrimary: (index: number) => void;
  onRemove: (index: number) => void;
}

export function PhotosStep({
  photos,
  onPickImage,
  onSetPrimary,
  onRemove,
}: Props): React.ReactElement {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useThemedStyles(onboardingStyles);

  return (
    <View>
      <Text style={styles.stepTitle}>{t('onboarding.photos.title')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.photos.subtitle')}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.photoRow}
        keyboardShouldPersistTaps="handled"
      >
        {photos.map((img, index) => (
          <View key={`${img.url}-${index}`} style={styles.photoWrapper}>
            <Image source={{ uri: img.url }} style={styles.photo} />

            {img.isPrimary && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryBadgeText}>
                  {t('onboarding.photos.primary')}
                </Text>
              </View>
            )}

            <View style={styles.photoActions}>
              <TouchableOpacity
                style={styles.photoActionBtn}
                onPress={() => onSetPrimary(index)}
                accessibilityRole="button"
                accessibilityLabel={t('onboarding.photos.set_primary')}
              >
                <Feather name="star" size={12} color={theme.colors.accent} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.photoActionBtn, styles.photoActionBtnDanger]}
                onPress={() => onRemove(index)}
                accessibilityRole="button"
                accessibilityLabel={t('onboarding.photos.remove')}
              >
                <Feather name="trash-2" size={12} color={theme.colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {photos.length < MAX_PHOTOS && (
          <TouchableOpacity
            style={styles.addPhotoBtn}
            onPress={onPickImage}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.photos.add')}
          >
            <Feather name="plus" size={28} color={theme.colors.textMuted} />
            <Text style={styles.addPhotoText}>
              {t('onboarding.photos.add')}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Text style={styles.photoHint}>{t('onboarding.photos.hint')}</Text>

      {photos.length === 0 && (
        <View style={styles.photoEmptyState}>
          <Feather name="camera" size={40} color={theme.colors.textMuted} />
          <Text style={styles.photoEmptyTitle}>
            {t('onboarding.photos.empty_title')}
          </Text>
          <Text style={styles.photoEmptySubtitle}>
            {t('onboarding.photos.empty_subtitle')}
          </Text>
        </View>
      )}
    </View>
  );
}
