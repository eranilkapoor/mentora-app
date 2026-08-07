import { IsMongoId, IsObject, IsOptional, IsString } from 'class-validator';

export class ReconcileLedgerDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsString()
  externalReference?: string;

  @IsOptional()
  @IsObject()
  reconciliation?: Record<string, unknown>;
}
