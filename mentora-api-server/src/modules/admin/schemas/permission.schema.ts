import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

@Schema({ collection: COLLECTION_NAMES.PERMISSION, timestamps: true })
export class Permission {
  @Prop({ required: true, unique: true, trim: true })
  name!: string; // e.g. "profile:view"

  @Prop({ default: 'general', trim: true, index: true })
  module!: string; // profile, chat, admin, etc

  @Prop({ trim: true })
  description?: string;

  @Prop({
    default: 'organization',
    enum: ['platform', 'organization', 'branch'],
  })
  scope!: string;

  @Prop({ default: false })
  isSystem!: boolean;

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop({ default: 1 })
  version!: number;
}

export type PermissionDocument = Permission & Document;
export const PermissionSchema = SchemaFactory.createForClass(Permission);

PermissionSchema.index({ module: 1, isActive: 1 });
PermissionSchema.index({ scope: 1, module: 1, isActive: 1 });
