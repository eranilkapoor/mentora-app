import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from './repositories/user.repository';
import { ProfileRepository } from '../profile/repositories/profile.repository';
import { OtpService } from './otp.service';
import { User, UserSchema } from './schemas/user.schema';
import { ProfileModule } from '../profile/profile.module';
import { Profile, ProfileSchema } from '../profile/schemas/profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Profile.name, schema: ProfileSchema }
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret', '123456'),
        signOptions: {
          expiresIn: parseInt(
            configService.get<string>('jwt.expiresIn', '900'),
            10,
          ), // 15 minutes in seconds
        },
      }),
      inject: [ConfigService],
    }),
    ProfileModule,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, AuthService, UserRepository, OtpService, ProfileRepository],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule { }
