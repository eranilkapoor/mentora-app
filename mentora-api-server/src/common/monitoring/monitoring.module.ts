import { Global, Module } from '@nestjs/common';
import { ErrorMonitoringService } from './error-monitoring.service';
import { OperationalMetricsController } from './operational-metrics.controller';
import { OperationalMetricsService } from './operational-metrics.service';

@Global()
@Module({
  controllers: [OperationalMetricsController],
  providers: [ErrorMonitoringService, OperationalMetricsService],
  exports: [ErrorMonitoringService, OperationalMetricsService],
})
export class MonitoringModule {}
