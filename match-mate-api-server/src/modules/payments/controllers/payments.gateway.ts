export interface PaymentsGatewayCreateOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
}

export interface PaymentsGatewayCreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  expiresAt?: Date;
}

export interface PaymentsGatewayVerifyPaymentRequest {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface PaymentsGatewayVerifyPaymentResponse {
  verified: boolean;
  paymentId?: string;
}

export interface PaymentsGateway {
  createOrder(
    params: PaymentsGatewayCreateOrderRequest,
  ): Promise<PaymentsGatewayCreateOrderResponse>;
  verifyPayment(
    params: PaymentsGatewayVerifyPaymentRequest,
  ): PaymentsGatewayVerifyPaymentResponse;
}
