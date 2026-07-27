import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContextsController } from './controllers/contexts.controller';
import {
  UserMembership,
  UserMembershipSchema,
} from './schemas/contexts.schema';
import { TenantContextGuard } from './guards/tenant-context.guard';
import { ContextsService } from './services/contexts.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserMembership.name, schema: UserMembershipSchema },
    ]),
  ],
  controllers: [ContextsController],
  providers: [ContextsService, TenantContextGuard],
  exports: [ContextsService, TenantContextGuard],
})
export class ContextsModule {}
