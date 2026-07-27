import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  toRequiredObjectId,
  toTenantObjectId,
} from '@/common/utils/tenant-scope.util';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import { UpsertIntegrationProviderDto } from '../dto/integrations.dto';
import {
  IntegrationProviderConfig,
  IntegrationProviderConfigDocument,
} from '../schemas/integrations.schema';

const providerCatalog = [
  { key: 'microsoft_sso', module: 'authentication', external: true },
  { key: 'google_sso', module: 'authentication', external: true },
  { key: 'whatsapp_business', module: 'whatsapp_crm', external: true },
  { key: 'sms_gateway', module: 'sms', external: true },
  { key: 'email_delivery', module: 'email_crm', external: true },
  { key: 'dialer_recording', module: 'call_center', external: true },
  { key: 'calendar_sync', module: 'calendar', external: true },
  { key: 'webinar_provider', module: 'event_management', external: true },
  { key: 'ocr_verification', module: 'document_management', external: true },
  { key: 'geo_telemetry', module: 'field_force_automation', external: true },
  { key: 'accounting_export', module: 'finance', external: true },
  { key: 'payment_reconciliation', module: 'payments', external: true },
  { key: 'ai_provider_metering', module: 'ai_features', external: true },
];

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectModel(IntegrationProviderConfig.name)
    private readonly configs: Model<IntegrationProviderConfigDocument>,
    private readonly auditService: AdminAuditService,
  ) {}

  async listProviders(tenantId: string) {
    const tenantObjectId = toTenantObjectId(tenantId);
    const configs = await this.configs
      .find({ tenantId: tenantObjectId })
      .lean();
    return providerCatalog.map((provider) => {
      const config = configs.find((item) => item.providerKey === provider.key);
      return {
        ...provider,
        status: config?.status ?? 'not_configured',
        settings: config?.settings ?? {},
        health: config?.health ?? {},
        lastCheckedAt: config?.lastCheckedAt,
      };
    });
  }

  async upsertProvider(
    userId: string,
    providerKey: string,
    dto: UpsertIntegrationProviderDto,
  ) {
    const record = await this.configs.findOneAndUpdate(
      { tenantId: toTenantObjectId(dto.tenantId), providerKey },
      {
        tenantId: toTenantObjectId(dto.tenantId),
        providerKey,
        status: dto.status ?? 'configured',
        settings: dto.settings ?? {},
        health: dto.health ?? { checked: true },
        lastCheckedAt: new Date(),
        updatedBy: toRequiredObjectId(userId),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    await this.auditService.write({
      actorId: userId,
      action: 'crm_integration_provider.upserted',
      resource: 'crm_integration_provider',
      targetId: String(record._id),
      after: JSON.parse(JSON.stringify(record.toObject())) as Record<
        string,
        unknown
      >,
      metadata: { tenantId: dto.tenantId, providerKey },
    });
    return record;
  }
}
