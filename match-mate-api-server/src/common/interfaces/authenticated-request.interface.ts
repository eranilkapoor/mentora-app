import { AppRequest } from './app-request.interface';
import { JwtUser } from 'src/modules/auth/interfaces/jwt-user.interface';

export interface AuthenticatedRequest extends AppRequest {
    /**
     * Guaranteed user (after JwtAuthGuard)
     */
    user: JwtUser;
}