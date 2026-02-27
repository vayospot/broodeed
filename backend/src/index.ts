import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import {
  createCheckoutSession,
  getCheckoutById,
  isCheckoutPaid,
} from "./lib/creem";
import { verifyWebhookSignature } from "./lib/crypto";
import type {
  CheckoutRequestBody,
  CheckoutResponseBody,
  CreemWebhookPayload,
  Env,
  VerifyPremiumResponse,
} from "./types";

const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());

// During dev, allows all origins. Lock this down for production.
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/", (c) => {
  return c.json({
    status: "ok",
    service: "broodeed-backend",
    version: "1.0.0",
    environment: c.env.ENVIRONMENT,
  });
});

// ROUTE 1: Create Checkout Session

app.post("/api/checkout", async (c) => {
  let body: CheckoutRequestBody;

  try {
    body = await c.req.json<CheckoutRequestBody>();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  if (!body.planType || !body.deviceId) {
    return c.json(
      { error: "Missing required fields: planType, deviceId" },
      400,
    );
  }

  if (body.planType !== "one_time" && body.planType !== "monthly") {
    return c.json({ error: 'planType must be "one_time" or "monthly"' }, 400);
  }

  const workerUrl = new URL(c.req.url).origin;

  try {
    const checkout = await createCheckoutSession(c.env, body, workerUrl);

    const response: CheckoutResponseBody = {
      checkoutUrl: checkout.checkout_url,
      checkoutId: checkout.id,
    };

    console.log(
      `[checkout] Created session ${checkout.id} for plan: ${body.planType}, device: ${body.deviceId}`,
    );

    return c.json(response, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[checkout] Failed to create session:", message);

    return c.json({ error: "Failed to create checkout session" }, 500);
  }
});

// ROUTE 2: Payment Success Redirect

app.get("/api/payment/success", (c) => {
  const checkoutId = c.req.query("checkout_id");
  const orderId = c.req.query("order_id");
  const customerId = c.req.query("customer_id");
  const productId = c.req.query("product_id");

  console.log("[success] Redirect received from CREEM:", {
    checkoutId,
    orderId,
    customerId,
    productId,
  });

  // Build the deep link URL — to open Broodeed app
  const deepLinkParams = new URLSearchParams();
  if (checkoutId) deepLinkParams.set("checkoutId", checkoutId);
  if (orderId) deepLinkParams.set("orderId", orderId);
  if (customerId) deepLinkParams.set("customerId", customerId);
  if (productId) deepLinkParams.set("productId", productId);

  const deepLink = `broodeed://payment/success?${deepLinkParams.toString()}`;

  // 302 Found → tells the browser to follow the redirect immediately
  return c.redirect(deepLink, 302);
});

// ROUTE 3: CREEM Webhook Receiver

app.post("/api/webhooks/creem", async (c) => {
  const rawBody = await c.req.text();

  const signature = c.req.header("creem-signature");

  if (!signature) {
    console.warn("[webhook] Missing creem-signature header — rejected");
    return c.json({ error: "Missing signature" }, 401);
  }

  const isValid = await verifyWebhookSignature(
    rawBody,
    signature,
    c.env.CREEM_WEBHOOK_SECRET,
  );

  if (!isValid) {
    console.warn("[webhook] Invalid signature — possible spoofed request");
    return c.json({ error: "Invalid signature" }, 401);
  }

  c.executionCtx.waitUntil(processWebhookEvent(rawBody));

  return c.json({ received: true }, 200);
});

async function processWebhookEvent(rawBody: string): Promise<void> {
  let payload: CreemWebhookPayload;

  try {
    payload = JSON.parse(rawBody) as CreemWebhookPayload;
  } catch {
    console.error("[webhook] Failed to parse payload");
    return;
  }

  console.log(`[webhook] Event received: ${payload.eventType}`, {
    eventId: payload.id,
    customerId: payload.object?.customer?.id,
    customerEmail: payload.object?.customer?.email,
    productId: payload.object?.product?.id,
    metadata: payload.object?.metadata,
  });

  switch (payload.eventType) {
    case "checkout.completed":
      // One-time payment succeeded.
      console.log(`[webhook] ✅ One-time purchase completed!`);
      console.log(`Customer: ${payload.object.customer.email}`);
      console.log(`Plan: ${payload.object.metadata?.planType}`);
      console.log(`Device: ${payload.object.metadata?.deviceId}`);
      break;

    case "subscription.paid":
      // Recurring subscription payment succeeded.
      console.log(`[webhook] ✅ Subscription payment received!`);
      console.log(`Customer: ${payload.object.customer.email}`);
      console.log(`Device: ${payload.object.metadata?.deviceId}`);
      break;

    case "subscription.canceled":
      // User canceled their subscription.
      console.log(`[webhook] ⚠️  Subscription canceled`);
      console.log(`Customer: ${payload.object.customer.email}`);
      break;

    case "refund.created":
      // A refund was created.
      console.log(`[webhook] Refund created`);
      console.log(`Customer: ${payload.object.customer.email}`);
      break;

    default:
      // We registered for specific events in the dashboard,
      // but just incase... log and ignore gracefully.
      console.log(`[webhook] Unhandled event type: ${payload.eventType}`);
  }
}

// ROUTE 4: Verify Premium Status

app.get("/api/verify-premium", async (c) => {
  const checkoutId = c.req.query("checkoutId");

  if (!checkoutId) {
    return c.json({ error: "Missing checkoutId parameter" }, 400);
  }

  try {
    const checkout = await getCheckoutById(c.env, checkoutId);

    const paid = isCheckoutPaid(checkout);

    console.log(
      `[verify] Checkout ${checkoutId}: status=${checkout.status}, paid=${paid}`,
    );

    const response: VerifyPremiumResponse = {
      premium: paid,
      ...(paid && {
        planType: checkout.metadata?.planType as
          | "one_time"
          | "monthly"
          | undefined,
        email: checkout.customer?.email,
        checkoutId: checkout.id,
      }),
    };

    return c.json(response, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[verify] Failed to verify checkout:", message);
    return c.json<VerifyPremiumResponse>({ premium: false }, 200);
  }
});

app.notFound((c) => {
  return c.json(
    { error: `Route not found: ${c.req.method} ${c.req.path}` },
    404,
  );
});

app.onError((err, c) => {
  console.error("[worker] Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
