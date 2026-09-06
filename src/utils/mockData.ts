import { Transaction, BudgetConfig } from "../types";

export const DEFAULT_BUDGET_CONFIG: BudgetConfig = {
  monthlyBudget: 3800,
  currency: "$",
  categoryBudgets: {
    Rent: 1650,
    Groceries: 550,
    Travel: 400,
    Shopping: 300,
    Subscriptions: 90,
    "Food & Dining": 350,
    Utilities: 220,
    Transportation: 180,
    Entertainment: 120,
  },
};

// Start with clean, empty transactions
export const INITIAL_TRANSACTIONS: Transaction[] = [];
