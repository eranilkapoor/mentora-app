import { Types } from 'mongoose';
import { DataScope, Role } from '@/common/enums';
import { ActorScopeService } from './actor-scope.service';

const createQueryChain = (result: unknown) => {
  const chain = {
    select: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn(),
  };
  chain.select.mockReturnValue(chain);
  chain.lean.mockReturnValue(chain);
  chain.exec.mockResolvedValue(result);
  return chain;
};

const createFixture = () => {
  const users = { findById: jest.fn() };
  const memberships = { findOne: jest.fn() };
  const service = new ActorScopeService(users as never, memberships as never);
  return { service, users, memberships };
};

describe('ActorScopeService', () => {
  it('gives platform-role actors an unrestricted PLATFORM scope without a membership lookup', async () => {
    const { service, users, memberships } = createFixture();
    users.findById.mockReturnValue(
      createQueryChain({ roles: [Role.SUPER_ADMIN] }),
    );

    const scope = await service.resolveActorScope(
      new Types.ObjectId().toString(),
    );

    expect(scope.dataScope).toBe(DataScope.PLATFORM);
    expect(memberships.findOne).not.toHaveBeenCalled();
  });

  it('derives scope and branch/department/team ids from the active membership', async () => {
    const { service, users, memberships } = createFixture();
    const branchId = new Types.ObjectId();
    users.findById.mockReturnValue(createQueryChain({ roles: [] }));
    memberships.findOne.mockReturnValue(
      createQueryChain({
        role: 'branch_admin',
        organizationId: new Types.ObjectId(),
        branchIds: [branchId],
        departmentIds: [],
        teamIds: [],
      }),
    );

    const scope = await service.resolveActorScope(
      new Types.ObjectId().toString(),
      new Types.ObjectId().toString(),
    );

    expect(scope.dataScope).toBe(DataScope.BRANCH);
    expect(scope.branchIds).toEqual([branchId]);
  });

  it('falls back to the narrowest SELF scope when no active membership exists', async () => {
    const { service, users, memberships } = createFixture();
    users.findById.mockReturnValue(createQueryChain({ roles: [] }));
    memberships.findOne.mockReturnValue(createQueryChain(null));

    const scope = await service.resolveActorScope(
      new Types.ObjectId().toString(),
    );

    expect(scope.dataScope).toBe(DataScope.SELF);
    expect(scope.branchIds).toEqual([]);
  });
});
