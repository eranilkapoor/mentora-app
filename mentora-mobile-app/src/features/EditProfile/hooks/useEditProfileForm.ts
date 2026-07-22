import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { MAX_PHOTOS } from '@/core/constants';
import { ProfileImage } from '@/core/types';
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
import { generateVideoThumbnail } from '@/core/utils/videoThumbnail';
import { hasMediaLibraryPermission } from '@/core/utils/mediaPermission';
import { executeProfileMediaSave } from './profileMediaSave.utils';

interface PendingMediaAsset {
  tempId: string;
  asset: ImagePicker.ImagePickerAsset;
  thumbnailUri?: string;
}

const isPendingMediaId = (mediaId: string): boolean =>
  mediaId.startsWith('pending-');

const appendAssetToFormData = async (
  formData: FormData,
  fieldName: 'images' | 'videos',
  asset: ImagePicker.ImagePickerAsset,
  fallbackName: string,
  fallbackType: string
): Promise<void> => {
  if (Platform.OS === 'web') {
    const res = await fetch(asset.uri);
    const blob = await res.blob();
    formData.append(
      fieldName,
      new File([blob], asset.fileName ?? fallbackName, {
        type: asset.mimeType ?? fallbackType,
      })
    );
    return;
  }

  formData.append(fieldName, {
    uri: asset.uri,
    type: asset.mimeType ?? fallbackType,
    name: asset.fileName ?? fallbackName,
  } as unknown as Blob);
};

const appendUriToFormData = async (
  formData: FormData,
  fieldName: 'thumbnails',
  uri: string,
  fallbackName: string,
  fallbackType: string
): Promise<void> => {
  if (Platform.OS === 'web') {
    const res = await fetch(uri);
    const blob = await res.blob();
    formData.append(
      fieldName,
      new File([blob], fallbackName, {
        type: blob.type || fallbackType,
      })
    );
    return;
  }

  formData.append(fieldName, {
    uri,
    type: fallbackType,
    name: fallbackName,
  } as unknown as Blob);
};

