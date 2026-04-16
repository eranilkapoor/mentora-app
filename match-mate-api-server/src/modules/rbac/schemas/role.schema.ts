import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true })
  name!: string; // USER, ADMIN, etc

  @Prop()
  description?: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Permission' }],
    default: [],
  })
  permissions!: Types.ObjectId[];

  @Prop({ default: true })
  isActive!: boolean;
}

export type RoleDocument = Role & Document;
export const RoleSchema = SchemaFactory.createForClass(Role);
