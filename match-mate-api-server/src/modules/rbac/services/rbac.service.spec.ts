import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RbacService } from './rbac.service';
import { Permission } from '../schemas/permission.schema';
import { Role } from '../schemas/role.schema';
import { User } from '../../auth/schemas/user.schema';

const buildModel = () => ({
  create: jest.fn(),
  find: jest.fn(),
  findByIdAndDelete: jest.fn(),
  findByIdAndUpdate: jest.fn(),
});

describe('RbacService', () => {
  let service: RbacService;
  let permissionModel: ReturnType<typeof buildModel>;
  let roleModel: ReturnType<typeof buildModel>;
  let userModel: ReturnType<typeof buildModel>;

  beforeEach(async () => {
    permissionModel = buildModel();
    roleModel = buildModel();
    userModel = buildModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RbacService,
        { provide: getModelToken(Permission.name), useValue: permissionModel },
        { provide: getModelToken(Role.name), useValue: roleModel },
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();

    service = module.get<RbacService>(RbacService);
  });

  afterEach(() => jest.clearAllMocks());

  it('createPermission should call permission model create', async () => {
    permissionModel.create.mockResolvedValue({ _id: 'p1' });
    const result = await service.createPermission({ name: 'PLAN_CREATE' });
    expect(result).toEqual({ _id: 'p1' });
  });

  it('getRoles should return populated roles', async () => {
    const roles = [{ _id: 'r1' }];
    roleModel.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue(roles),
    });

    const result = await service.getRoles();
    expect(result).toEqual(roles);
  });

  it('assignRoles should flatten permissions and update user', async () => {
    roleModel.find.mockReturnValue({
      populate: jest
        .fn()
        .mockResolvedValue([
          { permissions: [{ name: 'A' }, { name: 'B' }] },
          { permissions: [{ name: 'B' }, { name: 'C' }] },
        ]),
    });
    userModel.findByIdAndUpdate.mockResolvedValue({ _id: 'u1' });

    const result = await service.assignRoles('u1', ['r1', 'r2']);

    expect(result).toEqual({ _id: 'u1' });
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({
        permissions: ['A', 'B', 'C'],
        roles: ['r1', 'r2'],
      }),
      { new: true },
    );
  });
});
