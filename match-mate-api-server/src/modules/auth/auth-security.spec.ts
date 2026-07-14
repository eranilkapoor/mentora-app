import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import { Permission, Role } from '@/common/enums';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

describe('auth strategies and guards', () => {
  const reflector = { getAllAndOverride: jest.fn() };
  const logger = { error: jest.fn() };

  const context = (user?: unknown) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as unknown as ExecutionContext;

  beforeEach(() => jest.clearAllMocks());

  describe('GoogleStrategy', () => {
    const config = (values: Record<string, string | undefined>) =>
      ({ get: (key: string) => values[key] }) as unknown as ConfigService;

    it.each([
      {},
      { 'oauth.google.clientId': 'client' },
      { 'oauth.google.clientSecret': 'secret' },
    ])('rejects incomplete OAuth configuration', (values) => {
      expect(() => new GoogleStrategy(config(values))).toThrow(
        'Google OAuth env variables missing',
      );
    });

    it('maps a complete Google profile', () => {
      const strategy = new GoogleStrategy(
        config({
          'oauth.google.clientId': 'client',
          'oauth.google.clientSecret': 'secret',
          'oauth.google.callbackUrl': 'https://example.com/callback',
        }),
      );
      const done = jest.fn();

      strategy.validate(
        'access',
        'refresh',
        {
          id: 'google-1',
          displayName: 'Asha Singh',
          emails: [{ value: 'asha@example.com', verified: true }],
        } as never,
        done,
      );

      expect(done).toHaveBeenCalledWith(null, {
        provider: 'google',
        provider_id: 'google-1',
        email: 'asha@example.com',
        first_name: 'Asha Singh',
      });
    });

    it('allows a provider profile without an email', () => {
      const strategy = new GoogleStrategy(
        config({
          'oauth.google.clientId': 'client',
          'oauth.google.clientSecret': 'secret',
        }),
      );
      const done = jest.fn();
      strategy.validate(
        'access',
        'refresh',
        { id: 'google-1', displayName: 'Asha' } as never,
        done,
      );
      expect(done).toHaveBeenCalledWith(
        null,
        expect.objectContaining({ email: undefined }),
      );
    });
  });

  describe('JWT strategies', () => {
    const config = {
      get: jest.fn((key: string, fallback?: string) =>
        key === 'jwt.secret' ? 'test-secret' : fallback,
      ),
      getOrThrow: jest.fn((key: string) => key),
    } as unknown as ConfigService;
    const query = (value: unknown) => ({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(value),
    });
    const userModel = { findOne: jest.fn() };
    const sessionModel = { findOne: jest.fn() };

    it('rejects a missing JWT secret', () => {
      const missing = {
        get: jest.fn(),
        getOrThrow: jest.fn(),
      } as unknown as ConfigService;
      expect(
        () =>
          new JwtStrategy(missing, userModel as never, sessionModel as never),
      ).toThrow('JWT_SECRET missing');
    });

    it('validates bound sessions and resolves current authorization state', async () => {
      const userId = new Types.ObjectId().toString();
      const sessionId = new Types.ObjectId().toString();
      userModel.findOne.mockReturnValue(
        query({
          roles: [Role.USER],
          permissions: [Permission.PROFILE_VIEW],
          membership: { tier: 'gold' },
        }),
      );
      sessionModel.findOne.mockReturnValue(query({ _id: sessionId }));
      const strategy = new JwtStrategy(
        config,
        userModel as never,
        sessionModel as never,
      );

      const validated = await strategy.validate({
        sub: userId,
        roles: [Role.ADMIN],
        permissions: [],
        membership: { tier: 'free' },
        type: 'access',
        sid: sessionId,
        family: 'family-1',
      });
      expect(validated).toMatchObject({
        sub: userId,
        roles: [Role.USER],
        membership: { tier: 'gold' },
      });
      expect(validated.permissions).toContain(Permission.PROFILE_VIEW);
    });

    it('rejects malformed, revoked, and blocked access sessions', async () => {
      const userId = new Types.ObjectId().toString();
      const sessionId = new Types.ObjectId().toString();
      const strategy = new JwtStrategy(
        config,
        userModel as never,
        sessionModel as never,
      );

      await expect(
        strategy.validate({
          sub: 'invalid',
          type: 'access',
        }),
      ).rejects.toThrow('Invalid access token');

      userModel.findOne.mockReturnValue(query(null));
      sessionModel.findOne.mockReturnValue(query({ _id: sessionId }));
      await expect(
        strategy.validate({
          sub: userId,
          type: 'access',
          sid: sessionId,
          family: 'family-1',
        }),
      ).rejects.toThrow('Session is no longer active');

      userModel.findOne.mockReturnValue(query({ roles: [], permissions: [] }));
      sessionModel.findOne.mockReturnValue(query(null));
      await expect(
        strategy.validate({
          sub: userId,
          type: 'access',
          sid: sessionId,
          family: 'family-1',
        }),
      ).rejects.toThrow('Session is no longer active');
    });

    it('validates refresh payloads and extracts an optional refresh token', () => {
      const strategy = new JwtRefreshStrategy(config);
      const payload = {
        sub: 'u1',
        roles: [Role.USER],
        permissions: [Permission.PROFILE_VIEW],
        membership: { tier: 'gold' },
        type: 'refresh' as const,
      };
      expect(
        strategy.validate({ body: { refreshToken: 'refresh' } }, payload),
      ).toEqual({
        sub: 'u1',
        roles: [Role.USER],
        permissions: [Permission.PROFILE_VIEW],
        membership: { tier: 'gold' },
        refreshToken: 'refresh',
      });
      expect(
        strategy.validate({}, { sub: 'u2', type: 'refresh' } as never),
      ).toEqual({
        sub: 'u2',
        roles: [],
        permissions: [],
        membership: undefined,
        refreshToken: undefined,
      });
    });
  });

  describe('RolesGuard', () => {
    const guard = new RolesGuard(reflector as unknown as Reflector);

    it.each([undefined, []])('allows routes without role metadata', (roles) => {
      reflector.getAllAndOverride.mockReturnValue(roles);
      expect(guard.canActivate(context())).toBe(true);
    });

    it.each([undefined, {}])('rejects missing user roles', (user) => {
      reflector.getAllAndOverride.mockReturnValue([Role.MODERATOR]);
      expect(guard.canActivate(context(user))).toBe(false);
    });

    it('allows admins or a matching role and rejects other roles', () => {
      reflector.getAllAndOverride.mockReturnValue([Role.MODERATOR]);
      expect(guard.canActivate(context({ roles: [Role.ADMIN] }))).toBe(true);
      expect(guard.canActivate(context({ roles: [Role.SUPER_ADMIN] }))).toBe(
        true,
      );
      expect(guard.canActivate(context({ roles: [Role.MODERATOR] }))).toBe(
        true,
      );
      expect(guard.canActivate(context({ roles: [Role.USER] }))).toBe(false);
    });
  });

  describe('PermissionsGuard', () => {
    const guard = new PermissionsGuard(reflector as unknown as Reflector);

    it.each([undefined, []])(
      'allows routes without permission metadata',
      (permissions) => {
        reflector.getAllAndOverride.mockReturnValue(permissions);
        expect(guard.canActivate(context())).toBe(true);
      },
    );

    it('requires every permission and handles an absent user', () => {
      reflector.getAllAndOverride.mockReturnValue([
        Permission.PROFILE_VIEW,
        Permission.PROFILE_UPDATE,
      ]);
      expect(guard.canActivate(context())).toBe(false);
      expect(
        guard.canActivate(
          context({
            permissions: [Permission.PROFILE_VIEW, Permission.PROFILE_UPDATE],
          }),
        ),
      ).toBe(true);
      expect(
        guard.canActivate(context({ permissions: [Permission.PROFILE_VIEW] })),
      ).toBe(false);
      expect(
        guard.canActivate(
          context({ roles: [Role.SUPER_ADMIN], permissions: [] }),
        ),
      ).toBe(true);
    });
  });

  describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;

    beforeEach(() => {
      guard = new JwtAuthGuard(
        reflector as unknown as Reflector,
        logger as never,
      );
    });

    it('allows public routes without invoking Passport', () => {
      reflector.getAllAndOverride.mockReturnValue(true);
      expect(guard.canActivate(context())).toBe(true);
    });

    it('delegates protected routes to Passport', () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const parent = Object.getPrototypeOf(JwtAuthGuard.prototype) as {
        canActivate(ctx: ExecutionContext): boolean;
      };
      const passport = jest.spyOn(parent, 'canActivate').mockReturnValue(true);
      expect(guard.canActivate(context())).toBe(true);
      expect(passport).toHaveBeenCalled();
    });

    it('classifies expired, failed, and successful authentication results', () => {
      expect(() =>
        guard.handleRequest(null, false, { name: 'TokenExpiredError' }),
      ).toThrow(ErrorCode.AUTH_TOKEN_EXPIRED);

      const error = new Error('passport failed');
      expect(() =>
        guard.handleRequest(error, false, { message: 'bad token' }),
      ).toThrow(ErrorCode.AUTH_UNAUTHORIZED);
      expect(logger.error).toHaveBeenCalledWith('Auth Error:', error.stack);

      expect(() => guard.handleRequest(null, false, {})).toThrow(
        ErrorCode.AUTH_UNAUTHORIZED,
      );
      const user = { sub: 'u1' };
      expect(guard.handleRequest(null, user, {})).toBe(user);
    });
  });

  it('constructs the refresh guard with its Passport strategy', () => {
    expect(new JwtRefreshGuard()).toBeInstanceOf(JwtRefreshGuard);
  });
});
