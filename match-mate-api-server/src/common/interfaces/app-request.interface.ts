import { Request } from 'express';
import { JwtUser } from '../../modules/auth/interfaces/jwt-user.interface';

export interface AppRequest extends Request {
  user?: JwtUser;
  correlationId?: string;
  requestId?: string;
  clientVersion?: string;
  platform?: string;
  deviceId?: string;
}
