import { Types } from 'mongoose';
import { DataScope } from '@/common/enums';
import { LeadsService } from './leads.service';

const createQueryChain = (result: unknown) => {
  const chain = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    populate: jest.fn(),
    select: jest.fn(),
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    lean: jest.fn(),
  };
  chain.find.mockReturnValue(chain);
  chain.findOne.mockReturnValue(chain);
  chain.findOneAndUpdate.mockReturnValue(chain);
  chain.populate.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  chain.sort.mockReturnValue(chain);
  chain.skip.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  chain.lean.mockResolvedValue(result);
  return chain;
};

const createFixture = () => {
  const leads = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    countDocuments: jest.fn().mockResolvedValue(0),
    create: jest.fn(),
  };
  const activities = { create: jest.fn().mockResolvedValue({}) };
  const assignments = { create: jest.fn().mockResolvedValue({}) };
  const sources = {
    countDocuments: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };
  const stages = {
    findOne: jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue(null),
    }),
  };
  const auditService = { write: jest.fn().mockResolvedValue(undefined) };
  const actorScope = { resolveActorScope: jest.fn() };

  const service = new LeadsService(
    leads as never,
    activities as never,
    assignments as never,
    sources as never,
    stages as never,
    auditService as never,
    actorScope as never,
  );

  return {
    service,
    leads,
    activities,
    assignments,
    stages,
    auditService,
    actorScope,
  };
};

describe('LeadsService', () => {
  describe('listLeads', () => {
    it('does not resolve or apply a scope filter when no actor is given', async () => {
      const { service, leads, actorScope } = createFixture();
      leads.find.mockReturnValue(createQueryChain([]));

      await service.listLeads({
        organizationId: new Types.ObjectId().toString(),
      });

      expect(actorScope.resolveActorScope).not.toHaveBeenCalled();
      const calls = leads.find.mock.calls as unknown[][];
      const filter = calls[0][0] as Record<string, unknown>;
      expect(filter.$and).toBeUndefined();
    });

    it('ANDs a SELF-scoped actor filter onto the query without discarding existing filters', async () => {
      const { service, leads, actorScope } = createFixture();
      const userId = new Types.ObjectId();
      const organizationId = new Types.ObjectId().toString();
      leads.find.mockReturnValue(createQueryChain([]));
      actorScope.resolveActorScope.mockResolvedValue({
        dataScope: DataScope.SELF,
        userId,
        organizationId: new Types.ObjectId(organizationId),
        branchIds: [],
        departmentIds: [],
        teamIds: [],
      });

      await service.listLeads(
        { organizationId, branchId: new Types.ObjectId().toString() },
        userId.toString(),
      );

      const calls = leads.find.mock.calls as unknown[][];
      const filter = calls[0][0] as {
        $and: [Record<string, unknown>, Record<string, unknown>];
      };
      expect(filter.$and[0]).toMatchObject({});
      expect(filter.$and[1]).toEqual({ assignedTo: userId });
      // the caller's explicit branchId filter must survive alongside scope
      expect(filter.$and[0]).toHaveProperty('branchId');
    });

    it('does not apply any filter for a PLATFORM-scoped actor', async () => {
      const { service, leads, actorScope } = createFixture();
      leads.find.mockReturnValue(createQueryChain([]));
      actorScope.resolveActorScope.mockResolvedValue({
        dataScope: DataScope.PLATFORM,
        userId: new Types.ObjectId(),
        branchIds: [],
        departmentIds: [],
        teamIds: [],
      });

      await service.listLeads(
        { organizationId: new Types.ObjectId().toString() },
        new Types.ObjectId().toString(),
      );

      const calls = leads.find.mock.calls as unknown[][];
      const filter = calls[0][0] as Record<string, unknown>;
      expect(filter.$and).toBeUndefined();
    });
  });

  describe('getLead', () => {
    it('scopes the lookup so a SELF-scoped actor cannot fetch another rep’s lead', async () => {
      const { service, leads, actorScope } = createFixture();
      const userId = new Types.ObjectId();
      const organizationId = new Types.ObjectId().toString();
      leads.findOne.mockReturnValue(createQueryChain(null));
      actorScope.resolveActorScope.mockResolvedValue({
        dataScope: DataScope.SELF,
        userId,
        organizationId: new Types.ObjectId(organizationId),
        branchIds: [],
        departmentIds: [],
        teamIds: [],
      });

      await expect(
        service.getLead(
          organizationId,
          new Types.ObjectId().toString(),
          userId.toString(),
        ),
      ).rejects.toThrow('Education CRM lead not found');

      const calls = leads.findOne.mock.calls as unknown[][];
      const filter = calls[0][0] as {
        $and: [Record<string, unknown>, Record<string, unknown>];
      };
      expect(filter.$and[1]).toEqual({ assignedTo: userId });
    });
  });
});
