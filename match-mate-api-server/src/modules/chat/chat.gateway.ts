import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { ChatRealtimeService } from './chat-realtime.service';
import { JoinRoomDto } from './dto/join-room.dto';
import { MarkRoomReadDto } from './dto/mark-room-read.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { TypingEventDto } from './dto/typing-event.dto';
import { ChatPresenceService } from './chat-presence.service';
import { getJwtConfig } from 'src/config/jwt.config';

interface SocketJwtPayload {
  sub: string;
}

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*' },
})
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly presence: ChatPresenceService,
    private readonly realtime: ChatRealtimeService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.realtime.bindServer(server);
  }

  async handleConnection(client: Socket) {
    try {
      const payload = await this.verifyClient(client);
      const userId = payload.sub;

      this.presence.connect(userId, client.id);
      client.data.userId = userId;

      await client.join(this.realtime.getUserRoom(userId));
      client.emit('connection:ready', { userId });
      this.server
        .to(this.realtime.getUserRoom(userId))
        .emit('presence:update', {
          userId,
          isOnline: true,
        });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unauthorized';
      this.logger.warn(`Socket authentication failed: ${message}`);
      client.emit('connection:error', { message: 'Unauthorized' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.presence.disconnect(client.id);
    if (!userId) {
      return;
    }

    this.server.to(this.userRoom(userId)).emit('presence:update', {
      userId,
      isOnline: false,
      lastSeen: this.presence.getLastSeen(userId),
    });
  }

  @SubscribeMessage('room:join')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomDto,
  ) {
    const userId = this.getClientUserId(client);
    await this.chatService.getConversationDetail(userId, payload.roomId);
    await client.join(this.realtime.getConversationRoom(payload.roomId));
    await this.chatService.getMessages(userId, payload.roomId, { limit: 20 });

    return {
      event: 'room:joined',
      data: { roomId: payload.roomId },
    };
  }

  @SubscribeMessage('message:send')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessageDto,
  ) {
    const userId = this.getClientUserId(client);
    const message = await this.chatService.sendMessage(userId, payload);

    return {
      event: 'message:sent',
      data: message,
    };
  }

  @SubscribeMessage('message:read')
  async handleReadReceipt(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomDto & MarkRoomReadDto,
  ) {
    const userId = this.getClientUserId(client);
    const result = await this.chatService.markRoomRead(
      userId,
      payload.roomId,
      payload,
    );

    return {
      event: 'message:read:ack',
      data: result,
    };
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TypingEventDto,
  ) {
    const userId = this.getClientUserId(client);
    await this.chatService.getConversationDetail(userId, payload.roomId);

    client
      .to(this.realtime.getConversationRoom(payload.roomId))
      .emit('typing', {
        roomId: payload.roomId,
        userId,
        isTyping: payload.isTyping,
      });

    return {
      event: 'typing:ack',
      data: {
        roomId: payload.roomId,
        isTyping: payload.isTyping,
      },
    };
  }

  private getClientUserId(client: Socket) {
    const userId = client.data.userId as string | undefined;
    if (!userId) {
      throw new WsException('Unauthorized');
    }

    return userId;
  }

  private async verifyClient(client: Socket): Promise<SocketJwtPayload> {
    const token = this.extractToken(client);
    if (!token) {
      throw new Error('Missing token');
    }

    const jwtConfig = getJwtConfig(this.configService);
    return this.jwtService.verifyAsync<SocketJwtPayload>(token, {
      secret: jwtConfig.secret,
      audience: jwtConfig.audience,
      issuer: jwtConfig.issuer,
    });
  }

  private extractToken(client: Socket) {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.trim().length > 0) {
      return authToken.startsWith('Bearer ') ? authToken.slice(7) : authToken;
    }

    const authorizationHeader = client.handshake.headers.authorization;
    if (
      typeof authorizationHeader === 'string' &&
      authorizationHeader.startsWith('Bearer ')
    ) {
      return authorizationHeader.slice(7);
    }

    const queryToken = client.handshake.query.token;
    if (typeof queryToken === 'string' && queryToken.trim().length > 0) {
      return queryToken.startsWith('Bearer ')
        ? queryToken.slice(7)
        : queryToken;
    }

    return undefined;
  }

  private userRoom(userId: string) {
    return this.realtime.getUserRoom(userId);
  }
}
