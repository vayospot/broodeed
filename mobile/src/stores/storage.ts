import { createMMKV } from "react-native-mmkv";

// Create MMKV instance for Broodeed app
export const storage = createMMKV({ id: "broodeed-storage" });

// Storage keys
export const STORAGE_KEYS = {
  FLOCKS: "broodeed_flocks",
  DAILY_LOGS: "broodeed_logs",
  EXPENSES: "broodeed_expenses",
  SALES: "broodeed_sales",
  SETTINGS: "broodeed_settings",
  PREMIUM: "broodeed_premium",
  ONBOARDING_COMPLETE: "broodeed_onboarding_complete",
  DEVICE_ID: "broodeed_device_id",
} as const;

// Helper functions for JSON storage
export const storageHelpers = {
  getString: <T>(key: string): T | null => {
    const value = storage.getString(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },

  remove: (key: string): void => {
    storage.remove(key);
  },

  removeMultiple: (keys: string[]): void => {
    keys.forEach((key) => storage.remove(key));
  },

  clearAll: (): void => {
    storage.clearAll();
  },
};
