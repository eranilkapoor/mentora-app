import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';
import {
  SUPPORT_TICKET_CATEGORIES,
  SUPPORT_TICKET_MESSAGE_AUTHOR_TYPES,
  SUPPORT_TICKET_PRIORITIES,
  SUPPORT_TICKET_STATUSES,
  SupportTicketCategory,
  SupportTicketMessageAuthorType,
  SupportTicketPriority,
  SupportTicketStatus,
} from '../support.constants';

@Schema({ _id: false, timestamps: true })
export class SupportTicketMessage {
  @Prop({ type: Types.ObjectId, required: true })
  authorId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: SUPPORT_TICKET_MESSAGE_AUTHOR_TYPES,
    default: 'user',
  })
  authorType!: SupportTicketMessageAuthorType;

  @Prop({ required: true, trim: true, maxlength: 4000 })
  message!: string;

  @Prop({ type: [String], default: [] })
  attachments!: string[];

  createdAt?: Date;
  updatedAt?: Date;
}

@Schema({ collection: COLLECTION_NAMES.SUPPORT_TICKET, timestamps: true })
export class SupportTicket {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 160 })
  subject!: string;

  @Prop({ type: String, enum: SUPPORT_TICKET_CATEGORIES, default: 'other' })
  category!: SupportTicketCategory;

  @Prop({ type: String, enum: SUPPORT_TICKET_PRIORITIES, default: 'normal' })
  priority!: SupportTicketPriority;

  @Prop({ type: String, enum: SUPPORT_TICKET_STATUSES, default: 'open' })
  status!: SupportTicketStatus;

  @Prop({ type: [SupportTicketMessage], default: [] })
  messages!: SupportTicketMessage[];

  @Prop({ type: Types.ObjectId })
  assignedTo?: Types.ObjectId;

  @Prop()
  lastUserReplyAt?: Date;

  @Prop()
  lastAgentReplyAt?: Date;

  @Prop()
  resolvedAt?: Date;

  @Prop()
  closedAt?: Date;
}

export type SupportTicketDocument = SupportTicket & Document;
export const SupportTicketSchema = SchemaFactory.createForClass(SupportTicket);

SupportTicketSchema.index({ userId: 1, updatedAt: -1 });
SupportTicketSchema.index({ status: 1, priority: 1, updatedAt: -1 });
SupportTicketSchema.index({ status: 1, updatedAt: -1 });
SupportTicketSchema.index({ category: 1, status: 1 });
