import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';

@Schema({ collection: COLLECTIONS.ROLES, timestamps: true })
export class Role {
  @Prop({ required: true, unique: true, trim: true })
  name!: string; // user, admin, etc

  @Prop({ trim: true })
  description?: string;

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
