import { Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import { Role } from '@/common/enums';
import { OrganizationsService } from './organizations.service';

const createQueryChain = (result: unknown) => {
  const chain = {
    find: jest.fn(),
    findOne: jest.fn(),
    populate: jest.fn(),
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    select: jest.fn(),
    lean: jest.fn(),
  };
  chain.find.mockReturnValue(chain);
  chain.findOne.mockReturnValue(chain);
  chain.populate.mockReturnValue(chain);
  chain.sort.mockReturnValue(chain);
  chain.skip.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  chain.lean.mockResolvedValue(result);
  return chain;
};

const createFixture = () => {
  const organizations = {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    exists: jest.fn(),
  };
  const branches = { findOneAndUpdate: jest.fn() };
  const departments = { findOneAndUpdate: jest.fn() };
  const teams = { findOneAndUpdate: jest.fn() };
  const branding = { findOneAndUpdate: jest.fn() };
  const channelSettings = { findOneAndUpdate: jest.fn() };
  const sources = { findOneAndUpdate: jest.fn() };
  const stages = { findOneAndUpdate: jest.fn() };
  const users = {
    findOne: jest.fn(),
    create: jest.fn(),
    exists: jest.fn(),
    findById: jest.fn(),
  };
  const leads = { aggregate: jest.fn().mockResolvedValue([]) };
  const memberships = {
    find: jest.fn(),
    countDocuments: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };

  const service = new OrganizationsService(
    organizations as never,
    branches as never,
    departments as never,
    teams as never,
    branding as never,
    channelSettings as never,
    sources as never,
    stages as never,
    users as never,
    leads as never,
    memberships as never,
  );

  return {
    service,
    organizations,
    branches,
    departments,
    teams,
    users,
    leads,
    memberships,
  };
};

describe('OrganizationsService', () => {
  describe('listOrganizationUsers', () => {
    it('paginates within the full search-matched set, not just the current DB page', async () => {
      const { service, memberships } = createFixture();
      const organizationId = new Types.ObjectId().toString();

      // 25 memberships; only the ones with an email containing "match" are
      // relevant. Several of them fall outside what a naive
      // skip/limit-then-filter implementation would ever see on page 1.
      const allItems = Array.from({ length: 25 }, (_, index) => ({
        _id: new Types.ObjectId(),
        userId: {
          email:
            index % 5 === 0
              ? `match-${index}@example.com`
              : `user${index}@example.com`,
        },
      }));
      memberships.find.mockReturnValue(createQueryChain(allItems));
      memberships.countDocuments.mockResolvedValue(allItems.length);

      const result = await service.listOrganizationUsers({
        organizationId,
        search: 'match',
        limit: '2',
        page: '2',
      });

      // 5 total matches (indexes 0, 5, 10, 15, 20); page 2 of size 2 is
      // matches 3 and 4 (indexes 10 and 15).
      expect(result.pagination.total).toBe(5);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.items).toHaveLength(2);
      expect(
        result.items.every((item) =>
          (
            item as unknown as { userId: { email: string } }
          ).userId.email.includes('match'),
        ),
      ).toBe(true);
    });

    it('returns the plain DB page when no search term is given', async () => {
      const { service, memberships } = createFixture();
      const organizationId = new Types.ObjectId().toString();
      const pageItems = [{ _id: new Types.ObjectId() }];
      memberships.find.mockReturnValue(createQueryChain(pageItems));
      memberships.countDocuments.mockResolvedValue(42);

      const result = await service.listOrganizationUsers({
        organizationId,
        limit: '10',
        page: '1',
      });

      expect(result.items).toBe(pageItems);
      expect(result.pagination.total).toBe(42);
      expect(result.pagination.totalPages).toBe(5);
    });
  });

  describe('createOrganizationUser', () => {
    const baseDto = () => ({
      organizationId: new Types.ObjectId().toString(),
      email: 'new.counselor@example.com',
      password: 'Password@123',
      role: 'admission_counselor',
    });

    it('rejects when the email is already registered', async () => {
      const { service, users } = createFixture();
      users.findOne.mockResolvedValue({ _id: new Types.ObjectId() });

      await expect(
        service.createOrganizationUser(baseDto()),
      ).rejects.toMatchObject({
        code: ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
      });
      expect(users.create).not.toHaveBeenCalled();
    });

    it('rejects when the phone number is already registered', async () => {
      const { service, users } = createFixture();
      users.findOne
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce({ _id: new Types.ObjectId() }); // phone check

      await expect(
        service.createOrganizationUser({ ...baseDto(), phone: '9876543210' }),
      ).rejects.toMatchObject({
        code: ErrorCode.AUTH_PHONE_ALREADY_EXISTS,
      });
      expect(users.create).not.toHaveBeenCalled();
      expect(users.findOne).toHaveBeenLastCalledWith({
        'phone.phone': '9876543210',
      });
    });

    it('creates the user and membership when email and phone are free', async () => {
      const { service, users, organizations, memberships } = createFixture();
      const userId = new Types.ObjectId();
      users.findOne.mockResolvedValue(null);
      organizations.exists.mockResolvedValue(true);
      users.create.mockResolvedValue({ _id: userId });
      users.exists.mockResolvedValue(true);
      memberships.findOneAndUpdate.mockResolvedValue({
        _id: new Types.ObjectId(),
      });
      users.findById.mockReturnValue(
        createQueryChain({ _id: userId, email: baseDto().email }),
      );

      const result = await service.createOrganizationUser(baseDto());

      const calls = users.create.mock.calls as unknown[][];
      const created = calls[0][0] as {
        email: string;
        roles: Role[];
        permissions: string[];
      };
      expect(created.email).toBe(baseDto().email);
      expect(created.roles).toEqual([Role.ORG_STAFF]);
      expect(created.permissions).toEqual(
        expect.arrayContaining(['lead:view']),
      );
      expect(result.membership).toBeDefined();
    });

    it('rejects assigning a platform role through organization-membership creation', async () => {
      const { service, users } = createFixture();
      users.findOne.mockResolvedValue(null);

      await expect(
        service.createOrganizationUser({
          ...baseDto(),
          role: 'super_admin',
        }),
      ).rejects.toMatchObject({ code: ErrorCode.INVALID_REQUEST });
      expect(users.create).not.toHaveBeenCalled();
    });
  });
});
