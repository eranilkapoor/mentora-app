import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContextsModule } from '../contexts/contexts.module';
import { ProgramsController } from './controllers/programs.controller';
import { Program, ProgramSchema } from './schemas/programs.schema';
import { ProgramsService } from './services/programs.service';

@Module({
  imports: [
    ContextsModule,
    MongooseModule.forFeature([{ name: Program.name, schema: ProgramSchema }]),
  ],
  controllers: [ProgramsController],
  providers: [ProgramsService],
  exports: [ProgramsService],
})
export class ProgramsModule {}
