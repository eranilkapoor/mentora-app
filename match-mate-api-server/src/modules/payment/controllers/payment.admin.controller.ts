import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { Permission, Role } from 'src/common/enums';
import { AdminListPaymentsDto } from '../dto/admin-list-payments.dto';
import { AdminRefundPaymentDto } from '../dto/admin-refund-payment.dto';
import { PaymentReconciliationDto } from '../dto/payment-reconciliation.dto';
import { PaymentSettlementReportDto } from '../dto/payment-settlement-report.dto';

@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.ADMIN)
export class PaymentAdminController {
  constructor(private readonly paymentService: PaymentService) {}

  @Permissions(Permission.PAYMENT_VIEW)
  @Get('reports/reconciliation')
  reconcile(@Query() query: PaymentReconciliationDto) {
    return this.paymentService.adminReconcilePayments(query);
  }

  @Permissions(Permission.PAYMENT_VIEW)
  @Get('reports/settlement')
  settlementReport(@Query() query: PaymentSettlementReportDto) {
    return this.paymentService.adminSettlementReport(query);
  }

  @Permissions(Permission.PAYMENT_VIEW)
  @Get()
  listPayments(@Query() query: AdminListPaymentsDto) {
    return this.paymentService.adminListPayments(query);
  }

  @Permissions(Permission.PAYMENT_VIEW)
  @Get(':orderId')
  getPayment(@Param('orderId') orderId: string) {
    return this.paymentService.adminGetPaymentDetail(orderId);
  }

  @Permissions(Permission.PAYMENT_REFUND)
  @Post(':orderId/refund')
  refundPayment(
    @Param('orderId') orderId: string,
    @Body() dto: AdminRefundPaymentDto,
  ) {
    return this.paymentService.adminInitiateRefund(orderId, dto);
  }
}
