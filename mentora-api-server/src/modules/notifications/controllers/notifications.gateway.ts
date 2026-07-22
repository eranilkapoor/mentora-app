import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { NotificationRealtimeService } from '../services/notification-realtime.service';
import { getJwtConfig } from '@/config/jwt.config';
import { AppLogger } from '@/common/logger/logger.service';
import { OperationalMetricsService } from '@/common/monitoring/operational-metrics.service';

interface SocketJwtPayload {
  sub: string;
}

interface SocketAuth {
  token?: string;
}

interface AuthenticatedSocket extends Socket {
  data: {
    userId?: string;
  };
}

@WebSocketGateway({
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly realtime: NotificationRealtimeService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
    private readonly metrics: OperationalMetricsService,
  ) {}

  afterInit(server: Server): void {
    this.realtime.bindServer(server);
  }

  async handleConnection(client: Socket): Promise<void> {
    const socket = client as AuthenticatedSocket;

    try {
      const payload = await this.verifyClient(socket);
      const userId = payload.sub;

      socket.data.userId = userId;
      await socket.join(this.realtime.getUserRoom(userId));
      this.metrics.recordSocketConnected('notifications');
      socket.emit('connection:ready', { userId });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unauthorized';
      this.logger.warn(`Notification socket authentication failed: ${message}`);
      this.metrics.recordSocketAuthFailure('notifications');
      socket.emit('connection:error', { message: 'Unauthorized' });
      socket.disconnect(true);
    }
  }

  handleDisconnect(): void {
    this.metrics.recordSocketDisconnected('notifications');
    // Room cleanup is handled by Socket.IO.
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

  private extractToken(client: Socket): string | undefined {
    const auth = client.handshake.auth as SocketAuth | undefined;
    const authToken = auth?.token?.trim();
    if (authToken) {
      return authToken.startsWith('Bearer ') ? authToken.slice(7) : authToken;
    }

    const authorizationHeader = client.handshake.headers.authorization;
    if (
      typeof authorizationHeader === 'string' &&
      authorizationHeader.startsWith('Bearer ')
    ) {
      return authorizationHeader.slice(7);
    }

    const queryToken = (client.handshake.query as Record<string, unknown>)
      ?.token;
    if (typeof queryToken === 'string' && queryToken.trim().length > 0) {
      return queryToken.startsWith('Bearer ')
        ? queryToken.slice(7)
        : queryToken;
    }

    return undefined;
  }
}
