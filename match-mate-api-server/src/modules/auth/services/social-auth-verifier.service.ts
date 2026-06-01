import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErrorCode } from '@/common/constants';
import { AppException } from '@/common/exceptions/app.exception';
import { AuthProvider } from '../enums/auth-provider.enum';
import { SocialLoginDto } from '../dto/auth.dto';

export type VerifiedSocialProfile = {
  provider: AuthProvider.GOOGLE | AuthProvider.FACEBOOK | AuthProvider.APPLE;
  providerId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profilePhoto?: string;
};

@Injectable()
export class SocialAuthVerifierService {
  constructor(private readonly configService: ConfigService) {}

  async verify(dto: SocialLoginDto): Promise<VerifiedSocialProfile> {
    const provider = dto.provider;

    if (provider === AuthProvider.GOOGLE) {
      return this.verifyGoogle(dto.accessToken);
    }

    if (provider === AuthProvider.FACEBOOK) {
      return this.verifyFacebook(dto.accessToken);
    }

    if (provider === AuthProvider.APPLE) {
      return this.verifyApple(dto.accessToken);
    }

    throw new AppException(
      ErrorCode.AUTH_UNAUTHORIZED,
      HttpStatus.UNAUTHORIZED,
    );
  }

  private async verifyGoogle(
    accessToken: string,
  ): Promise<VerifiedSocialProfile> {
    const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new AppException(
        ErrorCode.AUTH_UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const profile = (await response.json()) as {
      id?: string;
      email?: string;
      given_name?: string;
      family_name?: string;
      picture?: string;
    };

    if (!profile.id) {
      throw new AppException(
        ErrorCode.AUTH_UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      provider: AuthProvider.GOOGLE,
      providerId: profile.id,
      ...(profile.email ? { email: profile.email } : {}),
      ...(profile.given_name ? { firstName: profile.given_name } : {}),
      ...(profile.family_name ? { lastName: profile.family_name } : {}),
      ...(profile.picture ? { profilePhoto: profile.picture } : {}),
    };
  }

  private async verifyFacebook(
    accessToken: string,
  ): Promise<VerifiedSocialProfile> {
    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,first_name,last_name,email,picture.type(large)&access_token=${encodeURIComponent(
        accessToken,
      )}`,
    );

    if (!response.ok) {
      throw new AppException(
        ErrorCode.AUTH_UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const profile = (await response.json()) as {
      id?: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      picture?: { data?: { url?: string } };
    };

    if (!profile.id) {
      throw new AppException(
        ErrorCode.AUTH_UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      provider: AuthProvider.FACEBOOK,
      providerId: profile.id,
      ...(profile.email ? { email: profile.email } : {}),
      ...(profile.first_name ? { firstName: profile.first_name } : {}),
      ...(profile.last_name ? { lastName: profile.last_name } : {}),
      ...(profile.picture?.data?.url
        ? { profilePhoto: profile.picture.data.url }
        : {}),
    };
  }

  private verifyApple(identityToken: string): VerifiedSocialProfile {
    const [, payload] = identityToken.split('.');

    if (!payload) {
      throw new AppException(
        ErrorCode.AUTH_UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const claims = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as {
      sub?: string;
      email?: string;
      aud?: string;
      exp?: number;
    };

    const expectedAudience = this.configService.get<string>(
      'oauth.apple.clientId',
      '',
    );

    if (
      !claims.sub ||
      (claims.exp && claims.exp * 1000 < Date.now()) ||
      (expectedAudience && claims.aud !== expectedAudience)
    ) {
      throw new AppException(
        ErrorCode.AUTH_UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      provider: AuthProvider.APPLE,
      providerId: claims.sub,
      ...(claims.email ? { email: claims.email } : {}),
    };
  }
}
