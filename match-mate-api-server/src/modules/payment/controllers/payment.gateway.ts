export interface PaymentGateway {
  createOrder(amount: number): Promise<any>;
  verifyPayment(data: any): boolean;
}
