import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Organization } from '@/modules/organizations/schemas/organizations.schema';

@Schema({ timestamps: true })
export class EducationRecord {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({
    enum: [
      'draft',
      'open',
      'in_progress',
      'approved',
      'rejected',
      'completed',
      'archived',
    ],
    default: 'open',
    index: true,
  })
  status!: string;

  @Prop({ enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' })
  priority!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  ownerId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lead', index: true })
  relatedLeadId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Application', index: true })
  relatedApplicationId?: Types.ObjectId;

  @Prop({ index: true })
  dueAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop({ type: [String], default: [], index: true })
  tags!: string[];

  @Prop({ type: Object, default: {} })
  payload!: Record<string, unknown>;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}

export type EducationRecordDocument = HydratedDocument<EducationRecord>;

export function createEducationRecordSchema(collection: string) {
  const schema = SchemaFactory.createForClass(EducationRecord);
  schema.set('collection', collection);
  schema.index({ organizationId: 1, status: 1, dueAt: 1 });
  schema.index({ organizationId: 1, ownerId: 1, status: 1, dueAt: 1 });
  schema.index({ organizationId: 1, title: 1, createdAt: -1 });
  return {
    modelName: collection
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(''),
    schema,
  };
}
