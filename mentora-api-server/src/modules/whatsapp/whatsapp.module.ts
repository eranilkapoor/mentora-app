import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';
import { ContextsModule } from '../contexts/contexts.module';
import { WhatsappController } from './controllers/whatsapp.controller';
import {
  WhatsappConversation,
  WhatsappConversationSchema,
} from './schemas/whatsapp.schema';
import { WhatsappService } from './services/whatsapp.service';

@Module({
  imports: [
    AdminModule,
    ContextsModule,
    MongooseModule.forFeature([
      { name: WhatsappConversation.name, schema: WhatsappConversationSchema },
    ]),
  ],
  controllers: [WhatsappController],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
