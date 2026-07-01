import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { SupportTicketController } from '@/modules/support/controllers/support-ticket.controller';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { FeatureGuard } from '@/modules/subscriptions/guards/feature.guard';
import { NotificationsService } from '@/modules/notifications/services/notifications.service';
import {
  SupportTicket,
  SupportTicketSchema,
} from '@/modules/support/schemas/support-ticket.schema';
import { SupportTicketRepository } from '@/modules/support/repositories/support-ticket.repository';
import { SupportTicketService } from '@/modules/support/services/support-ticket.service';

class AuthenticatedGuardStub implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { sub: '507f1f77bcf86cd799439012' };
    return true;
  }
}

describe('Support ticket lifecycle DB-backed (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let connection: Connection;

  const notificationsService = {
    notify: jest.fn(),
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: () => ({ uri: mongoServer.getUri() }),
        }),
        MongooseModule.forFeature([
          { name: SupportTicket.name, schema: SupportTicketSchema },
        ]),
      ],
      controllers: [SupportTicketController],
      providers: [
        SupportTicketRepository,
        SupportTicketService,
        { provide: NotificationsService, useValue: notificationsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(AuthenticatedGuardStub)
      .overrideGuard(FeatureGuard)
      .useClass(AuthenticatedGuardStub)
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

    connection = app.get<Connection>(getConnectionToken());
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await connection.db?.dropDatabase();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  it('persists create, list, get, reply, and close ticket lifecycle', async () => {
    const create = await request(app.getHttpServer())
      .post('/support/tickets')
      .send({
        subject: 'Need billing help',
        category: 'billing',
        priority: 'high',
        message: 'I was charged twice for my membership renewal.',
      })
      .expect(201);

    expect(create.body.success).toBe(true);
    expect(create.body.data.subject).toBe('Need billing help');
    expect(create.body.data.status).toBe('open');
    expect(create.body.data.messages).toHaveLength(1);

    const ticketId = create.body.data._id as string;

    const list = await request(app.getHttpServer())
      .get('/support/tickets?page=1&limit=20')
      .expect(200);

    expect(list.body.success).toBe(true);
    expect(list.body.data.total).toBe(1);
    expect(list.body.data.items).toHaveLength(1);
    expect(list.body.data.items[0]._id).toBe(ticketId);

    const get = await request(app.getHttpServer())
      .get(`/support/tickets/${ticketId}`)
      .expect(200);

    expect(get.body.success).toBe(true);
    expect(get.body.data._id).toBe(ticketId);
    expect(get.body.data.category).toBe('billing');

    const reply = await request(app.getHttpServer())
      .post(`/support/tickets/${ticketId}/replies`)
      .send({ message: 'Please check the invoice and refund the extra charge.' })
      .expect(200);

    expect(reply.body.success).toBe(true);
    expect(reply.body.data.messages).toHaveLength(2);
    expect(reply.body.data.status).toBe('open');

    const close = await request(app.getHttpServer())
      .patch(`/support/tickets/${ticketId}/close`)
      .expect(200);

    expect(close.body.success).toBe(true);
    expect(close.body.data.status).toBe('closed');
    expect(notificationsService.notify).toHaveBeenCalledTimes(2);
  });
});
