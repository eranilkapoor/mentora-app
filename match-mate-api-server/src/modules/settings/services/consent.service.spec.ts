/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Types } from 'mongoose';
import type { Model } from 'mongoose';
import { ConsentType } from '../enums/user-consent.enum';
import type { UserConsentDocument } from '../schemas/user-consent.schema';
import { ConsentService } from './consent.service';

describe('ConsentService', () => {
  const exec = jest.fn();
  const lean = jest.fn(() => ({ exec }));
  const sort = jest.fn(() => ({ lean }));
  const find = jest.fn(() => ({ sort }));
  const findOneAndUpdate = jest.fn(() => ({ lean }));
  const model = {
    find,
    findOneAndUpdate,
  } as unknown as Model<UserConsentDocument>;
  let service: ConsentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ConsentService(model);
  });

  it('returns user consents newest first', async () => {
    const userId = new Types.ObjectId().toString();
    exec.mockResolvedValue([{ type: ConsentType.PRIVACY_POLICY }]);

    await expect(service.getConsents(userId)).resolves.toEqual([
      { type: ConsentType.PRIVACY_POLICY },
    ]);
    expect(find).toHaveBeenCalledWith({ userId: new Types.ObjectId(userId) });
    expect(sort).toHaveBeenCalledWith({ acceptedAt: -1, createdAt: -1 });
  });

  it.each([
    { accepted: undefined, expected: true, revoked: undefined },
    { accepted: true, expected: true, revoked: undefined },
    { accepted: false, expected: false, revoked: expect.any(Date) },
  ])(
    'records consent when accepted is $accepted',
    async ({ accepted, expected, revoked }) => {
      const userId = new Types.ObjectId().toString();
      const result = { id: 'consent' };
      exec.mockResolvedValue(result);
      const dto = {
        type: ConsentType.PRIVACY_POLICY,
        version: '1.0',
        source: 'settings',
        ...(accepted === undefined ? {} : { accepted }),
      };

      await expect(
        service.recordConsent(userId, dto, {
          ip: '127.0.0.1',
          userAgent: 'Jest',
        }),
      ).resolves.toBe(result);

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        {
          userId: new Types.ObjectId(userId),
          type: dto.type,
          version: dto.version,
        },
        {
          $set: expect.objectContaining({
            accepted: expected,
            acceptedAt: expect.any(Date),
            revokedAt: revoked,
            ip: '127.0.0.1',
            userAgent: 'Jest',
            source: 'settings',
          }),
          $setOnInsert: {
            userId: new Types.ObjectId(userId),
            type: dto.type,
            version: dto.version,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    },
  );
});
