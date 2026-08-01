import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationsService } from '../../organizations/services/organizations.service';
import { PublicLeadCaptureDto } from '../dto/public-leads.dto';
import { LeadsService } from './leads.service';

@Injectable()
export class PublicLeadsService {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly leadsService: LeadsService,
  ) {}

  async capturePublicLead(dto: PublicLeadCaptureDto) {
    const organization =
      await this.organizationsService.findActiveOrganizationByCode(
        dto.organizationCode,
      );
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return this.leadsService.createLead(undefined, {
      organizationId: String(organization._id),
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
