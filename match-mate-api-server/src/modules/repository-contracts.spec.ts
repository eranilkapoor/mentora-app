/* eslint-disable @typescript-eslint/no-floating-promises, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import { Types } from 'mongoose';
import { MediaType, ProfileStatus } from '@/common/enums';
import { AdminRepository } from './admin/repositories/admin.repository';
import { AnalyticsRepository } from './analytics/repositories/analytics.repository';
import { UserRepository } from './auth/repositories/user.repository';
import { MediaModerationStatus } from './profiles/enums/profile-media.enums';
import { MediaRepository } from './profiles/repositories/media.repository';
import { PreferenceRepository } from './profiles/repositories/preference.repository';
import { ProfileRepository } from './profiles/repositories/profile.repository';
import { MatchDiscoveryRepository } from './matches/repositories/match-discovery.repository';
import { SupportTicketRepository } from './support/repositories/support-ticket.repository';

const objectId = new Types.ObjectId().toString();

const fluent = (value: unknown = { ok: true }) => {
  const query: Record<string, jest.Mock> = {};
  for (const method of [
    'select',
    'skip',
    'limit',
    'sort',
    'populate',
    'lean',
  ]) {
    query[method] = jest.fn(() => query);
  }
  query.exec = jest.fn().mockResolvedValue(value);
  query.then = jest.fn((resolve) => Promise.resolve(value).then(resolve));
  return query;
};

describe('remaining repository contracts', () => {
  describe('AdminRepository', () => {
    const query = fluent([]);
    const model = {
      find: jest.fn(() => query),
      countDocuments: jest.fn().mockResolvedValue(2),
      findById: jest.fn(() => query),
      findByIdAndUpdate: jest.fn().mockResolvedValue({ status: 'active' }),
    };
    const repository = new AdminRepository(model as never);

    it('delegates list, broadcast, count, detail, and status operations', async () => {
      await repository.findUsers({}, 2, 5);
      await repository.findUsersForBroadcast({}, 10);
      await repository.countUsers({});
      await repository.findUserById(objectId);
      await repository.updateUserStatus(objectId, {
        status: 'active' as never,
      });
      await repository.findUsers({});
      await repository.findUsersForBroadcast({});
      expect(model.find).toHaveBeenCalledTimes(4);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        objectId,
        { $set: { status: 'active' } },
        { new: true, runValidators: true },
      );
    });
  });

  describe('UserRepository', () => {
    const query = fluent({ id: objectId });
    const model = {
      create: jest.fn().mockResolvedValue({ id: objectId }),
      findOne: jest.fn(() => query),
      findById: jest.fn(() => query),
      findByIdAndUpdate: jest.fn().mockResolvedValue({ id: objectId }),
      updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };
    const repository = new UserRepository(model as never);

    it('delegates every user persistence operation', async () => {
      await repository.create({ email: 'a@example.com' });
      await repository.findByEmail('a@example.com');
      await repository.findById(objectId);
      await repository.findByProvider('google', 'g1');
      await repository.findByPhone('9999999999');
      await repository.findByIdWithRoles(objectId);
      await repository.update(objectId, { email: 'updated@example.com' });
      await repository.updateMembership(objectId, { tier: 'gold' } as never);
      await repository.expireMemberships([objectId], new Date());
      await repository.expireMemberships([], new Date());
      expect(query.populate).toHaveBeenCalled();
      expect(query.select).toHaveBeenCalledWith('+authAccounts.passwordHash');
      expect(model.findByIdAndUpdate).toHaveBeenCalledTimes(2);
      expect(model.updateMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('AnalyticsRepository', () => {
    const eventModel = {
      create: jest.fn(),
      aggregate: jest.fn(),
      countDocuments: jest.fn(),
      distinct: jest.fn(),
    };
    const query = fluent([]);
    const summaryModel = {
      findOneAndUpdate: jest.fn(() => query),
      findOne: jest.fn(() => query),
      find: jest.fn(() => query),
    };
    const repository = new AnalyticsRepository(
      eventModel as never,
      summaryModel as never,
    );

    it('delegates events and builds daily-summary date filters', async () => {
      repository.create({});
      repository.aggregate([]);
      repository.count({});
      repository.distinctUsers({});
      await repository.upsertDailySummary({ day: '2026-06-30' });
      await repository.getDailySummaryByDay('2026-06-30');
      await repository.getDailySummaries({ limit: 10 });
      await repository.getDailySummaries({
        from: new Date('2026-06-01T00:00:00Z'),
        to: new Date('2026-06-30T00:00:00Z'),
        limit: 20,
      });
      await repository.getDailySummaries({
        from: new Date('2026-06-01T00:00:00Z'),
        limit: 20,
      });
      await repository.getDailySummaries({
        to: new Date('2026-06-30T00:00:00Z'),
        limit: 20,
      });
      expect(summaryModel.find).toHaveBeenNthCalledWith(1, {});
      expect(summaryModel.find).toHaveBeenNthCalledWith(2, {
        day: { $gte: '2026-06-01', $lte: '2026-06-30' },
      });
    });
  });

  describe('PreferenceRepository', () => {
    const model = {
      findOne: jest.fn(() => fluent()),
      findOneAndUpdate: jest.fn().mockResolvedValue({ ok: true }),
    };
    const repository = new PreferenceRepository(model as never);

    it('merges defined preference fields and delegates every update', async () => {
      await repository.findByUserId(objectId);
      await repository.upsert(objectId, {});
      await repository.updateFilters(objectId, {
        minAge: 20,
        maxAge: undefined,
      } as never);
      await repository.updateSettings(objectId, {
        dailyMatchLimit: 5,
        autoMatch: undefined,
      } as never);
      await repository.updateWeights(objectId, {
        location: 10,
        education: undefined,
      } as never);
      await repository.updateAboutPartner(objectId, 'Kind and thoughtful');
      expect(model.findOneAndUpdate).toHaveBeenCalledTimes(5);
    });
  });

  describe('ProfileRepository', () => {
    const query = fluent([]);
    const model = {
      create: jest.fn(),
      findOne: jest.fn(() => query),
      findOneAndUpdate: jest.fn(),
      countDocuments: jest.fn(),
      find: jest.fn(() => query),
      updateMany: jest.fn(),
    };
    const repository = new ProfileRepository(model as never);

    it('creates, reads, updates, checks, and soft-deletes profiles', async () => {
      model.create.mockResolvedValue({ id: objectId });
      model.findOneAndUpdate.mockResolvedValue({ id: objectId });
      model.countDocuments.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
      await repository.create(objectId, { firstName: 'Asha' });
      await repository.findByUserId(objectId);
      await repository.update(objectId, { firstName: 'Anita' });
      await expect(repository.exists(objectId)).resolves.toBe(true);
      await expect(repository.exists(objectId)).resolves.toBe(false);
      await repository.softDelete(objectId);
    });

    it.each([new Error('failed'), 'failed'])(
      'normalizes profile create, read, and update errors',
      async (error) => {
        model.create.mockRejectedValueOnce(error);
        await expect(repository.create(objectId, {})).rejects.toThrow(
          error instanceof Error ? 'failed' : 'Unknown error',
        );
        query.then.mockImplementationOnce((_resolve, reject) => reject(error));
        await expect(repository.findByUserId(objectId)).rejects.toThrow();
        model.findOneAndUpdate.mockRejectedValueOnce(error);
        await expect(repository.update(objectId, {})).rejects.toThrow();
      },
    );

    it('skips or executes inactive-profile archival', async () => {
      query.exec
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ _id: new Types.ObjectId() }]);
      model.updateMany.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
      await expect(repository.archiveInactive(new Date(), 10)).resolves.toEqual(
        { matchedCount: 0, modifiedCount: 0 },
      );
      await expect(repository.archiveInactive(new Date(), 10)).resolves.toEqual(
        { matchedCount: 1, modifiedCount: 1 },
      );
      expect(model.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ status: ProfileStatus.ACTIVE }),
        expect.any(Object),
      );
    });
  });

  describe('MediaRepository', () => {
    const query = fluent([]);
    const model = {
      insertMany: jest.fn(),
      find: jest.fn(() => query),
      findById: jest.fn(() => query),
      findByIdAndUpdate: jest.fn(() => query),
      findOneAndUpdate: jest.fn(() => query),
      updateMany: jest.fn(),
      findByIdAndDelete: jest.fn(() => query),
      countDocuments: jest.fn(),
    };
    const repository = new MediaRepository(model as never);

    it('creates active and flagged media and delegates lifecycle operations', async () => {
      await repository.create(objectId, [
        { url: 'a.jpg', isPrimary: true, type: MediaType.IMAGE },
        {
          url: 'b.jpg',
          isPrimary: false,
          type: MediaType.IMAGE,
          moderationStatus: MediaModerationStatus.FLAGGED,
        },
      ]);
      await repository.findAllByUser(objectId, MediaType.IMAGE);
      await repository.findAllByUser('invalid', MediaType.IMAGE);
      await repository.findById(objectId);
      await repository.getReviewQueue();
      await repository.getReviewQueue(5);
      await repository.review(objectId, objectId, true, 'ok');
      await repository.review(objectId, objectId, false);
      await repository.setPrimary(objectId, objectId, MediaType.IMAGE);
      await repository.softDelete(objectId);
      await repository.findDeletedOlderThan(new Date());
      await repository.findDeletedOlderThan(new Date(), 5);
      await repository.hardDelete(objectId);
      await repository.countByUser(objectId, MediaType.IMAGE);
      model.countDocuments.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
      await expect(
        repository.hasPrimary(objectId, MediaType.IMAGE),
      ).resolves.toBe(true);
      await expect(
        repository.hasPrimary(objectId, MediaType.IMAGE),
      ).resolves.toBe(false);
      expect(model.insertMany).toHaveBeenCalled();
    });
  });

  describe('SupportTicketRepository', () => {
    const query = fluent([]);
    const model = {
      create: jest.fn(),
      find: jest.fn(() => query),
      countDocuments: jest.fn().mockResolvedValue(1),
      findOne: jest.fn(() => query),
      findOneAndUpdate: jest.fn(() => query),
    };
    const repository = new SupportTicketRepository(model as never);

    it('covers ticket creation, listing, replies, closure, and status changes', async () => {
      await repository.create({
        userId: objectId,
        subject: 'Help',
        category: 'technical' as never,
        priority: 'high' as never,
        message: 'Need help',
      });
      await repository.listForUser(objectId, 1, 10);
      await repository.listForUser(objectId, 1, 10, 'open');
      await repository.listAll(1, 10, {});
      await repository.listAll(1, 10, {
        status: 'open',
        priority: 'high' as never,
      });
      await expect(
        repository.findForUser('invalid', objectId),
      ).resolves.toBeNull();
      await repository.findForUser(objectId, objectId);
      await repository.addUserReply(objectId, objectId, 'reply');
      await repository.closeForUser(objectId, objectId);
      await repository.addAgentReply(objectId, objectId, 'agent reply');
      await repository.updateStatus(objectId, 'resolved');
      await repository.updateStatus(objectId, 'closed');
      await repository.updateStatus(objectId, 'open');
      expect(model.findOneAndUpdate).toHaveBeenCalledTimes(6);
    });
  });

  describe('MatchDiscoveryRepository', () => {
    const profileQuery = fluent([]);
    const preferenceQuery = fluent([]);
    const mediaQuery = fluent([]);
    const interestQuery = fluent([]);
    const profileModel = {
      findOne: jest.fn(() => profileQuery),
      find: jest.fn(() => profileQuery),
      countDocuments: jest.fn(() => ({ exec: jest.fn().mockResolvedValue(2) })),
    };
    const preferenceModel = {
      findOne: jest.fn(() => preferenceQuery),
      find: jest.fn(() => preferenceQuery),
    };
    const mediaModel = { find: jest.fn(() => mediaQuery) };
    const interestModel = { find: jest.fn(() => interestQuery) };
    const verificationModel = { distinct: jest.fn().mockResolvedValue([]) };
    const repository = new MatchDiscoveryRepository(
      profileModel as never,
      preferenceModel as never,
      mediaModel as never,
      interestModel as never,
      {} as never,
      verificationModel as never,
    );

    it('covers discovery reads, filtering, pagination, geo search, and media', async () => {
      repository.getVerifiedUserIds();
      await repository.getProfile(objectId);
      await repository.getPreference(objectId);
      await expect(
        repository.getPreferencesByUserIds(['invalid']),
      ).resolves.toEqual([]);
      await repository.getPreferencesByUserIds([objectId, 'invalid']);
      interestQuery.exec
        .mockResolvedValueOnce([{ receiverId: new Types.ObjectId() }])
        .mockResolvedValueOnce([{ senderId: new Types.ObjectId() }]);
      await repository.getInteractedUserIds(objectId);
      profileQuery.exec.mockResolvedValueOnce([
        { userId: new Types.ObjectId(objectId) },
      ]);
      await repository.getActiveDiscoveryUserIds();
      await repository.getActiveDiscoveryUserIds(5);
      await repository.findProfiles({}, 0, 10);
      await repository.findProfiles({}, 0, 10, { lastActiveAt: 1 });
      await repository.findNearbyProfiles({}, [77, 28], 1000, 0, 10);
      await expect(
        repository.getActiveMediaByUserIds(['invalid']),
      ).resolves.toEqual([]);
      await repository.getActiveMediaByUserIds([objectId]);
      expect(profileModel.find).toHaveBeenCalled();
      expect(mediaModel.find).toHaveBeenCalled();
    });
  });
});
