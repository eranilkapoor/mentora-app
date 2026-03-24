import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AuthProvider } from '../enums/auth-provider.enum';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientID || !clientSecret) {
      throw new Error('Google OAuth env variables missing');
    }

    super({
      clientID,
      clientSecret,
      callbackURL: '/auth/google/callback',
      scope: ['email', 'profile'],
      passReqToCallback: false,
    });
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const user = await this.authService.socialLogin({
      provider: AuthProvider.GOOGLE,
      provider_id: profile.id,
      // email: profile?.emails[0].value,
      first_name: profile.displayName,
      access_token: accessToken,
    });

    done(null, user);
  }
}
