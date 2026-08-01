import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

export function toOrganizationObjectId(organizationId: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(organizationId)) {
    throw new BadRequestException('Valid organizationId is required');
  }

  return new Types.ObjectId(organizationId);
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
