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
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../services/chat.service';
import { ChatRealtimeService } from '../services/chat-realtime.service';
import { JoinRoomDto } from '../dto/join-room.dto';
import { MarkRoomReadDto } from '../dto/mark-room-read.dto';
import { SendMessageDto } from '../dto/send-message.dto';
import { TypingEventDto } from '../dto/typing-event.dto';
import { ChatPresenceService } from '../services/chat-presence.service';
import { getJwtConfig } from '@/config/jwt.config';
import { AppLogger } from '@/common/logger/logger.service';

interface SocketJwtPayload {
  sub: string;
}

interface AuthenticatedSocket extends Socket {
  data: {
    userId?: string;
  };
}

interface SocketAuth {
  token?: string;
}

@WebSocketGateway({
  namespace: '/chats',
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

  constructor(
    private readonly chatService: ChatService,
    private readonly presence: ChatPresenceService,
    private readonly realtime: ChatRealtimeService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  afterInit(server: Server): void {
    this.realtime.bindServer(server);
  }

  async handleConnection(client: Socket): Promise<void> {
    const socket = client as AuthenticatedSocket;

    try {
      const payload = await this.verifyClient(socket);
      const userId = payload.sub;

      this.presence.connect(userId, socket.id);
      socket.data.userId = userId;

      await socket.join(this.realtime.getUserRoom(userId));

      socket.emit('connection:ready', { userId });

      this.server
        .to(this.realtime.getUserRoom(userId))
        .emit('presence:update', {
          userId,
          isOnline: true,
        });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unauthorized';

      this.logger.warn(`Socket authentication failed: ${message}`);

      socket.emit('connection:error', { message: 'Unauthorized' });
      socket.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    const socket = client as AuthenticatedSocket;

    const userId = this.presence.disconnect(socket.id);
    if (!userId) return;

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
  ): Promise<{ event: string; data: { roomId: string } }> {
    const socket = client as AuthenticatedSocket;
    const userId = this.getClientUserId(socket);

    await this.chatService.getConversationDetail(userId, payload.roomId);
    await socket.join(this.realtime.getConversationRoom(payload.roomId));
    await this.chatService.getMessages(userId, payload.roomId, { limit: 20 });

    return {
      event: 'room:joined',
      data: { roomId: payload.roomId },
    };
  }

  @SubscribeMessage('room:leave')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomDto,
  ): Promise<{ event: string; data: { roomId: string } }> {
    const socket = client as AuthenticatedSocket;
    this.getClientUserId(socket);

    await socket.leave(this.realtime.getConversationRoom(payload.roomId));

    return {
      event: 'room:left',
      data: { roomId: payload.roomId },
    };
  }

  @SubscribeMessage('message:send')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessageDto,
  ): Promise<{ event: string; data: unknown }> {
    const socket = client as AuthenticatedSocket;
    const userId = this.getClientUserId(socket);

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
  ): Promise<{ event: string; data: unknown }> {
    const socket = client as AuthenticatedSocket;
    const userId = this.getClientUserId(socket);

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
  ): Promise<{ event: string; data: { roomId: string; isTyping: boolean } }> {
    const socket = client as AuthenticatedSocket;
    const userId = this.getClientUserId(socket);

    await this.chatService.getConversationDetail(userId, payload.roomId);

    socket
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

  private getClientUserId(client: AuthenticatedSocket): string {
    const { userId } = client.data;

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

  private getAuthToken(client: Socket): string | undefined {
    const auth = client.handshake.auth as SocketAuth | undefined;

    if (auth && typeof auth.token === 'string') {
      const token = auth.token.trim();
      if (token.length > 0) {
        return token.startsWith('Bearer ') ? token.slice(7) : token;
      }
    }

    return undefined;
  }

  private extractToken(client: Socket): string | undefined {
    //  Auth object
    const authToken = this.getAuthToken(client);
    if (authToken) return authToken;

    //  Authorization header
    const authorizationHeader = client.handshake.headers.authorization;
    if (
      typeof authorizationHeader === 'string' &&
      authorizationHeader.startsWith('Bearer ')
    ) {
      return authorizationHeader.slice(7);
    }

    //  Query param
    const query = client.handshake.query as Record<string, unknown>;
    const queryToken = query?.token;

    if (typeof queryToken === 'string' && queryToken.trim().length > 0) {
      return queryToken.startsWith('Bearer ')
        ? queryToken.slice(7)
        : queryToken;
    }

    return undefined;
  }

  private userRoom(userId: string): string {
    return this.realtime.getUserRoom(userId);
  }
}
