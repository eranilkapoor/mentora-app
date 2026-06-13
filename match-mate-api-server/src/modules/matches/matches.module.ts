import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchesController } from './controllers/matches.controller';
import { MatchesService } from './services/matches.service';
import { MatchDiscoveryService } from './services/match-discovery.service';
import { MatchNotificationService } from './services/match-notification.service';
import { MatchCompatibilityService } from './services/match-compatibility.service';
import { PremiumMatchCuratorService } from './services/premium-match-curator.service';
import { MatchRepository } from './repositories/match.repository';
import { MatchDiscoveryRepository } from './repositories/match-discovery.repository';
import { Match, MatchSchema } from './schemas/match.schema';
import { Interest, InterestSchema } from './schemas/interest.schema';
import {
  CuratedMatch,
  CuratedMatchSchema,
} from './schemas/curated-match.schema';
import {
  Profile,
  ProfileSchema,
} from '../profiles/schemas/profile/profile.schema';
import {
  Preference,
  PreferenceSchema,
} from '../profiles/schemas/preference/preference.schema';
import { Media, MediaSchema } from '../profiles/schemas/media/media.schema';
import {
  Interaction,
  InteractionSchema,
} from '../profiles/schemas/interaction/interaction.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { SettingsModule } from '../settings/settings.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { DailyMatchDigestTask } from './tasks/daily-match-digest.task';
import { MatchExpiryTask } from './tasks/match-expiry.task';

@Module({
  imports: [
    NotificationsModule,
    SettingsModule,
    SubscriptionsModule,
    MongooseModule.forFeature([
      { name: Match.name, schema: MatchSchema },
      { name: Interest.name, schema: InterestSchema },
      { name: CuratedMatch.name, schema: CuratedMatchSchema },
      // Read-only access to Profile and Preference for discovery
      { name: Profile.name, schema: ProfileSchema },
      { name: Preference.name, schema: PreferenceSchema },
      { name: Media.name, schema: MediaSchema },
      { name: Interaction.name, schema: InteractionSchema },
    ]),
  ],
  controllers: [MatchesController],
  providers: [
    MatchesService,
    MatchDiscoveryService,
    PremiumMatchCuratorService,
    MatchCompatibilityService,
    MatchNotificationService,
    MatchRepository,
    MatchDiscoveryRepository,
    DailyMatchDigestTask,
    MatchExpiryTask,
  ],
  exports: [MatchesService, MatchDiscoveryService, PremiumMatchCuratorService],
})
export class MatchesModule {}
