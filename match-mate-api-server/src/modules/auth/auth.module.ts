import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from './repositories/user.repository';
import { OtpService } from './otp.service';
import { User, UserSchema } from './schemas/user.schema';
import { ProfileModule } from '../profile/profile.module';
import { Profile, ProfileSchema } from '../profile/schemas/profile.schema';
import { ProfileService } from '../profile/profile.service';
import { ProfileRepository } from '../profile/repositories/profile.repository';
import { getJwtConfig } from 'src/config/jwt.config';
import { AuthTokenService } from './auth-token.service';
import { UserSession, UserSessionSchema } from './schemas/user-session.schema';

@Module({
  imports: [
    ConfigModule, // ✅ ensure available

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Profile.name, schema: ProfileSchema },
      { name: UserSession.name, schema: UserSessionSchema }
    ]),

    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtConfig = getJwtConfig(configService);

        return {
          secret: jwtConfig.secret,
          signOptions: {
            expiresIn: jwtConfig.accessExpiresIn,
            audience: jwtConfig.audience,
            issuer: jwtConfig.issuer,
          },
        };
      },      
    }),
    ProfileModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    AuthService,
    UserRepository,
    OtpService,
    ProfileService,
    ProfileRepository,
    AuthTokenService
  ],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
