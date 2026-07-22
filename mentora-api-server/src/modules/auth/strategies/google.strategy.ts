import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    const clientID = configService.get<string>('oauth.google.clientId');
    const clientSecret = configService.get<string>('oauth.google.clientSecret');
    const callbackURL = configService.get<string>('oauth.google.callbackUrl');

    if (!clientID || !clientSecret) {
      throw new Error('Google OAuth env variables missing');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
      passReqToCallback: false,
    });
  }

  validate(
    _access_token: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const user = {
      provider: 'google',
      provider_id: profile.id,
      email: profile.emails?.[0]?.value,
      first_name: profile.displayName,
    };
    done(null, user);
  }
}
