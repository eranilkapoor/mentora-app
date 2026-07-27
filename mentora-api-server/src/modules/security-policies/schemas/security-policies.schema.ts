import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Tenant } from '@/modules/tenants/schemas/tenants.schema';

export type TenantSecurityPolicyDocument =
  HydratedDocument<TenantSecurityPolicy>;

@Schema({
  collection: COLLECTION_NAMES.TENANT_SECURITY_POLICY,
  timestamps: true,
})
export class TenantSecurityPolicy {
  @Prop({
    type: Types.ObjectId,
    ref: Tenant.name,
    required: true,
    unique: true,
  })
  tenantId!: Types.ObjectId;

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
  dataRetentionPolicy!: Record<string, unknown>;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  updatedBy?: Types.ObjectId;
}

export const TenantSecurityPolicySchema =
  SchemaFactory.createForClass(TenantSecurityPolicy);
