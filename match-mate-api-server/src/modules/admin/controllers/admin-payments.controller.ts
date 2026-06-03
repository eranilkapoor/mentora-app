import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission, Role } from '@/common/enums';
import { SuccessCode } from '@/common/constants';
import { successResponse } from '@/common/utils/response.util';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { PaymentsService } from '@/modules/payments/services/payments.service';
import { AdminListPaymentsDto } from '@/modules/payments/dto/admin-list-payments.dto';
import { AdminRefundPaymentDto } from '@/modules/payments/dto/admin-refund-payment.dto';
import { PaymentReconciliationDto } from '@/modules/payments/dto/payment-reconciliation.dto';
import { PaymentSettlementReportDto } from '@/modules/payments/dto/payment-settlement-report.dto';
import { AdminAuditService } from '../services/admin-audit.service';

@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.FINANCE)
export class AdminPaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly auditService: AdminAuditService,
  ) {}

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
    @Req() req: AuthenticatedRequest,
    @Param('orderId') orderId: string,
    @Body() dto: AdminRefundPaymentDto,
  ) {
    const data = await this.paymentsService.adminInitiateRefund(orderId, dto);
    await this.auditService.write({
      req,
      actorId: req.user.sub,
      action: 'payment.refund_initiated',
      resource: 'payment',
      targetId: orderId,
      reason: dto.reason,
      after: data as Record<string, unknown>,
    });
    return successResponse(data, SuccessCode.PAYMENT_REFUNDED);
  }
}
