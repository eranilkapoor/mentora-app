import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { MatchRepository } from './match.repository';
import {
  Interest,
  InterestSchema,
} from './schemas/interest.schema';
import {
  Match,
  MatchSchema,
} from './schemas/match.schema';

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