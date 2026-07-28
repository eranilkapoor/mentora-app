import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import {
  SUPPORT_TICKET_STATUSES,
  SupportTicketStatus,
} from '../support.constants';

function toInt(value: unknown): unknown {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.length > 0) return Number(value);
  return value;
}

export class ListSupportTicketsDto {
  @IsOptional()
  @Transform(({ value }) => toInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => toInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsIn(SUPPORT_TICKET_STATUSES)
  status?: SupportTicketStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
