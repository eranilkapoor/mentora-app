import { Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import { Role } from '@/common/enums';
import { AdminIamService } from './admin-iam.service';

const createQueryChain = (result: unknown) => {
  const chain = {
    find: jest.fn(),
    populate: jest.fn(),
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    select: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn(),
  };
  chain.find.mockReturnValue(chain);
  chain.populate.mockReturnValue(chain);
  chain.sort.mockReturnValue(chain);
  chain.skip.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  chain.lean.mockReturnValue(chain);
  chain.exec.mockResolvedValue(result);
  return chain;
};

const createFixture = () => {
  const users = {
    find: jest.fn(),
    findOne: jest.fn().mockReturnValue(createQueryChain(null)),
    countDocuments: jest.fn().mockResolvedValue(0),
    findById: jest
      .fn()
      .mockReturnValue(createQueryChain({ roles: [Role.SUPER_ADMIN] })),
    create: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
  };
  const sessions = {
    find: jest.fn(),
    countDocuments: jest.fn().mockResolvedValue(0),
    aggregate: jest.fn().mockResolvedValue([]),
    updateMany: jest.fn(),
  };
  const memberships = {
    find: jest.fn(),
    create: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
    findOneAndUpdate: jest.fn(),
  };

  const service = new AdminIamService(
    users as never,
    sessions as never,
    memberships as never,
  );

  return { service, users, sessions, memberships };
};

describe('AdminIamService', () => {
  describe('listUsers', () => {
    it('includes global staff alongside membership users for a plain org filter', async () => {
      const { service, users, memberships } = createFixture();
      const organizationId = new Types.ObjectId().toString();
      const membershipUserId = new Types.ObjectId();

      memberships.find.mockReturnValue(
        createQueryChain([{ userId: membershipUserId }]),
      );
      users.find.mockReturnValue(createQueryChain([]));

      await service.listUsers(
        { organizationId, page: '1', limit: '10' },
        new Types.ObjectId().toString(),
      );

      const calls = users.find.mock.calls as unknown[][];
      const userFilter = calls[0][0] as { $and: unknown[] };
      expect(userFilter.$and).toEqual([
        {
          $or: [
            { _id: { $in: [membershipUserId] } },
            {
              roles: {
                $in: [
                  Role.SUPER_ADMIN,
                  Role.ADMIN,
                  Role.SUPPORT,
                  Role.FINANCE,
                  Role.KYC_REVIEWER,
                  Role.CONTENT_MODERATOR,
                  Role.MARKETING_ADMIN,
                  Role.CONTENT_MANAGER,
                  Role.MODERATOR,
                ],
              },
            },
          ],
        },
      ]);
    });

    it('stays strictly membership-scoped when a role or branch filter narrows the query', async () => {
      const { service, users, memberships } = createFixture();
      const organizationId = new Types.ObjectId().toString();
      const membershipUserId = new Types.ObjectId();

      memberships.find.mockReturnValue(
        createQueryChain([{ userId: membershipUserId }]),
      );
      users.find.mockReturnValue(createQueryChain([]));

      await service.listUsers(
        {
          organizationId,
          role: 'branch_admin',
          page: '1',
          limit: '10',
        },
        new Types.ObjectId().toString(),
      );

      const calls = users.find.mock.calls as unknown[][];
      const userFilter = calls[0][0] as { $and: unknown[] };
      expect(userFilter.$and).toEqual([{ _id: { $in: [membershipUserId] } }]);
    });
  });

  describe('createUser', () => {
    const baseDto = () => ({
      email: 'counselor@example.com',
      password: 'Password@123',
      role: 'admission_counselor',
      organizationId: new Types.ObjectId().toString(),
    });

    it('assigns Role.ORG_STAFF and derived permissions instead of defaulting to Role.ADMIN', async () => {
      const { service, users } = createFixture();

      await service.createUser(baseDto());

      const calls = users.create.mock.calls as unknown[][];
      const created = calls[0][0] as { roles: Role[]; permissions: string[] };
      expect(created.roles).toEqual([Role.ORG_STAFF]);
      expect(created.permissions).toEqual(
        expect.arrayContaining(['lead:view']),
      );
    });

    it('rejects assigning a platform role through the organization-user flow', async () => {
      const { service, users } = createFixture();

      await expect(
        service.createUser({ ...baseDto(), role: 'super_admin' }),
      ).rejects.toMatchObject({ code: ErrorCode.INVALID_REQUEST });
      expect(users.create).not.toHaveBeenCalled();
    });
  });

  describe('getAuthOverview', () => {
    it('scopes counts to membership users plus global staff for the organization', async () => {
      const { service, users, sessions, memberships } = createFixture();
      const organizationId = new Types.ObjectId().toString();
      const membershipUserId = new Types.ObjectId();
      const globalStaffId = new Types.ObjectId();

      memberships.find.mockReturnValue(
        createQueryChain([{ userId: membershipUserId }]),
      );
      users.find.mockReturnValueOnce(
        createQueryChain([{ _id: globalStaffId }]),
      );
      sessions.find.mockReturnValue(createQueryChain([]));

      await service.getAuthOverview(organizationId);

      expect(users.countDocuments).toHaveBeenCalledWith({
        deletedAt: { $exists: false },
        _id: { $in: [membershipUserId, globalStaffId] },
      });
    });
  });
});
