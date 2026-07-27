import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContextsController } from './controllers/contexts.controller';
import {
  UserMembership,
  UserMembershipSchema,
} from './schemas/contexts.schema';
import { ContextsService } from './services/contexts.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserMembership.name, schema: UserMembershipSchema },
    ]),
  ],
  controllers: [ContextsController],
  providers: [ContextsService],
  exports: [ContextsService],
})
export class ContextsModule {}
