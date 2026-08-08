import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organizations.schema';

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
