import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AssignFeatureDto {
  @IsMongoId()
  planId!: string;

  @IsMongoId()
  featureId!: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiPropertyOptional({
    oneOf: [{ type: 'boolean' }, { type: 'number' }, { type: 'string' }],
  })
  value?: boolean | number | string;
}
