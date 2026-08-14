import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';

export type OrganizationSecurityPolicyDocument =
  HydratedDocument<OrganizationSecurityPolicy>;

@Schema({
  collection: COLLECTION_NAMES.ORGANIZATION_SECURITY_POLICY,
  timestamps: true,
})
export class OrganizationSecurityPolicy {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    unique: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({ default: false })
  mfaRequired!: boolean;

  @Prop({ default: false })
  ssoRequired!: boolean;

  @Prop({ type: [String], default: [] })
  allowedIpCidrs!: string[];

  @Prop({ type: [String], default: ['email', 'phone', 'dateOfBirth'] })
  maskedFields!: string[];

  @Prop({ type: Object, default: {} })
  sessionPolicy!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  passwordPolicy!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  devicePolicy!: Record<string, unknown>;

  @Prop({ default: false })
  dataExportRestricted!: boolean;

  @Prop({ default: false })
  rawSecretAccessBlocked!: boolean;

  @Prop({ default: true })
  auditLoggingEnabled!: boolean;

  @Prop({ type: [String], default: [] })
  allowedSsoDomains!: string[];

  @Prop({ type: Object, default: {} })
  dataRetentionPolicy!: Record<string, unknown>;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  updatedBy?: Types.ObjectId;
}

export const OrganizationSecurityPolicySchema = SchemaFactory.createForClass(
  OrganizationSecurityPolicy,
);
OrganizationSecurityPolicySchema.index({ organizationId: 1, mfaRequired: 1 });
