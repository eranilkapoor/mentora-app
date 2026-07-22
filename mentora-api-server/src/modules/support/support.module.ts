import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsModule } from '../notifications/notifications.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { AdminSupportTicketController } from './controllers/admin-support-ticket.controller';
import { SupportTicketController } from './controllers/support-ticket.controller';
import { SupportTicketRepository } from './repositories/support-ticket.repository';
import {
  SupportTicket,
  SupportTicketSchema,
} from './schemas/support-ticket.schema';
import { SupportTicketService } from './services/support-ticket.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupportTicket.name, schema: SupportTicketSchema },
    ]),
    NotificationsModule,
    SubscriptionsModule,
  ],
  controllers: [SupportTicketController, AdminSupportTicketController],
  providers: [SupportTicketService, SupportTicketRepository],
  exports: [SupportTicketService],
})
export class SupportModule {}
