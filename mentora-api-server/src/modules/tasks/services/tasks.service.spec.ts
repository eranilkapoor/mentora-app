import { Types } from 'mongoose';
import { DataScope } from '@/common/enums';
import { TasksService } from './tasks.service';

const createQueryChain = (result: unknown) => {
  const chain = {
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    lean: jest.fn(),
  };
  chain.find.mockReturnValue(chain);
  chain.findOneAndUpdate.mockReturnValue(chain);
  chain.sort.mockReturnValue(chain);
  chain.skip.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  chain.lean.mockResolvedValue(result);
  return chain;
};

const createFixture = () => {
  const tasks = {
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    countDocuments: jest.fn().mockResolvedValue(0),
    create: jest.fn().mockResolvedValue({}),
  };
  const actorScope = {
    resolveActorScope: jest.fn().mockResolvedValue({
      dataScope: DataScope.SELF,
      userId: new Types.ObjectId(),
      branchIds: [],
      departmentIds: [],
      teamIds: [],
    }),
  };

  const service = new TasksService(tasks as never, actorScope as never);

  return { service, tasks, actorScope };
};

describe('TasksService', () => {
  describe('createTask', () => {
    it('denormalizes branch/department/team from the assignee’s membership', async () => {
      const { service, tasks, actorScope } = createFixture();
      const branchId = new Types.ObjectId();
      const departmentId = new Types.ObjectId();
      const teamId = new Types.ObjectId();
      actorScope.resolveActorScope.mockResolvedValue({
        dataScope: DataScope.SELF,
        userId: new Types.ObjectId(),
        branchIds: [branchId],
        departmentIds: [departmentId],
        teamIds: [teamId],
      });

      await service.createTask(new Types.ObjectId().toString(), {
        organizationId: new Types.ObjectId().toString(),
        entityType: 'lead',
        entityId: new Types.ObjectId().toString(),
        title: 'Follow up',
        assignedTo: new Types.ObjectId().toString(),
      });

      expect(tasks.create).toHaveBeenCalledWith(
        expect.objectContaining({ branchId, departmentId, teamId }),
      );
    });
  });

  describe('listTasks', () => {
    it('ANDs a scope filter onto the query when an actor is given', async () => {
      const { service, tasks, actorScope } = createFixture();
      const userId = new Types.ObjectId();
      tasks.find.mockReturnValue(createQueryChain([]));
      actorScope.resolveActorScope.mockResolvedValue({
        dataScope: DataScope.SELF,
        userId,
        branchIds: [],
        departmentIds: [],
        teamIds: [],
      });

      await service.listTasks(
        { organizationId: new Types.ObjectId().toString() },
        userId.toString(),
      );

      const calls = tasks.find.mock.calls as unknown[][];
      const filter = calls[0][0] as {
        $and: [Record<string, unknown>, Record<string, unknown>];
      };
      expect(filter.$and[1]).toEqual({ assignedTo: userId });
    });

    it('leaves the filter untouched when no actor is given', async () => {
      const { service, tasks, actorScope } = createFixture();
      tasks.find.mockReturnValue(createQueryChain([]));

      await service.listTasks({
        organizationId: new Types.ObjectId().toString(),
      });

      expect(actorScope.resolveActorScope).not.toHaveBeenCalled();
      const calls = tasks.find.mock.calls as unknown[][];
      const filter = calls[0][0] as Record<string, unknown>;
      expect(filter.$and).toBeUndefined();
    });
  });

  describe('archiveTask', () => {
    it('scopes the archive filter so a SELF-scoped actor cannot cancel another rep’s task', async () => {
      const { service, tasks, actorScope } = createFixture();
      const userId = new Types.ObjectId();
      tasks.findOneAndUpdate.mockReturnValue(createQueryChain(null));
      actorScope.resolveActorScope.mockResolvedValue({
        dataScope: DataScope.SELF,
        userId,
        branchIds: [],
        departmentIds: [],
        teamIds: [],
      });

      await service.archiveTask(
        new Types.ObjectId().toString(),
        new Types.ObjectId().toString(),
        userId.toString(),
      );

      const calls = tasks.findOneAndUpdate.mock.calls as unknown[][];
      const filter = calls[0][0] as {
        $and: [Record<string, unknown>, Record<string, unknown>];
      };
      expect(filter.$and[1]).toEqual({ assignedTo: userId });
    });
  });
});
