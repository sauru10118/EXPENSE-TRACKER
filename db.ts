import pg from "pg";
import { Transaction, BudgetConfig } from "./src/types";

const { Pool } = pg;

// Aiven PostgreSQL Database Connection Pool
let pool: pg.Pool | null = null;
let isConnected = false;
let dbError: string | null = null;

export function getDbPool(): pg.Pool | null {
  if (pool) return pool;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log("ℹ️ [Aiven DB] DATABASE_URL is not set. Local in-memory / browser fallback active.");
    return null;
  }

  try {
    // Prevent Node from rejecting Aiven's self-signed CA certificate in certificate chain
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    // Clean URL: strip quotes, whitespace, and sslmode parameter to prevent strict CA rejection
    const cleanConnectionString = databaseUrl
      .trim()
      .replace(/^["']+|["']+$/g, "")
      .replace(/([?&])sslmode=[^&]*(&|$)/gi, "$1")
      .replace(/[?&]$/, "");

    pool = new Pool({
      connectionString: cleanConnectionString,
      // Aiven cloud databases enforce TLS/SSL
      ssl: {
        rejectUnauthorized: false,
      },
      connectionTimeoutMillis: 10000,
      max: 10,
    });

    pool.on("error", (err) => {
      console.error("⚠️ [Aiven DB] Unexpected error on idle client:", err.message);
      isConnected = false;
      dbError = err.message;
    });

    return pool;
  } catch (err: any) {
    console.error("⚠️ [Aiven DB] Failed to create database pool:", err.message);
    dbError = err.message;
    return null;
  }
}

/**
 * Initializes the database schema on Aiven PostgreSQL.
 * Automatically runs CREATE TABLE IF NOT EXISTS for transactions and budget.
 */
export async function initDatabase(): Promise<boolean> {
  const p = getDbPool();
  if (!p) {
    isConnected = false;
    return false;
  }

  try {
    const client = await p.connect();
    try {
      // Test basic connectivity
      const testRes = await client.query("SELECT NOW() as current_time");
      console.log(" Connected to Aiven Cloud Database at:", testRes.rows[0].current_time);

      // 1. Transactions Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id VARCHAR(120) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          location VARCHAR(255) DEFAULT 'Unspecified',
          amount NUMERIC(12, 2) NOT NULL,
          category VARCHAR(100) NOT NULL,
          type VARCHAR(20) NOT NULL DEFAULT 'expense',
          date VARCHAR(30) NOT NULL,
          payment_method VARCHAR(100) NOT NULL,
          notes TEXT DEFAULT '',
          created_at VARCHAR(50) NOT NULL
        );
      `);

      // 2. Budget Configuration Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS budget_config (
          id VARCHAR(50) PRIMARY KEY,
          monthly_budget NUMERIC(12, 2) NOT NULL DEFAULT 3500.00,
          currency VARCHAR(10) NOT NULL DEFAULT '$',
          category_budgets JSONB NOT NULL DEFAULT '{}'::jsonb,
          updated_at VARCHAR(50) NOT NULL
        );
      `);

      // Create index on date and category for fast querying
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
        CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
      `);

      isConnected = true;
      dbError = null;
      console.log(" [Aiven DB] Schema verified and tables initialized successfully.");
      return true;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("❌ [Aiven DB] Connection / Schema initialization failed:", err.message);
    isConnected = false;
    dbError = err.message;
    return false;
  }
}

export function getDbStatus() {
  return {
    connected: isConnected,
    configured: Boolean(process.env.DATABASE_URL),
    provider: "Aiven for PostgreSQL",
    error: dbError,
  };
}

// ─────────────────────────────────────────────────────────────
// Transaction Queries
// ─────────────────────────────────────────────────────────────

export async function dbGetTransactions(): Promise<Transaction[]> {
  const p = getDbPool();
  if (!p || !isConnected) return [];

  const res = await p.query(`
    SELECT 
      id,
      title,
      location,
      amount::float as amount,
      category,
      type,
      date,
      payment_method as "paymentMethod",
      notes,
      created_at as "createdAt"
    FROM transactions
    ORDER BY date DESC, created_at DESC;
  `);

  return res.rows;
}

export async function dbInsertTransaction(tx: Transaction): Promise<Transaction> {
  const p = getDbPool();
  if (!p || !isConnected) throw new Error("Database not connected");

  const query = `
    INSERT INTO transactions (
      id, title, location, amount, category, type, date, payment_method, notes, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      location = EXCLUDED.location,
      amount = EXCLUDED.amount,
      category = EXCLUDED.category,
      type = EXCLUDED.type,
      date = EXCLUDED.date,
      payment_method = EXCLUDED.payment_method,
      notes = EXCLUDED.notes
    RETURNING 
      id, title, location, amount::float as amount, category, type, date, 
      payment_method as "paymentMethod", notes, created_at as "createdAt";
  `;

  const values = [
    tx.id,
    tx.title,
    tx.location || "Unspecified",
    tx.amount,
    tx.category,
    tx.type,
    tx.date,
    tx.paymentMethod,
    tx.notes || "",
    tx.createdAt || new Date().toISOString(),
  ];

  const res = await p.query(query, values);
  return res.rows[0];
}

export async function dbUpdateTransaction(id: string, tx: Partial<Transaction>): Promise<Transaction | null> {
  const p = getDbPool();
  if (!p || !isConnected) throw new Error("Database not connected");

  const query = `
    UPDATE transactions SET
      title = COALESCE($2, title),
      location = COALESCE($3, location),
      amount = COALESCE($4, amount),
      category = COALESCE($5, category),
      type = COALESCE($6, type),
      date = COALESCE($7, date),
      payment_method = COALESCE($8, payment_method),
      notes = COALESCE($9, notes)
    WHERE id = $1
    RETURNING 
      id, title, location, amount::float as amount, category, type, date, 
      payment_method as "paymentMethod", notes, created_at as "createdAt";
  `;

  const values = [
    id,
    tx.title,
    tx.location,
    tx.amount,
    tx.category,
    tx.type,
    tx.date,
    tx.paymentMethod,
    tx.notes,
  ];

  const res = await p.query(query, values);
  return res.rows[0] || null;
}

export async function dbDeleteTransaction(id: string): Promise<boolean> {
  const p = getDbPool();
  if (!p || !isConnected) throw new Error("Database not connected");

  const res = await p.query("DELETE FROM transactions WHERE id = $1 RETURNING id;", [id]);
  return (res.rowCount ?? 0) > 0;
}

export async function dbBulkSyncTransactions(transactions: Transaction[]): Promise<number> {
  const p = getDbPool();
  if (!p || !isConnected) throw new Error("Database not connected");

  let synced = 0;
  for (const tx of transactions) {
    await dbInsertTransaction(tx);
    synced++;
  }
  return synced;
}

// ─────────────────────────────────────────────────────────────
// Budget Config Queries
// ─────────────────────────────────────────────────────────────

export async function dbGetBudgetConfig(): Promise<BudgetConfig | null> {
  const p = getDbPool();
  if (!p || !isConnected) return null;

  const res = await p.query("SELECT monthly_budget, currency, category_budgets FROM budget_config WHERE id = 'default' LIMIT 1;");
  if (res.rows.length === 0) return null;

  const row = res.rows[0];
  return {
    monthlyBudget: Number(row.monthly_budget),
    currency: row.currency || "$",
    categoryBudgets: row.category_budgets || {},
  };
}

export async function dbSaveBudgetConfig(config: BudgetConfig): Promise<BudgetConfig> {
  const p = getDbPool();
  if (!p || !isConnected) throw new Error("Database not connected");

  const query = `
    INSERT INTO budget_config (id, monthly_budget, currency, category_budgets, updated_at)
    VALUES ('default', $1, $2, $3, $4)
    ON CONFLICT (id) DO UPDATE SET
      monthly_budget = EXCLUDED.monthly_budget,
      currency = EXCLUDED.currency,
      category_budgets = EXCLUDED.category_budgets,
      updated_at = EXCLUDED.updated_at
    RETURNING monthly_budget, currency, category_budgets;
  `;

  const values = [
    config.monthlyBudget,
    config.currency,
    JSON.stringify(config.categoryBudgets || {}),
    new Date().toISOString(),
  ];

  const res = await p.query(query, values);
  const row = res.rows[0];
  return {
    monthlyBudget: Number(row.monthly_budget),
    currency: row.currency,
    categoryBudgets: row.category_budgets,
  };
}
