import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;

    // 🔐 TODO: Validate JWT
    // const userId = decodeToken(token);

    const userId = client.handshake.query.userId as string;
    client.data.userId = userId;

    console.log(`User connected: ${userId}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`User disconnected: ${client.data.userId}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, payload: { roomId: string }) {
    client.join(payload.roomId);
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: SendMessageDto) {
    const senderId = client.data.userId;

    const savedMessage = await this.chatService.sendMessage(senderId, payload);

    this.server.to(payload.roomId).emit('message', {
      _id: savedMessage._id,
      senderId,
      receiverId: payload.receiverId,
      message: payload.message,
    });
  }
}
