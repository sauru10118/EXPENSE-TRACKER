import { Transaction, BudgetConfig } from "../types";
import { loadTransactions, saveTransactions, loadBudgetConfig, saveBudgetConfig } from "./storage";

export interface DbStatus {
  connected: boolean;
  configured: boolean;
  provider: string;
  error: string | null;
}

/**
 * Check connectivity to the Aiven online database.
 */
export async function checkDbStatus(): Promise<DbStatus> {
  try {
    const res = await fetch("/api/db/status");
    if (!res.ok) throw new Error("Status check failed");
    return await res.json();
  } catch {
    return {
      connected: false,
      configured: false,
      provider: "Aiven for PostgreSQL",
      error: "Unable to reach server",
    };
  }
}

/**
 * Fetch transactions from Aiven DB.
 * If Aiven DB is connected but empty, auto-syncs local/mock transactions into Aiven!
 */
export async function syncAndLoadTransactions(): Promise<{
  transactions: Transaction[];
  fromAiven: boolean;
}> {
  try {
    const res = await fetch("/api/transactions");
    if (!res.ok) throw new Error("Failed to fetch transactions");
    const data = await res.json();

    if (data.connected && Array.isArray(data.data)) {
      if (data.data.length > 0) {
        // Cache in local storage as well for offline resilience
        saveTransactions(data.data);
        return { transactions: data.data, fromAiven: true };
      } else {
        // Aiven is connected but empty -> Seed initial transactions to Aiven!
        const local = loadTransactions();
        if (local.length > 0) {
          fetch("/api/transactions/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactions: local }),
          }).catch(console.error);
        }
        return { transactions: local, fromAiven: true };
      }
    }
  } catch (err) {
    console.warn("Could not load from Aiven DB, using local storage:", err);
  }

  return { transactions: loadTransactions(), fromAiven: false };
}

/**
 * Save transaction to Aiven database and local storage.
 */
export async function persistTransaction(tx: Transaction): Promise<void> {
  // Always update local cache instantly
  const current = loadTransactions();
  const updated = [tx, ...current.filter((t) => t.id !== tx.id)];
  saveTransactions(updated);

  // Sync to Aiven
  try {
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tx),
    });
  } catch (err) {
    console.error("Failed to persist transaction to Aiven DB:", err);
  }
}

/**
 * Delete transaction from Aiven database and local storage.
 */
export async function removeTransaction(id: string): Promise<void> {
  const current = loadTransactions();
  saveTransactions(current.filter((t) => t.id !== id));

  try {
    await fetch(`/api/transactions/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.error("Failed to delete transaction from Aiven DB:", err);
  }
}

/**
 * Update transaction in Aiven database and local storage.
 */
export async function updateTransactionInDb(tx: Transaction): Promise<void> {
  const current = loadTransactions();
  saveTransactions(current.map((t) => (t.id === tx.id ? tx : t)));

  try {
    await fetch(`/api/transactions/${encodeURIComponent(tx.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tx),
    });
  } catch (err) {
    console.error("Failed to update transaction in Aiven DB:", err);
  }
}

/**
 * Sync budget config with Aiven DB.
 */
export async function syncAndLoadBudget(): Promise<BudgetConfig> {
  try {
    const res = await fetch("/api/budget");
    if (res.ok) {
      const data = await res.json();
      if (data.connected && data.data) {
        saveBudgetConfig(data.data);
        return data.data;
      }
    }
  } catch (err) {
    console.warn("Could not load budget from Aiven DB:", err);
  }
  return loadBudgetConfig();
}

export async function persistBudget(config: BudgetConfig): Promise<void> {
  saveBudgetConfig(config);
  try {
    await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
  } catch (err) {
    console.error("Failed to save budget to Aiven DB:", err);
  }
}
