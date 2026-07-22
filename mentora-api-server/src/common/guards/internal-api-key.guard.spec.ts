import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { InternalApiKeyGuard } from './internal-api-key.guard';
import { INTERNAL_API_KEY_REQUIRED } from '@/common/decorators/internal-api-key.decorator';

const context = (headerValue?: string): ExecutionContext =>
  ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({
        header: (name: string) =>
          name.toLowerCase() === 'x-api-key' ? headerValue : undefined,
      }),
    }),
  }) as unknown as ExecutionContext;

describe('InternalApiKeyGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as jest.Mocked<Reflector>;
  const configService = {
    get: jest.fn(),
  } as unknown as jest.Mocked<ConfigService>;

  beforeEach(() => {
    jest.clearAllMocks();
    reflector.getAllAndOverride.mockReturnValue(true);
    configService.get.mockReturnValue('primary-key, secondary-key');
  });

  it('allows routes without internal API key metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const guard = new InternalApiKeyGuard(reflector, configService);

    expect(guard.canActivate(context())).toBe(true);
    expect(reflector.getAllAndOverride.mock.calls[0]).toEqual([
      INTERNAL_API_KEY_REQUIRED,
      expect.any(Array),
    ]);
    expect(configService.get.mock.calls).toHaveLength(0);
  });

  it('allows configured keys from the X-API-Key header', () => {
    const guard = new InternalApiKeyGuard(reflector, configService);

    expect(guard.canActivate(context('secondary-key'))).toBe(true);
  });

  it('rejects missing keys', () => {
    const guard = new InternalApiKeyGuard(reflector, configService);

    expect(() => guard.canActivate(context())).toThrow('AUTH.UNAUTHORIZED');
  });

  it('rejects invalid keys', () => {
    const guard = new InternalApiKeyGuard(reflector, configService);

    expect(() => guard.canActivate(context('wrong-key'))).toThrow(
      'COMMON.ACCESS_DENIED',
    );
  });

  it('fails closed when a protected route has no configured keys', () => {
    configService.get.mockReturnValue('');
    const guard = new InternalApiKeyGuard(reflector, configService);

    expect(() => guard.canActivate(context('primary-key'))).toThrow(
      'COMMON.ACCESS_DENIED',
    );
  });
});
