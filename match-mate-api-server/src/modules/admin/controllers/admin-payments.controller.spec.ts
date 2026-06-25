import { SuccessCode } from '@/common/constants';
import { AdminPaymentsController } from './admin-payments.controller';

describe('AdminPaymentsController', () => {
  const paymentsService = {
    adminReconcilePayments: jest.fn(),
    adminSettlementReport: jest.fn(),
    adminGstReport: jest.fn(),
    adminListPayments: jest.fn(),
    adminGetPaymentDetail: jest.fn(),
    adminInitiateRefund: jest.fn(),
  };
  const auditService = {
    write: jest.fn(),
  };

  let controller: AdminPaymentsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AdminPaymentsController(
      paymentsService as never,
      auditService as never,
    );
  });

  it('returns reconciliation, settlement, and gst reports', async () => {
    paymentsService.adminReconcilePayments.mockResolvedValue({ items: [] });
    paymentsService.adminSettlementReport.mockResolvedValue({ items: [] });
    paymentsService.adminGstReport.mockResolvedValue({ totals: {} });

    const reconciliation = await controller.reconcile({
      fromDate: '2026-06-01',
      toDate: '2026-06-25',
    });
    const settlement = await controller.settlementReport({
      fromDate: '2026-06-01',
      toDate: '2026-06-25',
    });
    const gst = await controller.gstReport({
      fromDate: '2026-06-01',
      toDate: '2026-06-25',
    });

    expect(reconciliation.code).toBe(SuccessCode.PAYMENTS_FETCHED);
    expect(settlement.code).toBe(SuccessCode.PAYMENTS_FETCHED);
    expect(gst.code).toBe(SuccessCode.PAYMENT_GST_REPORT_FETCHED);
  });

  it('lists payment rows and fetches detail', async () => {
    paymentsService.adminListPayments.mockResolvedValue({ data: [] });
    paymentsService.adminGetPaymentDetail.mockResolvedValue({ orderId: 'o1' });

    const list = await controller.listPayments({ page: 1, limit: 20 });
    const one = await controller.getPayment('o1');

    expect(list.code).toBe(SuccessCode.PAYMENTS_FETCHED);
    expect(one.code).toBe(SuccessCode.PAYMENT_FETCHED);
  });

  it('initiates refund and writes audit', async () => {
    const req = { user: { sub: 'admin-1' } };
    paymentsService.adminInitiateRefund.mockResolvedValue({ refunded: true });

    const response = await controller.refundPayment(req as never, 'o1', {
      reason: 'duplicate',
    });

    expect(paymentsService.adminInitiateRefund).toHaveBeenCalledWith('o1', {
      reason: 'duplicate',
    });
    expect(auditService.write).toHaveBeenCalled();
    expect(response.code).toBe(SuccessCode.PAYMENT_REFUNDED);
  });
});
