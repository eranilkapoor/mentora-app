import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockGoBack = jest.fn();
const mockShowUpgradePrompt = jest.fn();
const mockPickImage = jest.fn();
const mockPickVideoIntro = jest.fn();
const mockHandleSave = jest.fn();
const mockHandleSetPrimary = jest.fn();
const mockHandleRemoveImage = jest.fn();
const mockSetPersonal = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

jest.mock('@/core/theme/useThemedStyles', () => ({
  useThemedStyles: () => ({}),
}));

jest.mock('@/core/components/Header', () => {
  const { Pressable, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({
      title,
      onBackPress,
    }: {
      title: string;
      onBackPress: () => void;
    }) => (
      <Pressable onPress={onBackPress}>
        <Text>{title}</Text>
      </Pressable>
    ),
  };
});

jest.mock('@/core/components/Loader', () => {
  const { Text } = require('react-native');
  return { __esModule: true, default: () => <Text>edit-profile-loader</Text> };
});

jest.mock('@/features/Membership/hooks/usePlanFeatureAccess', () => ({
  usePlanFeatureAccess: () => ({ hasFeature: false }),
}));

jest.mock('@/features/Membership/hooks/useUpgradePrompt', () => ({
  useUpgradePrompt: () => mockShowUpgradePrompt,
}));

jest.mock('./hooks/useEditProfileForm', () => ({
  useEditProfileForm: () => ({
    profile: {
      personal: { firstName: 'Asha' },
      physical: {},
      education: {},
      family: {},
    },
    sectionLoading: null,
    pageLoading: false,
    profileCompletion: 72,
    setPersonal: mockSetPersonal,
    setPhysical: jest.fn(),
    setEducation: jest.fn(),
    setFamily: jest.fn(),
    images: [{ mediaId: 'image-1', url: '/image.jpg', isPrimary: true }],
    imagesLoading: false,
    videos: [],
    videosLoading: false,
    imageUploading: false,
    pickImage: mockPickImage,
    pickVideoIntro: mockPickVideoIntro,
    handleSave: mockHandleSave,
    handleSetPrimary: mockHandleSetPrimary,
    handleSetPrimaryVideo: jest.fn(),
    handleRemoveImage: mockHandleRemoveImage,
    handleRemoveVideoIntro: jest.fn(),
  }),
}));

jest.mock('./components/CompletionBar', () => {
  const { Text } = require('react-native');
  return {
    CompletionBar: ({ percent }: { percent: number }) => (
      <Text>{`completion:${percent}`}</Text>
    ),
  };
});

jest.mock('./sections/PhotosSection', () => {
  const { Pressable, Text } = require('react-native');
  return {
    PhotosSection: ({
      onPickImage,
      onSetPrimary,
      onRemove,
      onSave,
    }: {
      onPickImage: () => void;
      onSetPrimary: (id: string) => void;
      onRemove: (id: string) => void;
      onSave: () => void;
    }) => (
      <>
        <Pressable onPress={onPickImage}>
          <Text>pick-image</Text>
        </Pressable>
        <Pressable onPress={() => onSetPrimary('image-1')}>
          <Text>primary-image</Text>
        </Pressable>
        <Pressable onPress={() => onRemove('image-1')}>
          <Text>remove-image</Text>
        </Pressable>
        <Pressable onPress={onSave}>
          <Text>save-photos</Text>
        </Pressable>
      </>
    ),
  };
});

jest.mock('./sections/VideoIntroSection', () => {
  const { Pressable, Text } = require('react-native');
  return {
    VideoIntroSection: ({
      locked,
      onLockedPress,
      onPickVideo,
    }: {
      locked: boolean;
      onLockedPress: () => void;
      onPickVideo: () => void;
    }) => (
      <>
        <Text>{locked ? 'video-locked' : 'video-open'}</Text>
        <Pressable onPress={locked ? onLockedPress : onPickVideo}>
          <Text>video-action</Text>
        </Pressable>
      </>
    ),
  };
});

const makeSectionMock = (label: string) => {
  const { Pressable, Text } = require('react-native');
  return ({
    onSet,
    onSave,
  }: {
    onSet?: (patch: unknown) => void;
    onSave: () => void;
  }) => (
    <>
      <Pressable onPress={() => onSet?.({ firstName: 'Meera' })}>
        <Text>{`${label}-set`}</Text>
      </Pressable>
      <Pressable onPress={onSave}>
        <Text>{`${label}-save`}</Text>
      </Pressable>
    </>
  );
};

jest.mock('./sections/PersonalSection', () => ({
  PersonalSection: makeSectionMock('personal'),
}));
jest.mock('./sections/PhysicalSection', () => ({
  PhysicalSection: makeSectionMock('physical'),
}));
jest.mock('./sections/EducationSection', () => ({
  EducationSection: makeSectionMock('education'),
}));
jest.mock('./sections/FamilySection', () => ({
  FamilySection: makeSectionMock('family'),
}));

import EditProfileScreen from './EditProfile.screen';

describe('EditProfileScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('wires profile media, locked video, section updates, and back navigation', async () => {
    const { getByText } = await render(
      <EditProfileScreen navigation={{ goBack: mockGoBack } as never} />
    );

    expect(getByText('completion:72')).toBeTruthy();
    await fireEvent.press(getByText('edit_profile.title'));
    await fireEvent.press(getByText('pick-image'));
    await fireEvent.press(getByText('primary-image'));
    await fireEvent.press(getByText('remove-image'));
    await fireEvent.press(getByText('save-photos'));
    await fireEvent.press(getByText('video-action'));
    await fireEvent.press(getByText('personal-set'));
    await fireEvent.press(getByText('personal-save'));

    expect(mockGoBack).toHaveBeenCalled();
    expect(mockPickImage).toHaveBeenCalled();
    expect(mockHandleSetPrimary).toHaveBeenCalledWith('image-1');
    expect(mockHandleRemoveImage).toHaveBeenCalledWith('image-1');
    expect(mockHandleSave).toHaveBeenCalled();
    expect(mockShowUpgradePrompt).toHaveBeenCalledWith(
      'edit_profile.sections.video_intro'
    );
    expect(mockSetPersonal).toHaveBeenCalledWith({ firstName: 'Meera' });
    expect(mockPickVideoIntro).not.toHaveBeenCalled();
  });
});
