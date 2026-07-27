import {
  IsIn,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class ReconcileLedgerDto {
  @IsMongoId()
  tenantId!: string;

  @IsOptional()
  @IsString()
  externalReference?: string;

  @IsOptional()
  @IsObject()
  reconciliation?: Record<string, unknown>;
}

export class ExportLedgerDto {
  @IsMongoId()
  tenantId!: string;

  @IsOptional()
  @IsIn(['csv', 'json'])
  format?: string;
}
