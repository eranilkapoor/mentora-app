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
import { AdminController } from '@/modules/admin/controllers/admin.controller';
import { AdminService } from '@/modules/admin/services/admin.service';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import { AdminAuditLog, AdminAuditLogSchema } from '@/modules/admin/schemas/admin-audit-log.schema';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';

class AdminUserGuardStub implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { sub: '507f1f77bcf86cd799439099', roles: ['admin'] };
    return true;
  }
}

describe('Admin audit log DB-backed (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let connection: Connection;
  let auditService: AdminAuditService;

  const adminService = {
    getDashboard: jest.fn(),
    getUsers: jest.fn(),
    getUserById: jest.fn(),
    updateUserStatus: jest.fn(),
    broadcast: jest.fn(),
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: () => ({ uri: mongoServer.getUri() }),
        }),
        MongooseModule.forFeature([
          { name: AdminAuditLog.name, schema: AdminAuditLogSchema },
        ]),
      ],
      controllers: [AdminController],
      providers: [
        AdminAuditService,
        { provide: AdminService, useValue: adminService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(AdminUserGuardStub)
      .overrideGuard(RolesGuard)
      .useClass(AdminUserGuardStub)
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
    auditService = app.get(AdminAuditService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await connection?.db?.dropDatabase();
  });

  afterAll(async () => {
    await app?.close();
    await mongoServer?.stop();
  });

  it('persists and filters audit logs through the admin endpoint', async () => {
    await auditService.write({
      actorId: '507f1f77bcf86cd799439099',
      action: 'ticket_status_update',
      resource: 'support_ticket',
      targetId: 'ticket-1',
      metadata: { status: 'resolved' },
    });
    await auditService.write({
      actorId: '507f1f77bcf86cd799439099',
      action: 'ticket_reply',
      resource: 'support_ticket',
      targetId: 'ticket-1',
      metadata: { messageCount: 2 },
    });

    const response = await request(app.getHttpServer())
      .get('/admin/audit-logs?resource=support_ticket&action=ticket_status_update&page=1&limit=20')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].action).toBe('ticket_status_update');
    expect(response.body.data.pagination).toMatchObject({
      page: 1,
      limit: 20,
      total: 1,
    });
  });
});
