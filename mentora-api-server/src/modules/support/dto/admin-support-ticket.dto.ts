import {
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
