import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from '../controllers/profile.controller';
import { ProfileService } from '../services/profile.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { buildReq } from '../../../test/helpers/mock-factory';

const mockProfileService = () => ({
  createProfile: jest.fn(),
  updateProfile: jest.fn(),
  updatePersonalInfo: jest.fn(),
  updatePhysicalInfo: jest.fn(),
  updateEducationInfo: jest.fn(),
  updateFamilyInfo: jest.fn(),
  updatePreferences: jest.fn(),
  getPrivacySettings: jest.fn(),
  updatePrivacySettings: jest.fn(),
  getImages: jest.fn(),
  addImages: jest.fn(),
  setPrimaryImage: jest.fn(),
  removeImage: jest.fn(),
  getVideos: jest.fn(),
  addVideos: jest.fn(),
  setPrimaryVideo: jest.fn(),
  removeVideo: jest.fn(),
  getMyProfile: jest.fn(),
});

const USER_ID = 'user-id-1';

describe('ProfileController', () => {
  let controller: ProfileController;
  let service: ReturnType<typeof mockProfileService>;

  beforeEach(async () => {
    service = mockProfileService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [{ provide: ProfileService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ProfileController>(ProfileController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create()', () => {
    it('should return success when profile is created', async () => {
      const profile = { userId: USER_ID, firstName: 'Test' };
      service.createProfile.mockResolvedValue(profile);

      const result = await controller.create(USER_ID, {} as any);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(profile);
    });

    it('should return failure when service throws', async () => {
      service.createProfile.mockRejectedValue(
        new Error('Profile already exists'),
      );
      const result = await controller.create(USER_ID, {} as any);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Profile already exists');
    });
  });

  describe('update()', () => {
    it('should return success when profile is updated', async () => {
      const updated = { userId: USER_ID, firstName: 'Updated' };
      service.updateProfile.mockResolvedValue(updated);
      const req = buildReq();

      const result = await controller.update(req as any, USER_ID, {} as any);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(updated);
    });

    it('should return failure on update error', async () => {
      service.updateProfile.mockRejectedValue(new Error('Update failed'));
      const result = await controller.update(
        buildReq() as any,
        USER_ID,
        {} as any,
      );
      expect(result.success).toBe(false);
    });
  });

  describe('updatePersonal()', () => {
    it('should update personal info successfully', async () => {
      service.updatePersonalInfo.mockResolvedValue({ firstName: 'John' });
      const result = await controller.updatePersonal(
        buildReq() as any,
        USER_ID,
        {} as any,
      );
      expect(result.success).toBe(true);
    });
  });

  describe('updatePhysical()', () => {
    it('should update physical info successfully', async () => {
      service.updatePhysicalInfo.mockResolvedValue({ height: 175 });
      const result = await controller.updatePhysical(
        buildReq() as any,
        USER_ID,
        {} as any,
      );
      expect(result.success).toBe(true);
    });
  });

  describe('updateEducation()', () => {
    it('should update education info successfully', async () => {
      service.updateEducationInfo.mockResolvedValue({
        qualification: 'B.Tech',
      });
      const result = await controller.updateEducation(
        buildReq() as any,
        USER_ID,
        {} as any,
      );
      expect(result.success).toBe(true);
    });
  });

  describe('updateFamily()', () => {
    it('should update family info successfully', async () => {
      service.updateFamilyInfo.mockResolvedValue({ status: 'nuclear' });
      const result = await controller.updateFamily(
        buildReq() as any,
        USER_ID,
        {} as any,
      );
      expect(result.success).toBe(true);
    });
  });

  describe('updatePreferences()', () => {
    it('should update preferences successfully', async () => {
      service.updatePreferences.mockResolvedValue({ ageRange: [22, 30] });
      const result = await controller.updatePreferences(
        buildReq() as any,
        USER_ID,
        {} as any,
      );
      expect(result.success).toBe(true);
    });
  });

  describe('getMyProfile()', () => {
    it('should return the user profile', async () => {
      const profile = { userId: USER_ID, firstName: 'Test' };
      service.getMyProfile.mockResolvedValue(profile);

      const result = await controller.getMyProfile(USER_ID);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(profile);
    });

    it('should return failure when profile not found', async () => {
      service.getMyProfile.mockRejectedValue(new Error('Profile not found'));
      const result = await controller.getMyProfile(USER_ID);
      expect(result.success).toBe(false);
    });
  });

  describe('privacy settings', () => {
    it('should get privacy settings', async () => {
      service.getPrivacySettings.mockResolvedValue({
        profileVisibility: 'public',
      });
      const result = await controller.getPrivacySettings(USER_ID);
      expect(result.success).toBe(true);
    });

    it('should update privacy settings', async () => {
      service.updatePrivacySettings.mockResolvedValue({
        profileVisibility: 'private',
      });
      const req = buildReq();
      const result = await controller.updatePrivacySettings(
        req as any,
        USER_ID,
        {
          profileVisibility: 'private',
        } as any,
      );
      expect(result.success).toBe(true);
    });
  });

  describe('profile images', () => {
    it('should get images', async () => {
      service.getImages.mockResolvedValue([]);
      const result = await controller.getImages(USER_ID);
      expect(result.success).toBe(true);
    });

    it('should upload images', async () => {
      service.addImages.mockResolvedValue({ profileImages: [] });
      const req = buildReq();
      const files = [{ originalname: 'img.jpg' }];
      const result = await controller.addImages(
        req as any,
        USER_ID,
        files as any,
      );
      expect(result.success).toBe(true);
    });

    it('should set primary image', async () => {
      service.setPrimaryImage.mockResolvedValue({});
      const result = await controller.setPrimaryImage(
        buildReq() as any,
        USER_ID,
        'image-id-1',
      );
      expect(result.success).toBe(true);
    });

    it('should remove image', async () => {
      service.removeImage.mockResolvedValue({});
      const result = await controller.removeImage(
        buildReq() as any,
        USER_ID,
        'image-id-1',
      );
      expect(result.success).toBe(true);
    });
  });

  describe('profile videos', () => {
    it('should get videos', async () => {
      service.getVideos.mockResolvedValue([]);
      const result = await controller.getVideos(USER_ID);
      expect(result.success).toBe(true);
    });

    it('should upload videos', async () => {
      service.addVideos.mockResolvedValue({ profileVideos: [] });
      const req = buildReq();
      const files = [{ originalname: 'vid.mp4' }];
      const result = await controller.addVideos(
        req as any,
        USER_ID,
        files as any,
      );
      expect(result.success).toBe(true);
    });

    it('should set primary video', async () => {
      service.setPrimaryVideo.mockResolvedValue({});
      const result = await controller.setPrimaryVideo(
        buildReq() as any,
        USER_ID,
        'video-id-1',
      );
      expect(result.success).toBe(true);
    });

    it('should remove video', async () => {
      service.removeVideo.mockResolvedValue({});
      const result = await controller.removeVideo(
        buildReq() as any,
        USER_ID,
        'video-id-1',
      );
      expect(result.success).toBe(true);
    });
  });
});
