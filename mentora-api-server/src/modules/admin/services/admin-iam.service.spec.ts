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
    findOne: jest.fn(),
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

      await service.createUser(baseDto(), new Types.ObjectId().toString());

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
        service.createUser(
          { ...baseDto(), role: 'super_admin' },
          new Types.ObjectId().toString(),
        ),
      ).rejects.toMatchObject({ code: ErrorCode.INVALID_REQUEST });
      expect(users.create).not.toHaveBeenCalled();
    });

    it('rejects creating a user in an organization the actor cannot access', async () => {
      const { service, users, memberships } = createFixture();
      users.findById.mockReturnValue(
        createQueryChain({ roles: [Role.ORG_STAFF] }),
      );
      memberships.find.mockReturnValue(createQueryChain([]));

      await expect(
        service.createUser(baseDto(), new Types.ObjectId().toString()),
      ).rejects.toMatchObject({
        message: 'Organization access denied',
      });
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

      await service.getAuthOverview(
        organizationId,
        new Types.ObjectId().toString(),
      );

      expect(users.countDocuments).toHaveBeenCalledWith({
        deletedAt: { $exists: false },
        _id: { $in: [membershipUserId, globalStaffId] },
      });
    });

    it('does not include global platform staff in organization-admin overview counts', async () => {
      const { service, users, sessions, memberships } = createFixture();
      const organizationId = new Types.ObjectId();
      const membershipUserId = new Types.ObjectId();

      users.findById.mockReturnValue(
        createQueryChain({ roles: [Role.ORG_STAFF] }),
      );
      memberships.find
        .mockReturnValueOnce(createQueryChain([{ organizationId }]))
        .mockReturnValueOnce(createQueryChain([{ userId: membershipUserId }]));
      sessions.find.mockReturnValue(createQueryChain([]));

      await service.getAuthOverview(
        organizationId.toString(),
        new Types.ObjectId().toString(),
      );

      const userFindCalls = users.find.mock.calls as Array<[unknown]>;
      expect(
        userFindCalls.some((call) =>
          Object.prototype.hasOwnProperty.call(
            call[0] as Record<string, unknown>,
            'roles',
          ),
        ),
      ).toBe(false);
      expect(users.countDocuments).toHaveBeenCalledWith({
        deletedAt: { $exists: false },
        _id: { $in: [membershipUserId] },
      });
    });
  });

  describe('user access protection', () => {
    it('rejects organization admin viewing a platform super admin user', async () => {
      const { service, users, memberships } = createFixture();
      const organizationId = new Types.ObjectId();
      const targetUserId = new Types.ObjectId().toString();

      users.findById
        .mockReturnValueOnce(createQueryChain({ roles: [Role.ORG_STAFF] }))
        .mockReturnValueOnce(createQueryChain({ roles: [Role.SUPER_ADMIN] }));
      memberships.find.mockReturnValue(createQueryChain([{ organizationId }]));
      memberships.findOne.mockReturnValue(createQueryChain({ _id: 'member' }));

      await expect(
        service.getUser(targetUserId, new Types.ObjectId().toString()),
      ).rejects.toMatchObject({
        message: 'Platform user access denied',
      });
    });

    it('rejects organization admin updating a user from another organization', async () => {
      const { service, users, memberships } = createFixture();
      const actorOrganizationId = new Types.ObjectId();
      const targetOrganizationId = new Types.ObjectId();
      const targetUserId = new Types.ObjectId().toString();

      users.findById
        .mockReturnValueOnce(createQueryChain({ roles: [Role.ORG_STAFF] }))
        .mockReturnValueOnce(
          createQueryChain({
            roles: [Role.ORG_STAFF],
            save: jest.fn(),
          }),
        )
        .mockReturnValueOnce(createQueryChain({ roles: [Role.ORG_STAFF] }));
      memberships.find
        .mockReturnValueOnce(
          createQueryChain([{ organizationId: actorOrganizationId }]),
        )
        .mockReturnValueOnce(
          createQueryChain([{ organizationId: targetOrganizationId }]),
        );

      await expect(
        service.updateUser(
          targetUserId,
          { firstName: 'Blocked' },
          new Types.ObjectId().toString(),
        ),
      ).rejects.toMatchObject({
        message: 'User access denied',
      });
    });
  });
});
