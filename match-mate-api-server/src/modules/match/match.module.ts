import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchController } from './controllers/match.controller';
import { MatchService } from './services/match.service';
import { MatchDiscoveryService } from './services/match-discovery.service';
import { MatchRepository } from './repositories/match.repository';
import { MatchDiscoveryRepository } from './repositories/match-discovery.repository';
import { Match, MatchSchema } from './schemas/match.schema';
import { Interest, InterestSchema } from './schemas/interest.schema';
import {
  Profile,
  ProfileSchema,
} from '../profile/schemas/profile/profile.schema';
import {
  Preference,
  PreferenceSchema,
} from '../profile/schemas/preference/preference.schema';
import { Media, MediaSchema } from '../profile/schemas/media/media.schema';
import {
  Interaction,
  InteractionSchema,
} from '../profile/schemas/interaction/interaction.schema';
import { NotificationModule } from '../notification/notification.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    NotificationModule,
    SettingsModule,
    MongooseModule.forFeature([
      { name: Match.name, schema: MatchSchema },
      { name: Interest.name, schema: InterestSchema },
      // Read-only access to Profile and Preference for discovery
      { name: Profile.name, schema: ProfileSchema },
      { name: Preference.name, schema: PreferenceSchema },
      { name: Media.name, schema: MediaSchema },
      { name: Interaction.name, schema: InteractionSchema },
    ]),
  ],
  controllers: [MatchController],
  providers: [
    MatchService,
    MatchDiscoveryService,
    MatchRepository,
    MatchDiscoveryRepository,
  ],
  exports: [MatchService, MatchDiscoveryService],
})
export class MatchModule {}
