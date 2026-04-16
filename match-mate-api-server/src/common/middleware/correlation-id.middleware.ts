import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(
    req: Request & { correlationId?: string, requestId?: string },
    res: Response,
    next: NextFunction,
  ) {
    const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();

    req.correlationId = correlationId;
    req.requestId = requestId;

    res.setHeader('X-Correlation-ID', correlationId);
    res.setHeader('X-Request-ID', requestId);

    next();
  }
}
