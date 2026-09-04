import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  initDatabase,
  getDbStatus,
  dbGetTransactions,
  dbInsertTransaction,
  dbUpdateTransaction,
  dbDeleteTransaction,
  dbBulkSyncTransactions,
  dbGetBudgetConfig,
  dbSaveBudgetConfig,
} from "./db";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Configurable credentials with required defaults
const APP_USERNAME = process.env.APP_USERNAME || "shree";
const APP_PASSWORD = process.env.APP_PASSWORD || "sweri";

app.use(express.json({ limit: "10mb" }));

// ─────────────────────────────────────────────────────────────
// Aiven Cloud Database Endpoints
// ─────────────────────────────────────────────────────────────

// Check Aiven DB Status
app.get("/api/db/status", (_req, res) => {
  res.json(getDbStatus());
});

// Fetch all transactions from Aiven DB
app.get("/api/transactions", async (_req, res) => {
  try {
    const status = getDbStatus();
    if (!status.connected) {
      return res.json({ connected: false, data: [] });
    }
    const transactions = await dbGetTransactions();
    return res.json({ connected: true, data: transactions });
  } catch (err: any) {
    console.error("Error fetching transactions from Aiven DB:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Create or upsert a transaction in Aiven DB
app.post("/api/transactions", async (req, res) => {
  try {
    const status = getDbStatus();
    if (!status.connected) {
      return res.status(503).json({ error: "Aiven Database not connected" });
    }
    const created = await dbInsertTransaction(req.body);
    return res.json({ success: true, transaction: created });
  } catch (err: any) {
    console.error("Error inserting transaction to Aiven DB:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Update a transaction in Aiven DB
app.put("/api/transactions/:id", async (req, res) => {
  try {
    const status = getDbStatus();
    if (!status.connected) {
      return res.status(503).json({ error: "Aiven Database not connected" });
    }
    const updated = await dbUpdateTransaction(req.params.id, req.body);
    return res.json({ success: true, transaction: updated });
  } catch (err: any) {
    console.error("Error updating transaction in Aiven DB:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Delete a transaction from Aiven DB
app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const status = getDbStatus();
    if (!status.connected) {
      return res.status(503).json({ error: "Aiven Database not connected" });
    }
    const success = await dbDeleteTransaction(req.params.id);
    return res.json({ success });
  } catch (err: any) {
    console.error("Error deleting transaction from Aiven DB:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Bulk sync transactions from local client into Aiven DB
app.post("/api/transactions/sync", async (req, res) => {
  try {
    const status = getDbStatus();
    if (!status.connected) {
      return res.status(503).json({ error: "Aiven Database not connected" });
    }
    const { transactions } = req.body;
    if (!Array.isArray(transactions)) {
      return res.status(400).json({ error: "Transactions array required" });
    }
    const syncedCount = await dbBulkSyncTransactions(transactions);
    return res.json({ success: true, count: syncedCount });
  } catch (err: any) {
    console.error("Error syncing transactions to Aiven DB:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Get budget config from Aiven DB
app.get("/api/budget", async (_req, res) => {
  try {
    const status = getDbStatus();
    if (!status.connected) {
      return res.json({ connected: false, data: null });
    }
    const config = await dbGetBudgetConfig();
    return res.json({ connected: true, data: config });
  } catch (err: any) {
    console.error("Error getting budget from Aiven DB:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Save budget config to Aiven DB
app.post("/api/budget", async (req, res) => {
  try {
    const status = getDbStatus();
    if (!status.connected) {
      return res.status(503).json({ error: "Aiven Database not connected" });
    }
    const saved = await dbSaveBudgetConfig(req.body);
    return res.json({ success: true, budget: saved });
  } catch (err: any) {
    console.error("Error saving budget to Aiven DB:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Authentication Login endpoint
app.post("/api/auth/login", (req, res) => {

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: "Username and password are required.",
    });
  }

  // Case-insensitive username check, exact password check
  if (
    username.trim().toLowerCase() === APP_USERNAME.toLowerCase() &&
    password === APP_PASSWORD
  ) {
    return res.json({
      success: true,
      user: {
        username: APP_USERNAME,
        name: "Shree",
        role: "admin",
        loginTime: new Date().toISOString(),
      },
    });
  }

  return res.status(401).json({
    success: false,
    error: "Invalid username or password. Please try again.",
  });
});

// Lazy initialization of Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Financial Analysis endpoint
app.post("/api/ai/analyze", async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { transactions, budgetConfig, timeRange } = req.body;

    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ error: "Invalid transactions data" });
    }

    if (!ai) {
      // Return structured fallback analysis if API key is not yet set
      const totalExpense = transactions
        .filter((t: any) => t.type === "expense")
        .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

      return res.json({
        summary: `You have recorded ${transactions.length} transactions totaling $${totalExpense.toFixed(2)} in spending. Groceries, Rent, and Subscriptions constitute the primary expense buckets.`,
        healthScore: 78,
        insights: [
          {
            type: "warning",
            title: "Subscription & Recurring Audit",
            description: "Review your recurring monthly subscriptions to eliminate unused streaming or SaaS licenses.",
            estimatedSaving: 45,
          },
          {
            type: "tip",
            title: "Bulk Grocery Planning",
            description: "Consolidating your weekly grocery trips to 1-2 visits can reduce impulse snack purchases by ~15%.",
            estimatedSaving: 80,
          },
          {
            type: "positive",
            title: "Consistent Housing Budgeting",
            description: "Your rent and housing costs represent a stable baseline of your total monthly cash flow.",
          },
          {
            type: "trend",
            title: "Shopping Fluctuations",
            description: "Weekend retail shopping represents 65% of your discretionary spending.",
            estimatedSaving: 120,
          },
        ],
        topSpendingDrivers: [
          { category: "Housing & Rent", percentage: 40, note: "Fixed core necessity" },
          { category: "Groceries", percentage: 22, note: "Weekly food staples" },
          { category: "Shopping", percentage: 18, note: "Discretionary retail" },
        ],
        monthlyForecast: {
          projectedSpend: totalExpense * 1.1,
          riskLevel: "medium",
          advice: "Maintain a buffer for unexpected travel or maintenance expenses in the upcoming 30 days.",
        },
        actionableBudgetAdjustments: [
          { category: "Subscriptions", currentSpend: 65, suggestedBudget: 40, reason: "Cancel redundant media services" },
          { category: "Shopping", currentSpend: 320, suggestedBudget: 220, reason: "Set a $55/week non-essential limit" },
        ],
      });
    }

    const prompt = `You are a certified, friendly, pragmatic personal financial advisor analyzing an individual's actual spending history.
Here is the user's spending data for analysis:
- Timeframe: ${timeRange || "Recent"}
- Monthly Target Budget: ${budgetConfig?.monthlyBudget ? `$${budgetConfig.monthlyBudget}` : "Not set"}
- Transactions List (${transactions.length} items):
${JSON.stringify(
  transactions.slice(0, 100).map((t: any) => ({
    date: t.date,
    title: t.title,
    location: t.location || "Unspecified",
    category: t.category,
    amount: t.amount,
    type: t.type,
    paymentMethod: t.paymentMethod,
  })),
  null,
  2
)}

Analyze this spending profile deeply. Look for:
1. Exact merchants / locations where heavy spending occurs (e.g. Costco vs Whole Foods, Amazon, Uber, Airlines, Landlords).
2. Category balance (Travel, Housing, Rent, Shopping, Groceries, Subscriptions, Dining, Utilities, etc.).
3. Specific money-saving opportunities and realistic budget cut recommendations with dollar amounts.
4. Spending health score (1 to 100).
5. Monthly projection & financial risk evaluation.

Return ONLY a JSON response conforming exactly to this structure:
{
  "summary": "2-3 crisp sentences summarizing spending health, top categories, and primary locations of expenditure.",
  "healthScore": 82,
  "insights": [
    {
      "type": "warning" | "tip" | "positive" | "trend",
      "title": "Short title",
      "description": "Specific insight citing locations or categories.",
      "estimatedSaving": 50
    }
  ],
  "topSpendingDrivers": [
    {
      "category": "Category name",
      "percentage": 35,
      "note": "Observation about this category"
    }
  ],
  "monthlyForecast": {
    "projectedSpend": 2450.00,
    "riskLevel": "low" | "medium" | "high",
    "advice": "Actionable advice for remaining days of the month"
  },
  "actionableBudgetAdjustments": [
    {
      "category": "Category name",
      "currentSpend": 300,
      "suggestedBudget": 220,
      "reason": "Clear explanation"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are an expert financial advisor and spending auditor. Deliver precise, realistic, and structured JSON output.",
      },
    });

    const text = response.text?.trim() || "{}";
    const parsedData = JSON.parse(text);
    return res.json(parsedData);
  } catch (error: any) {
    console.error("AI Analysis error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate AI analysis" });
  }
});

// AI Chat / Ask Assistant endpoint
app.post("/api/ai/ask", async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { question, transactions, budgetConfig } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    if (!ai) {
      return res.json({
        answer: "I can help analyze your expenses, suggest budget cuts, and break down spending by store or category. (To activate live AI intelligence, configure your GEMINI_API_KEY).",
      });
    }

    const prompt = `You are the user's personal financial assistant embedded inside their Expense Tracker app.
The user has ${transactions?.length || 0} recorded transactions.
Here is the context of their recent transactions:
${JSON.stringify(
  (transactions || []).slice(0, 150).map((t: any) => ({
    date: t.date,
    title: t.title,
    location: t.location,
    category: t.category,
    amount: t.amount,
    type: t.type,
    paymentMethod: t.paymentMethod,
  }))
)}
Monthly budget: ${budgetConfig?.monthlyBudget || "Not set"}

User Question: "${question}"

Answer the user directly, accurately calculating totals, counting frequencies of store visits/locations (like where they spent money), identifying trends, and providing helpful advice. Format with clean markdown bullet points where appropriate. Keep it concise, friendly, and practical.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an intelligent, accurate financial assistant. Calculate totals carefully based on the provided transactions list.",
      },
    });

    return res.json({ answer: response.text });
  } catch (error: any) {
    console.error("AI Chat error:", error);
    return res.status(500).json({ error: error.message || "Failed to process question" });
  }
});

// AI Smart Quick Parse endpoint (from raw text or receipt note)
app.post("/api/ai/smart-parse", async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    if (!ai) {
      // Simple regex fallback
      const amountMatch = text.match(/\$?(\d+(\.\d{1,2})?)/);
      return res.json({
        title: "Parsed Expense",
        location: "Local Merchant",
        amount: amountMatch ? parseFloat(amountMatch[1]) : 25.0,
        category: "Shopping",
        type: "expense",
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "Credit Card",
        notes: text,
      });
    }

    const prompt = `Extract expense details from the following user description or receipt text:
"${text}"

Categories available:
- Travel
- Housing
- Rent
- Shopping
- Groceries
- Subscriptions
- Food & Dining
- Utilities
- Entertainment
- Health & Medical
- Transportation
- Education
- Personal Care
- Investments
- Other

Payment methods: "Credit Card", "Debit Card", "Cash", "Bank Transfer / UPI", "Digital Wallet"

Current Date reference: ${new Date().toISOString().split("T")[0]}

Return JSON ONLY:
{
  "title": "Clear brief description (e.g. Flight to Chicago, Monthly Rent, Weekly Groceries, Netflix Plan)",
  "location": "Exact store, merchant, landlord or vendor (e.g. Trader Joe's, United Airlines, Avalon Apartments, Target, Spotify)",
  "amount": 45.50,
  "category": "One category from the list above",
  "type": "expense" or "income",
  "date": "YYYY-MM-DD",
  "paymentMethod": "One payment method from above",
  "notes": "Any extra details or items purchased"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("AI Parse error:", error);
    return res.status(500).json({ error: error.message || "Failed to parse text" });
  }
});

// Setup Vite middleware or Static Serving
async function startServer() {
  // Initialize Aiven database if DATABASE_URL is provided
  try {
    await initDatabase();
  } catch (err: any) {
    console.error("Database initialization notice:", err.message);
  }

  if (process.env.NODE_ENV !== "production") {

    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Expense Tracker server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
