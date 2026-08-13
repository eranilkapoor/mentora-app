import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppLogger } from '@/common/logger/logger.service';
import {
  ActivityLog,
  ActivityLogDocument,
} from '@/common/schemas/activity-log.schema';
import { ActivityAction } from '@/common/enums/activity-log.enums';
import { UserReport, UserReportDocument } from '../schemas/user-report.schema';
import {
  Payment,
  PaymentDocument,
} from '@/modules/payments/schemas/payment.schema';
import { PaymentStatus } from '@/modules/payments/enums/payment-status.enum';
import {
  UserSession,
  UserSessionDocument,
} from '@/modules/auth/schemas/user-session.schema';

type FraudSignalKey =
  | 'high_report_volume'
  | 'failed_payment_spike'
  | 'suspicious_login_spike'
  | 'ip_churn_spike';

interface AggregateCountResult {
  _id: Types.ObjectId;
  count: number;
}

interface AggregateIpCountResult {
  _id: Types.ObjectId;
  ipCount: number;
}

export interface FraudSignal {
  key: FraudSignalKey;
  value: number;
  threshold: number;
  score: number;
  reason: string;
}

export interface FraudCandidate {
  userId: string;
  riskScore: number;
  signals: FraudSignal[];
}

export interface FraudScanOptions {
  windowDays?: number;
  limit?: number;
  highRiskThreshold?: number;
  reportThreshold?: number;
  failedPaymentThreshold?: number;
  suspiciousLoginThreshold?: number;
  distinctIpThreshold?: number;
}

export interface FraudScanResult {
  scannedUsers: number;
  flaggedUsers: number;
  highRiskUsers: number;
  windowDays: number;
  generatedAt: string;
  candidates: FraudCandidate[];
}

@Injectable()
export class FraudDetectionService {
  constructor(
    @InjectModel(UserReport.name)
    private readonly userReportModel: Model<UserReportDocument>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(ActivityLog.name)
    private readonly activityLogModel: Model<ActivityLogDocument>,
    @InjectModel(UserSession.name)
    private readonly userSessionModel: Model<UserSessionDocument>,
    private readonly logger: AppLogger,
  ) {}

  async runBatchScan(options: FraudScanOptions = {}): Promise<FraudScanResult> {
    const windowDays = Math.max(options.windowDays ?? 14, 1);
    const limit = Math.min(Math.max(options.limit ?? 100, 1), 500);
    const highRiskThreshold = options.highRiskThreshold ?? 70;
    const reportThreshold = options.reportThreshold ?? 3;
    const failedPaymentThreshold = options.failedPaymentThreshold ?? 3;
    const suspiciousLoginThreshold = options.suspiciousLoginThreshold ?? 2;
    const distinctIpThreshold = options.distinctIpThreshold ?? 4;

    const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

    const [reportCounts, failedPaymentCounts, suspiciousLoginCounts, ipCounts] =
      await Promise.all([
        this.userReportModel
          .aggregate<AggregateCountResult>([
            { $match: { createdAt: { $gte: since } } },
            { $group: { _id: '$reportedUserId', count: { $sum: 1 } } },
          ])
          .exec(),
        this.paymentModel
          .aggregate<AggregateCountResult>([
            {
              $match: {
                createdAt: { $gte: since },
                status: PaymentStatus.FAILED,
              },
            },
            { $group: { _id: '$userId', count: { $sum: 1 } } },
          ])
          .exec(),
        this.activityLogModel
          .aggregate<AggregateCountResult>([
            {
              $match: {
                createdAt: { $gte: since },
                action: ActivityAction.SUSPICIOUS_LOGIN,
              },
            },
            { $group: { _id: '$userId', count: { $sum: 1 } } },
          ])
          .exec(),
        this.userSessionModel
          .aggregate<AggregateIpCountResult>([
            { $match: { createdAt: { $gte: since }, ip: { $exists: true } } },
            { $group: { _id: '$userId', ips: { $addToSet: '$ip' } } },
            { $project: { ipCount: { $size: '$ips' } } },
          ])
          .exec(),
      ]);

    const reportMap = this.toCountMap(reportCounts);
    const failedPaymentMap = this.toCountMap(failedPaymentCounts);
    const suspiciousLoginMap = this.toCountMap(suspiciousLoginCounts);
    const ipMap = this.toIpCountMap(ipCounts);

    const userIds = new Set<string>([
      ...reportMap.keys(),
      ...failedPaymentMap.keys(),
      ...suspiciousLoginMap.keys(),
      ...ipMap.keys(),
    ]);

    const candidates: FraudCandidate[] = [];

    for (const userId of userIds) {
      const signals: FraudSignal[] = [];

      const reportCount = reportMap.get(userId) ?? 0;
      if (reportCount >= reportThreshold) {
        signals.push({
          key: 'high_report_volume',
          value: reportCount,
          threshold: reportThreshold,
          score: Math.min(reportCount * 15, 45),
          reason: `${reportCount} reports in ${windowDays} days`,
        });
      }

      const failedPayments = failedPaymentMap.get(userId) ?? 0;
      if (failedPayments >= failedPaymentThreshold) {
        signals.push({
          key: 'failed_payment_spike',
          value: failedPayments,
          threshold: failedPaymentThreshold,
          score: Math.min(failedPayments * 10, 30),
          reason: `${failedPayments} failed payments in ${windowDays} days`,
        });
      }

      const suspiciousLogins = suspiciousLoginMap.get(userId) ?? 0;
      if (suspiciousLogins >= suspiciousLoginThreshold) {
        signals.push({
          key: 'suspicious_login_spike',
          value: suspiciousLogins,
          threshold: suspiciousLoginThreshold,
          score: Math.min(suspiciousLogins * 20, 60),
          reason: `${suspiciousLogins} suspicious login events in ${windowDays} days`,
        });
      }

      const distinctIps = ipMap.get(userId) ?? 0;
      if (distinctIps >= distinctIpThreshold) {
        signals.push({
          key: 'ip_churn_spike',
          value: distinctIps,
          threshold: distinctIpThreshold,
          score: Math.min((distinctIps - distinctIpThreshold + 1) * 10, 30),
          reason: `${distinctIps} distinct session IPs in ${windowDays} days`,
        });
      }

      if (signals.length === 0) {
        continue;
      }

      const riskScore = Math.min(
        signals.reduce((sum, signal) => sum + signal.score, 0),
        100,
      );

      candidates.push({ userId, riskScore, signals });
    }

    candidates.sort((a, b) => b.riskScore - a.riskScore);

    const highRiskUsers = candidates.filter(
      (candidate) => candidate.riskScore >= highRiskThreshold,
    ).length;

    const trimmedCandidates = candidates.slice(0, limit);

    this.logger.log('Fraud detection batch scan complete', {
      scannedUsers: userIds.size,
      flaggedUsers: candidates.length,
      highRiskUsers,
      windowDays,
      topCandidates: trimmedCandidates.slice(0, 10).map((candidate) => ({
        userId: candidate.userId,
        riskScore: candidate.riskScore,
      })),
    });

    return {
      scannedUsers: userIds.size,
      flaggedUsers: candidates.length,
      highRiskUsers,
      windowDays,
      generatedAt: new Date().toISOString(),
      candidates: trimmedCandidates,
    };
  }

  private toCountMap(rows: AggregateCountResult[]): Map<string, number> {
    return new Map(rows.map((row) => [String(row._id), row.count]));
  }

  private toIpCountMap(rows: AggregateIpCountResult[]): Map<string, number> {
    return new Map(rows.map((row) => [String(row._id), row.ipCount]));
  }
}
