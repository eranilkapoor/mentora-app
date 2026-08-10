import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  SUPPORT_TICKET_PRIORITIES,
  SUPPORT_TICKET_STATUSES,
  SupportTicketPriority,
  SupportTicketStatus,
} from '../support.constants';
import { ListSupportTicketsDto } from './list-support-tickets.dto';

export class AdminCreateSupportTicketDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  subject?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(4000)
  message?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  priority?: string;
}

export class AdminListSupportTicketsDto extends ListSupportTicketsDto {
  @IsOptional()
  @IsIn(SUPPORT_TICKET_PRIORITIES)
  priority?: SupportTicketPriority;
}

export class AdminReplySupportTicketDto {
  @IsString()
  @MinLength(2)
  @MaxLength(4000)
  message!: string;
}

export class UpdateSupportTicketStatusDto {
  @IsIn(SUPPORT_TICKET_STATUSES)
  status!: SupportTicketStatus;
}

export class BulkUpdateSupportTicketStatusDto {
  @IsArray()
  @IsString({ each: true })
  recordIds!: string[];

  @IsIn(SUPPORT_TICKET_STATUSES)
  status!: SupportTicketStatus;
}
