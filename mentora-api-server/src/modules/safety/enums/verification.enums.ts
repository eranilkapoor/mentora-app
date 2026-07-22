export enum VerificationStatus {
  NOT_STARTED = 'not_started',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum VerificationProvider {
  MANUAL = 'manual',
  AADHAAR = 'aadhaar',
  DIGILOCKER = 'digilocker',
  LIVENESS = 'liveness',
}
