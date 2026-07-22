/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { ProfileBoostStatus } from '../enums/profile-boost-status.enum';
import type { ProfileBoostDocument } from '../schemas/profile-boost.schema';
import { ProfileBoostService } from './profile-boost.service';

describe('ProfileBoostService', () => {
  const create = jest.fn();
  const findExec = jest.fn();
  const find = jest.fn(() => ({
    sort: jest.fn(() => ({
      limit: jest.fn(() => ({
        lean: jest.fn(() => ({ exec: findExec })),
      })),
      lean: jest.fn(() => ({ exec: findExec })),
    })),
  }));
  const updateMany = jest.fn();
  const model = {
    create,
    find,
    updateMany,
  } as unknown as Model<ProfileBoostDocument>;
  let service: ProfileBoostService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProfileBoostService(model);
  });

  it('activates a boost with explicit purchase options', async () => {
    const userId = new Types.ObjectId().toString();
    const paymentId = new Types.ObjectId().toString();
    const planId = new Types.ObjectId().toString();
    create.mockImplementation((value: unknown) => Promise.resolve(value));

    const result = await service.activateBoost({
      userId,
      paymentId,
      planId,
      durationHours: 2,
      multiplier: 2,
      source: 'promotion',
    });

    expect(result).toMatchObject({
      userId: new Types.ObjectId(userId),
      paymentId: new Types.ObjectId(paymentId),
      planId: new Types.ObjectId(planId),
      source: 'promotion',
      multiplier: 2,
      status: ProfileBoostStatus.ACTIVE,
    });
    expect(
      (result as { endsAt: Date }).endsAt.getTime() -
        (result as { startsAt: Date }).startsAt.getTime(),
    ).toBe(7_200_000);
  });

  it('applies safe defaults and clamps a non-positive duration', async () => {
    const userId = new Types.ObjectId().toString();
    create.mockImplementation((value: unknown) => Promise.resolve(value));

    const result = (await service.activateBoost({
      userId,
      durationHours: 0,
    })) as unknown as Record<string, unknown>;

    expect(result).toMatchObject({
      paymentId: undefined,
      planId: undefined,
      source: 'purchase',
      multiplier: 1.25,
    });
    expect(
      (result.endsAt as Date).getTime() - (result.startsAt as Date).getTime(),
    ).toBe(3_600_000);
  });

  it('uses the default 24-hour duration when omitted', async () => {
    create.mockImplementation((value: unknown) => Promise.resolve(value));
    const result = (await service.activateBoost({
      userId: new Types.ObjectId().toString(),
    })) as unknown as { startsAt: Date; endsAt: Date };

    expect(result.endsAt.getTime() - result.startsAt.getTime()).toBe(
      86_400_000,
    );
  });

  it('returns boost history in reverse chronological order', async () => {
    const userId = new Types.ObjectId().toString();
    findExec.mockResolvedValue([{ source: 'purchase' }]);

    await expect(service.getMyBoosts(userId)).resolves.toEqual([
      { source: 'purchase' },
    ]);
    expect(find).toHaveBeenCalledWith({ userId: new Types.ObjectId(userId) });
  });

  it('returns no active boosts when every user ID is invalid', async () => {
    await expect(service.getActiveBoostMap(['invalid'])).resolves.toEqual(
      new Map(),
    );
    expect(find).not.toHaveBeenCalled();
  });

  it('selects the highest-priority active boost per valid user', async () => {
    const userId = new Types.ObjectId();
    const first = { userId, multiplier: 2 };
    const duplicate = { userId, multiplier: 1.5 };
    findExec.mockResolvedValue([first, duplicate]);

    const result = await service.getActiveBoostMap([
      userId.toString(),
      'invalid',
    ]);

    expect(result.get(userId.toString())).toBe(first);
    expect(result.size).toBe(1);
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: { $in: [new Types.ObjectId(userId.toString())] },
        status: ProfileBoostStatus.ACTIVE,
      }),
    );
  });

  it('expires overdue active boosts', async () => {
    updateMany.mockResolvedValue({ modifiedCount: 3 });

    await expect(service.expireOverdueBoosts()).resolves.toEqual({
      expiredCount: 3,
    });
    expect(updateMany).toHaveBeenCalledWith(
      {
        status: ProfileBoostStatus.ACTIVE,
        endsAt: { $lte: expect.any(Date) },
      },
      { $set: { status: ProfileBoostStatus.EXPIRED } },
    );
  });
});
