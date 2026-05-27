export interface PaymentsGateway {
  createOrder(amount: number): Promise<any>;
  verifyPayment(data: any): boolean;
}
