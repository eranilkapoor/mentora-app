import type { ConfigService } from '@nestjs/config';
import { AppException } from '@/common/exceptions/app.exception';
import { AuthProvider } from '../enums/auth-provider.enum';
import { SocialAuthVerifierService } from './social-auth-verifier.service';

const response = (ok: boolean, body: unknown): Response =>
  ({ ok, json: jest.fn().mockResolvedValue(body) }) as unknown as Response;

const appleToken = (claims: Record<string, unknown>): string =>
  `header.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.signature`;

describe('SocialAuthVerifierService', () => {
  const configService = { get: jest.fn() };
  const fetchMock = jest.fn();
  let service: SocialAuthVerifierService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global, 'fetch').mockImplementation(fetchMock);
    configService.get.mockReturnValue('com.mentora.app');
    service = new SocialAuthVerifierService(
      configService as unknown as ConfigService,
    );
  });

  afterEach(() => jest.restoreAllMocks());

  it('verifies a complete Google profile', async () => {
    fetchMock.mockResolvedValue(
      response(true, {
        id: 'google-id',
        email: 'user@example.com',
        given_name: 'Asha',
        family_name: 'Sharma',
        picture: 'photo.jpg',
      }),
    );

    await expect(
      service.verify({
        provider: AuthProvider.GOOGLE,
        accessToken: 'google-token',
      }),
    ).resolves.toEqual({
      provider: AuthProvider.GOOGLE,
      providerId: 'google-id',
      email: 'user@example.com',
      firstName: 'Asha',
      lastName: 'Sharma',
      profilePhoto: 'photo.jpg',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://www.googleapis.com/userinfo/v2/me',
      { headers: { Authorization: 'Bearer google-token' } },
    );
  });

  it('accepts a minimal Google profile', async () => {
    fetchMock.mockResolvedValue(response(true, { id: 'google-id' }));

    await expect(
      service.verify({
        provider: AuthProvider.GOOGLE,
        accessToken: 'token',
      }),
    ).resolves.toEqual({
      provider: AuthProvider.GOOGLE,
      providerId: 'google-id',
    });
  });

  it.each([
    response(false, {}),
    response(true, { email: 'missing-id@example.com' }),
  ])('rejects an invalid Google response', async (providerResponse) => {
    fetchMock.mockResolvedValue(providerResponse);

    await expect(
      service.verify({
        provider: AuthProvider.GOOGLE,
        accessToken: 'token',
      }),
    ).rejects.toBeInstanceOf(AppException);
  });

  it('verifies a complete Facebook profile with an encoded token', async () => {
    fetchMock.mockResolvedValue(
      response(true, {
        id: 'facebook-id',
        email: 'user@example.com',
        first_name: 'Ravi',
        last_name: 'Patel',
        picture: { data: { url: 'facebook.jpg' } },
      }),
    );

    await expect(
      service.verify({
        provider: AuthProvider.FACEBOOK,
        accessToken: 'token with spaces',
      }),
    ).resolves.toEqual({
      provider: AuthProvider.FACEBOOK,
      providerId: 'facebook-id',
      email: 'user@example.com',
      firstName: 'Ravi',
      lastName: 'Patel',
      profilePhoto: 'facebook.jpg',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('access_token=token%20with%20spaces'),
    );
  });

  it('accepts a minimal Facebook profile', async () => {
    fetchMock.mockResolvedValue(response(true, { id: 'facebook-id' }));

    await expect(
      service.verify({
        provider: AuthProvider.FACEBOOK,
        accessToken: 'token',
      }),
    ).resolves.toEqual({
      provider: AuthProvider.FACEBOOK,
      providerId: 'facebook-id',
    });
  });

  it.each([response(false, {}), response(true, { email: 'missing-id' })])(
    'rejects an invalid Facebook response',
    async (providerResponse) => {
      fetchMock.mockResolvedValue(providerResponse);
      await expect(
        service.verify({
          provider: AuthProvider.FACEBOOK,
          accessToken: 'token',
        }),
      ).rejects.toBeInstanceOf(AppException);
    },
  );

  it('verifies an Apple identity token', async () => {
    const token = appleToken({
      sub: 'apple-id',
      email: 'apple@example.com',
      aud: 'com.mentora.app',
      exp: Math.floor(Date.now() / 1000) + 60,
    });

    await expect(
      service.verify({ provider: AuthProvider.APPLE, accessToken: token }),
    ).resolves.toEqual({
      provider: AuthProvider.APPLE,
      providerId: 'apple-id',
      email: 'apple@example.com',
    });
  });

  it('accepts minimal non-expiring Apple claims without audience configuration', async () => {
    configService.get.mockReturnValue('');

    await expect(
      service.verify({
        provider: AuthProvider.APPLE,
        accessToken: appleToken({ sub: 'apple-id' }),
      }),
    ).resolves.toEqual({
      provider: AuthProvider.APPLE,
      providerId: 'apple-id',
    });
  });

  it.each([
    ['missing payload', 'invalid-token'],
    ['missing subject', appleToken({ aud: 'com.mentora.app' })],
    [
      'expired token',
      appleToken({
        sub: 'apple-id',
        aud: 'com.mentora.app',
        exp: Math.floor(Date.now() / 1000) - 60,
      }),
    ],
    [
      'wrong audience',
      appleToken({ sub: 'apple-id', aud: 'another.application' }),
    ],
  ])('rejects Apple token with %s', async (_label, accessToken) => {
    await expect(
      service.verify({ provider: AuthProvider.APPLE, accessToken }),
    ).rejects.toBeInstanceOf(AppException);
  });

  it('rejects unsupported providers', async () => {
    await expect(
      service.verify({
        provider: AuthProvider.EMAIL,
        accessToken: 'token',
      }),
    ).rejects.toBeInstanceOf(AppException);
  });
});
