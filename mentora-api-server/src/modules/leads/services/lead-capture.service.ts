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
      academicLevel: dto.academicLevel,
      campaign: dto.campaign,
      captureChannel: dto.captureChannel ?? 'public_website',
      consentStatus: dto.consentStatus,
      formSource: dto.formSource ?? 'public_lead_capture',
      interestedCourse: dto.course,
      interestedPrograms: dto.program ? [dto.program] : [],
      landingPage: dto.landingPage,
      leadType: dto.leadType ?? 'student_enquiry',
      persona: dto.persona ?? 'student',
      preferredMode: dto.preferredMode,
      temperature: 'warm',
      utm: dto.utm,
    });
  }
}
