import { Types } from 'mongoose';
import { DataScope } from '@/common/enums';
import { ActorScopeContext } from './actor-scope.service';
import { buildScopeFilter, ScopeFieldMap } from './data-scope.util';

const fields: ScopeFieldMap = {
  ownerField: 'assignedTo',
  organizationField: 'organizationId',
  branchField: 'branchId',
  departmentField: 'departmentId',
  teamField: 'teamId',
};

const baseActor = (
  overrides: Partial<ActorScopeContext> = {},
): ActorScopeContext => ({
  dataScope: DataScope.SELF,
  userId: new Types.ObjectId(),
  organizationId: new Types.ObjectId(),
  branchIds: [],
  departmentIds: [],
  teamIds: [],
  ...overrides,
});

describe('buildScopeFilter', () => {
  it('returns an empty filter for PLATFORM scope', () => {
    expect(
      buildScopeFilter(baseActor({ dataScope: DataScope.PLATFORM }), fields),
    ).toEqual({});
  });

  it('filters by organization for ORGANIZATION scope', () => {
    const actor = baseActor({ dataScope: DataScope.ORGANIZATION });
    expect(buildScopeFilter(actor, fields)).toEqual({
      organizationId: actor.organizationId,
    });
  });

  it('filters by branch ids for BRANCH scope when the schema supports it', () => {
    const branchId = new Types.ObjectId();
    const actor = baseActor({
      dataScope: DataScope.BRANCH,
      branchIds: [branchId],
    });
    expect(buildScopeFilter(actor, fields)).toEqual({
      branchId: { $in: [branchId] },
    });
  });

  it('matches nothing for BRANCH scope when the actor has zero assigned branches', () => {
    const actor = baseActor({ dataScope: DataScope.BRANCH, branchIds: [] });
    expect(buildScopeFilter(actor, fields)).toEqual({ branchId: { $in: [] } });
  });

  it('falls back to organization-wide filtering when the schema has no branch field', () => {
    const actor = baseActor({ dataScope: DataScope.BRANCH });
    const fieldsWithoutBranch: ScopeFieldMap = {
      ownerField: fields.ownerField,
      organizationField: fields.organizationField,
    };
    expect(buildScopeFilter(actor, fieldsWithoutBranch)).toEqual({
      organizationId: actor.organizationId,
    });
  });

  it('filters by the owner field for SELF scope', () => {
    const actor = baseActor({ dataScope: DataScope.SELF });
    expect(buildScopeFilter(actor, fields)).toEqual({
      assignedTo: actor.userId,
    });
  });
});
