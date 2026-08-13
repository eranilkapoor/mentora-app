import { Module } from '@nestjs/common';
import { ContextsModule } from '../contexts/contexts.module';
import { ModuleRecordsModule } from '../module-records/module-records.module';
import { NotesController } from './controllers/notes.controller';

@Module({
  imports: [ContextsModule, ModuleRecordsModule],
  controllers: [NotesController],
})
export class NotesModule {}
