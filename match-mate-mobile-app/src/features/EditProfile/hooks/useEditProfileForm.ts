import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { MAX_PHOTOS } from '@/core/constants';
import {
  useGetMyProfileQuery,
  useUpdatePersonalInfoMutation,
  useUpdatePhysicalInfoMutation,
  useUpdateEducationInfoMutation,
  useUpdateFamilyInfoMutation,
  useGetMyProfileMediaImagesQuery,
  useGetMyProfileMediaVideosQuery,
  useAddProfileMediaImagesMutation,
  useAddProfileMediaVideosMutation,
  useSetPrimaryProfileMediaImageMutation,
  useSetPrimaryProfileMediaVideoMutation,
  useRemoveProfileMediaImageMutation,
  useRemoveProfileMediaVideoMutation,
} from '@/store/services/profileApi.service';
import {
  ProfileData,
  PersonalSection,
  PhysicalSection,
  EducationSection,
  FamilySection,
  SectionKey,
} from '../EditProfile.types';
import { INITIAL_PROFILE } from '../EditProfile.constants';
import { showError, showSuccess } from '@/core/utils/toast';
import { showConfirm } from '@/core/utils/confirm';

export function useEditProfileForm() {
  const { t } = useTranslation();

  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [sectionLoading, setSectionLoading] = useState<SectionKey | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);

  // ─── Queries ──────────────────────────────────────────────────────────────

  const { data, error, isLoading } = useGetMyProfileQuery();

  // Images are driven entirely by the server — no local image state
  const {
    data: imagesData,
    isLoading: imagesLoading,
    isFetching: imagesFetching,
  } = useGetMyProfileMediaImagesQuery();

  const {
    data: videosData,
    isLoading: videosLoading,
    isFetching: videosFetching,
  } = useGetMyProfileMediaVideosQuery();

  // ─── Mutations ────────────────────────────────────────────────────────────

  const [updatePersonalInfo] = useUpdatePersonalInfoMutation();
  const [updatePhysicalInfo] = useUpdatePhysicalInfoMutation();
  const [updateEducationInfo] = useUpdateEducationInfoMutation();
  const [updateFamilyInfo] = useUpdateFamilyInfoMutation();
  const [addMediaImages] = useAddProfileMediaImagesMutation();
  const [addMediaVideos] = useAddProfileMediaVideosMutation();
  const [setPrimaryImage] = useSetPrimaryProfileMediaImageMutation();
  const [setPrimaryVideo] = useSetPrimaryProfileMediaVideoMutation();
  const [removeMediaImage] = useRemoveProfileMediaImageMutation();
  const [removeMediaVideo] = useRemoveProfileMediaVideoMutation();

  // ─── Server images (source of truth) ─────────────────────────────────────

  const serverImages = useMemo(
    () => (imagesData?.success ? (imagesData.data ?? []) : []),
    [imagesData]
  );

  const serverVideos = useMemo(
    () => (videosData?.success ? (videosData.data ?? []) : []),
    [videosData]
  );

  // ─── Load profile from API ─────────────────────────────────────────────────

  useEffect(() => {
    if (isLoading) return;

    if (error) {
      showError({
        title: t('common.error'),
        message: t('edit_profile.errors.load_failed'),
      });
      setPageLoading(false);
      return;
    }

    if (data?.success && data?.data) {
      setProfile((prev) => ({
        ...prev,
        personal: {
          ...prev.personal,
          ...(data.data.personal as typeof prev.personal),
        },
        physical: {
          ...prev.physical,
          ...(data.data.physical as typeof prev.physical),
        },
        education: {
          ...prev.education,
          ...(data.data.education as typeof prev.education),
        },
        family: {
          ...prev.family,
          ...(data.data.family as typeof prev.family),
        },
      }));
    }

    setPageLoading(false);
  }, [data, error, isLoading, t]);

  // ─── Profile completion ──────────────────────────────────────────────────

  const profileCompletion = useMemo((): number => {
    const serverCompletion =
      data?.success && data.data
        ? (data.data.summary?.profileCompletionPercentage ??
          data.data.profileCompletionPercentage)
        : undefined;

    if (typeof serverCompletion === 'number') {
      return Math.min(100, Math.max(0, Math.round(serverCompletion)));
    }

    const checks: unknown[] = [
      profile.personal.firstName,
      profile.personal.dateOfBirth,
      profile.personal.maritalStatus,
      profile.personal.motherTongue,
      profile.personal.country,
      profile.physical.height,
      profile.physical.bodyType,
      profile.education.qualification,
      profile.education.occupation,
      profile.family.familyType,
      serverImages.length > 0 ? 'yes' : '',
    ];
    const filled = checks.filter(
      (v) => v !== '' && v !== null && v !== undefined
    ).length;
    return Math.round((filled / checks.length) * 100);
  }, [data, profile, serverImages]);

  // ─── Section setters ─────────────────────────────────────────────────────

  const setPersonal = useCallback(
    <K extends keyof PersonalSection>(key: K, value: PersonalSection[K]) => {
      setProfile((p) => ({ ...p, personal: { ...p.personal, [key]: value } }));
    },
    []
  );

  const setPhysical = useCallback(
    <K extends keyof PhysicalSection>(key: K, value: PhysicalSection[K]) => {
      setProfile((p) => ({ ...p, physical: { ...p.physical, [key]: value } }));
    },
    []
  );

  const setEducation = useCallback(
    <K extends keyof EducationSection>(key: K, value: EducationSection[K]) => {
      setProfile((p) => ({
        ...p,
        education: { ...p.education, [key]: value },
      }));
    },
    []
  );

  const setFamily = useCallback(
    <K extends keyof FamilySection>(key: K, value: FamilySection[K]) => {
      setProfile((p) => ({ ...p, family: { ...p.family, [key]: value } }));
    },
    []
  );

  // ─── Image: Upload ────────────────────────────────────────────────────────

  const pickImage = useCallback(async (): Promise<void> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showError({
        title: t('edit_profile.photos.permission_title'),
        message: t('edit_profile.photos.permission_message'),
      });
      return;
    }

    if (serverImages.length >= MAX_PHOTOS) {
      showError({
        title: t('edit_profile.photos.limit_title'),
        message: t('edit_profile.photos.limit_message', { max: MAX_PHOTOS }),
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 5] as [number, number],
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];

    setImageUploading(true);
    try {
      const formData = new FormData();

      if (Platform.OS === 'web') {
        // Web: fetch blob from URI and append as File
        const res = await fetch(asset.uri);
        const blob = await res.blob();
        formData.append(
          'images',
          new File([blob], asset.fileName ?? `photo-${Date.now()}.jpg`, {
            type: asset.mimeType ?? 'image/jpeg',
          })
        );
      } else {
        // Native: append the file object directly
        formData.append('images', {
          uri: asset.uri,
          type: asset.mimeType ?? 'image/jpeg',
          name: asset.fileName ?? `photo-${Date.now()}.jpg`,
        } as unknown as Blob);
      }

      const response = await addMediaImages(formData).unwrap();

      if (!response.success) {
        throw new Error(t('edit_profile.photos.upload_failed'));
      }

      // RTK invalidates 'ProfileMedia' → useGetMyProfileMediaImagesQuery
      // refetches automatically — no local state update needed
    } catch {
      showError({
        title: t('common.error'),
        message: t('edit_profile.photos.upload_failed'),
      });
    } finally {
      setImageUploading(false);
    }
  }, [serverImages.length, addMediaImages, t]);

  const pickVideoIntro = useCallback(async (): Promise<void> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showError({
        title: t('edit_profile.photos.permission_title'),
        message: t('edit_profile.photos.permission_message'),
      });
      return;
    }

    if (serverVideos.length >= 1) {
      showError({
        title: t('common.error'),
        message:
          'Only one video intro is allowed. Remove the existing video first.',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
      allowsEditing: true,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];

    setImageUploading(true);
    try {
      const formData = new FormData();

      if (Platform.OS === 'web') {
        const res = await fetch(asset.uri);
        const blob = await res.blob();
        formData.append(
          'videos',
          new File([blob], asset.fileName ?? `intro-${Date.now()}.mp4`, {
            type: asset.mimeType ?? 'video/mp4',
          })
        );
      } else {
        formData.append('videos', {
          uri: asset.uri,
          type: asset.mimeType ?? 'video/mp4',
          name: asset.fileName ?? `intro-${Date.now()}.mp4`,
        } as unknown as Blob);
      }

      await addMediaVideos(formData).unwrap();
    } catch {
      showError({
        title: t('common.error'),
        message: 'Unable to upload video intro.',
      });
    } finally {
      setImageUploading(false);
    }
  }, [serverVideos.length, addMediaVideos, t]);

  // ─── Image: Set Primary ───────────────────────────────────────────────────

  const handleSetPrimary = useCallback(
    async (mediaId: string): Promise<void> => {
      if (!mediaId) return;
      try {
        await setPrimaryImage({ mediaId }).unwrap();
      } catch {
        showError({
          title: t('common.error'),
          message: t('edit_profile.photos.set_primary_failed'),
        });
      }
    },
    [setPrimaryImage, t]
  );

  const handleSetPrimaryVideo = useCallback(
    async (mediaId: string): Promise<void> => {
      if (!mediaId) return;
      try {
        await setPrimaryVideo({ mediaId }).unwrap();
      } catch {
        showError({
          title: t('common.error'),
          message: 'Unable to set primary video intro.',
        });
      }
    },
    [setPrimaryVideo, t]
  );

  // ─── Image: Remove ────────────────────────────────────────────────────────

  const handleRemoveImage = useCallback(
    async (mediaId: string): Promise<void> => {
      if (!mediaId) return;

      const handleDelete = async (): Promise<void> => {
        try {
          await removeMediaImage({ mediaId }).unwrap();
        } catch {
          if (Platform.OS === 'web') {
            window.alert(t('edit_profile.photos.remove_failed'));
          } else {
            showError({
              title: t('common.error'),
              message: t('edit_profile.photos.remove_failed'),
            });
          }
        }
      };

      if (Platform.OS === 'web') {
        const confirmed = window.confirm(
          t('edit_profile.photos.remove_confirm_message')
        );

        if (confirmed) {
          await handleDelete();
        }

        return;
      }

      showConfirm({
        title: t('edit_profile.photos.remove_confirm_title'),
        message: t('edit_profile.photos.remove_confirm_message'),
        confirmText: t('common.delete'),
        destructive: true,
        onConfirm: () => {
          void handleDelete();
        },
      });
    },
    [removeMediaImage, t]
  );

  const handleRemoveVideoIntro = useCallback(
    async (mediaId: string): Promise<void> => {
      if (!mediaId) return;
      try {
        await removeMediaVideo({ mediaId }).unwrap();
      } catch {
        showError({
          title: t('common.error'),
          message: 'Unable to remove video intro.',
        });
      }
    },
    [removeMediaVideo, t]
  );

  // ─── Save section ─────────────────────────────────────────────────────────

  const updateSection = useCallback(
    async (section: SectionKey): Promise<void> => {
      if (
        section === 'personal' &&
        profile.personal.personalityBadges &&
        (profile.personal.personalityBadges.length < 3 ||
          profile.personal.personalityBadges.length > 10)
      ) {
        showError({
          title: t('common.error'),
          message: 'Please select 3 to 10 personality badges.',
        });
        return;
      }

      setSectionLoading(section);
      try {
        switch (section) {
          case 'personal':
            await updatePersonalInfo(profile.personal).unwrap();
            break;
          case 'physical':
            await updatePhysicalInfo(profile.physical).unwrap();
            break;
          case 'education':
            await updateEducationInfo(profile.education).unwrap();
            break;
          case 'family':
            await updateFamilyInfo(profile.family).unwrap();
            break;
          case 'images':
            // Images are managed via their own handlers — no-op here
            break;
        }
        showSuccess({
          title: t('common.saved'),
          message: t('edit_profile.success.section_saved'),
        });
      } catch {
        showError({
          title: t('common.error'),
          message: t('edit_profile.errors.save_failed'),
        });
      } finally {
        setSectionLoading(null);
      }
    },
    [
      profile,
      updatePersonalInfo,
      updatePhysicalInfo,
      updateEducationInfo,
      updateFamilyInfo,
      t,
    ]
  );

  const handleSave = useCallback(
    (key: SectionKey) => {
      void updateSection(key);
    },
    [updateSection]
  );

  return {
    profile,
    sectionLoading,
    pageLoading,
    profileCompletion,
    // Images (server-driven)
    images: serverImages,
    imagesLoading: imagesLoading || imagesFetching,
    videos: serverVideos,
    videosLoading: videosLoading || videosFetching,
    imageUploading,
    // Section setters
    setPersonal,
    setPhysical,
    setEducation,
    setFamily,
    // Image handlers
    pickImage,
    pickVideoIntro,
    handleSetPrimary,
    handleSetPrimaryVideo,
    handleRemoveImage,
    handleRemoveVideoIntro,
    // Save
    handleSave,
  };
}
