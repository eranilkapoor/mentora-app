import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SettingsStackParamList } from '@/navigation/types';
import Header from '@/core/components/Header';
import Loader from '@/core/components/Loader';
import { editProfileStyles } from './EditProfile.styles';
import { useEditProfileForm } from './hooks/useEditProfileForm';
import { CompletionBar } from './components/CompletionBar';
import { PhotosSection } from './sections/PhotosSection';
import { VideoIntroSection } from './sections/VideoIntroSection';
import { PersonalSection } from './sections/PersonalSection';
import { AstroSection } from './sections/AstroSection';
import { PhysicalSection } from './sections/PhysicalSection';
import { EducationSection } from './sections/EducationSection';
import { FamilySection } from './sections/FamilySection';
import { LifestyleSection } from './sections/LifestyleSection';

type Props = {
  navigation: NativeStackNavigationProp<SettingsStackParamList, 'EditProfile'>;
};

export default function EditProfileScreen({
  navigation,
}: Props): React.ReactElement {
  const styles = useThemedStyles(editProfileStyles);
  const { t } = useTranslation();

  const {
    profile,
    sectionLoading,
    pageLoading,
    profileCompletion,
    setPersonal,
    setPhysical,
    setEducation,
    setFamily,
    images,
    imagesLoading,
    videos,
    videosLoading,
    imageUploading,
    pickImage,
    pickVideoIntro,
    handleSave,
    handleSetPrimary,
    handleSetPrimaryVideo,
    handleRemoveImage,
    handleRemoveVideoIntro,
  } = useEditProfileForm();

  if (pageLoading) {
    return (
      <Loader fullScreen size="large" loadingText={t('edit_profile.loading')} />
    );
  }

  const sectionProps = { sectionLoading, onSave: handleSave };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <Header
          showBack
          onBackPress={navigation.goBack}
          title={t('edit_profile.title')}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <CompletionBar percent={profileCompletion} />

          <PhotosSection
            images={images}
            imagesLoading={imagesLoading}
            imageUploading={imageUploading}
            onPickImage={() => {
              void pickImage();
            }}
            onSetPrimary={(mediaId) => {
              void handleSetPrimary(mediaId);
            }}
            onRemove={(mediaId) => {
              void handleRemoveImage(mediaId);
            }}
            {...sectionProps}
          />

          <VideoIntroSection
            videos={videos}
            videosLoading={videosLoading}
            videoUploading={imageUploading}
            onPickVideo={() => {
              void pickVideoIntro();
            }}
            onSetPrimary={(mediaId) => {
              void handleSetPrimaryVideo(mediaId);
            }}
            onRemove={(mediaId) => {
              void handleRemoveVideoIntro(mediaId);
            }}
            {...sectionProps}
          />

          <PersonalSection
            personal={profile.personal}
            onSet={setPersonal}
            {...sectionProps}
          />

          <AstroSection
            personal={profile.personal}
            onSet={setPersonal}
            {...sectionProps}
          />

          <PhysicalSection
            physical={profile.physical}
            onSet={setPhysical}
            {...sectionProps}
          />

          <EducationSection
            education={profile.education}
            onSet={setEducation}
            {...sectionProps}
          />

          <FamilySection
            family={profile.family}
            onSet={setFamily}
            {...sectionProps}
          />

          <LifestyleSection
            personal={profile.personal}
            onSet={setPersonal}
            {...sectionProps}
          />

          <View style={styles.footer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
