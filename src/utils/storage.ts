import { Transaction, BudgetConfig, AuthUser } from "../types";
import { INITIAL_TRANSACTIONS, DEFAULT_BUDGET_CONFIG } from "./mockData";

const TRANSACTIONS_KEY = "spendwise_transactions_v1";
const BUDGET_KEY = "spendwise_budget_v1";
const AUTH_KEY = "spendwise_auth_user_v1";


export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_TRANSACTIONS;
  } catch (err) {
    console.error("Failed to load transactions from localStorage", err);
    return INITIAL_TRANSACTIONS;
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (err) {
    console.error("Failed to save transactions", err);
  }
}

export function loadBudgetConfig(): BudgetConfig {
  try {
    const raw = localStorage.getItem(BUDGET_KEY);
    if (!raw) {
      localStorage.setItem(BUDGET_KEY, JSON.stringify(DEFAULT_BUDGET_CONFIG));
      return DEFAULT_BUDGET_CONFIG;
    }
    return { ...DEFAULT_BUDGET_CONFIG, ...JSON.parse(raw) };
  } catch (err) {
    console.error("Failed to load budget config", err);
    return DEFAULT_BUDGET_CONFIG;
  }
}

export function saveBudgetConfig(config: BudgetConfig): void {
  try {
    localStorage.setItem(BUDGET_KEY, JSON.stringify(config));
  } catch (err) {
    console.error("Failed to save budget config", err);
  }
}

export function formatCurrency(amount: number, currency: string = "$"): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${isNegative ? "-" : ""}${currency}${formatted}`;
}

export function exportBackupJSON(transactions: Transaction[], budget: BudgetConfig) {
  const data = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    budget,
    transactions,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ExpenseTracker_Backup_${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function loadAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load auth user from localStorage", err);
    return null;
  }
}

export function saveAuthUser(user: AuthUser | null): void {
  try {
    if (!user) {
      localStorage.removeItem(AUTH_KEY);
    } else {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    }
  } catch (err) {
    console.error("Failed to save auth user to localStorage", err);
  }
}

export function clearAuthUser(): void {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch (err) {
    console.error("Failed to clear auth user", err);
  }
}

