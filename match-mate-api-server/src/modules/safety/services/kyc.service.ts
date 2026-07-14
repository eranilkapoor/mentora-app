import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import { AppException } from '@/common/exceptions/app.exception';
import { StorageService } from '@/modules/storage/services/storage.service';
import {
  Verification,
  VerificationDocument,
} from '../schemas/verification.schema';
import {
  VerificationProvider,
  VerificationStatus,
} from '../enums/verification.enums';
import { detectFileCategory } from '@/common/utils/file-signature.util';

@Injectable()
export class KycService {
  constructor(
    @InjectModel(Verification.name)
    private readonly verificationModel: Model<VerificationDocument>,
    private readonly storageService: StorageService,
  ) {}

  async getMyStatus(userId: string) {
    return this.getOrCreate(userId);
  }

  async submitManual(
    userId: string,
    dto: { documentType?: string },
    files: {
      idProof?: Express.Multer.File[];
      selfie?: Express.Multer.File[];
    },
  ) {
    const idProof = files.idProof?.[0];
    const selfie = files.selfie?.[0];

    if (!idProof || !selfie) {
      throw new AppException(
        ErrorCode.FILE_UPLOAD_FAILED,
        HttpStatus.BAD_REQUEST,
        null,
        undefined,
        {
          reason: 'id_proof_and_selfie_required',
        },
      );
    }

    const idProofCategory = detectFileCategory(idProof.buffer);
    const selfieCategory = detectFileCategory(selfie.buffer);
    if (
      !['image', 'document'].includes(idProofCategory ?? '') ||
      selfieCategory !== 'image' ||
      !['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(
        idProof.mimetype.toLowerCase(),
      ) ||
      !['image/jpeg', 'image/png', 'image/webp'].includes(
        selfie.mimetype.toLowerCase(),
      )
    ) {
      throw new AppException(
        ErrorCode.FILE_UPLOAD_FAILED,
        HttpStatus.BAD_REQUEST,
        null,
        undefined,
        { reason: 'kyc_file_signature_or_type_invalid' },
      );
    }

    const [idProofUpload, selfieUpload] = await Promise.all([
      this.storageService.uploadFile(idProof, 'kyc'),
      this.storageService.uploadFile(selfie, 'kyc'),
    ]);

    return this.verificationModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        $set: {
          idProofUrl: idProofUpload.url,
          selfieUrl: selfieUpload.url,
          documentType: dto.documentType ?? 'identity_document',
          provider: VerificationProvider.MANUAL,
          status: VerificationStatus.PENDING,
          rejectionReason: undefined,
          submittedAt: new Date(),
        },
        $setOnInsert: { userId: new Types.ObjectId(userId) },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async initiateEkyc(
    userId: string,
    dto: {
      provider: VerificationProvider.AADHAAR | VerificationProvider.DIGILOCKER;
      consentReference?: string;
    },
  ) {
    return this.verificationModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        $set: {
          provider: dto.provider,
          status: VerificationStatus.PENDING,
          submittedAt: new Date(),
          providerPayload: {
            consentReference: dto.consentReference,
            integrationStatus: 'provider_credentials_required',
          },
        },
        $setOnInsert: { userId: new Types.ObjectId(userId) },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async getReviewQueue(
    status: VerificationStatus = VerificationStatus.PENDING,
  ) {
    return this.verificationModel
      .find({ status })
      .sort({ submittedAt: 1, createdAt: 1 })
      .limit(100)
      .lean()
      .exec();
  }

  async review(
    userId: string,
    reviewerId: string,
    dto: {
      status: VerificationStatus.APPROVED | VerificationStatus.REJECTED;
      rejectionReason?: string;
    },
  ) {
    const approved = dto.status === VerificationStatus.APPROVED;
    const update = {
      status: dto.status,
      verifiedAt: approved ? new Date() : undefined,
      rejectionReason: approved ? undefined : dto.rejectionReason,
      reviewedBy: new Types.ObjectId(reviewerId),
      reviewedAt: new Date(),
    };

    const verification = await this.verificationModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: update },
      { new: true },
    );

    if (!verification) {
      throw new AppException(ErrorCode.PROFILE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return verification;
  }

  private getOrCreate(userId: string) {
    return this.verificationModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        $setOnInsert: {
          userId: new Types.ObjectId(userId),
          status: VerificationStatus.NOT_STARTED,
          provider: VerificationProvider.MANUAL,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}
