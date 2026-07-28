import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { EDUCATION_PLATFORM_MODULE_KEYS } from '@/common/constants/education-platform.constants';
import { Tenant } from '../../tenants/schemas/tenants.schema';

export type ModuleRecordDocument = HydratedDocument<ModuleRecord>;

@Schema({
  collection: COLLECTION_NAMES.MODULE_RECORD,
  timestamps: true,
})
export class ModuleRecord {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ enum: EDUCATION_PLATFORM_MODULE_KEYS, required: true, index: true })
  moduleKey!: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({
    enum: ['draft', 'open', 'in_progress', 'blocked', 'completed', 'archived'],
    default: 'open',
    index: true,
  })
  status!: string;

  @Prop({
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true,
  })
  priority!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  ownerId?: Types.ObjectId;

  @Prop({ index: true })
  dueAt?: Date;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: Object, default: {} })
  payload!: Record<string, unknown>;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}

export const ModuleRecordSchema = SchemaFactory.createForClass(ModuleRecord);
ModuleRecordSchema.index({ tenantId: 1, moduleKey: 1, status: 1 });
ModuleRecordSchema.index({ tenantId: 1, moduleKey: 1, dueAt: 1 });
ModuleRecordSchema.index({
  tenantId: 1,
  moduleKey: 1,
  dueAt: 1,
  createdAt: -1,
});
ModuleRecordSchema.index({
  tenantId: 1,
  moduleKey: 1,
  status: 1,
  dueAt: 1,
  createdAt: -1,
});
ModuleRecordSchema.index({ tenantId: 1, moduleKey: 1, ownerId: 1 });
