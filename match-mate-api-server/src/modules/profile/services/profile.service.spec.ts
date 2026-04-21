import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { ProfileService } from './profile.service';
import { ProfileRepository } from '../repositories/profile.repository';
import { CACHE_SERVICE } from 'src/modules/cache/cache.interface';
import {
  mockCacheService,
  mockAnalyticsService,
  buildReq,
} from 'src/test/helpers/mock-factory';
import { ActivityLog } from '../schemas/settings/activity-logs.schema';
import { NotificationService } from '../notification/notification.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { StorageService } from '../../storage/storage.service';
import { PrivacySetting } from '../schemas/settings/privacy.schema';

const mockProfileRepository = () => ({
  findByUserId: jest.fn(),
  createProfile: jest.fn(),
  updateProfile: jest.fn(),
  updatePersonalInfo: jest.fn(),
  updatePhysicalInfo: jest.fn(),
  updateEducationInfo: jest.fn(),
  updateFamilyInfo: jest.fn(),
  updatePreferences: jest.fn(),
  getImages: jest.fn(),
  addImages: jest.fn(),
  setPrimaryImage: jest.fn(),
  removeImage: jest.fn(),
  getVideos: jest.fn(),
  addVideos: jest.fn(),
  setPrimaryVideo: jest.fn(),
  removeVideo: jest.fn(),
});

const mockActivityLogModel = () => ({
  create: jest.fn(),
});

const mockNotificationService = () => ({
  notify: jest.fn().mockResolvedValue({}),
});

const mockPrivacySettingModel = () => ({
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  create: jest.fn(),
});

const mockStorageService = () => ({
  uploadFiles: jest.fn(),
  deleteFile: jest.fn(),
});

const USER_ID = 'user-id-1';

