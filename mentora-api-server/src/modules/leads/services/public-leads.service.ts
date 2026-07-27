import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantsService } from '../../tenants/services/tenants.service';
import { PublicLeadCaptureDto } from '../dto/public-leads.dto';
import { LeadsService } from './leads.service';

@Injectable()
export class PublicLeadsService {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly leadsService: LeadsService,
  ) {}

  async capturePublicLead(dto: PublicLeadCaptureDto) {
    const tenant = await this.tenantsService.findActiveTenantByCode(
      dto.tenantCode,
    );
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.leadsService.createLead(undefined, {
      tenantId: String(tenant._id),
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      city: dto.city,
      interestedPrograms: dto.program ? [dto.program] : [],
      temperature: 'warm',
      utm: dto.utm,
    });
  }
}
