import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from './organization.schema';

export type OrganizationBrandingDocument =
  HydratedDocument<OrganizationBranding>;

@Schema({
  collection: COLLECTION_NAMES.ORGANIZATION_BRANDING,
  timestamps: true,
})
export class OrganizationBranding {
  @Prop({ type: Types.ObjectId, ref: Organization.name, required: true })
  organizationId!: Types.ObjectId;

  @Prop({ trim: true })
  logoUrl?: string;

  @Prop({ trim: true })
  primaryColor?: string;

  @Prop({ trim: true })
  secondaryColor?: string;

  @Prop({ trim: true })
  senderName?: string;

  @Prop({ trim: true })
  faviconUrl?: string;

  @Prop({ trim: true })
  appName?: string;

  @Prop({ trim: true })
  supportEmail?: string;

  @Prop({ type: [String], default: [] })
  domains!: string[];

  @Prop({ type: Object, default: {} })
  theme!: Record<string, unknown>;

  @Prop({ enum: ['active', 'inactive'], default: 'active', index: true })
  status!: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const OrganizationBrandingSchema =
  SchemaFactory.createForClass(OrganizationBranding);
OrganizationBrandingSchema.index({ organizationId: 1 }, { unique: true });
OrganizationBrandingSchema.index({ status: 1, organizationId: 1 });
