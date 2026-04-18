import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { ForbiddenException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly connectedUsers = new Map<string, string>();

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    const userId = this.getStringValue(client.handshake.query.userId);
    if (!userId) {
      client.disconnect(true);
      return;
    }

    this.connectedUsers.set(client.id, userId);

    console.log(`User connected: ${userId}`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id) ?? 'unknown';
    this.connectedUsers.delete(client.id);
    console.log(`User disconnected: ${userId}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, payload: { roomId: string }) {
    void client.join(payload.roomId);
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: SendMessageDto) {
    const senderId = this.connectedUsers.get(client.id);
    if (!senderId) {
      throw new ForbiddenException('Unauthorized');
    }

    const savedMessage = await this.chatService.sendMessage(senderId, payload);

    this.server.to(payload.roomId).emit('message', {
      _id: savedMessage._id,
      senderId,
      receiverId: payload.receiverId,
      message: payload.message,
    });
  }

  private getStringValue(value: unknown): string | undefined {
    if (typeof value === 'string') {
      return value;
    }

    if (
      Array.isArray(value) &&
      value.length > 0 &&
      typeof value[0] === 'string'
    ) {
      return value[0];
    }

    return undefined;
  }
}
