import { Request } from 'express';
import { JwtUser } from '../../modules/auth/interfaces/jwt-user.interface';

export interface AppRequest extends Request {
  /**
   * Populated by JwtStrategy (optional for public routes)
   */
  user?: JwtUser;

  /**
   * Request tracing / logging
   */
  correlationId?: string;
  requestId?: string;

  /**
   * Optional metadata (can be set via middleware if needed)
   */
  clientVersion?: string;
}
