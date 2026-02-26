import { create } from "zustand";
import type {
  DailyLog,
  Expense,
  Flock,
  PremiumStatus,
  Sale,
  Settings,
} from "../types";
import { STORAGE_KEYS, storageHelpers } from "./storage";

// Generate unique IDs
const generateId = () =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);

// Default settings
const defaultSettings: Settings = {
  farmName: "",
  currency: "₦ Naira",
  currencySymbol: "₦",
  weightUnit: "kg",
  isPremium: false,
  hasCompletedOnboarding: false,
  hapticEnabled: true,
  dailyLogReminder: false,
};

// Default premium status
const defaultPremium: PremiumStatus = {
  isPremium: false,
};

interface AppState {
  // Data
  flocks: Flock[];
  dailyLogs: DailyLog[];
  expenses: Expense[];
  sales: Sale[];
  settings: Settings;
  premium: PremiumStatus;

  // Actions - Flocks
  addFlock: (flock: Omit<Flock, "id" | "createdAt" | "updatedAt">) => void;
  updateFlock: (id: string, updates: Partial<Flock>) => void;
  deleteFlock: (id: string) => void;
  getFlock: (id: string) => Flock | undefined;

  // Actions - Daily Logs
  addDailyLog: (
    log: Omit<DailyLog, "id" | "createdAt" | "updatedAt" | "synced">,
  ) => void;
  updateDailyLog: (id: string, updates: Partial<DailyLog>) => void;
  getDailyLog: (flockId: string, date: string) => DailyLog | undefined;
  getFlockLogs: (flockId: string) => DailyLog[];

  // Actions - Expenses
  addExpense: (expense: Omit<Expense, "id" | "createdAt" | "synced">) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getFlockExpenses: (flockId?: string) => Expense[];

  // Actions - Sales
  addSale: (sale: Omit<Sale, "id" | "createdAt" | "synced">) => void;
  updateSale: (id: string, updates: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  getFlockSales: (flockId: string) => Sale[];

  // Actions - Settings
  updateSettings: (updates: Partial<Settings>) => void;
  clearAllData: () => void;

  // Actions - Premium
  setPremium: (status: PremiumStatus) => void;

  // Computed
  getActiveFlocks: () => Flock[];
  getFlocksCount: () => number;
  canAddFlock: () => boolean;
  getFlockMortalityRate: (flockId: string) => number;
  getFlockFCR: (flockId: string) => number | null;
  getFlockCurrentCount: (flockId: string) => number;
  getTodayEggs: (flockId: string) => number;

  // Initialize from storage
  initialize: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  flocks: [],
  dailyLogs: [],
  expenses: [],
  sales: [],
  settings: defaultSettings,
  premium: defaultPremium,

  // Flock actions
  addFlock: (flockData) => {
    const now = new Date().toISOString();
    const newFlock: Flock = {
      ...flockData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      const flocks = [...state.flocks, newFlock];
      storageHelpers.set(STORAGE_KEYS.FLOCKS, flocks);
      return { flocks };
    });
  },

  updateFlock: (id, updates) => {
    set((state) => {
      const flocks = state.flocks.map((f) =>
        f.id === id
          ? { ...f, ...updates, updatedAt: new Date().toISOString() }
          : f,
      );
      storageHelpers.set(STORAGE_KEYS.FLOCKS, flocks);
      return { flocks };
    });
  },

  deleteFlock: (id) => {
    set((state) => {
      const flocks = state.flocks.filter((f) => f.id !== id);
      storageHelpers.set(STORAGE_KEYS.FLOCKS, flocks);
      return { flocks };
    });
  },

  getFlock: (id) => get().flocks.find((f) => f.id === id),

