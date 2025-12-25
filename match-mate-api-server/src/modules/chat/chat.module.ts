import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatRepository } from './chat.repository';
import { ChatController } from './chat.controller';
import {
  ChatMessage,
  ChatMessageSchema,
} from './schemas/chat-message.schema';
import {
  ChatRoom,
  ChatRoomSchema,
} from './schemas/chat-room.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
    ]),
  ],
  providers: [ChatGateway, ChatService, ChatRepository],
  controllers: [ChatController],
})
export class ChatModule {}