import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import { PlanTier } from '@/common/enums';
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
      key === 'jwt.audience' ? 'matchmate-user' : 'matchmate-api',
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
      payload,
      expect.objectContaining({ expiresIn: '15m' }),
    );
    expect(jwtService.sign).toHaveBeenNthCalledWith(
      2,
      payload,
      expect.objectContaining({ expiresIn: '7d' }),
    );
  });
});
