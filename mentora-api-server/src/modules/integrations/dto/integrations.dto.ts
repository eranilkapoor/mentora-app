import { IsIn, IsMongoId, IsObject, IsOptional } from 'class-validator';

export class UpsertIntegrationProviderDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsIn([
    'not_configured',
    'sandbox_configured',
    'configured',
    'pending_approval',
    'healthy',
    'degraded',
  ])
  status?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  health?: Record<string, unknown>;
}
