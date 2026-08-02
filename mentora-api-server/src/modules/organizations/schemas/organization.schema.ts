import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';

export type OrganizationDocument = HydratedDocument<Organization>;

@Schema({
  collection: COLLECTION_NAMES.ORGANIZATION,
  timestamps: true,
})
export class Organization {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, uppercase: true, trim: true, unique: true })
  code!: string;

  @Prop({
    enum: [
      'university',
      'college',
      'school',
      'coaching',
      'edtech',
      'study_abroad',
      'training',
    ],
    default: 'coaching',
  })
  type!: string;

  @Prop({
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
    index: true,
  })
  status!: string;

  @Prop({ trim: true })
  primaryDomain?: string;

  @Prop({ default: 'Asia/Kolkata' })
  timezone!: string;

  @Prop({ default: 'INR' })
  currency!: string;

  @Prop({ type: Object, default: {} })
  settings!: Record<string, unknown>;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
OrganizationSchema.index({ status: 1, name: 1 });
