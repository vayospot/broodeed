// Flock types
export type FlockType = "broiler" | "layer" | "dual";

export interface Flock {
  id: string;
  name: string;
  type: FlockType;
  breed?: string;
  startDate: string; // ISO date string
  initialCount: number;
  costPerBird: number;
  status: "active" | "completed" | "archived";
  notes?: string;
  expectedDuration?: number; // days
  createdAt: string;
  updatedAt: string;
}

// Daily log types
export interface DailyLog {
  id: string;
  flockId: string;
  logDate: string; // ISO date string (unique per flock per day)
  birdCount: number; // end of day count
  deaths: number;
  feedConsumedKg: number;
  eggsCollected?: number;
  eggsDamaged?: number;
  notes?: string;
  synced: boolean;
  createdAt: string;
  updatedAt: string;
}

// Expense types
export type ExpenseCategory =
  | "feed"
  | "medicine"
  | "labor"
  | "utilities"
  | "other";

export interface Expense {
  id: string;
  flockId?: string; // nullable = general farm expense
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  description?: string;
  synced: boolean;
  createdAt: string;
}

// Sale types
export type SaleType = "eggs" | "birds" | "manure" | "other";

export interface Sale {
  id: string;
  flockId: string;
  saleType: SaleType;
  quantity: number;
  unitPrice: number;
  buyerName?: string;
  saleDate: string;
  notes?: string;
  synced: boolean;
  createdAt: string;
}

// Settings
export interface Settings {
  farmName: string;
  currency: string;
  currencySymbol: string;
  weightUnit: "kg" | "lb";
  isPremium: boolean;
  premiumType?: "monthly";
  hasCompletedOnboarding: boolean;
  hapticEnabled: boolean;
  dailyLogReminder: boolean;
}

// Premium status
export interface PremiumStatus {
  isPremium: boolean;
  premiumType?: "monthly";
  email?: string;
  checkoutId?: string;
  expiresAt?: string;
}
