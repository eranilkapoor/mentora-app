import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ChatController } from '@/modules/chat/controllers/chat.controller';
import { ChatService } from '@/modules/chat/services/chat.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { FeatureGuard } from '@/modules/subscriptions/guards/feature.guard';

class ToggleJwtGuardStub implements CanActivate {
  static allowed = true;

  canActivate(context: ExecutionContext): boolean {
    if (!ToggleJwtGuardStub.allowed) {
      return false;
    }

    const req = context.switchToHttp().getRequest();
    req.user = { sub: 'user-1' };
    return true;
  }
}

class ToggleFeatureGuardStub implements CanActivate {
  static allowed = true;

  canActivate(): boolean {
    return ToggleFeatureGuardStub.allowed;
  }
}

describe('Chat feature and access boundaries (e2e)', () => {
  let app: INestApplication;

  const chatService = {
    getConversations: jest.fn(),
    createOrGetDirectRoom: jest.fn(),
    health: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [{ provide: ChatService, useValue: chatService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(ToggleJwtGuardStub)
      .overrideGuard(FeatureGuard)
      .useClass(ToggleFeatureGuardStub)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    ToggleJwtGuardStub.allowed = true;
    ToggleFeatureGuardStub.allowed = true;

    chatService.getConversations.mockResolvedValue({ items: [] });
    chatService.createOrGetDirectRoom.mockResolvedValue({ roomId: 'room-1' });
  });

  it('returns 403 when jwt guard blocks protected chat routes', async () => {
    ToggleJwtGuardStub.allowed = false;

    await request(app.getHttpServer()).get('/chats/conversations').expect(403);

    expect(chatService.getConversations).not.toHaveBeenCalled();
  });

  it('returns 403 when feature guard blocks protected chat routes', async () => {
    ToggleFeatureGuardStub.allowed = false;

    await request(app.getHttpServer()).get('/chats/conversations').expect(403);

    expect(chatService.getConversations).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid direct-room payload and avoids service calls', async () => {
    await request(app.getHttpServer())
      .post('/chats/rooms/direct')
      .send({
        targetUserId: 'not-a-mongo-id',
        initialMessage: 'Hello there',
      })
      .expect(400);

    expect(chatService.createOrGetDirectRoom).not.toHaveBeenCalled();
  });

  it('returns success for authorized and valid chat routes', async () => {
    const list = await request(app.getHttpServer())
      .get('/chats/conversations?page=1&limit=20')
      .expect(200);

    const create = await request(app.getHttpServer())
      .post('/chats/rooms/direct')
      .send({
        targetUserId: '507f1f77bcf86cd799439011',
        initialMessage: 'Hi there',
      })
      .expect(201);

    expect(list.body.success).toBe(true);
    expect(create.body.success).toBe(true);
    expect(chatService.getConversations).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ page: 1, limit: 20 }),
    );
    expect(chatService.createOrGetDirectRoom).toHaveBeenCalledWith('user-1', {
      targetUserId: '507f1f77bcf86cd799439011',
      initialMessage: 'Hi there',
    });
  });
});
