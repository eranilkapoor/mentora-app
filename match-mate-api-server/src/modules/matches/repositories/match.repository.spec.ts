/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Types } from 'mongoose';
import { InterestStatus } from '../enums/match.enums';
import { MatchRepository } from './match.repository';

const userId = new Types.ObjectId().toString();
const targetId = new Types.ObjectId().toString();
const otherId = new Types.ObjectId().toString();

const fluent = (initial: unknown = []) => {
  let value = initial;
  const query: Record<string, jest.Mock> & { setValue(value: unknown): void } =
    {
      setValue(next: unknown) {
        value = next;
      },
    } as never;
  for (const method of ['lean', 'sort', 'skip', 'limit', 'select']) {
    query[method] = jest.fn(() => query);
  }
  query.exec = jest.fn(() => Promise.resolve(value));
  query.then = jest.fn((resolve) => Promise.resolve(value).then(resolve));
  return query;
};

describe('MatchRepository', () => {
  const interestQuery = fluent([]);
  const matchDocument = { toObject: () => ({ _id: new Types.ObjectId() }) };
  const matchQuery = fluent(matchDocument);
  const profileQuery = fluent([]);
  const preferenceQuery = fluent({});
  const mediaQuery = fluent([]);
  const interactionQuery = fluent([]);
  const interestModel = {
    create: jest
      .fn()
      .mockResolvedValue({ toObject: () => ({ id: 'interest' }) }),
    findOne: jest.fn(() => interestQuery),
    findById: jest.fn(() => interestQuery),
    findByIdAndUpdate: jest.fn(() => interestQuery),
    findByIdAndDelete: jest.fn(() => interestQuery),
    find: jest.fn(() => interestQuery),
    countDocuments: jest.fn().mockResolvedValue(1),
  };
  const matchModel = {
    findOneAndUpdate: jest.fn(() => matchQuery),
    find: jest.fn(() => matchQuery),
    countDocuments: jest.fn().mockResolvedValue(1),
    findOne: jest.fn(() => matchQuery),
    updateMany: jest
      .fn()
      .mockResolvedValue({ matchedCount: 1, modifiedCount: 1 }),
  };
  const profileModel = {
    findOne: jest.fn(() => profileQuery),
    find: jest.fn(() => profileQuery),
  };
  const preferenceModel = { findOne: jest.fn(() => preferenceQuery) };
  const mediaModel = { find: jest.fn(() => mediaQuery) };
  const interactionModel = {
    findOneAndUpdate: jest.fn(() => interactionQuery),
    findOneAndDelete: jest.fn(() => interactionQuery),
    find: jest.fn(() => interactionQuery),
    countDocuments: jest.fn().mockResolvedValue(1),
  };
  let repository: MatchRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    interestQuery.setValue([]);
    matchQuery.setValue(matchDocument);
    profileQuery.setValue([]);
    preferenceQuery.setValue({});
    mediaQuery.setValue([]);
    interactionQuery.setValue([]);
    repository = new MatchRepository(
      interestModel as never,
      matchModel as never,
      profileModel as never,
      preferenceModel as never,
      mediaModel as never,
      interactionModel as never,
    );
  });

  it('covers interest and match creation lifecycle', async () => {
    await repository.sendInterest(userId, targetId);
    await repository.getExistingInterest(userId, targetId);
    await repository.getInterestById('interest');
    await repository.updateInterestStatus('interest', InterestStatus.ACCEPTED);
    await repository.deleteInterest('interest');
    await repository.createMatch(userId, targetId);
    await repository.createMatch(userId, targetId, new Date());
    await repository.getMatchBetweenUsers(userId, targetId);
    await repository.unmatchUsers(userId, targetId);
    await repository.unmatchUsers(userId, targetId, 'not compatible');
    expect(matchModel.findOneAndUpdate).toHaveBeenCalledTimes(4);
  });

  it('covers match, interest, viewer, and shortlist filters with exclusions', async () => {
    await repository.getMatchesForUser(userId);
    await repository.getReceivedInterests(userId);
    await repository.countReceivedInterests(userId);
    await repository.getSentInterests(userId);
    await repository.countSentInterests(userId);
    await repository.getProfileViewers(userId);
    await repository.countProfileViewers(userId);
    await repository.countShortlisted(userId);
    for (const excluded of [[], [otherId, 'invalid', otherId]]) {
      await repository.getMatchesForUser(userId, 0, 10, excluded);
      await repository.countMatchesForUserExcluding(userId, excluded);
      await repository.getReceivedInterests(userId, 0, 10, excluded);
      await repository.countReceivedInterests(userId, excluded);
      await repository.getSentInterests(userId, 0, 10, excluded);
      await repository.countSentInterests(userId, excluded);
      await repository.getProfileViewers(userId, 0, 10, excluded);
      await repository.countProfileViewers(userId, excluded);
      await repository.countShortlisted(userId, excluded);
    }
    await repository.countMatchesForUser(userId);
    expect(matchModel.countDocuments).toHaveBeenCalled();
  });

  it('covers profile, preference, media, and shortlist persistence', async () => {
    await repository.getProfileByUserId(userId);
    await repository.getPreferenceByUserId(userId);
    await repository.getProfilesByUserIds([userId, userId, targetId]);
    await repository.getActiveMediaByUserIds([userId, userId]);
    await repository.getActiveMediaByUserId(userId);
    await repository.addShortlist(userId, targetId);
    await repository.removeShortlist(userId, targetId);
    await repository.recordProfileView(userId, targetId);
    expect(profileModel.find).toHaveBeenCalled();
    expect(mediaModel.find).toHaveBeenCalledTimes(2);
  });

  it('skips or performs overdue match expiry', async () => {
    matchQuery.setValue([]);
    await expect(repository.expireMatches(new Date())).resolves.toEqual({
      matchedCount: 0,
      modifiedCount: 0,
    });
    matchQuery.setValue([{ _id: new Types.ObjectId() }]);
    await expect(repository.expireMatches(new Date(), 5)).resolves.toEqual({
      matchedCount: 1,
      modifiedCount: 1,
    });
  });

  it('returns stats and ordered shortlisted identities/profiles', async () => {
    await repository.getStats(userId);
    await repository.getStats(userId, [otherId]);

    interactionQuery.setValue([
      { toUserId: new Types.ObjectId(targetId) },
      { toUserId: new Types.ObjectId(otherId) },
    ]);
    await expect(repository.getShortlistedUserIds(userId)).resolves.toEqual([
      targetId,
      otherId,
    ]);

    profileQuery.setValue([
      { userId: new Types.ObjectId(otherId), name: 'Other' },
    ]);
    await expect(
      repository.getShortlistedProfiles(userId, 0, 10),
    ).resolves.toEqual([expect.objectContaining({ name: 'Other' })]);
    await repository.getShortlistedProfiles(userId, 0, 10, [otherId]);
    await repository.getShortlistedProfiles(userId);
  });
});
