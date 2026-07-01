import { CanActivate, ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AdminController } from '@/modules/admin/controllers/admin.controller';
import { AdminService } from '@/modules/admin/services/admin.service';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';

class AuthenticatedGuardStub implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { sub: 'admin-1' };
    return true;
  }
}

class ToggleRolesGuardStub implements CanActivate {
  static allowed = true;

  canActivate(): boolean {
    return ToggleRolesGuardStub.allowed;
  }
}

describe('Admin role access boundaries (e2e)', () => {
  let app: INestApplication;

  const adminService = {
    getDashboard: jest.fn(),
    getUsers: jest.fn(),
    getUserById: jest.fn(),
    updateUserStatus: jest.fn(),
    broadcast: jest.fn(),
  };

  const auditService = {
    list: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: adminService },
        { provide: AdminAuditService, useValue: auditService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(AuthenticatedGuardStub)
      .overrideGuard(RolesGuard)
      .useClass(ToggleRolesGuardStub)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    ToggleRolesGuardStub.allowed = true;

    adminService.getDashboard.mockResolvedValue({ users: 5 });
    auditService.list.mockResolvedValue({ items: [] });
  });

  it('returns 403 when role guard blocks access to admin endpoints', async () => {
    ToggleRolesGuardStub.allowed = false;

    await request(app.getHttpServer()).get('/admin/dashboard').expect(403);
    await request(app.getHttpServer()).get('/admin/audit-logs').expect(403);

    expect(adminService.getDashboard).not.toHaveBeenCalled();
    expect(auditService.list).not.toHaveBeenCalled();
  });

  it('returns successful responses when role guard allows access', async () => {
    const dashboard = await request(app.getHttpServer())
      .get('/admin/dashboard')
      .expect(200);

    const logs = await request(app.getHttpServer())
      .get('/admin/audit-logs')
      .expect(200);

    expect(dashboard.body.success).toBe(true);
    expect(logs.body.success).toBe(true);
    expect(adminService.getDashboard).toHaveBeenCalledTimes(1);
    expect(auditService.list).toHaveBeenCalledTimes(1);
  });
});
