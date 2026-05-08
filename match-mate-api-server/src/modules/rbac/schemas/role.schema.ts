import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true })
  name!: string; // user, admin, etc

  @Prop()
  description?: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Permission' }],
    default: [],
  })
  permissions!: Types.ObjectId[];

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: 1 })
  version!: number;
}

export type RoleDocument = Role & Document;
export const RoleSchema = SchemaFactory.createForClass(Role);

RoleSchema.index({ isActive: 1 });
