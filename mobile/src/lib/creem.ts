import * as Linking from "expo-linking";
import type { PremiumStatus } from "../types";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export type PlanType = "one_time" | "monthly";

export interface CreateCheckoutParams {
  planType: PlanType;
  deviceId: string;
}

export interface CheckoutSession {
  checkoutUrl: string;
  checkoutId: string;
}

export interface VerifyPremiumResult {
  premium: boolean;
  planType?: PlanType;
  email?: string;
  checkoutId?: string;
}

export async function createCheckout(
  params: CreateCheckoutParams,
): Promise<CheckoutSession> {
  const response = await fetch(`${BACKEND_URL}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create checkout: ${error}`);
  }

  return response.json() as Promise<CheckoutSession>;
}

export async function verifyPremium(
  checkoutId: string,
): Promise<VerifyPremiumResult> {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/verify-premium?checkoutId=${encodeURIComponent(checkoutId)}`,
    );

    if (!response.ok) {
      return { premium: false };
    }

    return response.json() as Promise<VerifyPremiumResult>;
  } catch {
    // Network error — return false so polling retries
    return { premium: false };
  }
}

export function parseDeepLinkParams(url: string): Record<string, string> {
  try {
    const parsed = Linking.parse(url);
    const params: Record<string, string> = {};

    if (parsed.queryParams) {
      Object.entries(parsed.queryParams).forEach(([key, value]) => {
        if (value !== undefined) {
          params[key] = Array.isArray(value) ? String(value[0]) : String(value);
        }
      });
    }
    return params;
  } catch {
    return {};
  }
}

export function buildPremiumStatus(result: VerifyPremiumResult): PremiumStatus {
  return {
    isPremium: true,
    premiumType: result.planType,
    email: result.email,
    checkoutId: result.checkoutId,
  };
}
