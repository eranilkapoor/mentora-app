import {
  profileImageFileFilter,
  ProfilesController,
} from './profiles.controller';
import { SuccessCode } from '@/common/constants';
import { Gender, Religion } from '@/common/enums';

describe('ProfilesController', () => {
  const userId = 'user-1';
  const req = { user: { sub: userId } } as never;

  const service = {
    onboardingProfile: jest.fn(),
    createProfile: jest.fn(),
    getMyProfile: jest.fn(),
    updatePersonalInfo: jest.fn(),
    updatePhysicalInfo: jest.fn(),
    updateEducationInfo: jest.fn(),
    updateFamilyInfo: jest.fn(),
    updateLocation: jest.fn(),
  };

  let controller: ProfilesController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ProfilesController(service as never);
  });

  it('saves onboarding and create-profile payloads for the current user', async () => {
    const dto = { personal: { firstName: 'Asha' } } as never;
    const files = [{ originalname: 'photo.jpg' }] as Express.Multer.File[];
    service.onboardingProfile.mockResolvedValue({ id: 'profile-1' });
    service.createProfile.mockResolvedValue({ id: 'profile-1' });

    const onboarding = await controller.onboardingProfile(
      req,
      userId,
      dto,
      files,
    );
    const created = await controller.createProfile(req, dto);

    expect(service.onboardingProfile).toHaveBeenCalledWith(
      req,
      userId,
      dto,
      files,
    );
    expect(service.createProfile).toHaveBeenCalledWith(userId, dto);
    expect(onboarding.code).toBe(SuccessCode.PROFILE_CREATED);
    expect(created.code).toBe(SuccessCode.PROFILE_CREATED);
  });

  it('normalizes missing onboarding files to an empty array', async () => {
    service.onboardingProfile.mockResolvedValue({ id: 'profile-1' });

    await controller.onboardingProfile(req, userId, {} as never, undefined!);

    expect(service.onboardingProfile).toHaveBeenCalledWith(req, userId, {}, []);
  });

  it('fetches and updates profile sections', async () => {
    service.getMyProfile.mockResolvedValue({ id: 'profile-1' });
    service.updatePersonalInfo.mockResolvedValue({ section: 'personal' });
    service.updatePhysicalInfo.mockResolvedValue({ section: 'physical' });
    service.updateEducationInfo.mockResolvedValue({ section: 'education' });
    service.updateFamilyInfo.mockResolvedValue({ section: 'family' });
    service.updateLocation.mockResolvedValue({ section: 'location' });

    const profile = await controller.getMyProfile(req);
    await controller.updatePersonal(req, {
      firstName: 'Asha',
      gender: Gender.FEMALE,
      dateOfBirth: '1995-01-01',
      religion: Religion.HINDU,
    });
    await controller.updatePhysical(req, { accessibilityNeeds: [] });
    await controller.updateEducation(req, {
      occupation: 'Exam preparation',
    } as never);
    await controller.updateFamily(req, { fatherName: 'Parent' });
    await controller.updateLocation(req, { city: 'Mumbai' } as never);

    expect(service.getMyProfile).toHaveBeenCalledWith(userId);
    expect(service.updatePersonalInfo).toHaveBeenCalledWith(req, userId, {
      firstName: 'Asha',
      gender: Gender.FEMALE,
      dateOfBirth: '1995-01-01',
      religion: Religion.HINDU,
    });
    expect(service.updatePhysicalInfo).toHaveBeenCalledWith(req, userId, {
      accessibilityNeeds: [],
    });
    expect(service.updateEducationInfo).toHaveBeenCalledWith(req, userId, {
      occupation: 'Exam preparation',
    });
    expect(service.updateFamilyInfo).toHaveBeenCalledWith(req, userId, {
      fatherName: 'Parent',
    });
    expect(service.updateLocation).toHaveBeenCalledWith(req, userId, {
      city: 'Mumbai',
    });
    expect(profile.code).toBe(SuccessCode.PROFILE_FETCHED);
  });

  it.each(['image/jpeg', 'image/png', 'image/webp'])(
    'accepts supported %s onboarding images',
    (mimetype) => {
      const callback = jest.fn();

      profileImageFileFilter(
        {} as Express.Request,
        { mimetype } as Express.Multer.File,
        callback,
      );

      expect(callback).toHaveBeenCalledWith(null, true);
    },
  );

  it('rejects unsupported onboarding image formats', () => {
    const callback = jest.fn();

    profileImageFileFilter(
      {} as Express.Request,
      { mimetype: 'image/gif' } as Express.Multer.File,
      callback,
    );

    expect(callback).toHaveBeenCalledWith(expect.any(Error), false);
  });
});
