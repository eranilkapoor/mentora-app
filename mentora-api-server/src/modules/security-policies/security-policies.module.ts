import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';
import { ContextsModule } from '../contexts/contexts.module';
import { SecurityPoliciesController } from './controllers/security-policies.controller';
import {
  OrganizationSecurityPolicy,
  OrganizationSecurityPolicySchema,
} from './schemas/security-policies.schema';
import { SecurityPoliciesService } from './services/security-policies.service';

@Module({
  imports: [
    AdminModule,
    ContextsModule,
    MongooseModule.forFeature([
      {
        name: OrganizationSecurityPolicy.name,
        schema: OrganizationSecurityPolicySchema,
      },
    ]),
  ],
  controllers: [SecurityPoliciesController],
  providers: [SecurityPoliciesService],
  exports: [SecurityPoliciesService],
})
export class SecurityPoliciesModule {}
