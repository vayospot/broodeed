# Broodeed

A monorepo containing a mobile app for poultry farmers and backend services.

## Structure

```
/
├── mobile/          # React Native (Expo) mobile app
├── backend/         # Backend services (Creem integration)
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Install all dependencies (mobile + backend)
npm run install:all

# Or install separately
cd mobile && npm install
cd backend && npm install
```

### Running the App

```bash
# Mobile App (from root)
npm run mobile

# Or directly
cd mobile && npx expo start
```

## Mobile App

A mobile app for poultry farmers to track their farm operations with ease.

### Features

- **One-tap Daily Logging** - Record mortality, feed, and eggs with large buttons
- **Flock Management** - Track multiple flocks (broilers, layers, dual-purpose)
- **Finance Tracking** - Record expenses and sales, view P&L
- **FCR Calculation** - Automatic Feed Conversion Ratio tracking
- **Offline-First** - Works without internet, data stored locally
- **Dark Theme** - Optimized for outdoor visibility
- **CREEM Payments** - In-app purchases for premium features

### Tech Stack

- React Native (Expo SDK 54)
- TypeScript
- Zustand + MMKV (state & storage)
- twrnc (styling)
- Ionicons (icons)
- Expo Router (navigation)
- CREEM (payments)

## CREEM Integration

This app uses CREEM for its payment integration:

- **In-app Checkout** - Open CREEM checkout
- **Deep Linking** - Handle payment success/cancel callbacks
- **Purchase Verification** - Verify purchases from mobile client
- **Two Plans** - $9.99 one-time or $1/month

## Premium Features

- Unlimited flocks
- CSV export
- Priority support

## Backend

Backend services for:

- Creem payment webhook handling

See `backend/README.md` for more details.

## License

MIT
