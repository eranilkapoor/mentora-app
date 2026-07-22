import { SetMetadata } from '@nestjs/common';

export const INTERNAL_API_KEY_REQUIRED = 'internalApiKeyRequired';

export const RequireInternalApiKey = (): MethodDecorator & ClassDecorator =>
  SetMetadata(INTERNAL_API_KEY_REQUIRED, true);
