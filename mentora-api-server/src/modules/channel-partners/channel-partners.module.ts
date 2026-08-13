import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';
import { ContextsModule } from '../contexts/contexts.module';
import { ChannelPartnersController } from './controllers/channel-partners.controller';
import {
  ChannelPartner,
  ChannelPartnerSchema,
} from './schemas/channel-partner.schema';
import { ChannelPartnersService } from './services/channel-partners.service';

@Module({
  imports: [
    AdminModule,
    ContextsModule,
    MongooseModule.forFeature([
      { name: ChannelPartner.name, schema: ChannelPartnerSchema },
    ]),
  ],
  controllers: [ChannelPartnersController],
  providers: [ChannelPartnersService],
  exports: [ChannelPartnersService],
})
export class ChannelPartnersModule {}
