export interface Env {
  ENVIRONMENT: string;
  CREEM_API_KEY: string;
  CREEM_WEBHOOK_SECRET: string;
  CREEM_PRODUCT_LIFETIME: string;
  CREEM_PRODUCT_MONTHLY: string;
}

// ─── CREEM API Response Types

// Returned by POST /v1/checkouts
export interface CreemCheckoutResponse {
  id: string;
  checkout_url: string;
  product_id: string;
  status: "pending" | "paid" | "completed" | "expired" | "canceled";
  customer?: {
    id: string;
    email: string;
  };
  metadata?: Record<string, string>;
}

// Returned by GET /v1/checkouts/{id}
export type CreemCheckoutGetResponse = CreemCheckoutResponse;

// ─── CREEM Webhook Payload Types

// CREEM sends these to POST /api/webhooks/creem
export type CreemEventType =
  | "checkout.completed"
  | "subscription.paid"
  | "subscription.active"
  | "subscription.canceled"
  | "subscription.expired"
  | "refund.created";

export interface CreemWebhookCustomer {
  id: string;
  email: string;
}

export interface CreemWebhookProduct {
  id: string;
  name: string;
}

export interface CreemWebhookObject {
  id: string;
  customer: CreemWebhookCustomer;
  product: CreemWebhookProduct;
  metadata?: Record<string, string>;
  subscription_id?: string;
  status?: string;
}

export interface CreemWebhookPayload {
  id: string;
  eventType: CreemEventType;
  created_at: number;
  object: CreemWebhookObject;
}

// ─── Internal App Types

export type PlanType = "one_time" | "monthly";

export interface CheckoutRequestBody {
  planType: PlanType;
  deviceId: string; // generated on first launch, stored in MMKV
}

export interface CheckoutResponseBody {
  checkoutUrl: string;
  checkoutId: string;
}

export interface VerifyPremiumResponse {
  premium: boolean;
  planType?: PlanType;
  email?: string;
  checkoutId?: string;
}
