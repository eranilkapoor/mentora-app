import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Permission {
  @Prop({ required: true, unique: true })
  name!: string; // e.g. "profile:view"

  @Prop()
  description?: string;

  @Prop({ default: 'general' })
  module!: string; // profile, chat, admin, etc

  @Prop({ default: true })
  isActive!: boolean;
}

export type PermissionDocument = Permission & Document;
export const PermissionSchema = SchemaFactory.createForClass(Permission);
