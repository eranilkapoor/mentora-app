import { Module } from '@nestjs/common';
import { ModuleRecordsModule } from '../module-records/module-records.module';
import { NotesController } from './controllers/notes.controller';

@Module({
  imports: [ModuleRecordsModule],
  controllers: [NotesController],
})
export class NotesModule {}
