import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';

export type StudyMaterialDocument = HydratedDocument<StudyMaterial>;

@Schema({ collection: COLLECTION_NAMES.STUDY_MATERIAL, timestamps: true })
export class StudyMaterial {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;
  @Prop({ required: true, trim: true }) title!: string;
  @Prop({ trim: true }) description?: string;
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
    default: 'draft',
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
  @Prop({ index: true }) dueAt?: Date;
  @Prop() completedAt?: Date;
  @Prop({ type: [String], default: [], index: true }) tags!: string[];
  @Prop({ type: Object, default: {} }) payload!: Record<string, unknown>;
  @Prop({
    enum: ['pdf', 'video', 'quiz', 'assignment', 'link', 'note'],
    default: 'pdf',
    index: true,
  })
  materialType!: string;
  @Prop({ type: Types.ObjectId, ref: 'Subject', index: true })
  subjectId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Program', index: true })
  programId?: Types.ObjectId;
  @Prop({ trim: true })
  url?: string;
  @Prop({ default: 1, min: 1 })
  version!: number;
  @Prop({ enum: ['draft', 'published', 'retired'], default: 'draft' })
  publishStatus!: string;
  @Prop({
    enum: ['free', 'paid', 'plan_only', 'internal'],
    default: 'plan_only',
  })
  accessLevel!: string;
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}

export const StudyMaterialSchema = SchemaFactory.createForClass(StudyMaterial);
StudyMaterialSchema.index({ organizationId: 1, status: 1, dueAt: 1 });
StudyMaterialSchema.index({
  organizationId: 1,
  ownerId: 1,
  status: 1,
  dueAt: 1,
});
StudyMaterialSchema.index({ organizationId: 1, createdAt: -1 });
StudyMaterialSchema.index({
  organizationId: 1,
  materialType: 1,
  publishStatus: 1,
});
StudyMaterialSchema.index({ organizationId: 1, subjectId: 1, accessLevel: 1 });
