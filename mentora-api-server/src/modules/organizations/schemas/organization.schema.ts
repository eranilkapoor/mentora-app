import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';

export type OrganizationDocument = HydratedDocument<Organization>;

@Schema({
  collection: COLLECTION_NAMES.ORGANIZATION,
  timestamps: true,
})
export class Organization {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  legalName?: string;

  @Prop({ required: true, uppercase: true, trim: true, unique: true })
  code!: string;

  @Prop({
    enum: [
      'university',
      'college',
      'school',
      'coaching',
      'edtech',
      'study_abroad',
      'training',
    ],
    default: 'coaching',
  })
  type!: string;

  @Prop({
    enum: [
      'active',
      'trial',
      'suspended',
      'payment_overdue',
      'cancelled',
      'inactive',
    ],
    default: 'active',
    index: true,
  })
  status!: string;

  @Prop({ trim: true })
  logoUrl?: string;

  @Prop({ trim: true })
  website?: string;

  @Prop({ trim: true })
  registrationNumber?: string;

  @Prop({ trim: true })
  taxNumber?: string;

  @Prop({ lowercase: true, trim: true })
  primaryEmail?: string;

  @Prop({ trim: true })
  primaryPhone?: string;

  @Prop({
    type: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    default: {},
    _id: false,
  })
  address!: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };

  @Prop({ trim: true })
  primaryDomain?: string;

  @Prop({ lowercase: true, trim: true })
  subdomain?: string;

  @Prop({ trim: true })
  customDomain?: string;

  @Prop({ default: 'Asia/Kolkata' })
  timezone!: string;

  @Prop({ default: 'INR' })
  currency!: string;

  @Prop({ default: 'en-IN' })
  locale!: string;

  @Prop({ default: 'DD/MM/YYYY' })
  dateFormat!: string;

  @Prop({ trim: true })
  financialYear?: string;

  @Prop({ trim: true })
  academicYear?: string;

  @Prop({
    type: {
      plan: { type: String, default: 'starter' },
      billingCycle: { type: String, default: 'monthly' },
      trialStart: Date,
      trialEnd: Date,
      subscriptionStart: Date,
      subscriptionEnd: Date,
      userLimit: { type: Number, default: 25 },
      leadLimit: { type: Number, default: 1000 },
      storageLimitGb: { type: Number, default: 10 },
      enabledModules: { type: [String], default: [] },
      status: { type: String, default: 'active' },
    },
    default: {},
    _id: false,
  })
  subscription!: {
    plan?: string;
    billingCycle?: string;
    trialStart?: Date;
    trialEnd?: Date;
    subscriptionStart?: Date;
    subscriptionEnd?: Date;
    userLimit?: number;
    leadLimit?: number;
    storageLimitGb?: number;
    enabledModules?: string[];
    status?: string;
  };

  @Prop({ type: Object, default: {} })
  settings!: Record<string, unknown>;

  @Prop()
  lastActivityAt?: Date;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
OrganizationSchema.index({ status: 1, name: 1 });
