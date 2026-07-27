import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';
import { ContextsModule } from '../contexts/contexts.module';
import { FinanceLedgersController } from './controllers/finance-ledgers.controller';
import {
  FinanceLedgerEntry,
  FinanceLedgerEntrySchema,
} from './schemas/finance-ledgers.schema';
import { FinanceLedgersService } from './services/finance-ledgers.service';

@Module({
  imports: [
    AdminModule,
    ContextsModule,
    MongooseModule.forFeature([
      { name: FinanceLedgerEntry.name, schema: FinanceLedgerEntrySchema },
    ]),
  ],
  controllers: [FinanceLedgersController],
  providers: [FinanceLedgersService],
  exports: [FinanceLedgersService],
})
export class FinanceLedgersModule {}
