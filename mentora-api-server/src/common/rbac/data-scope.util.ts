import { FilterQuery } from 'mongoose';
import { DataScope } from '@/common/enums';
import { ActorScopeContext } from './actor-scope.service';

export interface ScopeFieldMap {
  // Field holding the record's "owner" (e.g. assignedTo) — used for SELF.
  ownerField: string;
  organizationField: string;
  branchField?: string;
  departmentField?: string;
  teamField?: string;
}

function organizationFallback<T>(
  actor: ActorScopeContext,
  fields: ScopeFieldMap,
): FilterQuery<T> {
  return actor.organizationId
    ? ({ [fields.organizationField]: actor.organizationId } as FilterQuery<T>)
    : {};
}

/**
 * Turns a resolved ActorScopeContext into a Mongo filter fragment to AND
 * into an existing query. Falls back to organization-wide filtering only
 * when the target schema has no field for that scope tier (e.g. Tasks
 * before it gained branch/department/team fields) — an empty id array on
 * the actor still narrows the filter to match nothing, since that reflects
 * a real "assigned to zero branches" state, not a missing capability.
 */
export function buildScopeFilter<T>(
  actor: ActorScopeContext,
  fields: ScopeFieldMap,
): FilterQuery<T> {
  switch (actor.dataScope) {
    case DataScope.PLATFORM:
      return {};
    case DataScope.ORGANIZATION:
      return organizationFallback(actor, fields);
    case DataScope.BRANCH:
      return fields.branchField
        ? ({
            [fields.branchField]: { $in: actor.branchIds },
          } as FilterQuery<T>)
        : organizationFallback(actor, fields);
    case DataScope.DEPARTMENT:
      return fields.departmentField
        ? ({
            [fields.departmentField]: { $in: actor.departmentIds },
          } as FilterQuery<T>)
        : organizationFallback(actor, fields);
    case DataScope.TEAM:
      return fields.teamField
        ? ({ [fields.teamField]: { $in: actor.teamIds } } as FilterQuery<T>)
        : organizationFallback(actor, fields);
    case DataScope.SELF:
    default:
      return { [fields.ownerField]: actor.userId } as FilterQuery<T>;
  }
}
