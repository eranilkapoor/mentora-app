import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract correlation ID from request header or generate new one
    const correlationId = 
      req.headers['x-correlation-id'] as string || 
      uuidv4();

    // Generate request ID (unique per request)
    const requestId = uuidv4();

    // Attach to request object for later use
    req['correlationId'] = correlationId;
    req['requestId'] = requestId;

    // Add to response headers (send back to client)
    res.setHeader('X-Correlation-ID', correlationId);
    res.setHeader('X-Request-ID', requestId);

    // Store in async context for logging (optional but recommended)
    // This allows you to access correlationId anywhere in the request lifecycle
    
    next();
  }
}