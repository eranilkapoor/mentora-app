import { Types } from 'mongoose';
import { SettingsRepository } from './settings.repository';

const userId = new Types.ObjectId().toString();
const targetId = new Types.ObjectId().toString();

const fluent = (value: unknown = { enabled: true }) => {
  const query: Record<string, jest.Mock> = {};
  for (const method of ['lean', 'select', 'sort']) {
    query[method] = jest.fn(() => query);
  }
  query.exec = jest.fn().mockResolvedValue(value);
  return query;
};

const model = () => {
  const query = fluent();
  return {
    query,
    findOneAndUpdate: jest.fn(() => query),
    deleteOne: jest.fn(() => ({
      exec: jest
        .fn()
        .mockResolvedValue({ acknowledged: true, deletedCount: 1 }),
    })),
    find: jest.fn(() => query),
    findOne: jest.fn(() => query),
  };
};

describe('SettingsRepository', () => {
  const models = Array.from({ length: 11 }, model);
  let repository: SettingsRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    for (const item of models) {
      item.query.exec.mockResolvedValue({ enabled: true });
    }
    repository = new SettingsRepository(
      models[0] as never,
      models[1] as never,
      models[2] as never,
      models[3] as never,
      models[4] as never,
      models[5] as never,
      models[6] as never,
      models[7] as never,
      models[8] as never,
      models[9] as never,
      models[10] as never,
    );
  });

  it('returns existing notification settings or creates defaults', async () => {
    await expect(repository.getOrCreateUserSettings(userId)).resolves.toEqual({
      enabled: true,
    });
    models[2].query.exec
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ pushEnabled: true });
    await expect(repository.getOrCreateUserSettings(userId)).resolves.toEqual({
      pushEnabled: true,
    });
  });

  it('creates and returns all nine settings documents', async () => {
    await expect(
      repository.getOrCreateAllUserSettings(userId),
    ).resolves.toEqual(
      expect.objectContaining({
        account: { enabled: true },
        privacy: { enabled: true },
        notification: { enabled: true },
        ai: { enabled: true },
      }),
    );
  });

  it('delegates every getter and combines missing values safely', async () => {
    await repository.getAccount(userId);
    await repository.getPrivacy(userId);
    await repository.getNotification(userId);
    await repository.getCommunication(userId);
    await repository.getSecurity(userId);
    await repository.getLocalization(userId);
    await repository.getAccessibility(userId);
    await repository.getMedia(userId);
    await repository.getAi(userId);

    for (const item of models.slice(0, 9))
      item.query.exec.mockResolvedValueOnce(null);
    await expect(repository.getAllSettings(userId)).resolves.toEqual({
      account: {},
      privacy: {},
      notification: {},
      communication: {},
      security: {},
      localization: {},
      accessibility: {},
      media: {},
      ai: {},
    });
  });

  it('flattens nested update data while preserving scalar-like values', async () => {
    const date = new Date();
    const id = new Types.ObjectId();
    await repository.updateAccount(userId, {
      nested: { child: true },
      nullable: null,
      values: ['a'],
      objectId: id,
      changedAt: date,
    } as never);
    await repository.updatePrivacy(userId, {});
    await repository.updateCommunication(userId, {});
    await repository.updateSecurity(userId, {});
    await repository.updateLocalization(userId, {});
    await repository.updateAccessibility(userId, {});
    await repository.updateMedia(userId, {});
    await repository.updateAi(userId, {});

    expect(models[0].findOneAndUpdate).toHaveBeenCalledWith(
      expect.any(Object),
      {
        $set: {
          'nested.child': true,
          nullable: null,
          values: ['a'],
          objectId: id,
          changedAt: date,
        },
      },
      expect.any(Object),
    );
  });

  it('returns notification updates and rejects an absent updated document', async () => {
    await expect(repository.updateNotification(userId, {})).resolves.toEqual({
      enabled: true,
    });
    models[2].query.exec.mockResolvedValueOnce(null);
    await expect(repository.updateNotification(userId, {})).rejects.toThrow(
      'Failed to update notification settings',
    );
  });

  it('covers block and hidden-profile lifecycle and relation directions', async () => {
    repository.blockUser(userId, targetId);
    await repository.unblockUser(userId, targetId);
    await repository.getBlockedUsers(userId);
    models[9].query.exec.mockResolvedValueOnce([
      {
        userId: new Types.ObjectId(userId),
        blockedUserId: new Types.ObjectId(targetId),
      },
      {
        userId: new Types.ObjectId(targetId),
        blockedUserId: new Types.ObjectId(userId),
      },
    ]);
    await expect(repository.getBlockedRelationUserIds(userId)).resolves.toEqual(
      [targetId],
    );
    models[9].query.exec.mockResolvedValueOnce({ id: 'block' });
    await expect(repository.isBlockedBetween(userId, targetId)).resolves.toBe(
      true,
    );
    models[9].query.exec.mockResolvedValueOnce(null);
    await expect(repository.isBlockedBetween(userId, targetId)).resolves.toBe(
      false,
    );

    await repository.hideProfile(userId, targetId);
    await repository.hideProfile(userId, targetId, 'not relevant');
    await repository.unhideProfile(userId, targetId);
    await repository.getHiddenProfiles(userId);
    models[10].query.exec.mockResolvedValueOnce([
      {
        userId: new Types.ObjectId(userId),
        hiddenUserId: new Types.ObjectId(targetId),
      },
      {
        userId: new Types.ObjectId(targetId),
        hiddenUserId: new Types.ObjectId(userId),
      },
    ]);
    await expect(repository.getHiddenRelationUserIds(userId)).resolves.toEqual([
      targetId,
    ]);
    models[10].query.exec.mockResolvedValueOnce({ id: 'hide' });
    await expect(repository.isHiddenBetween(userId, targetId)).resolves.toBe(
      true,
    );
    models[10].query.exec.mockResolvedValueOnce(null);
    await expect(repository.isHiddenBetween(userId, targetId)).resolves.toBe(
      false,
    );
  });

  it('revokes one or all devices', () => {
    repository.revokeDevice(userId, 'device-1');
    repository.revokeAllDevices(userId);
    expect(models[4].findOneAndUpdate).toHaveBeenCalledTimes(2);
  });
});
