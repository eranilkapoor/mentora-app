import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';

export type IntegrationProviderConfigDocument =
  HydratedDocument<IntegrationProviderConfig>;

@Schema({
  collection: COLLECTION_NAMES.INTEGRATION_PROVIDER_CONFIG,
  timestamps: true,
})
export class IntegrationProviderConfig {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  providerKey!: string;

  @Prop({
    enum: [
      'ads',
      'analytics',
      'communication',
      'calendar',
      'payment',
      'erp',
      'lms',
      'sis',
      'storage',
      'webhook',
    ],
    default: 'webhook',
    index: true,
  })
  category!: string;

  @Prop({
    enum: ['none', 'api_key', 'oauth2', 'webhook_secret'],
    default: 'api_key',
  })
  authType!: string;

  @Prop({ trim: true })
  secretRef?: string;

  @Prop({
    enum: [
      'not_configured',
      'sandbox_configured',
      'configured',
      'pending_approval',
      'healthy',
      'degraded',
    ],
    default: 'not_configured',
    index: true,
  })
  status!: string;

  @Prop({ type: Object, default: {} })
  settings!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  health!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  rateLimits!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  webhookConfig!: Record<string, unknown>;

  @Prop({ default: false })
  enabled!: boolean;

  @Prop()
  lastCheckedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  updatedBy?: Types.ObjectId;
}

export const IntegrationProviderConfigSchema = SchemaFactory.createForClass(
  IntegrationProviderConfig,
);
IntegrationProviderConfigSchema.index(
  { organizationId: 1, providerKey: 1 },
  { unique: true },
);
IntegrationProviderConfigSchema.index({
  organizationId: 1,
  category: 1,
  status: 1,
});
