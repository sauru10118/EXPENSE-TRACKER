import * as XLSX from "xlsx";
import { Transaction, BudgetConfig } from "../types";

export function exportTransactionsToExcel(
  transactions: Transaction[],
  budgetConfig: BudgetConfig,
  customFileName?: string
) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet 1: Detailed Transactions List
  const transactionsData = transactions.map((t, idx) => ({
    "No.": idx + 1,
    "Date": t.date,
    "Description": t.title,
    "Where Spent / Location": t.location || "N/A",
    "Category": t.category,
    "Type": t.type.toUpperCase(),
    "Amount ($)": Number(t.amount.toFixed(2)),
    "Payment Method": t.paymentMethod,
    "Recurring": t.recurring ? "Yes" : "No",
    "Notes": t.notes || "",
  }));

  const wsTransactions = XLSX.utils.json_to_sheet(transactionsData);

  // Set column widths for readable formatting
  wsTransactions["!cols"] = [
    { wch: 6 },  // No.
    { wch: 12 }, // Date
    { wch: 32 }, // Description
    { wch: 28 }, // Where Spent / Location
    { wch: 18 }, // Category
    { wch: 10 }, // Type
    { wch: 14 }, // Amount
    { wch: 22 }, // Payment Method
    { wch: 12 }, // Recurring
    { wch: 35 }, // Notes
  ];

  XLSX.utils.book_append_sheet(wb, wsTransactions, "Transactions Log");

  // 2. Sheet 2: Category Spending Breakdown
  const categoryMap: Record<string, { total: number; count: number; locations: Set<string> }> = {};
  let totalExpenses = 0;

  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      totalExpenses += t.amount;
      if (!categoryMap[t.category]) {
        categoryMap[t.category] = { total: 0, count: 0, locations: new Set() };
      }
      categoryMap[t.category].total += t.amount;
      categoryMap[t.category].count += 1;
      if (t.location) categoryMap[t.category].locations.add(t.location);
    });

  const categoryBreakdown = Object.entries(categoryMap)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([cat, data]) => {
      const budget = budgetConfig.categoryBudgets[cat as any] || 0;
      const pctOfTotal = totalExpenses > 0 ? ((data.total / totalExpenses) * 100).toFixed(1) + "%" : "0%";
      const budgetVariance = budget > 0 ? (budget - data.total).toFixed(2) : "No Target";
      return {
        "Expense Category": cat,
        "Total Spent ($)": Number(data.total.toFixed(2)),
        "% of Total Spending": pctOfTotal,
        "Transaction Count": data.count,
        "Category Target Budget ($)": budget > 0 ? budget : "N/A",
        "Budget Remaining / (Over)": budgetVariance,
        "Primary Merchants / Places": Array.from(data.locations).slice(0, 4).join(", "),
      };
    });

  const wsCategories = XLSX.utils.json_to_sheet(categoryBreakdown);
  wsCategories["!cols"] = [
    { wch: 20 }, // Category
    { wch: 16 }, // Total Spent
    { wch: 20 }, // % of Total
    { wch: 18 }, // Count
    { wch: 24 }, // Target Budget
    { wch: 24 }, // Variance
    { wch: 45 }, // Places
  ];
  XLSX.utils.book_append_sheet(wb, wsCategories, "Category Breakdown");

  // 3. Sheet 3: Monthly & Location Summary
  const locationMap: Record<string, { total: number; count: number; category: string }> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const loc = t.location || "Unspecified";
      if (!locationMap[loc]) {
        locationMap[loc] = { total: 0, count: 0, category: t.category };
      }
      locationMap[loc].total += t.amount;
      locationMap[loc].count += 1;
    });

  const topLocations = Object.entries(locationMap)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([loc, data]) => ({
      "Merchant / Where Spent": loc,
      "Category": data.category,
      "Total Amount ($)": Number(data.total.toFixed(2)),
      "Visits / Transactions": data.count,
      "Avg Spend Per Visit ($)": Number((data.total / data.count).toFixed(2)),
    }));

  const wsLocations = XLSX.utils.json_to_sheet(topLocations);
  wsLocations["!cols"] = [
    { wch: 32 },
    { wch: 18 },
    { wch: 18 },
    { wch: 22 },
    { wch: 24 },
  ];
  XLSX.utils.book_append_sheet(wb, wsLocations, "Merchant & Location Analytics");

  // Trigger download
  const dateStamp = new Date().toISOString().split("T")[0];
  const filename = customFileName || `Expense_Report_${dateStamp}.xlsx`;
  XLSX.writeFile(wb, filename);
}
