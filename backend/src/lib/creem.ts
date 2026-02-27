import type {
  CheckoutRequestBody,
  CreemCheckoutGetResponse,
  CreemCheckoutResponse,
  Env,
} from "../types";

export function getCreemBaseUrl(env: Env): string {
  return env.ENVIRONMENT === "production"
    ? "https://api.creem.io"
    : "https://test-api.creem.io";
}

async function creemFetch<T>(
  url: string,
  apiKey: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    // CREEM returns error details in the response body
    const errorBody = await response.text();
    throw new Error(`CREEM API error ${response.status}: ${errorBody}`);
  }

  return response.json() as Promise<T>;
}

export async function createCheckoutSession(
  env: Env,
  body: CheckoutRequestBody,
  workerUrl: string,
): Promise<CreemCheckoutResponse> {
  const baseUrl = getCreemBaseUrl(env);

  const productId = env.CREEM_PRODUCT_MONTHLY;

  // The success_url is our own backend endpoint.
  // CREEM will append its own query params to this URL after payment:
  // ?checkout_id=xxx&order_id=xxx&customer_id=xxx&product_id=xxx
  // Our GET /api/payment/success handler then reads those and
  // redirects to the app's deep link.
  const successUrl = `${workerUrl}/api/payment/success`;

  return creemFetch<CreemCheckoutResponse>(
    `${baseUrl}/v1/checkouts`,
    env.CREEM_API_KEY,
    {
      method: "POST",
      body: JSON.stringify({
        product_id: productId,
        success_url: successUrl,
        metadata: {
          planType: body.planType,
          deviceId: body.deviceId,
        },
      }),
    },
  );
}

// Used by GET /api/verify-premium to confirm a checkout was actually paid.
// This is a stateless verification.
// CREEM is the source of truth.
export async function getCheckoutById(
  env: Env,
  checkoutId: string,
): Promise<CreemCheckoutGetResponse> {
  const baseUrl = getCreemBaseUrl(env);

  return creemFetch<CreemCheckoutGetResponse>(
    `${baseUrl}/v1/checkouts?checkout_id=${checkoutId}`,
    env.CREEM_API_KEY,
  );
}

export function isCheckoutPaid(checkout: CreemCheckoutGetResponse): boolean {
  const paidStatuses = ["paid", "completed", "active"];
  return paidStatuses.includes(checkout.status);
}