  // Daily Log actions
  addDailyLog: (logData) => {
    const now = new Date().toISOString();
    const newLog: DailyLog = {
      ...logData,
      id: generateId(),
      synced: false,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      const dailyLogs = [...state.dailyLogs, newLog];
      storageHelpers.set(STORAGE_KEYS.DAILY_LOGS, dailyLogs);
      return { dailyLogs };
    });
  },

  updateDailyLog: (id, updates) => {
    set((state) => {
      const dailyLogs = state.dailyLogs.map((log) =>
        log.id === id
          ? { ...log, ...updates, updatedAt: new Date().toISOString() }
          : log,
      );
      storageHelpers.set(STORAGE_KEYS.DAILY_LOGS, dailyLogs);
      return { dailyLogs };
    });
  },

  getDailyLog: (flockId, date) =>
    get().dailyLogs.find(
      (log) => log.flockId === flockId && log.logDate === date,
    ),

  getFlockLogs: (flockId) =>
    get()
      .dailyLogs.filter((log) => log.flockId === flockId)
      .sort(
        (a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime(),
      ),

  // Expense actions
  addExpense: (expenseData) => {
    const now = new Date().toISOString();
    const newExpense: Expense = {
      ...expenseData,
      id: generateId(),
      synced: false,
      createdAt: now,
    };
    set((state) => {
      const expenses = [...state.expenses, newExpense];
      storageHelpers.set(STORAGE_KEYS.EXPENSES, expenses);
      return { expenses };
    });
  },

  updateExpense: (id, updates) => {
    set((state) => {
      const expenses = state.expenses.map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp,
      );
      storageHelpers.set(STORAGE_KEYS.EXPENSES, expenses);
      return { expenses };
    });
  },

  deleteExpense: (id) => {
    set((state) => {
      const expenses = state.expenses.filter((exp) => exp.id !== id);
      storageHelpers.set(STORAGE_KEYS.EXPENSES, expenses);
      return { expenses };
    });
  },

  getFlockExpenses: (flockId) =>
    get().expenses.filter((exp) => exp.flockId === flockId || !exp.flockId),

  // Sale actions
  addSale: (saleData) => {
    const now = new Date().toISOString();
    const newSale: Sale = {
      ...saleData,
      id: generateId(),
      synced: false,
      createdAt: now,
    };
    set((state) => {
      const sales = [...state.sales, newSale];
      storageHelpers.set(STORAGE_KEYS.SALES, sales);
      return { sales };
    });
  },

  updateSale: (id, updates) => {
    set((state) => {
      const sales = state.sales.map((sale) =>
        sale.id === id ? { ...sale, ...updates } : sale,
      );
      storageHelpers.set(STORAGE_KEYS.SALES, sales);
      return { sales };
    });
  },

  deleteSale: (id) => {
    set((state) => {
      const sales = state.sales.filter((sale) => sale.id !== id);
      storageHelpers.set(STORAGE_KEYS.SALES, sales);
      return { sales };
    });
  },

  getFlockSales: (flockId) =>
    get().sales.filter((sale) => sale.flockId === flockId),

  // Settings actions
  updateSettings: (updates) => {
    set((state) => {
      const settings = { ...state.settings, ...updates };
      storageHelpers.set(STORAGE_KEYS.SETTINGS, settings);
      return { settings };
    });
  },

  clearAllData: () => {
    storageHelpers.set(STORAGE_KEYS.FLOCKS, []);
    storageHelpers.set(STORAGE_KEYS.DAILY_LOGS, []);
    storageHelpers.set(STORAGE_KEYS.EXPENSES, []);
    storageHelpers.set(STORAGE_KEYS.SALES, []);
    set({
      flocks: [],
      dailyLogs: [],
      expenses: [],
      sales: [],
      settings: defaultSettings,
      premium: defaultPremium,
    });
  },

  // Premium actions
  setPremium: (status) => {
    set((state) => {
      const premium = status;
      storageHelpers.set(STORAGE_KEYS.PREMIUM, premium);
      return { premium };
    });
  },

  // Computed
  getActiveFlocks: () => get().flocks.filter((f) => f.status === "active"),

  getFlocksCount: () =>
    get().flocks.filter((f) => f.status === "active").length,

  canAddFlock: () => {
    const { isPremium } = get().premium;
    const activeCount = get().getFlocksCount();
    // Free: 5 flocks max, Premium: unlimited
    return isPremium || activeCount < 5;
  },

  // Calculate mortality rate for a flock
  getFlockMortalityRate: (flockId) => {
    const flock = get().flocks.find((f) => f.id === flockId);
    if (!flock) return 0;

    const logs = get().dailyLogs.filter((log) => log.flockId === flockId);
    const totalDeaths = logs.reduce((sum, log) => sum + (log.deaths || 0), 0);

    // Mortality rate = total deaths / initial count * 100
    return (totalDeaths / flock.initialCount) * 100;
  },

  // Calculate FCR (Feed Conversion Ratio) for a flock
  getFlockFCR: (flockId) => {
    const flock = get().flocks.find((f) => f.id === flockId);
    if (!flock || flock.type !== "broiler") return null;

    const logs = get().dailyLogs.filter((log) => log.flockId === flockId);
    const totalFeed = logs.reduce(
      (sum, log) => sum + (log.feedConsumedKg || 0),
      0,
    );

    // For now, estimate based on initial count (in real app, track harvested birds)
    const currentCount = get().getFlockCurrentCount(flockId);
    const birdsSold = flock.initialCount - currentCount;

    if (birdsSold <= 0) return null;

    // FCR = total feed / (birds * avg weight, assume 2.5kg)
    const totalWeight = birdsSold * 2.5;
    return totalFeed / totalWeight;
  },

  // Get current bird count (initial - deaths)
  getFlockCurrentCount: (flockId) => {
    const flock = get().flocks.find((f) => f.id === flockId);
    if (!flock) return 0;

    const logs = get().dailyLogs.filter((log) => log.flockId === flockId);
    const totalDeaths = logs.reduce((sum, log) => sum + (log.deaths || 0), 0);

    return Math.max(0, flock.initialCount - totalDeaths);
  },

  // Get today's eggs for a flock
  getTodayEggs: (flockId) => {
    const today = new Date().toISOString().split("T")[0];
    const log = get().dailyLogs.find(
      (log) => log.flockId === flockId && log.logDate === today,
    );
    return log?.eggsCollected || 0;
  },

  // Initialize from storage
  initialize: () => {
    const flocks = storageHelpers.getString<Flock[]>(STORAGE_KEYS.FLOCKS) || [];
    const dailyLogs =
      storageHelpers.getString<DailyLog[]>(STORAGE_KEYS.DAILY_LOGS) || [];
    const expenses =
      storageHelpers.getString<Expense[]>(STORAGE_KEYS.EXPENSES) || [];
    const sales = storageHelpers.getString<Sale[]>(STORAGE_KEYS.SALES) || [];
    const settings =
      storageHelpers.getString<Settings>(STORAGE_KEYS.SETTINGS) ||
      defaultSettings;
    const premium =
      storageHelpers.getString<PremiumStatus>(STORAGE_KEYS.PREMIUM) ||
      defaultPremium;

    set({ flocks, dailyLogs, expenses, sales, settings, premium });
  },
}));
