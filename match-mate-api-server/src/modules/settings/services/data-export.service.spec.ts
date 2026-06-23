import { Types } from 'mongoose';
import { DataExportService } from './data-export.service';
import { COLLECTION_NAMES } from '@/common/constants';

describe('DataExportService', () => {
  const userId = new Types.ObjectId().toString();
  const userObjectId = new Types.ObjectId(userId);

  const findCalls: unknown[] = [];
  const collection = jest.fn((name: string) => ({
    findOne: jest.fn((filter: unknown) => {
      if (
        name === COLLECTION_NAMES.USER &&
        JSON.stringify(filter).includes(userId)
      ) {
        return Promise.resolve({
          _id: userObjectId,
          email: 'user@example.com',
          passwordHash: 'secret',
          nested: { refreshToken: 'secret', safe: 'ok' },
        });
      }

      return Promise.resolve({
        userId: userObjectId,
        __v: 3,
        safeSetting: true,
        totpSecret: 'secret',
      });
    }),
    find: jest.fn((filter: unknown) => {
      findCalls.push(filter);
      return {
        toArray: jest.fn(() =>
          Promise.resolve([
            {
              userId: userObjectId,
              createdAt: new Date('2026-06-23T00:00:00.000Z'),
              gatewayPayload: { token: 'secret' },
              label: 'safe',
            },
          ]),
        ),
      };
    }),
  }));

  beforeEach(() => {
    jest.clearAllMocks();
    findCalls.length = 0;
  });

  it('exports all user-owned collections and removes secrets recursively', async () => {
    const service = new DataExportService({ collection } as never);
    const result = (await service.exportUserData(userId)) as Record<
      string,
      unknown
    >;

    expect(collection).toHaveBeenCalledWith(COLLECTION_NAMES.USER);
    expect(collection).toHaveBeenCalledWith(COLLECTION_NAMES.MEDIA);
    expect(collection).toHaveBeenCalledWith(COLLECTION_NAMES.PAYMENT);
    expect(collection).toHaveBeenCalledWith(COLLECTION_NAMES.USER_CONSENT);
    expect(result.exportedAt).toEqual(expect.any(String));
    expect(result.user).toMatchObject({
      _id: userId,
      email: 'user@example.com',
      nested: { safe: 'ok' },
    });
    expect(JSON.stringify(result)).not.toContain('passwordHash');
    expect(JSON.stringify(result)).not.toContain('refreshToken');
    expect(JSON.stringify(result)).not.toContain('gatewayPayload');
    expect(JSON.stringify(result)).not.toContain('totpSecret');
    expect(JSON.stringify(result)).not.toContain('__v');
  });

  it('queries referral and report collections from both user perspectives', async () => {
    const service = new DataExportService({ collection } as never);

    await service.exportUserData(userId);

    expect(findCalls).toContainEqual({
      $or: [{ referrerId: userObjectId }, { referredUserId: userObjectId }],
    });
    expect(findCalls).toContainEqual({
      $or: [{ reportedBy: userObjectId }, { reportedUserId: userObjectId }],
    });
  });
});
