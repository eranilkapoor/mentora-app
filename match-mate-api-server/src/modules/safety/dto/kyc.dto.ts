import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  VerificationProvider,
  VerificationStatus,
} from '../schemas/verification.schema';

export class SubmitKycDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  documentType?: string;
}

export class InitiateEkycDto {
  @IsIn([VerificationProvider.AADHAAR, VerificationProvider.DIGILOCKER])
  provider!: VerificationProvider.AADHAAR | VerificationProvider.DIGILOCKER;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  consentReference?: string;
}

export class ReviewKycDto {
  @IsIn([VerificationStatus.APPROVED, VerificationStatus.REJECTED])
  status!: VerificationStatus.APPROVED | VerificationStatus.REJECTED;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
