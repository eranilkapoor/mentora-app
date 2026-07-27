import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';
import { ContextsModule } from '../contexts/contexts.module';
import { WorkflowsController } from './controllers/workflows.controller';
import {
  WorkflowExecution,
  WorkflowExecutionSchema,
  WorkflowRule,
  WorkflowRuleSchema,
} from './schemas/workflows.schema';
import { WorkflowsService } from './services/workflows.service';

@Module({
  imports: [
    AdminModule,
    ContextsModule,
    MongooseModule.forFeature([
      { name: WorkflowRule.name, schema: WorkflowRuleSchema },
      { name: WorkflowExecution.name, schema: WorkflowExecutionSchema },
    ]),
  ],
  controllers: [WorkflowsController],
  providers: [WorkflowsService],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}
