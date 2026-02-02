import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithCorrelationId } from '../interfaces/request-with-correlation.interface';

export const CorrelationId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithCorrelationId>();

    return request.correlationId;
  },
);
