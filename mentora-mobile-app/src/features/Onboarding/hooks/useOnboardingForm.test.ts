import { Platform } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { useOnboardingForm } from './useOnboardingForm';
import {
  Countries,
  Genders,
  MaritalStatuses,
  ProfileFors,
  Qualifications,
  Religions,
} from '@/core/types';

const mockDispatch = jest.fn();
const mockOnboardingProfile = jest.fn();
const mockShowError = jest.fn();
const mockInvalidateTags = jest.fn((tags: string[]) => ({
  type: 'api/invalidate',
  payload: tags,
}));
const mockSetOnboardingCompletionPending = jest.fn((value: boolean) => ({
  type: 'auth/onboardingPending',
  payload: value,
}));

let mockAuthUser: { firstName?: string; lastName?: string } | undefined;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ auth: { user: mockAuthUser } }),
}));

jest.mock('@/store/slices/auth.slice', () => ({
  setOnboardingCompletionPending: (value: boolean) =>
    mockSetOnboardingCompletionPending(value),
}));

jest.mock('@/store/services/baseApi.service', () => ({
  baseApi: {
    util: {
      invalidateTags: (tags: string[]) => mockInvalidateTags(tags),
    },
  },
}));

jest.mock('@/store/services/profileApi.service', () => ({
  useOnboardingProfileMutation: () => [mockOnboardingProfile],
}));

jest.mock('@/core/utils/toast', () => ({
  showError: (payload: unknown) => mockShowError(payload),
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

const setPlatform = (os: 'android' | 'ios' | 'web') => {
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    value: os,
  });
};

const fillValidBasic = async (
  result: Awaited<
    ReturnType<typeof renderHook<ReturnType<typeof useOnboardingForm>, void>>
  >['result']
) => {
  await act(async () => {
    result.current.setBasicField('profileFor', ProfileFors.SELF);
    result.current.setBasicField('firstName', 'Riya');
    result.current.setBasicField('lastName', 'Sharma');
    result.current.setBasicField('dateOfBirth', '1998-01-01');
    result.current.setBasicField('gender', Genders.FEMALE);
    result.current.setBasicField('religion', Religions.HINDU);
    result.current.setBasicField('country', Countries.INDIA);
    result.current.setBasicField('state', 'Maharashtra');
    result.current.setBasicField('city', 'Mumbai');
    result.current.setBasicField(
      'maritalStatus',
      MaritalStatuses.NEVER_MARRIED
    );
    result.current.setBasicField('qualification', Qualifications.BTECH);
    result.current.setBasicField('occupation', 'Engineer');
    result.current.setBasicField('height', '170');
    result.current.setPreferenceField('maritalStatus', [
      MaritalStatuses.NEVER_MARRIED,
    ]);
    result.current.setPreferenceField('religion', [Religions.HINDU]);
  });
};

describe('useOnboardingForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setPlatform('android');
    mockAuthUser = { firstName: '  Asha ', lastName: ' Mehta ' };
    mockOnboardingProfile.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        success: true,
        data: { isOnboardingCompleted: true },
      }),
    });
    jest
      .mocked(ImagePicker.requestMediaLibraryPermissionsAsync)
      .mockResolvedValue({ status: 'granted' } as never);
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///photo.jpg' }],
    } as never);
  });

  it('prefills names from auth user and validates basic/preference data', async () => {
    const { result } = await renderHook(() => useOnboardingForm());

    expect(result.current.basic.firstName).toBe('Asha');
    expect(result.current.basic.lastName).toBe('Mehta');

    await act(async () => {
      result.current.setBasicField('firstName', '');
    });

    await act(async () => {
      expect(result.current.validateBasic()).toBe(false);
    });

    expect(result.current.errors.firstName).toBe(
      'onboarding.errors.first_name_required'
    );

    await fillValidBasic(result);
    await act(async () => {
      expect(result.current.validateBasic()).toBe(true);
      expect(result.current.validatePreferences()).toBe(true);
    });
  });

  it('adds, promotes, and removes selected photos', async () => {
    const { result } = await renderHook(() => useOnboardingForm());

    await act(async () => {
      await result.current.pickImage();
    });

    expect(result.current.photos).toEqual([
      { url: 'file:///photo.jpg', isPrimary: true },
    ]);

    jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///second.jpg' }],
    } as never);

    await act(async () => {
      await result.current.pickImage();
      result.current.setPrimaryPhoto(1);
    });

    expect(result.current.photos[1]?.isPrimary).toBe(true);

    await act(async () => {
      result.current.removePhoto(1);
    });

    expect(result.current.photos).toEqual([
      { url: 'file:///photo.jpg', isPrimary: true },
    ]);
  });

  it('shows errors for denied photo permission and photo limit', async () => {
    jest
      .mocked(ImagePicker.requestMediaLibraryPermissionsAsync)
      .mockResolvedValueOnce({ status: 'denied' } as never);

    const { result } = await renderHook(() => useOnboardingForm());

    await act(async () => {
      await result.current.pickImage();
    });

    expect(mockShowError).toHaveBeenCalledWith({
      title: 'onboarding.photos.permission_title',
      message: 'onboarding.photos.permission_message',
    });

    for (let index = 0; index < 6; index += 1) {
      jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: `file:///photo-${index}.jpg` }],
      } as never);
      await act(async () => {
        await result.current.pickImage();
      });
    }

    await act(async () => {
      await result.current.pickImage();
    });

    expect(mockShowError).toHaveBeenCalledWith({
      title: 'onboarding.photos.limit_title',
      message: 'onboarding.photos.limit_message',
    });
  });

  it('submits onboarding form data and invalidates profile caches', async () => {
    const { result } = await renderHook(() => useOnboardingForm());

    await fillValidBasic(result);
    await act(async () => {
      await result.current.pickImage();
    });

    await act(async () => {
      await expect(result.current.handleSubmit()).resolves.toBe(true);
    });

    expect(mockOnboardingProfile).toHaveBeenCalledWith(expect.any(FormData));
    expect(mockSetOnboardingCompletionPending).toHaveBeenCalledWith(true);
    expect(mockInvalidateTags).toHaveBeenCalledWith(['Profile', 'Preference']);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'auth/onboardingPending',
      payload: true,
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'api/invalidate',
      payload: ['Profile', 'Preference'],
    });
  });

  it('returns false and shows API errors when submission fails', async () => {
    mockOnboardingProfile.mockReturnValueOnce({
      unwrap: jest.fn().mockResolvedValue({
        success: false,
        code: 'ONBOARDING.INVALID',
        message: 'Invalid onboarding',
      }),
    });

    const { result } = await renderHook(() => useOnboardingForm());

    await act(async () => {
      await expect(result.current.handleSubmit()).resolves.toBe(false);
    });

    expect(mockShowError).toHaveBeenCalledWith({
      title: 'common.error',
      message: 'Invalid onboarding',
    });
  });
});
