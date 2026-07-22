export interface GatewayOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  expiresAt?: Date;
}

export interface GatewayVerifyResult {
  verified: boolean;
  paymentId?: string;
}

export interface IPaymentGateway {
  createOrder(params: {
    amount: number;
    currency: string;
    receipt: string;
  }): Promise<GatewayOrderResult>;

  verifyPayment(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): GatewayVerifyResult;
}
