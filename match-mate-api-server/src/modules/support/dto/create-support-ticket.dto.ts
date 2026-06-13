import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  SUPPORT_TICKET_CATEGORIES,
  SUPPORT_TICKET_PRIORITIES,
  SupportTicketCategory,
  SupportTicketPriority,
} from '../support.constants';

export class CreateSupportTicketDto {
  @IsString()
  @MinLength(4)
  @MaxLength(160)
  subject!: string;

  @IsOptional()
  @IsIn(SUPPORT_TICKET_CATEGORIES)
  category?: SupportTicketCategory;

  @IsOptional()
  @IsIn(SUPPORT_TICKET_PRIORITIES)
  priority?: SupportTicketPriority;

  @IsString()
  @MinLength(10)
  @MaxLength(4000)
  message!: string;
}
