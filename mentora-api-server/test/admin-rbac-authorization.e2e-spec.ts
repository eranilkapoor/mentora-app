import { CanActivate, ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { RbacController } from '@/modules/admin/controllers/rbac.controller';
import { RbacService } from '@/modules/admin/services/rbac.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

class AuthenticatedGuardStub implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { sub: 'admin-1' };
    return true;
  }
}

class TogglePermissionsGuardStub implements CanActivate {
  static allowed = true;

  canActivate(): boolean {
    return TogglePermissionsGuardStub.allowed;
  }
}

describe('Admin RBAC authorization boundaries (e2e)', () => {
  let app: INestApplication;

  const rbacService = {
    getPermissions: jest.fn(),
    createPermission: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RbacController],
      providers: [{ provide: RbacService, useValue: rbacService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(AuthenticatedGuardStub)
      .overrideGuard(PermissionsGuard)
      .useClass(TogglePermissionsGuardStub)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    TogglePermissionsGuardStub.allowed = true;
    rbacService.getPermissions.mockResolvedValue([{ _id: 'perm-1' }]);
    rbacService.createPermission.mockResolvedValue({ _id: 'perm-2' });
  });

  it('denies access when permissions guard rejects the request', async () => {
    TogglePermissionsGuardStub.allowed = false;

    await request(app.getHttpServer()).get('/admin/rbac/permissions').expect(403);

    expect(rbacService.getPermissions).not.toHaveBeenCalled();
  });

  it('allows access and returns success response when authorized', async () => {
    const list = await request(app.getHttpServer())
      .get('/admin/rbac/permissions')
      .expect(200);

    const create = await request(app.getHttpServer())
      .post('/admin/rbac/permissions')
      .send({
        name: 'ADMIN_TEST_PERMISSION',
        module: 'admin',
        description: 'Permission for authorization e2e coverage',
      })
      .expect(201);

    expect(list.body.success).toBe(true);
    expect(create.body.success).toBe(true);
    expect(rbacService.getPermissions).toHaveBeenCalledTimes(1);
    expect(rbacService.createPermission).toHaveBeenCalledTimes(1);
  });
});
