import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';

export type AdmissionDocument = HydratedDocument<Admission>;

@Schema({ collection: COLLECTION_NAMES.ADMISSION, timestamps: true })
export class Admission {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;
  @Prop({ required: true, trim: true }) title!: string;
  @Prop({ trim: true }) description?: string;
  @Prop({
    enum: [
      'draft',
      'open',
      'in_progress',
      'approved',
      'rejected',
      'completed',
      'archived',
    ],
    default: 'open',
    index: true,
  })
  status!: string;
  @Prop({ enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' })
  priority!: string;
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  ownerId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Lead', index: true })
  relatedLeadId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Application', index: true })
  relatedApplicationId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Branch', index: true })
  branchId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Department', index: true })
  departmentId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Team', index: true })
  teamId?: Types.ObjectId;
  @Prop({ trim: true, uppercase: true, index: true })
  admissionNumber?: string;
  @Prop({ type: Types.ObjectId, ref: 'StudentProfile', index: true })
  studentId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Program', index: true })
  programId?: Types.ObjectId;
  @Prop({ trim: true })
  batchName?: string;
  @Prop({ enum: ['pending', 'partial', 'paid', 'waived'], default: 'pending' })
  feeStatus!: string;
  @Prop({ enum: ['pending', 'started', 'completed'], default: 'pending' })
  onboardingStatus!: string;
  @Prop({ enum: ['pending', 'provisioned', 'failed'], default: 'pending' })
  learningPlanStatus!: string;
  @Prop() offerAcceptedAt?: Date;
  @Prop() enrolledAt?: Date;
  @Prop() dueAt?: Date;
  @Prop() completedAt?: Date;
  @Prop({ type: [String], default: [] }) tags!: string[];
  @Prop({ type: Object, default: {} }) payload!: Record<string, unknown>;
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}
export const AdmissionSchema = SchemaFactory.createForClass(Admission);
AdmissionSchema.index({ organizationId: 1, status: 1, dueAt: 1 });
AdmissionSchema.index({ organizationId: 1, dueAt: 1, createdAt: -1 });
AdmissionSchema.index({
  organizationId: 1,
  status: 1,
  dueAt: 1,
  createdAt: -1,
});
AdmissionSchema.index({ organizationId: 1, ownerId: 1, status: 1, dueAt: 1 });
AdmissionSchema.index({ organizationId: 1, branchId: 1, status: 1 });
AdmissionSchema.index({ organizationId: 1, programId: 1, status: 1 });
AdmissionSchema.index(
  { organizationId: 1, admissionNumber: 1 },
  { sparse: true },
);
AdmissionSchema.index({ organizationId: 1, relatedLeadId: 1, createdAt: -1 });
AdmissionSchema.index({
  organizationId: 1,
  relatedApplicationId: 1,
  createdAt: -1,
});
