import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
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
} from '@/store/services/profileApi';
import {
    ProfileData,
    PersonalSection,
    PhysicalSection,
    EducationSection,
    FamilySection,
    SectionKey,
} from '../EditProfile.types';
import { INITIAL_PROFILE } from '../EditProfile.constants';

export function useEditProfileForm() {
    const { t } = useTranslation();

    const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
    const [sectionLoading, setSectionLoading] = useState<SectionKey | null>(null);
    const [pageLoading, setPageLoading] = useState(true);

    const { data, error, isLoading } = useGetMyProfileQuery();
    const [updatePersonalInfo] = useUpdatePersonalInfoMutation();
    const [updatePhysicalInfo] = useUpdatePhysicalInfoMutation();
    const [updateEducationInfo] = useUpdateEducationInfoMutation();
    const [updateFamilyInfo] = useUpdateFamilyInfoMutation();

    // ─── Load from API ──────────────────────────────────────────────────────

    useEffect(() => {
        if (isLoading) return;

        if (error) {
            Alert.alert(t('common.error'), t('edit_profile.errors.load_failed'));
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

    // ─── Profile completion ─────────────────────────────────────────────────

    const profileCompletion = useMemo((): number => {
        const checks: unknown[] = [
            profile.personal.firstName,
            profile.personal.dateOfBirth,
            profile.personal.maritalStatus,
            profile.personal.motherTongue,
            profile.personal.country,
            profile.physical.heightLabel,
            profile.physical.bodyType,
            profile.education.qualification,
            profile.education.occupation,
            profile.family.familyType,
            (profile.images ?? []).length > 0 ? 'yes' : '',
        ];
        const filled = checks.filter(
            (v) => v !== '' && v !== null && v !== undefined
        ).length;
        return Math.round((filled / checks.length) * 100);
    }, [profile]);

    // ─── Section setters ────────────────────────────────────────────────────

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
            setProfile((p) => ({ ...p, education: { ...p.education, [key]: value } }));
        },
        []
    );

    const setFamily = useCallback(
        <K extends keyof FamilySection>(key: K, value: FamilySection[K]) => {
            setProfile((p) => ({ ...p, family: { ...p.family, [key]: value } }));
        },
        []
    );

    // ─── Image handlers ─────────────────────────────────────────────────────

    const pickImage = useCallback(async (): Promise<void> => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                t('edit_profile.photos.permission_title'),
                t('edit_profile.photos.permission_message')
            );
            return;
        }

        if ((profile.images ?? []).length >= MAX_PHOTOS) {
            Alert.alert(
                t('edit_profile.photos.limit_title'),
                t('edit_profile.photos.limit_message', { max: MAX_PHOTOS })
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
            aspect: [4, 5] as [number, number],
        });

        if (!result.canceled && result.assets[0]) {
            const newImage: ProfileImage = {
                url: result.assets[0].uri,
                isPrimary: (profile.images ?? []).length === 0,
            };
            setProfile((p) => ({ ...p, images: [...(p.images ?? []), newImage] }));
        }
    }, [profile.images, t]);

    const setPrimary = useCallback((index: number) => {
        setProfile((p) => ({
            ...p,
            images: (p.images ?? []).map((img, i) => ({
                ...img,
                isPrimary: i === index,
            })),
        }));
    }, []);

    const removeImage = useCallback((index: number) => {
        setProfile((p) => {
            const updated = (p.images ?? []).filter((_, i) => i !== index);
            if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
                updated[0] = { ...updated[0], isPrimary: true };
            }
            return { ...p, images: updated };
        });
    }, []);

    // ─── Save ───────────────────────────────────────────────────────────────

    const updateSection = useCallback(
        async (section: SectionKey): Promise<void> => {
            setSectionLoading(section);
            try {
                switch (section) {
                    case 'personal':
                        await updatePersonalInfo(profile.personal).unwrap();
                        break;
                    case 'physical':
                        //await updatePhysicalInfo(profile.physical).unwrap();
                        break;
                    case 'education':
                        //await updateEducationInfo(profile.education).unwrap();
                        break;
                    case 'family':
                        //await updateFamilyInfo(profile.family).unwrap();
                        break;
                    case 'images':
                        // Images are uploaded inline via media endpoint
                        break;
                }
                Alert.alert(t('common.saved'), t('edit_profile.success.section_saved'));
            } catch {
                Alert.alert(t('common.error'), t('edit_profile.errors.save_failed'));
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
        // Section setters
        setPersonal,
        setPhysical,
        setEducation,
        setFamily,
        // Image handlers
        pickImage,
        setPrimary,
        removeImage,
        // Save
        handleSave,
    };
}