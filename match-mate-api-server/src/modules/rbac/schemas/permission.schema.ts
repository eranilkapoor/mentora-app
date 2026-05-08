import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Permission {
  @Prop({ required: true, unique: true })
  name!: string; // e.g. "profile:view"

  @Prop({ default: 'general' })
  module!: string; // profile, chat, admin, etc

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: 1 })
  version!: number;
}

export type PermissionDocument = Permission & Document;
export const PermissionSchema = SchemaFactory.createForClass(Permission);

PermissionSchema.index({ module: 1 });
PermissionSchema.index({ isActive: 1 });
