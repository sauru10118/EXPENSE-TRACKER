export type ExpenseCategory =
  | "Travel"
  | "Housing"
  | "Rent"
  | "Shopping"
  | "Groceries"
  | "Subscriptions"
  | "Food & Dining"
  | "Utilities"
  | "Entertainment"
  | "Health & Medical"
  | "Transportation"
  | "Education"
  | "Personal Care"
  | "Investments"
  | "Salary / Income"
  | "Other";

export type PaymentMethod =
  | "Credit Card"
  | "Debit Card"
  | "Cash"
  | "Bank Transfer / UPI"
  | "Digital Wallet (Apple/Google Pay)"
  | "Other";

export type TransactionType = "expense" | "income";

export interface Transaction {
  id: string;
  title: string;
  location: string; // Where I spent it (merchant, store, address, vendor)
  amount: number;
  category: ExpenseCategory;
  type: TransactionType;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  tags?: string[];
  recurring?: boolean;
  createdAt: string;
}

export interface BudgetConfig {
  monthlyBudget: number;
  currency: string;
  categoryBudgets: Partial<Record<ExpenseCategory, number>>;
}

export interface AIInsight {
  type: "warning" | "tip" | "positive" | "trend";
  title: string;
  description: string;
  estimatedSaving?: number;
}

export interface AISpendingDriver {
  category: string;
  percentage: number;
  note: string;
}

export interface AIBudgetAdjustment {
  category: string;
  currentSpend: number;
  suggestedBudget: number;
  reason: string;
}

export interface AIAnalysisResult {
  summary: string;
  healthScore: number;
  insights: AIInsight[];
  topSpendingDrivers: AISpendingDriver[];
  monthlyForecast: {
    projectedSpend: number;
    riskLevel: "low" | "medium" | "high";
    advice: string;
  };
  actionableBudgetAdjustments: AIBudgetAdjustment[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface AuthUser {
  username: string;
  name: string;
  role?: string;
  loginTime?: string;
}

