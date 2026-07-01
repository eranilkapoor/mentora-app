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
import { AdminSupportTicketController } from '@/modules/support/controllers/admin-support-ticket.controller';
import { SupportTicketService } from '@/modules/support/services/support-ticket.service';
import { SupportTicketRepository } from '@/modules/support/repositories/support-ticket.repository';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { FeatureGuard } from '@/modules/subscriptions/guards/feature.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { NotificationsService } from '@/modules/notifications/services/notifications.service';
import {
  SupportTicket,
  SupportTicketSchema,
} from '@/modules/support/schemas/support-ticket.schema';

class RouteUserGuardStub implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const isAdminRoute = String(req.url).startsWith('/admin/');
    req.user = {
      sub: isAdminRoute
        ? '507f1f77bcf86cd799439099'
        : '507f1f77bcf86cd799439012',
    };
    return true;
  }
}

describe('Admin support ticket flow DB-backed (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let connection: Connection;

  const notificationsService = {
    notify: jest.fn(async () => undefined),
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
      controllers: [SupportTicketController, AdminSupportTicketController],
      providers: [
        SupportTicketRepository,
        SupportTicketService,
        { provide: NotificationsService, useValue: notificationsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(RouteUserGuardStub)
      .overrideGuard(FeatureGuard)
      .useClass(RouteUserGuardStub)
      .overrideGuard(RolesGuard)
      .useClass(RouteUserGuardStub)
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

  it('persists admin list, reply, and status update over a user-created ticket', async () => {
    const create = await request(app.getHttpServer())
      .post('/support/tickets')
      .send({
        subject: 'Account verification issue',
        category: 'account',
        priority: 'normal',
        message: 'My verification status is stuck and needs manual review.',
      })
      .expect(201);

    const ticketId = create.body.data._id as string;

    const adminList = await request(app.getHttpServer())
      .get('/admin/support/tickets?page=1&limit=20')
      .expect(200);

    expect(adminList.body.success).toBe(true);
    expect(adminList.body.data.total).toBe(1);

    const reply = await request(app.getHttpServer())
      .post(`/admin/support/tickets/${ticketId}/replies`)
      .send({ message: 'We are reviewing your verification and will update you shortly.' })
      .expect(201);

    expect(reply.body.success).toBe(true);
    expect(reply.body.data.status).toBe('pending');
    expect(reply.body.data.messages).toHaveLength(2);

    const status = await request(app.getHttpServer())
      .patch(`/admin/support/tickets/${ticketId}/status`)
      .send({ status: 'resolved' })
      .expect(200);

    expect(status.body.success).toBe(true);
    expect(status.body.data.status).toBe('resolved');

    const userView = await request(app.getHttpServer())
      .get(`/support/tickets/${ticketId}`)
      .expect(200);

    expect(userView.body.data.status).toBe('resolved');
    expect(notificationsService.notify).toHaveBeenCalledTimes(2);
  });
});
