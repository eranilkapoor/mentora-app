import { SetMetadata } from '@nestjs/common';

export const SKIP_RATE_LIMIT_KEY = 'skip-rate-limit';

export const SkipRateLimit = () => SetMetadata(SKIP_RATE_LIMIT_KEY, true);

// Usage in controller:
/*
@SkipRateLimit()
@Get('health')
async health() { ... }
*/
