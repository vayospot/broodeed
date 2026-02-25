# Broodeed

A mobile app for poultry farmers to track their farm operations with ease.

## Features

- **One-tap Daily Logging** - Record mortality, feed, and eggs with large buttons
- **Flock Management** - Track multiple flocks (broilers, layers, dual-purpose)
- **Finance Tracking** - Record expenses and sales, view P&L
- **FCR Calculation** - Automatic Feed Conversion Ratio tracking
- **Offline-First** - Works without internet, data stored locally
- **Dark Theme** - Optimized for outdoor visibility
- **CREEM Payments** - In-app purchases for premium features

## Tech Stack

- React Native (Expo SDK 54)
- TypeScript
- Zustand + MMKV (state & storage)
- twrnc (styling)
- Ionicons (icons)
- Expo Router (navigation)
- CREEM (payments)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI

### Installation

```bash
# Install dependencies
npm install

# Start development server
npx expo start
```

### Running on Device/Simulator

```bash
# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android

# Or press 'i' / 'a' in the expo terminal
```

## CREEM Integration

This app uses CREEM for its payment integration:

- **In-app Checkout** - Open CREEM checkout
- **Deep Linking** - Handle payment success/cancel callbacks
- **Purchase Verification** - Verify purchases from mobile client
- **Two Plans** - $9.99 one-time or $1/month

### Payment Flow

1. User taps "Upgrade to Premium"
2. CREEM checkout opens
3. On success, deep link redirects to app
4. Premium status stored locally via MMKV (for now)

## Premium Features

- Unlimited flocks
- CSV export
- Priority support

## License

MIT
