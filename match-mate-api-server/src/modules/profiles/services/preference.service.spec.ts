/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus } from '@nestjs/common';
import type { ICacheService } from '@/common/cache/interfaces/cache.interface';
import { ErrorCode } from '@/common/constants';
import { AppException } from '@/common/exceptions/app.exception';
import { ChildPreference, ResidencyPreference } from '@/common/enums';
import type { PreferenceRepository } from '../repositories/preference.repository';
import { PreferenceService } from './preference.service';

describe('PreferenceService', () => {
  const repo = {
    findByUserId: jest.fn(),
    upsert: jest.fn(),
    updateFilters: jest.fn(),
    updateSettings: jest.fn(),
    updateWeights: jest.fn(),
    updateAboutPartner: jest.fn(),
  };
  const cache = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };
  let service: PreferenceService;

  const appError = () =>
    new AppException(ErrorCode.INVALID_REQUEST, HttpStatus.BAD_REQUEST);

  beforeEach(() => {
    jest.clearAllMocks();
    repo.findByUserId.mockResolvedValue(null);
    cache.get.mockResolvedValue(null);
    cache.set.mockResolvedValue(undefined);
    cache.del.mockResolvedValue(undefined);
    service = new PreferenceService(
      repo as unknown as PreferenceRepository,
      cache as unknown as ICacheService,
    );
  });

  it('creates default preferences and invalidates cached data', async () => {
    const created = { _id: 'preference' };
    repo.upsert.mockResolvedValue(created);

    await expect(service.createPreference('user')).resolves.toBe(created);
    expect(repo.upsert).toHaveBeenCalledWith('user', {
      filters: {
        childPreference: ChildPreference.DOES_NOT_MATTER,
        residencyPreference: ResidencyPreference.DOES_NOT_MATTER,
      },
      settings: {
        isStrict: false,
        allowPartialMatches: true,
        horoscopeRequired: false,
        profileVerificationRequired: false,
        minimumMatchScore: 50,
      },
      weights: {
        age: 10,
        height: 10,
        religion: 15,
        caste: 10,
        location: 10,
        education: 10,
        occupation: 10,
        lifestyle: 10,
        horoscope: 15,
      },
      aboutPartner: '',
    });
    expect(cache.del).toHaveBeenCalledWith('preference:user');
  });

  it('merges valid custom preference values', async () => {
    repo.upsert.mockResolvedValue({ _id: 'preference' });

    await service.createPreference('user', {
      filters: { childPreference: ChildPreference.HAS_CHILDREN_OK },
      settings: { isStrict: true },
      weights: { age: 20, caste: 0 },
      aboutPartner: 'Kind and thoughtful',
    });

    expect(repo.upsert).toHaveBeenCalledWith(
      'user',
      expect.objectContaining({
        filters: expect.objectContaining({
          childPreference: ChildPreference.HAS_CHILDREN_OK,
          residencyPreference: ResidencyPreference.DOES_NOT_MATTER,
        }),
        settings: expect.objectContaining({ isStrict: true }),
        weights: expect.objectContaining({ age: 20, caste: 0 }),
        aboutPartner: 'Kind and thoughtful',
      }),
    );
  });

  it('rejects duplicate preferences and invalid custom weight totals', async () => {
    repo.findByUserId.mockResolvedValueOnce({ _id: 'existing' });
    await expect(service.createPreference('user')).rejects.toBeInstanceOf(
      AppException,
    );

    repo.findByUserId.mockResolvedValueOnce(null);
    await expect(
      service.createPreference('user', {
        weights: { age: 'invalid' } as never,
      }),
    ).rejects.toBeInstanceOf(AppException);
  });

  it('normalizes generic creation failures and preserves app errors', async () => {
    repo.findByUserId.mockRejectedValueOnce(new Error('database'));
    await expect(service.createPreference('user')).rejects.toBeInstanceOf(
      AppException,
    );

    const expected = appError();
    repo.findByUserId.mockRejectedValueOnce(expected);
    await expect(service.createPreference('user')).rejects.toBe(expected);
  });

  it('returns cached, stored, and default preferences', async () => {
    const cached = { aboutPartner: 'cached' };
    cache.get.mockResolvedValueOnce(cached);
    await expect(service.getMyPreference('user')).resolves.toBe(cached);
    expect(repo.findByUserId).not.toHaveBeenCalled();

    const stored = { aboutPartner: 'stored' };
    cache.get.mockResolvedValueOnce(null);
    repo.findByUserId.mockResolvedValueOnce(stored);
    await expect(service.getMyPreference('user')).resolves.toBe(stored);
    expect(cache.set).toHaveBeenCalledWith('preference:user', stored, 300);

    cache.get.mockResolvedValueOnce(null);
    repo.findByUserId.mockResolvedValueOnce(null);
    await expect(service.getMyPreference('user')).resolves.toMatchObject({
      filters: {
        childPreference: ChildPreference.DOES_NOT_MATTER,
        residencyPreference: ResidencyPreference.DOES_NOT_MATTER,
      },
      aboutPartner: '',
    });
  });

  it('normalizes generic retrieval failures and preserves app errors', async () => {
    cache.get.mockRejectedValueOnce(new Error('cache'));
    await expect(service.getMyPreference('user')).rejects.toBeInstanceOf(
      AppException,
    );

    const expected = appError();
    cache.get.mockRejectedValueOnce(expected);
    await expect(service.getMyPreference('user')).rejects.toBe(expected);
  });

  it.each([
    ['updateFilters', { religion: ['Hindu'] }],
    ['updateSettings', { isStrict: true }],
    ['updateAboutPartner', 'Thoughtful partner'],
  ] as const)('%s updates data and invalidates cache', async (method, dto) => {
    repo[method].mockResolvedValue({ updated: true });

    await expect(
      (service[method] as (userId: string, value: never) => Promise<unknown>)(
        'user',
        dto as never,
      ),
    ).resolves.toEqual({ updated: true });
    expect(cache.del).toHaveBeenCalledWith('preference:user');
  });

  it.each([
    ['updateFilters', { religion: ['Hindu'] }],
    ['updateSettings', { isStrict: true }],
    ['updateAboutPartner', 'Thoughtful partner'],
  ] as const)('%s handles repository failures', async (method, dto) => {
    repo[method].mockRejectedValueOnce(new Error('database'));
    await expect(
      (service[method] as (userId: string, value: never) => Promise<unknown>)(
        'user',
        dto as never,
      ),
    ).rejects.toBeInstanceOf(AppException);

    const expected = appError();
    repo[method].mockRejectedValueOnce(expected);
    await expect(
      (service[method] as (userId: string, value: never) => Promise<unknown>)(
        'user',
        dto as never,
      ),
    ).rejects.toBe(expected);
  });

  it('validates and updates a complete weight allocation', async () => {
    const weights = {
      age: 'ignored',
      height: 20,
      religion: 15,
      caste: 10,
      location: 10,
      education: 10,
      occupation: 10,
      lifestyle: 10,
      horoscope: 15,
    } as never;
    repo.updateWeights.mockResolvedValue({ weights });

    await expect(service.updateWeights('user', weights)).resolves.toEqual({
      weights,
    });
    expect(cache.del).toHaveBeenCalledWith('preference:user');
  });

  it('rejects invalid weights and handles update failures', async () => {
    await expect(
      service.updateWeights('user', { age: 10 }),
    ).rejects.toBeInstanceOf(AppException);

    const weights = {
      age: 10,
      height: 10,
      religion: 15,
      caste: 10,
      location: 10,
      education: 10,
      occupation: 10,
      lifestyle: 10,
      horoscope: 15,
    };
    repo.updateWeights.mockRejectedValueOnce(new Error('database'));
    await expect(service.updateWeights('user', weights)).rejects.toBeInstanceOf(
      AppException,
    );

    const expected = appError();
    repo.updateWeights.mockRejectedValueOnce(expected);
    await expect(service.updateWeights('user', weights)).rejects.toBe(expected);
  });
});
