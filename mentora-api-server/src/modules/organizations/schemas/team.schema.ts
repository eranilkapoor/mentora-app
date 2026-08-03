import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from './organization.schema';
import { Department } from './department.schema';

export type TeamDocument = HydratedDocument<Team>;

@Schema({
  collection: COLLECTION_NAMES.TEAM,
  timestamps: true,
})
export class Team {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, uppercase: true, trim: true })
  code!: string;

  @Prop({ type: Types.ObjectId, ref: Department.name, index: true })
  departmentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  managerId?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  memberIds!: Types.ObjectId[];

  @Prop({ type: Object, default: {} })
  capacityRules!: Record<string, unknown>;

  @Prop({ enum: ['active', 'inactive'], default: 'active', index: true })
  status!: string;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
TeamSchema.index({ organizationId: 1, code: 1 }, { unique: true });
TeamSchema.index({ organizationId: 1, departmentId: 1, status: 1 });
TeamSchema.index({ organizationId: 1, status: 1, name: 1 });
