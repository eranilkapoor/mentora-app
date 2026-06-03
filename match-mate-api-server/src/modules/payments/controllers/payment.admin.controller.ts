import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission, Role } from '@/common/enums';
import { AdminListPaymentsDto } from '../dto/admin-list-payments.dto';
import { AdminRefundPaymentDto } from '../dto/admin-refund-payment.dto';
import { PaymentReconciliationDto } from '../dto/payment-reconciliation.dto';
import { PaymentSettlementReportDto } from '../dto/payment-settlement-report.dto';
import { SuccessCode } from '@/common/constants';
import { successResponse } from '@/common/utils/response.util';

@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.ADMIN)
export class PaymentAdminController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Permissions(Permission.PAYMENT_VIEW)
  @Get('reports/reconciliation')
  async reconcile(@Query() query: PaymentReconciliationDto) {
    return successResponse(
      await this.paymentsService.adminReconcilePayments(query),
      SuccessCode.PAYMENTS_FETCHED,
    );
  }

  @Permissions(Permission.PAYMENT_VIEW)
  @Get('reports/settlement')
  async settlementReport(@Query() query: PaymentSettlementReportDto) {
    return successResponse(
      await this.paymentsService.adminSettlementReport(query),
      SuccessCode.PAYMENTS_FETCHED,
    );
  }

  @Permissions(Permission.PAYMENT_VIEW)
  @Get('reports/gst')
  async gstReport(@Query() query: { fromDate?: string; toDate?: string }) {
    return successResponse(
      await this.paymentsService.adminGstReport(query),
      SuccessCode.PAYMENT_GST_REPORT_FETCHED,
    );
  }

  @Permissions(Permission.PAYMENT_VIEW)
  @Get()
  async listPayments(@Query() query: AdminListPaymentsDto) {
    return successResponse(
      await this.paymentsService.adminListPayments(query),
      SuccessCode.PAYMENTS_FETCHED,
    );
  }

  @Permissions(Permission.PAYMENT_VIEW)
  @Get(':orderId')
  async getPayment(@Param('orderId') orderId: string) {
    return successResponse(
      await this.paymentsService.adminGetPaymentDetail(orderId),
      SuccessCode.PAYMENT_FETCHED,
    );
  }

  @Permissions(Permission.PAYMENT_REFUND)
  @Post(':orderId/refund')
  async refundPayment(
    @Param('orderId') orderId: string,
    @Body() dto: AdminRefundPaymentDto,
  ) {
    return successResponse(
      await this.paymentsService.adminInitiateRefund(orderId, dto),
      SuccessCode.PAYMENT_REFUNDED,
    );
  }
}
