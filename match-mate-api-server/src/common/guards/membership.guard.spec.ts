import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ErrorCode } from '../constants';
import { MembershipGuard } from './membership.guard';

describe('MembershipGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() };

  const context = (membership?: { tier?: string }) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: membership === undefined ? undefined : { membership },
        }),
      }),
    }) as unknown as ExecutionContext;

  let guard: MembershipGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new MembershipGuard(reflector as unknown as Reflector);
  });

  it('allows routes without a membership requirement', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(context())).toBe(true);
  });

  it('rejects users without membership data', () => {
    reflector.getAllAndOverride.mockReturnValue('gold');

    expect(() => guard.canActivate(context())).toThrow(
      ErrorCode.SUBSCRIPTION_REQUIRED,
    );
  });

  it('rejects users whose tier does not satisfy the route', () => {
    reflector.getAllAndOverride.mockReturnValue('gold');

    expect(() => guard.canActivate(context({ tier: 'free' }))).toThrow(
      ErrorCode.SUBSCRIPTION_FEATURE_NOT_AVAILABLE,
    );
  });

  it('allows users with the exact required tier', () => {
    reflector.getAllAndOverride.mockReturnValue('gold');

    expect(guard.canActivate(context({ tier: 'gold' }))).toBe(true);
  });
});
