import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  toRequiredObjectId,
  toOrganizationObjectId,
} from '@/common/utils/organization-scope.util';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import { UpsertIntegrationProviderDto } from '../dto/integrations.dto';
import {
  IntegrationProviderConfig,
  IntegrationProviderConfigDocument,
} from '../schemas/integrations.schema';

type ProviderCatalogItem = {
  docs: string;
  envKeys: string[];
  external: true;
  key: string;
  module: string;
  requiredConfigPaths: string[];
};

const providerCatalog: ProviderCatalogItem[] = [
  {
    key: 'microsoft_sso',
    module: 'authentication',
    external: true,
    docs: 'Microsoft Entra ID OAuth/OIDC configuration',
    envKeys: [
      'AUTH_MICROSOFT_ENABLED',
      'MICROSOFT_CLIENT_ID',
      'MICROSOFT_CLIENT_SECRET',
    ],
    requiredConfigPaths: [
      'integrations.sso.microsoftEnabled',
      'integrations.sso.microsoftClientId',
      'integrations.sso.microsoftClientSecret',
    ],
  },
  {
    key: 'google_sso',
    module: 'authentication',
    external: true,
    docs: 'Google OAuth client configuration',
    envKeys: [
      'AUTH_SOCIAL_GOOGLE_ENABLED',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
    ],
    requiredConfigPaths: [
      'integrations.sso.googleEnabled',
      'integrations.sso.googleClientId',
      'integrations.sso.googleClientSecret',
    ],
  },
  {
    key: 'whatsapp_business',
    module: 'whatsapp',
    external: true,
    docs: 'Meta WhatsApp Business Cloud API',
    envKeys: [
      'WHATSAPP_PROVIDER_ENABLED',
      'WHATSAPP_ACCESS_TOKEN',
      'WHATSAPP_PHONE_NUMBER_ID',
      'WHATSAPP_BUSINESS_ACCOUNT_ID',
      'WHATSAPP_WEBHOOK_VERIFY_TOKEN',
      'WHATSAPP_APP_SECRET',
    ],
    requiredConfigPaths: [
      'integrations.whatsapp.enabled',
      'integrations.whatsapp.accessToken',
      'integrations.whatsapp.phoneNumberId',
      'integrations.whatsapp.businessAccountId',
      'integrations.whatsapp.webhookVerifyToken',
    ],
  },
  {
    key: 'sms_gateway',
    module: 'sms',
    external: true,
    docs: 'MSG91 SMS and DLT template configuration',
    envKeys: [
      'NOTIFICATION_SMS_ENABLED',
      'NOTIFICATION_SMS_PROVIDER',
      'NOTIFICATION_SMS_MSG91_AUTH_KEY',
      'NOTIFICATION_SMS_MSG91_TEMPLATE_ID',
    ],
    requiredConfigPaths: [
      'notification.sms.enabled',
      'notification.sms.msg91.authKey',
      'notification.sms.msg91.templateId',
    ],
  },
  {
    key: 'email_delivery',
    module: 'emails',
    external: true,
    docs: 'SMTP or AWS SES email delivery configuration',
    envKeys: [
      'NOTIFICATION_EMAIL_ENABLED',
      'NOTIFICATION_EMAIL_PROVIDER',
      'NOTIFICATION_EMAIL_FROM',
      'NOTIFICATION_EMAIL_SMTP_DSN',
      'NOTIFICATION_EMAIL_SES_ACCESS_KEY_ID',
    ],
    requiredConfigPaths: [
      'notification.email.enabled',
      'notification.email.provider',
      'notification.email.from',
    ],
  },
  {
    key: 'dialer_recording',
    module: 'call-center',
    external: true,
    docs: 'Dialer/call recording provider configuration',
    envKeys: [
      'DIALER_PROVIDER_ENABLED',
      'DIALER_PROVIDER',
      'DIALER_PROVIDER_API_KEY',
      'DIALER_PROVIDER_BASE_URL',
      'DIALER_WEBHOOK_SECRET',
    ],
    requiredConfigPaths: [
      'integrations.dialer.enabled',
      'integrations.dialer.apiKey',
      'integrations.dialer.baseUrl',
    ],
  },
  {
    key: 'calendar_sync',
    module: 'calendar',
    external: true,
    docs: 'Google Calendar or Microsoft Graph calendar sync',
    envKeys: [
      'CALENDAR_SYNC_ENABLED',
      'GOOGLE_CALENDAR_CLIENT_ID',
      'GOOGLE_CALENDAR_CLIENT_SECRET',
      'MICROSOFT_CALENDAR_CLIENT_ID',
      'MICROSOFT_CALENDAR_CLIENT_SECRET',
    ],
    requiredConfigPaths: [
      'integrations.calendar.enabled',
      'integrations.calendar.googleClientId',
      'integrations.calendar.googleClientSecret',
    ],
  },
  {
    key: 'webinar_provider',
    module: 'events',
    external: true,
    docs: 'Webinar/live-class provider configuration',
    envKeys: [
      'WEBINAR_PROVIDER',
      'WEBINAR_PROVIDER_API_KEY',
      'WEBINAR_PROVIDER_BASE_URL',
    ],
    requiredConfigPaths: [
      'integrations.webinar.enabled',
      'integrations.webinar.apiKey',
      'integrations.webinar.baseUrl',
    ],
  },
  {
    key: 'ocr_verification',
    module: 'documents',
    external: true,
    docs: 'OCR/KYC document verification provider',
    envKeys: [
      'OCR_PROVIDER_ENABLED',
      'OCR_PROVIDER',
      'OCR_PROVIDER_API_KEY',
      'OCR_PROVIDER_BASE_URL',
    ],
    requiredConfigPaths: [
      'integrations.ocr.enabled',
      'integrations.ocr.apiKey',
      'integrations.ocr.baseUrl',
    ],
  },
  {
    key: 'geo_telemetry',
    module: 'field-force',
    external: true,
    docs: 'Maps/geocoding/routing provider configuration',
    envKeys: [
      'GEO_TELEMETRY_ENABLED',
      'GEO_TELEMETRY_PROVIDER',
      'GEO_TELEMETRY_API_KEY',
    ],
    requiredConfigPaths: [
      'integrations.geo.enabled',
      'integrations.geo.apiKey',
    ],
  },
  {
    key: 'accounting_export',
    module: 'finance',
    external: true,
    docs: 'Accounting export adapter configuration',
    envKeys: [
      'ACCOUNTING_EXPORT_PROVIDER',
      'ACCOUNTING_EXPORT_API_KEY',
      'ACCOUNTING_EXPORT_BASE_URL',
    ],
    requiredConfigPaths: [
      'integrations.accounting.enabled',
      'integrations.accounting.apiKey',
      'integrations.accounting.baseUrl',
    ],
  },
  {
    key: 'payment_reconciliation',
    module: 'payments',
    external: true,
    docs: 'Payment gateway reconciliation and webhook configuration',
    envKeys: [
      'PAYMENT_SIGNATURE_SECRET',
      'PAYMENT_WEBHOOK_SECRET',
      'RAZORPAY_KEY_ID',
      'RAZORPAY_KEY_SECRET',
      'STRIPE_SECRET_KEY',
    ],
    requiredConfigPaths: [
      'payments.signatureSecret',
      'payments.webhookSecret',
      'payments.razorpay.keyId',
      'payments.razorpay.keySecret',
      'payments.stripe.secretKey',
    ],
  },
  {
    key: 'ai_provider_metering',
    module: 'ai-features',
    external: true,
    docs: 'AI model provider and metering configuration',
    envKeys: [
      'AI_PROVIDER_ENABLED',
      'AI_PROVIDER',
      'AI_PROVIDER_API_KEY',
      'AI_PROVIDER_MODEL',
    ],
    requiredConfigPaths: [
      'integrations.ai.enabled',
      'integrations.ai.apiKey',
      'integrations.ai.model',
    ],
  },
];

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectModel(IntegrationProviderConfig.name)
    private readonly configs: Model<IntegrationProviderConfigDocument>,
    private readonly auditService: AdminAuditService,
    private readonly configService: ConfigService,
  ) {}

  async listProviders(organizationId: string) {
    const organizationObjectId = toOrganizationObjectId(organizationId);
    const configs = await this.configs
      .find({ organizationId: organizationObjectId })
      .lean();
    return providerCatalog.map((provider) => {
      const config = configs.find((item) => item.providerKey === provider.key);
      const configuredByEnv = this.isConfiguredByEnv(provider);
      const demoMode = this.isDemoMode();
      const computedStatus = configuredByEnv
        ? demoMode
          ? 'sandbox_configured'
          : 'healthy'
        : 'not_configured';
      return {
        ...provider,
        configuredByEnv,
        demoMode,
        missingEnvKeys: this.missingEnvKeys(provider),
        requiredEnvKeys: provider.envKeys,
        status: config?.status ?? computedStatus,
        settings: config?.settings ?? {},
        health: {
          ...(config?.health ?? {}),
          checkedBy: 'integration_catalog',
          readyForDemo: configuredByEnv,
          readyForLive: configuredByEnv && !demoMode,
        },
        lastCheckedAt: config?.lastCheckedAt,
      };
    });
  }

  testProvider(organizationId: string, providerKey: string) {
    const provider = providerCatalog.find((item) => item.key === providerKey);
    if (!provider) {
      return {
        providerKey,
        readyForLive: false,
        status: 'unknown_provider',
      };
    }
    const missingEnvKeys = this.missingEnvKeys(provider);
    return {
      organizationId,
      providerKey,
      module: provider.module,
      demoMode: this.isDemoMode(),
      readyForDemo: missingEnvKeys.length === 0,
      readyForLive: missingEnvKeys.length === 0 && !this.isDemoMode(),
      missingEnvKeys,
      requiredEnvKeys: provider.envKeys,
      status:
        missingEnvKeys.length === 0
          ? this.isDemoMode()
            ? 'sandbox_configured'
            : 'healthy'
          : 'not_configured',
      checkedAt: new Date().toISOString(),
    };
  }

  async upsertProvider(
    userId: string,
    providerKey: string,
    dto: UpsertIntegrationProviderDto,
  ) {
    const record = await this.configs.findOneAndUpdate(
      {
        organizationId: toOrganizationObjectId(dto.organizationId),
        providerKey,
      },
      {
        organizationId: toOrganizationObjectId(dto.organizationId),
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
      action: 'integration_provider.upserted',
      resource: 'integration_provider',
      targetId: String(record._id),
      after: JSON.parse(JSON.stringify(record.toObject())) as Record<
        string,
        unknown
      >,
      metadata: { organizationId: dto.organizationId, providerKey },
    });
    return record;
  }

  private isConfiguredByEnv(provider: ProviderCatalogItem) {
    return this.missingEnvKeys(provider).length === 0;
  }

  private isDemoMode() {
    return this.configService.get<boolean>('integrations.demoMode', false);
  }

  private missingEnvKeys(provider: ProviderCatalogItem) {
    return provider.envKeys.filter((envKey, index) => {
      const path = provider.requiredConfigPaths[index];
      if (!path) return false;
      const value = this.configService.get<unknown>(path);
      return (
        value === undefined || value === null || value === '' || value === false
      );
    });
  }
}
