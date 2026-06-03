import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';
import {
  WalletTransactionSource,
  WalletTransactionStatus,
  WalletTransactionType,
} from '../enums/wallet-transaction.enum';

@Schema({
  collection: COLLECTION_NAMES.WALLET_TRANSACTION,
  timestamps: true,
  versionKey: false,
})
export class WalletTransaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ enum: WalletTransactionType, required: true, index: true })
  type!: WalletTransactionType;

  @Prop({ enum: WalletTransactionSource, required: true, index: true })
  source!: WalletTransactionSource;

  @Prop({ required: true })
  points!: number;

  @Prop({ required: true, min: 0 })
  balanceAfter!: number;

  @Prop({ index: true, sparse: true })
  referenceId?: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop()
  expiresAt?: Date;

  @Prop({
    enum: WalletTransactionStatus,
    default: WalletTransactionStatus.POSTED,
    index: true,
  })
  status!: WalletTransactionStatus;
}

export type WalletTransactionDocument = HydratedDocument<WalletTransaction>;

export const WalletTransactionSchema =
  SchemaFactory.createForClass(WalletTransaction);

WalletTransactionSchema.index({ userId: 1, createdAt: -1 });
WalletTransactionSchema.index(
  { userId: 1, source: 1, referenceId: 1 },
  { unique: true, sparse: true },
);
