export type {
  components as OpenApiComponents,
  operations as OpenApiOperations,
  paths as OpenApiPaths,
} from "./generated";

export interface ApiResponse<T> {
  success: boolean;
  code?: string;
  message?: string;
  data: T;
}

export type PaymentGateway =
  | "razorpay"
  | "stripe"
  | "apple_iap"
  | "google_play"
  | "manual";

export type PaymentPurpose =
  | "subscription"
  | "profile_boost"
  | "priority_support"
  | "coin_pack";

export type PaymentStatus =
  | "created"
  | "pending"
  | "success"
  | "failed"
  | "refunded"
  | "cancelled";

export type MembershipPlanType = "self_service" | "assisted" | "profile_boost";

export interface MembershipPlanFeature {
  value?: string | number | boolean;
  featureId?: {
    key?: string;
    name?: string;
    description?: string;
    category?: string;
    type?: "boolean" | "limit" | "quota" | "tier" | "duration";
  };
}

export interface MembershipPlan {
  _id: string;
  name: string;
  slug: string;
  tier: string;
  planType?: MembershipPlanType;
  billingCycle: string;
  price: number;
  durationDays: number;
  trialDays?: number;
  autoRenewDefault?: boolean;
  currency: string;
  isPopular?: boolean;
  sortOrder?: number;
  description?: string;
  features?: MembershipPlanFeature[];
}

export interface ActiveSubscription {
  _id: string;
  planId: MembershipPlan | string;
  startDate: string;
  endDate: string;
  status: string;
  trialEndsAt?: string;
  autoRenew?: boolean;
  cancelledAt?: string;
  cancelledReason?: string;
  paymentProvider?: PaymentGateway;
  storeProductId?: string;
  storeTransactionId?: string;
  storeOriginalTransactionId?: string;
}

export interface BillingPayment {
  _id: string;
  orderId: string;
  planId?: MembershipPlan | string;
  amount: number;
  taxAmount: number;
  discountAmount: number;
  netAmount: number;
  currency: string;
  gateway: PaymentGateway | string;
  method?: string;
  purpose: PaymentPurpose | string;
  status: PaymentStatus | string;
  initiatedAt: string;
  paidAt?: string;
  failedAt?: string;
  failureReason?: string;
}

export interface BillingSummary {
  currentPlan: ActiveSubscription | null;
  subscriptions: ActiveSubscription[];
  payments: BillingPayment[];
  billing: {
    currency: string;
    totalPaid: number;
    successfulPayments: number;
    lastPaymentAt?: string;
    nextRenewalAt?: string | null;
    autoRenew: boolean;
  };
}

export interface ProfileBoost {
  _id: string;
  userId: string;
  startsAt: string;
  endsAt: string;
  multiplier: number;
  status: string;
  source?: string;
}

export interface CreatePaymentOrderRequest {
  planId?: string;
  amount?: number;
  coinAmount?: number;
  currency?: string;
  purpose?: PaymentPurpose;
  gateway?: PaymentGateway;
  idempotencyKey?: string;
  description?: string;
  couponCode?: string;
  customerGstin?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentOrder {
  orderId: string;
  gatewayOrderId?: string;
  amount: number;
  taxAmount: number;
  discountAmount?: number;
  netAmount: number;
  couponCode?: string;
  currency: string;
  status: PaymentStatus | string;
  gateway: PaymentGateway | string;
  expiresAt: string;
}

export interface VerifyPaymentRequest {
  orderId: string;
  gatewayPaymentId: string;
  gatewayOrderId?: string;
  signature: string;
  method?: string;
  gatewayPayload?: Record<string, unknown>;
}

export interface ValidateCouponRequest {
  planId: string;
  code: string;
}

export interface CouponValidationResult {
  couponCode?: string;
  discountAmount: number;
  couponSummary?: {
    code: string;
    title?: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  };
}

export interface VerifyStoreSubscriptionRequest {
  gateway: Extract<PaymentGateway, "apple_iap" | "google_play">;
  planId: string;
  productId: string;
  transactionId: string;
  originalTransactionId?: string;
  receiptData?: string;
  purchaseToken?: string;
  couponCode?: string;
  payload?: Record<string, unknown>;
}

export interface StartFreeTrialRequest {
  planId: string;
  trialDays?: number;
}

export interface CancelSubscriptionRequest {
  reason?: string;
}

export interface PaymentInvoice {
  invoiceNumber: string;
  orderId: string;
  currency: string;
  taxableAmount: number;
  discountAmount: number;
  gstPercentage: number;
  gstAmount: number;
  totalAmount: number;
  issuedAt: string;
}

export type SupportTicketCategory =
  | "account"
  | "billing"
  | "matches"
  | "chat"
  | "safety"
  | "technical"
  | "feedback"
  | "other";

export type SupportTicketPriority = "low" | "normal" | "high" | "urgent";
export type SupportTicketStatus = "open" | "pending" | "resolved" | "closed";

export interface SupportTicketMessage {
  authorId: string;
  authorType: "user" | "agent" | "system";
  message: string;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SupportTicket {
  _id: string;
  subject: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  messages: SupportTicketMessage[];
  lastUserReplyAt?: string;
  lastAgentReplyAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupportTicketsResponse {
  items: SupportTicket[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CreateSupportTicketRequest {
  subject: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  message: string;
}

export interface ReplySupportTicketRequest {
  ticketId: string;
  message: string;
}
