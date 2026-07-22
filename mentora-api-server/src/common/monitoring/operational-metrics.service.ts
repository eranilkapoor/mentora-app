import { Injectable } from '@nestjs/common';

type SocketNamespace = string;

export interface SocketMetric {
  connected: number;
  connections: number;
  disconnects: number;
  authFailures: number;
  events: Record<string, number>;
}

export interface ProductMetrics {
  matchDigestSent: number;
  matchDigestEligible: number;
  matchDigestErrors: number;
  notificationDeliveryFailures: number;
  notificationDeliverySent: number;
  notificationDeliverySkipped: number;
}

export interface MongoSlowQueryMetric {
  collection: string;
  commandName: string;
  durationMs: number;
  recordedAt: string;
}

const newSocketMetric = (): SocketMetric => ({
  connected: 0,
  connections: 0,
  disconnects: 0,
  authFailures: 0,
  events: {},
});

export interface OperationalMetricsSnapshot {
  service: string;
  generatedAt: string;
  startedAt: string;
  uptimeSeconds: number;
  product: ProductMetrics;
  sockets: Record<string, SocketMetric>;
  database: {
    mongoSlowQueryCount: number;
    recentMongoSlowQueries: MongoSlowQueryMetric[];
  };
}

@Injectable()
export class OperationalMetricsService {
  private readonly startedAt = new Date();
  private readonly socketMetrics = new Map<SocketNamespace, SocketMetric>();
  private readonly productMetrics: ProductMetrics = {
    matchDigestSent: 0,
    matchDigestEligible: 0,
    matchDigestErrors: 0,
    notificationDeliveryFailures: 0,
    notificationDeliverySent: 0,
    notificationDeliverySkipped: 0,
  };
  private mongoSlowQueryCount = 0;
  private readonly recentMongoSlowQueries: MongoSlowQueryMetric[] = [];

  recordSocketConnected(namespace: SocketNamespace): void {
    const metric = this.getSocketMetric(namespace);
    metric.connected += 1;
    metric.connections += 1;
  }

  recordSocketDisconnected(namespace: SocketNamespace): void {
    const metric = this.getSocketMetric(namespace);
    metric.connected = Math.max(0, metric.connected - 1);
    metric.disconnects += 1;
  }

  recordSocketAuthFailure(namespace: SocketNamespace): void {
    this.getSocketMetric(namespace).authFailures += 1;
  }

  recordSocketEvent(namespace: SocketNamespace, event: string): void {
    const metric = this.getSocketMetric(namespace);
    metric.events[event] = (metric.events[event] ?? 0) + 1;
  }

  recordNotificationDelivery(status: string): void {
    if (status === 'sent') {
      this.productMetrics.notificationDeliverySent += 1;
    } else if (status === 'skipped') {
      this.productMetrics.notificationDeliverySkipped += 1;
    } else if (status === 'failed') {
      this.productMetrics.notificationDeliveryFailures += 1;
    }
  }

  recordMatchDigest(summary: {
    eligible: number;
    sent: number;
    errors: number;
  }): void {
    this.productMetrics.matchDigestEligible += summary.eligible;
    this.productMetrics.matchDigestSent += summary.sent;
    this.productMetrics.matchDigestErrors += summary.errors;
  }

  recordMongoSlowQuery(metric: MongoSlowQueryMetric): void {
    this.mongoSlowQueryCount += 1;
    this.recentMongoSlowQueries.unshift(metric);
    this.recentMongoSlowQueries.splice(20);
  }

  snapshot(): OperationalMetricsSnapshot {
    return {
      service: 'match-mate-api',
      generatedAt: new Date().toISOString(),
      startedAt: this.startedAt.toISOString(),
      uptimeSeconds: Math.floor((Date.now() - this.startedAt.getTime()) / 1000),
      product: { ...this.productMetrics },
      sockets: Object.fromEntries(this.socketMetrics),
      database: {
        mongoSlowQueryCount: this.mongoSlowQueryCount,
        recentMongoSlowQueries: [...this.recentMongoSlowQueries],
      },
    };
  }

  private getSocketMetric(namespace: SocketNamespace): SocketMetric {
    const existing = this.socketMetrics.get(namespace);
    if (existing) {
      return existing;
    }

    const metric = newSocketMetric();
    this.socketMetrics.set(namespace, metric);
    return metric;
  }
}
