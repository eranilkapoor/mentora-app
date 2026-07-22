import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import { Permission, PlanTier, Role } from '@/common/enums';
import { AuthTokenService } from './auth-token.service';

describe('AuthTokenService', () => {
  const jwtService = { sign: jest.fn() };
  const configService = {
    get: jest.fn((key: string, fallback?: unknown) => {
      const values: Record<string, unknown> = {
        'jwt.secret': 'secret',
        'jwt.accessExpiresIn': '15m',
        'jwt.refreshExpiresIn': '7d',
      };
      return values[key] ?? fallback;
    }),
    getOrThrow: jest.fn((key: string) =>
      key === 'jwt.audience'
        ? 'mentora-user'
        : key === 'jwt.refreshAudience'
          ? 'mentora-refresh'
          : 'mentora-api',
    ),
  };
  const service = new AuthTokenService(
    jwtService as unknown as JwtService,
    configService as unknown as ConfigService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('deduplicates direct and role permissions in the token payload', () => {
    const payload = service.generatePayload({
      _id: { toString: () => 'user-id' },
      roles: [
        {
          name: 'user',
          permissions: [{ name: 'profile:read' }, { name: 'chat:read' }],
        },
      ],
      permissions: ['profile:read'],
      membership: { tier: PlanTier.GOLD },
    });

    expect(payload).toEqual({
      sub: 'user-id',
      roles: ['user'],
      permissions: ['profile:read', 'chat:read'],
      membership: { tier: PlanTier.GOLD },
    });
  });

  it('uses the free tier when membership is absent', () => {
    const payload = service.generatePayload({
      _id: { toString: () => 'user-id' },
      roles: ['user'],
    });

    expect(payload.membership.tier).toBe(PlanTier.FREE);
  });

  it('materializes permissions for seeded built-in admin roles', () => {
    const superAdmin = service.generatePayload({
      _id: { toString: () => 'super-id' },
      roles: [Role.SUPER_ADMIN],
      permissions: [],
    });
    const finance = service.generatePayload({
      _id: { toString: () => 'finance-id' },
      roles: [Role.FINANCE],
      permissions: [],
    });

    expect(superAdmin.permissions).toEqual(
      expect.arrayContaining(Object.values(Permission)),
    );
    expect(finance.permissions).toEqual(
      expect.arrayContaining([
        Permission.PAYMENT_VIEW,
        Permission.PAYMENT_REFUND,
        Permission.ANALYTICS_VIEW,
      ]),
    );
    expect(finance.permissions).not.toContain(Permission.USER_DELETE);
  });

  it('creates access and refresh tokens with distinct expirations', () => {
    jwtService.sign
      .mockReturnValueOnce('access')
      .mockReturnValueOnce('refresh');
    const payload = service.generatePayload({
      _id: { toString: () => 'user-id' },
      roles: ['user'],
    });

    expect(service.generateTokens(payload)).toEqual({
      accessToken: 'access',
      refreshToken: 'refresh',
    });
    expect(jwtService.sign).toHaveBeenNthCalledWith(
      1,
      { ...payload, type: 'access' },
      expect.objectContaining({ expiresIn: '15m' }),
    );
    expect(jwtService.sign).toHaveBeenNthCalledWith(
      2,
      { ...payload, type: 'refresh' },
      expect.objectContaining({
        expiresIn: '7d',
        audience: 'mentora-refresh',
      }),
    );
  });
});
