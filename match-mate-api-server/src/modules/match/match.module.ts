import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchController } from './controllers/match.controller';
import { MatchService } from './services/match.service';
import { MatchRepository } from './repositories/match.repository';
import { Interest, InterestSchema } from './schemas/interest.schema';
import { Match, MatchSchema } from './schemas/match.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Interest.name, schema: InterestSchema },
      { name: Match.name, schema: MatchSchema },
    ]),
  ],
  controllers: [MatchController],
  providers: [MatchService, MatchRepository],
  exports: [MatchService],
})
export class MatchModule {}
