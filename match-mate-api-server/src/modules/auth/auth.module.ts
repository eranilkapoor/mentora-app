import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthPasswordService } from './services/auth-password.service';
import { UserRepository } from './repositories/user.repository';
import { OtpService } from './services/otp.service';
import { User, UserSchema } from './schemas/user.schema';
import { getJwtConfig } from '@/config/jwt.config';
import { AuthTokenService } from './services/auth-token.service';
import { SocialAuthVerifierService } from './services/social-auth-verifier.service';
import { UserSession, UserSessionSchema } from './schemas/user-session.schema';
import {
  Subscription,
  SubscriptionSchema,
} from '../subscriptions/schemas/subscription.schema';
import { Plan, PlanSchema } from '../subscriptions/schemas/plan.schema';
import {
  ActivityLog,
  ActivityLogSchema,
} from '../profiles/schemas/settings/activity-logs.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { SafetyModule } from '../safety/safety.module';
import { ReferralsModule } from '../referrals/referrals.module';

@Module({
  imports: [
    ConfigModule,

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: ActivityLog.name, schema: ActivityLogSchema },
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
    NotificationsModule,
    AnalyticsModule,
    SafetyModule,
    ReferralsModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    AuthService,
    AuthPasswordService,
    UserRepository,
    OtpService,
    AuthTokenService,
    SocialAuthVerifierService,
  ],
  exports: [AuthService, UserRepository, JwtModule, PassportModule],
})
export class AuthModule {}