export function useEditProfileForm() {
  const { t } = useTranslation();

  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [sectionLoading, setSectionLoading] = useState<SectionKey | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [imageUploading] = useState(false);
  const [pendingImageAssets, setPendingImageAssets] = useState<
    PendingMediaAsset[]
  >([]);
  const [pendingVideoAsset, setPendingVideoAsset] =
    useState<PendingMediaAsset | null>(null);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [removedVideoIds, setRemovedVideoIds] = useState<string[]>([]);
  const [pendingPrimaryImageId, setPendingPrimaryImageId] = useState<
    string | null
  >(null);
  const [pendingPrimaryVideoId, setPendingPrimaryVideoId] = useState<
    string | null
  >(null);

  const { data, error, isLoading } = useGetMyProfileQuery();

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

  const serverImages = useMemo(
    () => (imagesData?.success ? (imagesData.data ?? []) : []),
    [imagesData]
  );

  const serverVideos = useMemo(
    () => (videosData?.success ? (videosData.data ?? []) : []),
    [videosData]
  );

  const images = useMemo<ProfileImage[]>(() => {
    const activeServerImages = serverImages
      .filter((image) => !image._id || !removedImageIds.includes(image._id))
      .map((image) => ({
        ...image,
        isPrimary: pendingPrimaryImageId
          ? image._id === pendingPrimaryImageId
          : (image.isPrimary ?? false),
      }));

    const stagedImages = pendingImageAssets.map(({ tempId, asset }, index) => {
      const shouldBePrimary =
        activeServerImages.length === 0 &&
        !pendingPrimaryImageId &&
        index === 0;

      return {
        _id: tempId,
        url: asset.uri,
        filename: asset.fileName ?? 'New profile photo',
        ...(asset.mimeType ? { mimeType: asset.mimeType } : {}),
        isActive: true,
        isPrimary: shouldBePrimary,
      };
    });

    return [...activeServerImages, ...stagedImages];
  }, [
    pendingImageAssets,
    pendingPrimaryImageId,
    removedImageIds,
    serverImages,
  ]);

  const videos = useMemo<ProfileImage[]>(() => {
    const activeServerVideos = serverVideos
      .filter((video) => !video._id || !removedVideoIds.includes(video._id))
      .map((video) => ({
        ...video,
        isPrimary: pendingPrimaryVideoId
          ? video._id === pendingPrimaryVideoId
          : (video.isPrimary ?? false),
      }));

    if (!pendingVideoAsset) {
      return activeServerVideos;
    }

    return [
      ...activeServerVideos,
      {
        _id: pendingVideoAsset.tempId,
        url: pendingVideoAsset.asset.uri,
        filename: pendingVideoAsset.asset.fileName ?? 'New video intro',
        ...(pendingVideoAsset.thumbnailUri
          ? { thumbnailUrl: pendingVideoAsset.thumbnailUri }
          : {}),
        ...(pendingVideoAsset.asset.mimeType
          ? { mimeType: pendingVideoAsset.asset.mimeType }
          : {}),
        isActive: true,
        isPrimary: activeServerVideos.length === 0 && !pendingPrimaryVideoId,
      },
    ];
  }, [pendingPrimaryVideoId, pendingVideoAsset, removedVideoIds, serverVideos]);

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
      profile.personal.country,
      profile.education.qualification,
      profile.education.occupation,
      profile.education.field,
      profile.education.university,
      images.length > 0 ? 'yes' : '',
    ];
    const filled = checks.filter(
      (v) => v !== '' && v !== null && v !== undefined
    ).length;
    return Math.round((filled / checks.length) * 100);
  }, [data, images.length, profile]);

  const missingProfileSections = useMemo((): string[] => {
    const missing =
      data?.success &&
      data.data &&
      Array.isArray(data.data.summary?.missingFields)
        ? data.data.summary.missingFields
        : [];

    return missing.map((field) =>
      t(`edit_profile.profile_sections.${field}`, { defaultValue: field })
    );
  }, [data, t]);

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

  const pickImage = useCallback(async (): Promise<void> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!hasMediaLibraryPermission(status)) {
      showError({
        title: t('edit_profile.photos.permission_title'),
        message: t('edit_profile.photos.permission_message'),
      });
      return;
    }

    if (images.length >= MAX_PHOTOS) {
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

    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];

    setPendingImageAssets((current) => [
      ...current,
      {
        tempId: `pending-image-${Date.now()}`,
        asset,
      },
    ]);
  }, [images.length, t]);

  const pickVideoIntro = useCallback(async (): Promise<void> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!hasMediaLibraryPermission(status)) {
      showError({
        title: t('edit_profile.photos.permission_title'),
        message: t('edit_profile.photos.permission_message'),
      });
      return;
    }

    if (videos.length >= 1) {
      showError({
        title: t('common.error'),
        message: t('edit_profile.video_intro.only_one_allowed'),
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
      allowsEditing: true,
    });

    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];

    const thumbnailUri = await generateVideoThumbnail(asset.uri);

    setPendingVideoAsset({
      tempId: `pending-video-${Date.now()}`,
      asset,
      ...(thumbnailUri ? { thumbnailUri } : {}),
    });
  }, [t, videos.length]);

  const handleSetPrimary = useCallback((mediaId: string): void => {
    if (!mediaId || isPendingMediaId(mediaId)) return;
    setPendingPrimaryImageId(mediaId);
  }, []);

  const handleSetPrimaryVideo = useCallback((mediaId: string): void => {
    if (!mediaId || isPendingMediaId(mediaId)) return;
    setPendingPrimaryVideoId(mediaId);
  }, []);

  const handleRemoveImage = useCallback(
    async (mediaId: string): Promise<void> => {
      if (!mediaId) return;

      const markForRemoval = (): void => {
        if (isPendingMediaId(mediaId)) {
          setPendingImageAssets((current) =>
            current.filter((item) => item.tempId !== mediaId)
          );
          return;
        }

        setRemovedImageIds((current) =>
          current.includes(mediaId) ? current : [...current, mediaId]
        );
        setPendingPrimaryImageId((current) =>
          current === mediaId ? null : current
        );
      };

      showConfirm({
        title: t('edit_profile.photos.remove_confirm_title'),
        message: t('edit_profile.photos.remove_confirm_message'),
        confirmText: t('common.delete'),
        destructive: true,
        onConfirm: markForRemoval,
      });
    },
    [t]
  );

  const handleRemoveVideoIntro = useCallback(
    async (mediaId: string): Promise<void> => {
      if (!mediaId) return;

      const markForRemoval = (): void => {
        if (isPendingMediaId(mediaId)) {
          setPendingVideoAsset(null);
          return;
        }

        setRemovedVideoIds((current) =>
          current.includes(mediaId) ? current : [...current, mediaId]
        );
        setPendingPrimaryVideoId((current) =>
          current === mediaId ? null : current
        );
      };

      showConfirm({
        title: t('edit_profile.video_intro.remove_confirm_title'),
        message: t('edit_profile.video_intro.remove_confirm_message'),
        confirmText: t('common.delete'),
        destructive: true,
        onConfirm: markForRemoval,
      });
    },
    [t]
  );

  const saveImageChanges = useCallback(async (): Promise<void> => {
    const hadExistingVisibleImage = serverImages.some(
      (image) => image._id && !removedImageIds.includes(image._id)
    );

    await executeProfileMediaSave({
      removedIds: removedImageIds,
      remove: async (mediaId) => {
        await removeMediaImage({ mediaId }).unwrap();
      },
      ...(pendingImageAssets.length > 0
        ? {
            upload: async () => {
              const formData = new FormData();
              for (const { asset } of pendingImageAssets) {
                await appendAssetToFormData(
                  formData,
                  'images',
                  asset,
                  `photo-${Date.now()}.jpg`,
                  'image/jpeg'
                );
              }
              const response = await addMediaImages(formData).unwrap();
              if (!response.success) {
                throw new Error(t('edit_profile.photos.upload_failed'));
              }
              return response.data?.find((image) => image._id)?._id;
            },
          }
        : {}),
      preferredPrimaryId: pendingPrimaryImageId,
      hadExistingVisibleMedia: hadExistingVisibleImage,
      setPrimary: async (mediaId) => {
        await setPrimaryImage({ mediaId }).unwrap();
      },
    });

    setPendingImageAssets([]);
    setRemovedImageIds([]);
    setPendingPrimaryImageId(null);
  }, [
    addMediaImages,
    pendingImageAssets,
    pendingPrimaryImageId,
    removeMediaImage,
    removedImageIds,
    serverImages,
    setPrimaryImage,
    t,
  ]);

  const saveVideoChanges = useCallback(async (): Promise<void> => {
    const hadExistingVisibleVideo = serverVideos.some(
      (video) => video._id && !removedVideoIds.includes(video._id)
    );

    for (const mediaId of removedVideoIds) {
      await removeMediaVideo({ mediaId }).unwrap();
    }

    let firstUploadedVideoId: string | undefined;
    if (pendingVideoAsset) {
      const formData = new FormData();
      await appendAssetToFormData(
        formData,
        'videos',
        pendingVideoAsset.asset,
        `intro-${Date.now()}.mp4`,
        'video/mp4'
      );
      if (pendingVideoAsset.thumbnailUri) {
        await appendUriToFormData(
          formData,
          'thumbnails',
          pendingVideoAsset.thumbnailUri,
          `intro-thumbnail-${Date.now()}.jpg`,
          'image/jpeg'
        );
      }

      const response = await addMediaVideos(formData).unwrap();
      if (!response.success) {
        throw new Error(t('edit_profile.video_intro.upload_failed'));
      }

      firstUploadedVideoId = response.data?.find((video) => video._id)?._id;
    }

    if (pendingPrimaryVideoId) {
      await setPrimaryVideo({ mediaId: pendingPrimaryVideoId }).unwrap();
    } else if (!hadExistingVisibleVideo && firstUploadedVideoId) {
      await setPrimaryVideo({ mediaId: firstUploadedVideoId }).unwrap();
    }

    setPendingVideoAsset(null);
    setRemovedVideoIds([]);
    setPendingPrimaryVideoId(null);
  }, [
    addMediaVideos,
    pendingPrimaryVideoId,
    pendingVideoAsset,
    removeMediaVideo,
    removedVideoIds,
    serverVideos,
    setPrimaryVideo,
    t,
  ]);

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
          message: t('edit_profile.errors.personality_badges_required'),
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
            await saveImageChanges();
            break;
          case 'videos':
            await saveVideoChanges();
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
      saveImageChanges,
      saveVideoChanges,
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
    missingProfileSections,
    images,
    imagesLoading: imagesLoading || imagesFetching,
    videos,
    videosLoading: videosLoading || videosFetching,
    imageUploading,
    setPersonal,
    setPhysical,
    setEducation,
    setFamily,
    pickImage,
    pickVideoIntro,
    handleSetPrimary,
    handleSetPrimaryVideo,
    handleRemoveImage,
    handleRemoveVideoIntro,
    handleSave,
  };
}
