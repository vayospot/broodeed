# Broodeed Backend

Cloudflare Workers backend for CREEM payment integration. Built with Hono framework.

> **Full Tutorial Guide**: [How to integrate CREEM payments into React Native](https://medium.com/@vayospot/how-to-integrate-creem-payments-into-react-native-app-full-tutorial-e521c4baed38)

## Overview

This backend handles:

- Creating CREEM checkout sessions
- Processing payment success redirects
- Receiving and verifying webhooks
- Verifying premium status

## Prerequisites

- Node.js 18+
- npm
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account

## Installation

```bash
npm install
```

## Development

### Environment Setup

Create a `.dev.vars` file in the `backend` directory:

```bash
# backend/.dev.vars
CREEM_API_KEY=your_creem_api_key
CREEM_WEBHOOK_SECRET=your_webhook_secret
CREEM_PRODUCT_MONTHLY=prod_xxx
ENVIRONMENT=development
```

Get your credentials:

- **CREEM_API_KEY**: From CREEM dashboard → Settings → API Keys
- **CREEM_WEBHOOK_SECRET**: From CREEM dashboard → Settings → Webhooks (generate secret)
- **CREEM_PRODUCT_MONTHLY**: From CREEM dashboard → Products (your subscription product ID)

### Run Locally

```bash
npm run dev
```

## Deployment

### Deploy to Cloudflare Workers

```bash
npm run deploy
```

This will deploy to your Cloudflare account. Note the deployed URL (e.g., `https://broodeed-backend.your-name.workers.dev`).

### Update Environment Variables in Production

Set production secrets via Cloudflare dashboard or CLI:

```bash
wrangler secret put CREEM_API_KEY
# Enter your CREEM API key when prompted

wrangler secret put CREEM_WEBHOOK_SECRET
# Enter your webhook secret when prompted
```

Or set non-sensitive variables:

```bash
wrangler secret put CREEM_PRODUCT_MONTHLY
wrangler secret put ENVIRONMENT
```

### Configure CREEM Webhook

In CREEM dashboard → Settings → Webhooks:

- **URL**: `https://your-backend.workers.dev/api/webhooks/creem`
- **Events**: `subscription.paid`, `subscription.canceled`, `subscription.active`, `subscription.expired`, `refund.created`

## API Routes

### Health Check

```
GET /
```

Response:

```json
{
  "status": "ok",
  "service": "broodeed-backend",
  "version": "1.0.0",
  "environment": "development"
}
```

### Create Checkout Session

```
POST /api/checkout
Content-Type: application/json

{
  "planType": "monthly",
  "deviceId": "device-123-abc"
}
```

Response:

```json
{
  "checkoutUrl": "https://checkout.creem.io/xxx",
  "checkoutId": "chk_xxx"
}
```

### Payment Success Redirect

```
GET /api/payment/success?checkout_id=chk_xxx&order_id=xxx&customer_id=xxx&product_id=xxx
```

Redirects to: `broodeed://payment/success?checkoutId=chk_xxx&...`

### Verify Premium Status

```
GET /api/verify-premium?checkoutId=chk_xxx
```

Response:

```json
{
  "premium": true,
  "planType": "monthly",
  "email": "user@example.com",
  "checkoutId": "chk_xxx"
}
```

### Webhook Receiver

```
POST /api/webhooks/creem
Content-Type: application/json
creem-signature: <HMAC signature>
```

Handles payment events:

- `subscription.paid` - Payment succeeded
- `subscription.canceled` - Subscription canceled
- `subscription.active` - Subscription activated
- `subscription.expired` - Subscription expired
- `refund.created` - Refund issued

## Payment Flow

```
┌─────────────┐     POST /api/checkout      ┌─────────────────┐
│   Mobile    │ ──────────────────────────▶│  Cloudflare     │
│   App       │                              │  Workers        │
└─────────────┘                              └────────┬────────┘
                                                      │
                                    CREEM API         │
                                                      ▼
┌─────────────┐     Open checkout_url    ┌─────────────────┐
│   CREEM     │◀─────────────────────────│  Cloudflare     │
│  Checkout   │                          │  Workers        │
└─────────────┘                          └────────┬────────┘
      │                                           │
      │  Payment complete                         │ GET /api/payment/success
      │                                           ▼
      │                                  ┌─────────────────┐
      └─────────────────────────────────▶│ broodeed://    │
         Redirect with checkout_id        │ payment/success│
                                          └─────────────────┘
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts         # Main app with all routes
│   ├── types.ts         # TypeScript interfaces
│   └── lib/
│       ├── creem.ts     # CREEM API utilities
│       └── crypto.ts    # Webhook signature verification
├── package.json
├── wrangler.jsonc
└── tsconfig.json
```

## Related Documentation

- [CREEM API Documentation](https://docs.creem.io)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Hono Framework](https://hono.dev)
