import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContextsModule } from '../contexts/contexts.module';
import { CampaignsController } from './controllers/campaigns.controller';
import { Campaign, CampaignSchema } from './schemas/campaigns.schema';
import { CampaignsService } from './services/campaigns.service';

@Module({
  imports: [
    ContextsModule,
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
    ]),
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
