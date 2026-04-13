import { Module, Global } from '@nestjs/common';
import { StorageService } from './storage.service';

@Global() // makes StorageService available everywhere without re-importing
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
