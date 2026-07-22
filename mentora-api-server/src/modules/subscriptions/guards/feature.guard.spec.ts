import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { ErrorCode } from '@/common/constants';
import { FeatureKey, Role } from '@/common/enums';
import type { FeatureService } from '../services/feature.service';
import { FeatureGuard } from './feature.guard';

const createContext = (request: Record<string, unknown>): ExecutionContext =>
  ({
    getHandler: () => function handler() {},
    getClass: () => class Controller {},
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

describe('FeatureGuard', () => {
  it('denies feature routes without an authenticated user', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(FeatureKey.VIDEO_PROFILE),
    };
    const guard = new FeatureGuard(
      reflector as unknown as Reflector,
      { checkAccess: jest.fn() } as unknown as FeatureService,
    );

    await expect(
      guard.canActivate(createContext({ headers: {}, ip: '127.0.0.1' })),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_FORBIDDEN });
  });

  it('allows staff roles without consuming plan feature usage', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(FeatureKey.VIDEO_PROFILE),
    };
    const featureService = { checkAccess: jest.fn() };
    const request: Record<string, unknown> = {
      headers: {},
      ip: '127.0.0.1',
      user: { sub: 'admin-id', roles: [Role.ADMIN] },
    };
    const guard = new FeatureGuard(
      reflector as unknown as Reflector,
      featureService as unknown as FeatureService,
    );

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(featureService.checkAccess).not.toHaveBeenCalled();
    expect(request.feature).toMatchObject({ bypassed: true });
  });

  it('checks plan access for regular users', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(FeatureKey.VIDEO_PROFILE),
    };
    const featureService = {
      checkAccess: jest.fn().mockResolvedValue({ allowed: true }),
    };
    const request: Record<string, unknown> = {
      headers: { 'x-device-id': 'device-id', 'x-platform': 'android' },
      ip: '127.0.0.1',
      user: { sub: 'user-id', roles: [Role.USER] },
    };
    const guard = new FeatureGuard(
      reflector as unknown as Reflector,
      featureService as unknown as FeatureService,
    );

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(featureService.checkAccess).toHaveBeenCalledWith(
      FeatureKey.VIDEO_PROFILE,
      expect.objectContaining({
        userId: 'user-id',
        deviceId: 'device-id',
        platform: 'android',
      }),
    );
  });
});
