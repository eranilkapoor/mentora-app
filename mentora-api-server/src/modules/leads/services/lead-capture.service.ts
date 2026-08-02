import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationsService } from '../../organizations/services/organizations.service';
import { LeadCaptureDto } from '../dto/lead-capture.dto';
import { LeadsService } from './leads.service';

@Injectable()
export class LeadCaptureService {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly leadsService: LeadsService,
  ) {}

  async captureLead(dto: LeadCaptureDto) {
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
