import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

@Schema({
  collection: COLLECTION_NAMES.ADMIN_AUDIT_LOG,
  timestamps: true,
  versionKey: false,
})
export class AdminAuditLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  actorId!: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  action!: string;

  @Prop({ required: true, trim: true, index: true })
  resource!: string;

  @Prop({ trim: true, index: true })
  targetId?: string;

  @Prop({ trim: true })
  reason?: string;

  @Prop({ type: Object })
  before?: Record<string, unknown>;

  @Prop({ type: Object })
  after?: Record<string, unknown>;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop({ trim: true })
  ipAddress?: string;

  @Prop({ trim: true })
  userAgent?: string;

  @Prop({ trim: true, index: true })
  requestId?: string;

  @Prop({ trim: true, index: true })
  correlationId?: string;
}

export type AdminAuditLogDocument = HydratedDocument<AdminAuditLog>;

export const AdminAuditLogSchema = SchemaFactory.createForClass(AdminAuditLog);

AdminAuditLogSchema.index({ createdAt: -1 });
AdminAuditLogSchema.index({ actorId: 1, createdAt: -1 });
AdminAuditLogSchema.index({ resource: 1, targetId: 1, createdAt: -1 });
