/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { FeatureKey, Gender, Permission, PlanTier } from '@/common/enums';
import {
  FEATURE_SEEDS,
  NOTIFICATION_TEMPLATE_SEEDS,
  PLAN_SEEDS,
} from '../data';
import { MasterSeederService } from './master-seeder.service';

jest.mock('bcryptjs', () => ({ hash: jest.fn().mockResolvedValue('hash') }));

const result = { matchedCount: 1, modifiedCount: 1, upsertedCount: 1 };

const query = (value: unknown) => {
  const chain: Record<string, jest.Mock> = {};
  chain.select = jest.fn(() => chain);
  chain.lean = jest.fn().mockResolvedValue(value);
  return chain;
};

const model = () => ({
  bulkWrite: jest.fn().mockResolvedValue(result),
  updateMany: jest.fn().mockResolvedValue(result),
  find: jest.fn(() => query([])),
  findOne: jest.fn(() => query(null)),
});

describe('MasterSeederService', () => {
  const logger = { log: jest.fn(), warn: jest.fn() };
  const permissionModel = model();
  const roleModel = model();
  const planModel = model();
  const featureModel = model();
  const planFeatureModel = model();
  const subscriptionModel = model();
  const templateModel = model();
  const userModel = model();
  const profileModel = model();
  const preferenceModel = model();
  const mediaModel = model();
  const accountModel = model();
  const privacyModel = model();
  const notificationModel = model();
  const communicationModel = model();
  const securityModel = model();
  const localizationModel = model();
  const accessibilityModel = model();
  const mediaSettingsModel = model();
  const aiModel = model();
  const verificationModel = model();

  let service: MasterSeederService;

  beforeEach(() => {
    jest.clearAllMocks();
    for (const item of [
      permissionModel,
      roleModel,
      planModel,
      featureModel,
      planFeatureModel,
      subscriptionModel,
      templateModel,
      userModel,
      profileModel,
      preferenceModel,
      mediaModel,
      accountModel,
      privacyModel,
      notificationModel,
      communicationModel,
      securityModel,
      localizationModel,
      accessibilityModel,
      mediaSettingsModel,
      aiModel,
      verificationModel,
    ]) {
      item.bulkWrite.mockResolvedValue(result);
      item.updateMany.mockResolvedValue(result);
      item.find.mockReturnValue(query([]));
      item.findOne.mockReturnValue(query(null));
    }

    service = new MasterSeederService(
      logger as never,
      permissionModel as never,
      roleModel as never,
      planModel as never,
      featureModel as never,
      planFeatureModel as never,
      subscriptionModel as never,
      templateModel as never,
      userModel as never,
      profileModel as never,
      preferenceModel as never,
      mediaModel as never,
      accountModel as never,
      privacyModel as never,
      notificationModel as never,
      communicationModel as never,
      securityModel as never,
      localizationModel as never,
      accessibilityModel as never,
      mediaSettingsModel as never,
      aiModel as never,
      verificationModel as never,
    );
  });

  it('runs the complete idempotent seed pipeline', async () => {
    permissionModel.find.mockReturnValue(
      query(
        Object.values(Permission).map((name) => ({
          _id: new Types.ObjectId(),
          name,
        })),
      ),
    );
    planModel.find.mockReturnValue(
      query(PLAN_SEEDS.map((plan) => ({ ...plan, _id: new Types.ObjectId() }))),
    );
    const freePlan = {
      ...PLAN_SEEDS.find(({ tier }) => tier === PlanTier.FREE),
      _id: new Types.ObjectId(),
    };
    const reviewerPlan = {
      ...PLAN_SEEDS.find(({ slug }) => slug === 'platinum-yearly'),
      _id: new Types.ObjectId(),
    };
    planModel.findOne.mockImplementation((filter?: unknown) => {
      const slug = (filter as { slug?: string } | undefined)?.slug;
      return query(slug === 'platinum-yearly' ? reviewerPlan : freePlan);
    });
    featureModel.find.mockReturnValue(
      query(
        FEATURE_SEEDS.map((feature) => ({
          ...feature,
          _id: new Types.ObjectId(),
        })),
      ),
    );

    const profiles = (
      service as unknown as {
        buildIndianDummyProfiles(): Array<{ email: string; phone: string }>;
      }
    ).buildIndianDummyProfiles();
    userModel.find
      .mockReturnValueOnce(
        query([
          { email: profiles[0].email, phone: { phone: profiles[0].phone } },
          { email: 'owner@example.com', phone: { phone: profiles[1].phone } },
        ]),
      )
      .mockReturnValueOnce(
        query([
          { _id: new Types.ObjectId(), email: profiles[0].email },
          { _id: new Types.ObjectId(), email: profiles[1].email },
          {
            _id: new Types.ObjectId(),
            email: 'reviewer@webnza.com',
          },
          {
            _id: new Types.ObjectId(),
            email: 'phone-reviewer@webnza.com',
          },
        ]),
      )
      .mockReturnValueOnce(
        query([
          {
            _id: new Types.ObjectId(),
            email: profiles[0].email,
            membership: { tier: 'free' },
          },
          {
            _id: new Types.ObjectId(),
            email: 'reviewer@webnza.com',
            membership: { tier: 'platinum' },
          },
          {
            _id: new Types.ObjectId(),
            email: 'phone-reviewer@webnza.com',
            membership: { tier: 'platinum' },
          },
        ]),
      );

    await service.run();

    expect(permissionModel.bulkWrite).toHaveBeenCalled();
    expect(roleModel.bulkWrite).toHaveBeenCalled();
    expect(planModel.bulkWrite).toHaveBeenCalled();
    expect(featureModel.bulkWrite).toHaveBeenCalled();
    expect(planFeatureModel.bulkWrite).toHaveBeenCalled();
    expect(subscriptionModel.bulkWrite).toHaveBeenCalledWith(
      expect.any(Array),
      { ordered: false },
    );
    expect(templateModel.bulkWrite).toHaveBeenCalled();
    expect(profileModel.bulkWrite).toHaveBeenCalled();
    expect(bcrypt.hash).toHaveBeenCalledWith('Test@125#', 10);
    expect(bcrypt.hash).toHaveBeenCalledWith('Test@123456#', 10);
    expect(subscriptionModel.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: { $in: expect.any(Array) },
        planId: { $ne: reviewerPlan._id },
      }),
      expect.objectContaining({
        $set: expect.objectContaining({
          cancelledReason: 'reviewer_plan_sync',
        }),
      }),
    );
    expect(logger.log).toHaveBeenCalledWith('Master seeder completed');
  });

  it('builds balanced, unique profile fixtures and settings upserts', () => {
    const internals = service as unknown as {
      buildIndianDummyProfiles(): Array<{
        email: string;
        gender: Gender;
        location: { coordinates: number[] };
      }>;
      buildPlayReviewerProfile(): { email: string; personal: object };
      buildPlayPhoneReviewerProfile(): {
        email: string;
        phone: string;
        personal: object;
      };
      buildSettingsUpsert(userId: Types.ObjectId, data?: object): unknown;
      getSeedProfileImageUrl(gender: Gender, index: number): string;
      extractModule(permission: string): string;
      generateDescription(permission: string): string;
    };
    const profiles = internals.buildIndianDummyProfiles();
    const reviewer = internals.buildPlayReviewerProfile();
    const phoneReviewer = internals.buildPlayPhoneReviewerProfile();

    expect(profiles).toHaveLength(500);
    expect(new Set(profiles.map(({ email }) => email)).size).toBe(500);
    expect(reviewer).toMatchObject({
      email: 'reviewer@webnza.com',
      personal: { firstName: 'Play', lastName: 'Reviewer' },
    });
    expect(phoneReviewer).toMatchObject({
      email: 'phone-reviewer@webnza.com',
      phone: '9876543210',
      personal: { firstName: 'Phone', lastName: 'Reviewer' },
    });
    expect(
      profiles.filter(({ gender }) => gender === Gender.FEMALE),
    ).toHaveLength(250);
    expect(
      profiles.every(({ location }) => location.coordinates.length === 2),
    ).toBe(true);
    expect(internals.getSeedProfileImageUrl(Gender.FEMALE, 101)).toContain(
      '/women/1.jpg',
    );
    expect(internals.getSeedProfileImageUrl(Gender.MALE, 2)).toContain(
      '/men/2.jpg',
    );
    expect(internals.extractModule('profile:update')).toBe('profile');
    expect(internals.generateDescription('profile:update_name')).toBe(
      'profile update name',
    );
    expect(
      internals.buildSettingsUpsert(new Types.ObjectId(), { enabled: true }),
    ).toEqual(expect.objectContaining({ updateOne: expect.any(Object) }));
  });

  it('rejects a role policy when its permission seed is missing', async () => {
    permissionModel.find.mockReturnValue(query([]));
    const internals = service as unknown as { seedRoles(): Promise<void> };

    await expect(internals.seedRoles()).rejects.toThrow(
      'Permission seed missing for role policy',
    );
  });

  it('warns for missing plans and features without writing invalid mappings', async () => {
    planModel.find.mockReturnValue(
      query([{ _id: new Types.ObjectId(), name: 'FREE' }]),
    );
    featureModel.find.mockReturnValue(
      query([
        {
          _id: new Types.ObjectId(),
          key: FeatureKey.EMAIL_REGISTRATION,
          type: 'boolean',
        },
      ]),
    );
    const internals = service as unknown as {
      seedPlanFeatures(): Promise<void>;
    };

    await internals.seedPlanFeatures();

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('not found'),
    );
    expect(planFeatureModel.bulkWrite).toHaveBeenCalled();
  });

  it('validates declared notification template variables', () => {
    const internals = service as unknown as {
      validateTemplateVariables(template: object): void;
    };

    expect(() =>
      internals.validateTemplateVariables({
        key: 'VALID',
        title: 'Hello {{ name }} {{name}}',
        variables: ['name'],
      }),
    ).not.toThrow();
    expect(() =>
      internals.validateTemplateVariables({
        key: 'INVALID',
        message: 'Hello {{missing}}',
        variables: [],
      }),
    ).toThrow('Invalid variables in template "INVALID": missing');
  });

  it('supports default template locale and skips an empty template dataset', async () => {
    const internals = service as unknown as {
      seedDefaultTemplates(): Promise<void>;
    };
    const original = [...NOTIFICATION_TEMPLATE_SEEDS];
    const withoutLocale = { ...original[0], locale: undefined };

    NOTIFICATION_TEMPLATE_SEEDS.splice(
      0,
      NOTIFICATION_TEMPLATE_SEEDS.length,
      withoutLocale,
    );
    await internals.seedDefaultTemplates();
    expect(templateModel.bulkWrite).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          updateOne: expect.objectContaining({
            filter: { key: withoutLocale.key, locale: 'en' },
          }),
        }),
      ],
      { ordered: false },
    );

    NOTIFICATION_TEMPLATE_SEEDS.splice(0, NOTIFICATION_TEMPLATE_SEEDS.length);
    await internals.seedDefaultTemplates();
    expect(logger.log).toHaveBeenCalledWith(
      'Skipping notification template seeding',
    );

    NOTIFICATION_TEMPLATE_SEEDS.splice(0, 0, ...original);
  });
});
