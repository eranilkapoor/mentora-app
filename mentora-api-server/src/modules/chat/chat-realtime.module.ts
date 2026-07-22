import { Module } from '@nestjs/common';
import { ChatRealtimeService } from './services/chat-realtime.service';

@Module({
  providers: [ChatRealtimeService],
  exports: [ChatRealtimeService],
})
export class ChatRealtimeModule {}
