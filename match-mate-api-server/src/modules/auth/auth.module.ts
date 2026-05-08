import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UserRepository } from './repositories/user.repository';
import { OtpService } from './services/otp.service';
import { User, UserSchema } from './schemas/user.schema';
import { getJwtConfig } from 'src/config/jwt.config';
import { AuthTokenService } from './services/auth-token.service';
import { UserSession, UserSessionSchema } from './schemas/user-session.schema';
import {
  Subscription,
  SubscriptionSchema,
} from '../subscription/schemas/subscription.schema';
import { Plan, PlanSchema } from '../plan/schemas/plan.schema';
import {
  ActivityLog,
  ActivityLogSchema,
} from '../profile/schemas/settings/activity-logs.schema';
import { NotificationModule } from '../notification/notification.module';
import { AnalyticsModule } from '../analytics/analytics.module';

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
    NotificationModule,
    AnalyticsModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    AuthService,
    UserRepository,
    OtpService,
    AuthTokenService,
  ],
  exports: [AuthService, UserRepository, JwtModule, PassportModule],
})
export class AuthModule {}
