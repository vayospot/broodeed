# Broodeed

A production-grade mobile app for poultry farmers with full CREEM payment integration. Built with React Native (Expo) and Cloudflare Workers.

## Full Tutorial Guide

[A complete written walkthrough of the CREEM integration](https://medium.com/@vayospot/how-to-integrate-creem-payments-into-react-native-app-full-tutorial-e521c4baed38)

## CREEM

This app demonstrates a complete **CREEM payment integration** for React Native. It showcases:

- ✅ **In-app Checkout** - Open CREEM checkout in WebView or external browser
- ✅ **Deep Linking** - Handle payment success/cancel callbacks with custom URL scheme
- ✅ **Purchase Verification** - Verify purchases from mobile client
- ✅ **Webhook Handling** - Server-side webhook receiver for payment events
- ✅ **Both iOS & Android** - Built with Expo for cross-platform support

## Project Structure

```
broodeed/                      # Monorepo
├── mobile/                   # React Native (Expo SDK 54) mobile app
│   ├── app/                  # Expo Router screens
│   ├── src/
│   │   ├── lib/creem.ts     # Mobile CREEM client library
│   │   ├── stores/          # Zustand + MMKV state management
│   │   └── types/           # TypeScript definitions
│   └── package.json
├── backend/                  # Cloudflare Workers + Hono backend
│   ├── src/
│   │   ├── index.ts         # API routes
│   │   ├── lib/creem.ts     # CREEM API utilities
│   │   └── lib/crypto.ts    # Webhook signature verification
│   └── package.json
└── package.json              # Monorepo workspace config
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native (Expo SDK 54) |
| Language | TypeScript |
| Navigation | Expo Router v6 (file-based) |
| Styling | twrnc (Tailwind CSS) |
| State | Zustand + MMKV (offline-first) |
| Backend | Cloudflare Workers + Hono |
| Payments | CREEM |
| Icons | Ionicons |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Expo CLI (`npx expo`)
- Wrangler CLI (`npm install -g wrangler`)

### Installation

```bash
# Install all dependencies (monorepo)
npm run install:all

# Or install separately
cd mobile && npm install
cd backend && npm install
```

### Running the Mobile App

```bash
# From root (uses npm workspace)
npm run mobile

# Or directly
cd mobile && npx expo start
```

## Platform Setup

### iOS Setup

```bash
cd mobile
npx expo run:ios
```

**iOS Requirements:**
- Xcode installed
- Apple Developer account (for physical device testing)

### Android Setup

```bash
cd mobile
npx expo run:android
```

**Android Requirements:**
- Android Studio installed
- Android SDK configured

### Backend Development

```bash
cd backend

# Copy environment template
cp .dev.vars.example .dev.vars

# Add your CREEM credentials to .dev.vars:
# CREEM_API_KEY=your_api_key
# CREEM_WEBHOOK_SECRET=your_webhook_secret
# CREEM_PRODUCT_MONTHLY=prod_xxx
# ENVIRONMENT=development

# Run locally
npm run dev

# Deploy to Cloudflare
npm run deploy
```

## Mobile App Features

- **One-tap Daily Logging** - Record mortality, feed, and eggs with large touch targets
- **Flock Management** - Track multiple flocks (broilers, layers, dual-purpose)
- **Finance Tracking** - Record expenses and sales, view P&L
- **FCR Calculation** - Automatic Feed Conversion Ratio tracking
- **Offline-First** - Works without internet, all data stored locally in MMKV
- **Dark Theme** - Optimized for outdoor visibility (#0D1B12 background)

## CREEM Integration

### Payment Flow

```
1. User taps "Upgrade to Premium" in app
2. App calls POST /api/checkout with deviceId
3. Backend creates CREEM checkout session
4. App opens checkout_url in WebView or external browser
5. User completes payment on CREEM
6. CREEM redirects to /api/payment/success with checkout_id
7. Backend redirects to broodeed://payment/success?checkout_id=xxx
8. App handles deep link, stores premium status locally
```

### Deep Links

| Event | Deep Link |
|-------|-----------|
| Success | `broodeed://payment/success?checkoutId=xxx` |
| Cancel | `broodeed://payment/cancel` |

### Checkout Methods

The app demonstrates **two checkout methods**:

1. **External Browser** - Opens Safari/Chrome, deep link returns to app
2. **In-App WebView** - Renders CREEM inside app, intercepts redirect

### Premium Plan

- **$1/month**
- Unlimited flocks
- CSV export
- Priority support
- No ads

## Backend API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/api/checkout` | Create checkout session |
| GET | `/api/payment/success` | Payment success redirect |
| POST | `/api/webhooks/creem` | Webhook receiver |
| GET | `/api/verify-premium` | Verify premium status |

## Environment Variables

### Mobile (.env)

```
EXPO_PUBLIC_BACKEND_URL=https://your-backend.workers.dev
```

### Backend (.dev.vars)

```
CREEM_API_KEY=your_api_key
CREEM_WEBHOOK_SECRET=your_webhook_secret
CREEM_PRODUCT_MONTHLY=prod_xxx
ENVIRONMENT=development
```

## Testing the Payment Flow

For testing purposes, **premium status resets on every app launch**. This allows easy re-testing of the checkout flow. Remove this in production (see `mobile/src/stores/useAppStore.ts`).

## License

MIT

## Related Documentation

- [CREEM API Docs](https://docs.creem.io)
- [Expo SDK](https://docs.expo.dev)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
