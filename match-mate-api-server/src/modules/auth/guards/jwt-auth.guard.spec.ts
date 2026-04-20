import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';

describe('JwtAuthGuard', () => {
  const logger = { error: jest.fn() };

  afterEach(() => jest.clearAllMocks());

  it('canActivate should return true for @Public routes', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(true),
    } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector, logger as any);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(reflector.getAllAndOverride as jest.Mock).toHaveBeenCalledWith(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
  });

  it('handleRequest should throw token expired message', () => {
    const reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector, logger as any);

    expect(() =>
      guard.handleRequest(null, false, {
        name: 'TokenExpiredError',
        message: 'jwt expired',
      }),
    ).toThrow(new UnauthorizedException('Token expired'));
  });

  it('handleRequest should throw unauthorized when user missing', () => {
    const reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector, logger as any);

    expect(() =>
      guard.handleRequest(null, false, { message: 'bad token' }),
    ).toThrow(new UnauthorizedException('bad token'));
    expect(logger.error).toHaveBeenCalled();
  });
});
