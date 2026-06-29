/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import { CuratedMatchStatus } from '../enums/match.enums';
import { PremiumMatchCuratorService } from './premium-match-curator.service';

describe('PremiumMatchCuratorService', () => {
  const model = {
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };
  const discoveryRepo = {
    getProfile: jest.fn(),
    getPreference: jest.fn(),
    getActiveMediaByUserIds: jest.fn(),
    getPreferencesByUserIds: jest.fn(),
  };
  const compatibilityService = {
    calculateMutualCompatibility: jest.fn(),
  };

  let service: PremiumMatchCuratorService;
  let curatorId: string;
  let userId: string;
  let profileUserId: string;
  let curatedMatchId: string;

  const execChain = (value: unknown) => ({
    lean: () => ({ exec: jest.fn().mockResolvedValue(value) }),
  });

  const findChain = (value: unknown) => ({
    sort: () => ({
      skip: () => ({
        limit: () => execChain(value),
      }),
      limit: () => execChain(value),
    }),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    curatorId = new Types.ObjectId().toString();
    userId = new Types.ObjectId().toString();
    profileUserId = new Types.ObjectId().toString();
    curatedMatchId = new Types.ObjectId().toString();
    discoveryRepo.getActiveMediaByUserIds.mockResolvedValue([]);
    discoveryRepo.getPreferencesByUserIds.mockResolvedValue([]);
    compatibilityService.calculateMutualCompatibility.mockReturnValue({
      score: 80,
    });
    service = new PremiumMatchCuratorService(
      model as never,
      discoveryRepo as never,
      compatibilityService as never,
    );
  });

  it('rejects self-curation and missing profiles', async () => {
    await expect(
      service.curateMatch(curatorId, {
        userId,
        profileUserId: userId,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.MATCH_CANNOT_MATCH_SELF });

    discoveryRepo.getProfile.mockResolvedValue(null);
    await expect(
      service.curateMatch(curatorId, { userId, profileUserId }),
    ).rejects.toMatchObject({ code: ErrorCode.PROFILE_NOT_FOUND });

    discoveryRepo.getProfile
      .mockResolvedValueOnce({ userId: new Types.ObjectId(userId) })
      .mockResolvedValueOnce(null);
    await expect(
      service.curateMatch(curatorId, { userId, profileUserId }),
    ).rejects.toMatchObject({ code: ErrorCode.PROFILE_NOT_FOUND });
  });

  it('upserts curated matches with default and explicit priority', async () => {
    discoveryRepo.getProfile.mockImplementation((id: string) =>
      Promise.resolve({ userId: new Types.ObjectId(id) }),
    );
    const saved = { _id: new Types.ObjectId(curatedMatchId) };
    model.findOneAndUpdate.mockReturnValue(execChain(saved));

    await expect(
      service.curateMatch(curatorId, { userId, profileUserId }),
    ).resolves.toBe(saved);
    expect(model.findOneAndUpdate).toHaveBeenLastCalledWith(
      expect.any(Object),
      expect.objectContaining({
        $set: expect.objectContaining({ priority: 0 }),
      }),
      expect.objectContaining({ upsert: true }),
    );

    await service.curateMatch(curatorId, {
      userId,
      profileUserId,
      priority: 90,
      note: 'Excellent fit',
      expiresAt: new Date('2026-12-01'),
    });
    expect(model.findOneAndUpdate).toHaveBeenLastCalledWith(
      expect.any(Object),
      expect.objectContaining({
        $set: expect.objectContaining({ priority: 90, note: 'Excellent fit' }),
      }),
      expect.any(Object),
    );
  });

  it('requires the member profile before returning curated matches', async () => {
    model.find.mockReturnValue(findChain([]));
    model.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(0),
    });
    discoveryRepo.getProfile.mockResolvedValue(null);
    discoveryRepo.getPreference.mockResolvedValue(null);

    await expect(service.getCuratedMatches(userId, {})).rejects.toMatchObject({
      code: ErrorCode.PROFILE_NOT_FOUND,
    });
  });

  it('enriches, orders, and paginates curated matches', async () => {
    const secondId = new Types.ObjectId().toString();
    const firstCuratedId = new Types.ObjectId();
    const secondCuratedId = new Types.ObjectId();
    const curatedRows = [
      {
        _id: firstCuratedId,
        userId: new Types.ObjectId(userId),
        profileUserId: new Types.ObjectId(profileUserId),
        curatedById: new Types.ObjectId(curatorId),
        priority: 10,
        note: 'First',
      },
      {
        _id: secondCuratedId,
        userId: new Types.ObjectId(userId),
        profileUserId: new Types.ObjectId(secondId),
        curatedById: new Types.ObjectId(curatorId),
        priority: 80,
        expiresAt: new Date('2027-01-01'),
      },
    ];
    model.find.mockReturnValue(findChain(curatedRows));
    model.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(3),
    });
    const myProfile = { userId: new Types.ObjectId(userId) };
    discoveryRepo.getPreference.mockResolvedValue({ filters: {} });
    discoveryRepo.getProfile.mockImplementation((id: string) => {
      if (id === userId) return Promise.resolve(myProfile);
      if (id === profileUserId) {
        return Promise.resolve({ userId: new Types.ObjectId(profileUserId) });
      }
      return Promise.resolve({ userId: new Types.ObjectId(secondId) });
    });
    discoveryRepo.getActiveMediaByUserIds.mockResolvedValue([
      { userId: new Types.ObjectId(profileUserId), url: 'one' },
      { userId: new Types.ObjectId(profileUserId), url: 'two' },
    ]);
    discoveryRepo.getPreferencesByUserIds.mockResolvedValue([
      { userId: new Types.ObjectId(profileUserId), filters: {} },
    ]);

    await expect(
      service.getCuratedMatches(userId, { page: 2, limit: 2 }),
    ).resolves.toMatchObject({
      success: true,
      data: [
        expect.objectContaining({
          userId: new Types.ObjectId(secondId),
          curation: expect.objectContaining({ priority: 80 }),
          images: [],
        }),
        expect.objectContaining({
          userId: new Types.ObjectId(profileUserId),
          curation: expect.objectContaining({ priority: 10 }),
          images: [
            expect.objectContaining({ url: 'one' }),
            expect.objectContaining({ url: 'two' }),
          ],
        }),
      ],
      meta: {
        total: 3,
        page: 2,
        limit: 2,
        totalPages: 2,
        hasNextPage: false,
        hasPrevPage: true,
      },
    });
  });

  it('filters missing profiles and tolerates unmatched enrichment output', async () => {
    const unexpectedId = new Types.ObjectId().toString();
    const secondUnexpectedId = new Types.ObjectId().toString();
    const curatedRow = {
      _id: new Types.ObjectId(curatedMatchId),
      userId: new Types.ObjectId(userId),
      profileUserId: new Types.ObjectId(profileUserId),
      curatedById: new Types.ObjectId(curatorId),
      priority: undefined,
    };
    const secondCuratedRow = {
      ...curatedRow,
      _id: new Types.ObjectId(),
      profileUserId: new Types.ObjectId(),
    };
    model.find.mockReturnValue(findChain([curatedRow, secondCuratedRow]));
    model.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(2),
    });
    discoveryRepo.getPreference.mockResolvedValue(null);
    discoveryRepo.getProfile
      .mockResolvedValueOnce({ userId: new Types.ObjectId(userId) })
      .mockResolvedValueOnce({ userId: new Types.ObjectId(unexpectedId) })
      .mockResolvedValueOnce({
        userId: new Types.ObjectId(secondUnexpectedId),
      });

    await expect(service.getCuratedMatches(userId, {})).resolves.toMatchObject({
      data: [
        expect.objectContaining({ curation: undefined }),
        expect.objectContaining({ curation: undefined }),
      ],
      meta: expect.objectContaining({ hasNextPage: false, hasPrevPage: false }),
    });

    discoveryRepo.getProfile
      .mockReset()
      .mockResolvedValueOnce({ userId: new Types.ObjectId(userId) })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    await expect(service.getCuratedMatches(userId, {})).resolves.toMatchObject({
      data: [],
    });
  });

  it('dismisses and expires curated matches with not-found handling', async () => {
    model.findOneAndUpdate.mockReturnValue(execChain(null));
    await expect(
      service.dismissCuratedMatch(userId, curatedMatchId),
    ).rejects.toMatchObject({ code: ErrorCode.MATCH_NOT_FOUND });
    const dismissed = { status: CuratedMatchStatus.DISMISSED };
    model.findOneAndUpdate.mockReturnValue(execChain(dismissed));
    await expect(
      service.dismissCuratedMatch(userId, curatedMatchId),
    ).resolves.toBe(dismissed);

    model.findByIdAndUpdate.mockReturnValue(execChain(null));
    await expect(
      service.expireCuratedMatch(curatedMatchId),
    ).rejects.toMatchObject({
      code: ErrorCode.MATCH_NOT_FOUND,
    });
    const expired = { status: CuratedMatchStatus.EXPIRED };
    model.findByIdAndUpdate.mockReturnValue(execChain(expired));
    await expect(service.expireCuratedMatch(curatedMatchId)).resolves.toBe(
      expired,
    );
  });

  it('lists all or member-specific admin rows with bounded limits', async () => {
    model.find.mockReturnValue(findChain([{ id: 1 }]));
    await expect(service.getAdminCuratedMatches()).resolves.toEqual([
      { id: 1 },
    ]);
    expect(model.find).toHaveBeenLastCalledWith({});

    await service.getAdminCuratedMatches(userId, 500);
    expect(model.find).toHaveBeenLastCalledWith({
      userId: new Types.ObjectId(userId),
    });
    await service.getAdminCuratedMatches(undefined, -1);
  });
});
