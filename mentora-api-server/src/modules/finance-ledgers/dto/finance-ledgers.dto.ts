import {
  IsIn,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

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

export class ExportLedgerDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsIn(['csv', 'json'])
  format?: string;
}
