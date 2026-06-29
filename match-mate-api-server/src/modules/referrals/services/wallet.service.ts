import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import {
  throwBadRequest,
  throwConflict,
} from '@/common/exceptions/throw-app-exception';
import {
  WalletTransaction,
  WalletTransactionDocument,
} from '../schemas/wallet-transaction.schema';
import {
  WalletTransactionSource,
  WalletTransactionStatus,
  WalletTransactionType,
} from '../enums/wallet-transaction.enum';

const REDEMPTION_THRESHOLD = 1000;

const normalizePoints = (value: unknown): number => {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) ? Math.round(numericValue) : 0;
};

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(WalletTransaction.name)
    private readonly walletModel: Model<WalletTransactionDocument>,
  ) {}

  async credit(params: {
    userId: string | Types.ObjectId;
    points: number;
    source: WalletTransactionSource;
    referenceId?: string;
    metadata?: Record<string, unknown>;
  }) {
    const points = Math.max(0, normalizePoints(params.points));
    if (points <= 0) {
      return null;
    }

    if (params.referenceId) {
      const existing = await this.walletModel.findOne({
        userId: this.toObjectId(params.userId),
        source: params.source,
        referenceId: params.referenceId,
        status: WalletTransactionStatus.POSTED,
      });

      if (existing) {
        return existing;
      }
    }

    const balance = await this.getBalance(params.userId);
    return this.walletModel.create({
      userId: this.toObjectId(params.userId),
      type: WalletTransactionType.CREDIT,
      source: params.source,
      points,
      balanceAfter: balance + points,
      referenceId: params.referenceId,
      metadata: params.metadata,
    });
  }

  async redeem(userId: string, points: number) {
    const requestedPoints = normalizePoints(points);
    if (requestedPoints < REDEMPTION_THRESHOLD) {
      return throwBadRequest(ErrorCode.PAYMENT_FAILED, {
        reason: 'minimum_redemption_threshold_not_met',
        redemptionThreshold: REDEMPTION_THRESHOLD,
      });
    }

    const balance = await this.getBalance(userId);
    if (requestedPoints > balance) {
      return throwConflict(ErrorCode.PAYMENT_FAILED, {
        reason: 'insufficient_wallet_balance',
        balance,
      });
    }

    await this.walletModel.create({
      userId: new Types.ObjectId(userId),
      type: WalletTransactionType.DEBIT,
      source: WalletTransactionSource.REDEMPTION,
      points: -requestedPoints,
      balanceAfter: balance - requestedPoints,
    });

    return this.getSummary(userId);
  }

  async creditCoinPurchase(params: {
    userId: string | Types.ObjectId;
    coins: number;
    paymentId: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.credit({
      userId: params.userId,
      points: params.coins,
      source: WalletTransactionSource.COIN_PURCHASE,
      referenceId: params.paymentId,
      metadata: params.metadata,
    });
  }

  async spend(params: {
    userId: string;
    coins: number;
    referenceId?: string;
    reason?: string;
    metadata?: Record<string, unknown>;
  }) {
    const requestedCoins = normalizePoints(params.coins);
    if (requestedCoins <= 0) {
      return throwBadRequest(ErrorCode.PAYMENT_FAILED, {
        reason: 'invalid_wallet_spend_amount',
      });
    }

    if (params.referenceId) {
      const existing = await this.walletModel.findOne({
        userId: new Types.ObjectId(params.userId),
        source: WalletTransactionSource.COIN_SPEND,
        referenceId: params.referenceId,
        status: WalletTransactionStatus.POSTED,
      });

      if (existing) {
        return this.getSummary(params.userId);
      }
    }

    const balance = await this.getBalance(params.userId);
    if (requestedCoins > balance) {
      return throwConflict(ErrorCode.PAYMENT_FAILED, {
        reason: 'insufficient_wallet_balance',
        balance,
      });
    }

    await this.walletModel.create({
      userId: new Types.ObjectId(params.userId),
      type: WalletTransactionType.DEBIT,
      source: WalletTransactionSource.COIN_SPEND,
      points: -requestedCoins,
      balanceAfter: balance - requestedCoins,
      referenceId: params.referenceId,
      metadata: {
        ...(params.metadata ?? {}),
        reason: params.reason,
      },
    });

    return this.getSummary(params.userId);
  }

  async getSummary(userId: string | Types.ObjectId) {
    const userObjectId = this.toObjectId(userId);
    const [balance, transactions] = await Promise.all([
      this.getBalance(userObjectId),
      this.walletModel
        .find({
          userId: userObjectId,
          status: WalletTransactionStatus.POSTED,
        })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()
        .exec(),
    ]);

    return {
      balance,
      redeemablePoints: balance >= REDEMPTION_THRESHOLD ? balance : 0,
      pendingPoints: balance < REDEMPTION_THRESHOLD ? balance : 0,
      redemptionThreshold: REDEMPTION_THRESHOLD,
      transactions,
    };
  }

  async getBalance(userId: string | Types.ObjectId) {
    const [result] = await this.walletModel.aggregate<{ balance: number }>([
      {
        $match: {
          userId: this.toObjectId(userId),
          status: WalletTransactionStatus.POSTED,
        },
      },
      {
        $group: {
          _id: '$userId',
          balance: { $sum: '$points' },
        },
      },
    ]);

    return Math.max(0, result?.balance ?? 0);
  }

  private toObjectId(id: string | Types.ObjectId) {
    return id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
  }
}
