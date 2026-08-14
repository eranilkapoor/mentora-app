import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

@Schema({ collection: COLLECTION_NAMES.ROLE, timestamps: true })
export class Role {
  @Prop({ required: true, unique: true, trim: true })
  name!: string; // user, admin, etc

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Organization', index: true })
  organizationId?: Types.ObjectId;

  @Prop({ default: false })
  isSystem!: boolean;

  @Prop({
    default: 'organization',
    enum: ['platform', 'organization', 'branch'],
  })
  scope!: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Permission' }],
    default: [],
  })
  permissions!: Types.ObjectId[];

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop({ default: 1 })
  version!: number;
}

export type RoleDocument = Role & Document;
export const RoleSchema = SchemaFactory.createForClass(Role);
RoleSchema.index({ organizationId: 1, isActive: 1, name: 1 });
RoleSchema.index({ scope: 1, isSystem: 1 });
