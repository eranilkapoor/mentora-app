import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

export function toTenantObjectId(tenantId: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(tenantId)) {
    throw new BadRequestException('Valid tenantId is required');
  }

  return new Types.ObjectId(tenantId);
}

export function toOptionalObjectId(value?: string): Types.ObjectId | undefined {
  if (!value) return undefined;
  if (!Types.ObjectId.isValid(value)) {
    throw new BadRequestException('Valid object id is required');
  }

  return new Types.ObjectId(value);
}

export function toRequiredObjectId(value: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(value)) {
    throw new BadRequestException('Valid object id is required');
  }

  return new Types.ObjectId(value);
}