describe('ProfileService', () => {
  let service: ProfileService;
  let profileRepo: ReturnType<typeof mockProfileRepository>;
  let cacheService: ReturnType<typeof mockCacheService>;
  let activityLogModel: ReturnType<typeof mockActivityLogModel>;
  let notificationService: ReturnType<typeof mockNotificationService>;
  let analyticsService: ReturnType<typeof mockAnalyticsService>;
  let privacySettingModel: ReturnType<typeof mockPrivacySettingModel>;
  let storageService: ReturnType<typeof mockStorageService>;

  beforeEach(async () => {
    profileRepo = mockProfileRepository();
    cacheService = mockCacheService();
    activityLogModel = mockActivityLogModel();
    notificationService = mockNotificationService();
    analyticsService = mockAnalyticsService();
    privacySettingModel = mockPrivacySettingModel();
    storageService = mockStorageService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: ProfileRepository, useValue: profileRepo },
        { provide: CACHE_SERVICE, useValue: cacheService },
        {
          provide: getModelToken(ActivityLog.name),
          useValue: activityLogModel,
        },
        {
          provide: getModelToken(PrivacySetting.name),
          useValue: privacySettingModel,
        },
        { provide: NotificationService, useValue: notificationService },
        { provide: AnalyticsService, useValue: analyticsService },
        { provide: StorageService, useValue: storageService },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('createProfile()', () => {
    it('should throw BadRequestException if profile already exists', async () => {
      profileRepo.findByUserId.mockResolvedValue({ userId: USER_ID });

      await expect(service.createProfile(USER_ID, {} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create profile when no existing profile', async () => {
      profileRepo.findByUserId.mockResolvedValue(null);
      const created = { userId: USER_ID };
      profileRepo.createProfile.mockResolvedValue(created);

      const dto = {
        personal: {
          profileFor: 'self',
          firstName: 'John',
          gender: 'male',
          dateOfBirth: '1995-01-01',
          religion: 'hindu',
          maritalStatus: 'never_married',
        },
        physical: { height: 175 },
        education: { qualification: 'B.Tech', occupation: 'Engineer' },
      };

      const result = await service.createProfile(USER_ID, dto as any);
      expect(result).toEqual(created);
      expect(profileRepo.createProfile).toHaveBeenCalledWith(
        USER_ID,
        expect.objectContaining({
          personal: expect.objectContaining({
            firstName: 'John',
            age: expect.any(Number),
          }),
          physical: expect.objectContaining({ heightCm: 175 }),
          education: expect.objectContaining({ occupation: 'Engineer' }),
          preferences: { partnerPreference: {} },
          profileCompletionPercentage: 100,
          isActive: true,
        }),
        [],
      );
    });
  });

  describe('updateProfile()', () => {
    it('should update profile and invalidate cache', async () => {
      const updated = { userId: USER_ID, firstName: 'Updated' };
      profileRepo.findByUserId.mockResolvedValue({
        personal: {
          profileFor: 'self',
          firstName: 'John',
          gender: 'male',
          dateOfBirth: new Date('1995-01-01'),
          age: 29,
          religion: 'hindu',
          maritalStatus: 'never_married',
        },
        physical: { heightCm: 175 },
        education: { qualification: 'B.Tech', occupation: 'Engineer' },
        preferences: { partnerPreference: {} },
        profileImages: [],
      });
      profileRepo.updateProfile.mockResolvedValue(updated);
      cacheService.del.mockResolvedValue(undefined);
      activityLogModel.create.mockResolvedValue({});
      notificationService.notify.mockResolvedValue({});
      analyticsService.trackEvent.mockResolvedValue({});

      const result = await service.updateProfile(
        buildReq() as any,
        USER_ID,
        {} as any,
      );

      expect(result).toEqual(
        expect.objectContaining({
          userId: USER_ID,
        }),
      );
      expect(cacheService.del).toHaveBeenCalledWith(`profile:${USER_ID}`);
      expect(activityLogModel.create).toHaveBeenCalled();
      expect(notificationService.notify).toHaveBeenCalled();
      expect(analyticsService.trackEvent).toHaveBeenCalled();
    });

    it('should throw BadRequestException on repository error', async () => {
      profileRepo.findByUserId.mockResolvedValue({
        personal: {
          profileFor: 'self',
          firstName: 'John',
          gender: 'male',
          dateOfBirth: new Date('1995-01-01'),
          age: 29,
          religion: 'hindu',
          maritalStatus: 'never_married',
        },
        physical: { heightCm: 175 },
        education: { qualification: 'B.Tech', occupation: 'Engineer' },
        preferences: { partnerPreference: {} },
        profileImages: [],
      });
      profileRepo.updateProfile.mockRejectedValue(new Error('DB error'));

      await expect(
        service.updateProfile(buildReq() as any, USER_ID, {} as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updatePersonalInfo()', () => {
    it('should delegate to profileRepo', async () => {
      const dto = {
        profileFor: 'self',
        firstName: 'John',
        gender: 'male',
        dateOfBirth: '1995-01-01',
        religion: 'hindu',
        maritalStatus: 'never_married',
      };
      profileRepo.findByUserId.mockResolvedValue({
        personal: dto,
        physical: { heightCm: 175 },
        education: { qualification: 'B.Tech', occupation: 'Engineer' },
        preferences: { partnerPreference: {} },
        profileImages: [],
      });
      profileRepo.updateProfile.mockResolvedValue(dto);
      cacheService.del.mockResolvedValue(undefined);
      activityLogModel.create.mockResolvedValue({});
      notificationService.notify.mockResolvedValue({});
      analyticsService.trackEvent.mockResolvedValue({});

      const result = await service.updatePersonalInfo(
        buildReq() as any,
        USER_ID,
        dto as any,
      );
      expect(profileRepo.updateProfile).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          firstName: 'John',
        }),
      );
    });
  });

  describe('updatePhysicalInfo()', () => {
    it('should delegate to profileRepo', async () => {
      const dto = { height: 175 };
      profileRepo.findByUserId.mockResolvedValue({
        personal: {
          profileFor: 'self',
          firstName: 'John',
          gender: 'male',
          dateOfBirth: new Date('1995-01-01'),
          age: 29,
          religion: 'hindu',
          maritalStatus: 'never_married',
        },
        physical: { heightCm: 170 },
        education: { qualification: 'B.Tech', occupation: 'Engineer' },
        preferences: { partnerPreference: {} },
        profileImages: [],
      });
      profileRepo.updateProfile.mockResolvedValue(dto);
      cacheService.del.mockResolvedValue(undefined);
      activityLogModel.create.mockResolvedValue({});
      notificationService.notify.mockResolvedValue({});
      analyticsService.trackEvent.mockResolvedValue({});

      const result = await service.updatePhysicalInfo(
        buildReq() as any,
        USER_ID,
        dto as any,
      );
      expect(result).toEqual(
        expect.objectContaining({
          height: 175,
        }),
      );
    });
  });

  describe('updateEducationInfo()', () => {
    it('should delegate to profileRepo', async () => {
      profileRepo.findByUserId.mockResolvedValue({
        personal: {
          profileFor: 'self',
          firstName: 'John',
          gender: 'male',
          dateOfBirth: new Date('1995-01-01'),
          age: 29,
          religion: 'hindu',
          maritalStatus: 'never_married',
        },
        physical: { heightCm: 175 },
        education: { qualification: 'B.Tech', occupation: 'Engineer' },
        preferences: { partnerPreference: {} },
        profileImages: [],
      });
      profileRepo.updateProfile.mockResolvedValue({ qualification: 'B.Tech' });
      cacheService.del.mockResolvedValue(undefined);
      activityLogModel.create.mockResolvedValue({});
      notificationService.notify.mockResolvedValue({});
      analyticsService.trackEvent.mockResolvedValue({});
      const result = await service.updateEducationInfo(
        buildReq() as any,
        USER_ID,
        { qualification: 'B.Tech' } as any,
      );
      expect(result).toEqual(
        expect.objectContaining({
          qualification: 'B.Tech',
        }),
      );
    });
  });

  describe('updateFamilyInfo()', () => {
    it('should delegate to profileRepo', async () => {
      profileRepo.findByUserId.mockResolvedValue({
        personal: {
          profileFor: 'self',
          firstName: 'John',
          gender: 'male',
          dateOfBirth: new Date('1995-01-01'),
          age: 29,
          religion: 'hindu',
          maritalStatus: 'never_married',
        },
        physical: { heightCm: 175 },
        education: { qualification: 'B.Tech', occupation: 'Engineer' },
        preferences: { partnerPreference: {} },
        profileImages: [],
      });
      profileRepo.updateProfile.mockResolvedValue({ status: 'nuclear' });
      cacheService.del.mockResolvedValue(undefined);
      activityLogModel.create.mockResolvedValue({});
      notificationService.notify.mockResolvedValue({});
      analyticsService.trackEvent.mockResolvedValue({});
      const result = await service.updateFamilyInfo(
        buildReq() as any,
        USER_ID,
        {} as any,
      );
      expect(result).toEqual(
        expect.objectContaining({
          status: 'nuclear',
        }),
      );
    });
  });

  describe('updatePreferences()', () => {
    it('should delegate to profileRepo', async () => {
      profileRepo.findByUserId.mockResolvedValue({
        personal: {
          profileFor: 'self',
          firstName: 'John',
          gender: 'male',
          dateOfBirth: new Date('1995-01-01'),
          age: 29,
          religion: 'hindu',
          maritalStatus: 'never_married',
        },
        physical: { heightCm: 175 },
        education: { qualification: 'B.Tech', occupation: 'Engineer' },
        preferences: { partnerPreference: {} },
        profileImages: [],
      });
      profileRepo.updateProfile.mockResolvedValue({ ageRange: [22, 30] });
      cacheService.del.mockResolvedValue(undefined);
      activityLogModel.create.mockResolvedValue({});
      notificationService.notify.mockResolvedValue({});
      analyticsService.trackEvent.mockResolvedValue({});
      const result = await service.updatePreferences(
        buildReq() as any,
        USER_ID,
        {} as any,
      );
      expect(result).toEqual(
        expect.objectContaining({
          ageRange: [22, 30],
        }),
      );
    });
  });

  describe('getMyProfile()', () => {
    it('should return cached profile when available', async () => {
      const cached = { userId: USER_ID, firstName: 'Cached' };
      cacheService.get.mockResolvedValue(cached);

      const result = await service.getMyProfile(USER_ID);
      expect(result).toEqual(cached);
      expect(profileRepo.findByUserId).not.toHaveBeenCalled();
    });

    it('should fetch from repo and cache when not in cache', async () => {
      cacheService.get.mockResolvedValue(null);
      const fresh = {
        userId: USER_ID,
        personal: {
          profileFor: 'self',
          firstName: 'Fresh',
          gender: 'male',
          dateOfBirth: new Date('1995-01-01'),
          age: 29,
          religion: 'hindu',
          maritalStatus: 'never_married',
        },
        physical: { heightCm: 175 },
        education: { qualification: 'B.Tech', occupation: 'Engineer' },
        preferences: { partnerPreference: {} },
        profileImages: [],
        profileCompletionPercentage: 100,
        profileScore: 80,
      };
      profileRepo.findByUserId.mockResolvedValue(fresh);
      cacheService.set.mockResolvedValue(undefined);

      const result = await service.getMyProfile(USER_ID);
      expect(result).toEqual(
        expect.objectContaining({
          userId: USER_ID,
          summary: expect.objectContaining({
            profileCompletionPercentage: 100,
          }),
          sections: expect.any(Object),
        }),
      );
      expect(cacheService.set).toHaveBeenCalledWith(
        `profile:${USER_ID}`,
        expect.any(Object),
        expect.any(Number),
      );
    });

    it('should throw when profile does not exist', async () => {
      cacheService.get.mockResolvedValue(null);
      profileRepo.findByUserId.mockResolvedValue(null);

      await expect(service.getMyProfile(USER_ID)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('privacy settings', () => {
    it('should create default privacy settings when missing', async () => {
      privacySettingModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });
      privacySettingModel.create.mockResolvedValue({
        toObject: () => ({ profileVisibility: 'public' }),
      });

      const result = await service.getPrivacySettings(USER_ID);
      expect(result).toEqual(
        expect.objectContaining({ profileVisibility: 'public' }),
      );
    });

    it('should update privacy settings and sync profile flags', async () => {
      privacySettingModel.findOneAndUpdate.mockResolvedValue({
        profileVisibility: 'private',
      });
      profileRepo.updateProfile.mockResolvedValue({});
      cacheService.del.mockResolvedValue(undefined);
      activityLogModel.create.mockResolvedValue({});
      notificationService.notify.mockResolvedValue({});
      analyticsService.trackEvent.mockResolvedValue({});

      const result = await service.updatePrivacySettings(
        buildReq() as any,
        USER_ID,
        {
          profileVisibility: 'private',
          hidePhotos: true,
        },
      );

      expect(result).toEqual(
        expect.objectContaining({ profileVisibility: 'private' }),
      );
      expect(profileRepo.updateProfile).toHaveBeenCalled();
    });
  });

  describe('profile media', () => {
    it('should upload images with storage metadata', async () => {
      storageService.uploadFiles.mockResolvedValue([
        { url: 'https://cdn/img.jpg', filename: 'img.jpg' },
      ]);
      profileRepo.getImages.mockResolvedValue([]);
      profileRepo.addImages.mockResolvedValue({});
      cacheService.del.mockResolvedValue(undefined);
      activityLogModel.create.mockResolvedValue({});
      notificationService.notify.mockResolvedValue({});
      analyticsService.trackEvent.mockResolvedValue({});

      await service.addImages(buildReq() as any, USER_ID, [
        { mimetype: 'image/jpeg' },
      ] as any);
      expect(storageService.uploadFiles).toHaveBeenCalled();
      expect(profileRepo.addImages).toHaveBeenCalled();
    });

    it('should upload videos with storage metadata', async () => {
      storageService.uploadFiles.mockResolvedValue([
        { url: 'https://cdn/video.mp4', filename: 'video.mp4' },
      ]);
      profileRepo.getVideos.mockResolvedValue([]);
      profileRepo.addVideos.mockResolvedValue({});
      cacheService.del.mockResolvedValue(undefined);
      activityLogModel.create.mockResolvedValue({});
      notificationService.notify.mockResolvedValue({});
      analyticsService.trackEvent.mockResolvedValue({});

      await service.addVideos(buildReq() as any, USER_ID, [
        { mimetype: 'video/mp4', size: 1234 },
      ] as any);
      expect(storageService.uploadFiles).toHaveBeenCalled();
      expect(profileRepo.addVideos).toHaveBeenCalled();
    });
  });
});
