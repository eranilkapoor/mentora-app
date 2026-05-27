import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants';

@Schema({ _id: false })
class LinkedAccount {
  @Prop() provider!: string;
  @Prop() providerId?: string;
  @Prop({ default: false }) connected!: boolean;
  @Prop() connectedAt?: Date;
}

@Schema({ collection: COLLECTIONS.ACCOUNT_SETTING, timestamps: true })
export class AccountSetting {
  @Prop({ type: Types.ObjectId, required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ default: false }) emailVerified!: boolean;
  @Prop({ default: false }) phoneVerified!: boolean;
  @Prop({ default: false }) isDeactivated!: boolean;
  @Prop() deactivatedAt?: Date;
  @Prop() deactivationReason?: string;
  @Prop() deletionScheduledAt?: Date;

  @Prop({ type: [LinkedAccount], default: [] })
  linkedAccounts!: LinkedAccount[];
}

export type AccountSettingDocument = AccountSetting & Document;
export const AccountSettingSchema =
  SchemaFactory.createForClass(AccountSetting);
