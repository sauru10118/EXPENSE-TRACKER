import React, { useState, useMemo } from "react";
import {
  TrendingDown,
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  Plus,
  Calendar,
  Store,
  Wallet,
  AlertCircle,
  FileSpreadsheet,
  ChevronRight,
  ArrowDownLeft,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Transaction, BudgetConfig, ExpenseCategory } from "../types";
import { CATEGORIES, getCategoryMeta } from "../utils/categories";
import { CategoryIcon } from "./CategoryIcon";
import { formatCurrency } from "../utils/storage";
import { exportTransactionsToExcel } from "../utils/excelExport";

interface DashboardViewProps {
  transactions: Transaction[];
  budgetConfig: BudgetConfig;
  onNavigateTab: (tab: "dashboard" | "transactions" | "add" | "ai-analytics") => void;
  openAddModal: () => void;
  openBudgetModal: () => void;
  onDeleteTransaction: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  budgetConfig,
  onNavigateTab,
  openAddModal,
  openBudgetModal,
  onDeleteTransaction,
}) => {
  const [timeFilter, setTimeFilter] = useState<"all" | "this-month" | "last-30">("this-month");
  const [chartViewMode, setChartViewMode] = useState<"area" | "bar">("area");
  const [searchQuery, setSearchQuery] = useState("");

  const currency = budgetConfig.currency || "$";

  // Filter transactions by selected timeframe
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions.filter((t) => {
      if (timeFilter === "all") return true;
      const tDate = new Date(t.date);
      if (timeFilter === "this-month") {
        return tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth;
      }
      if (timeFilter === "last-30") {
        const diffDays = (now.getTime() - tDate.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 30;
      }
      return true;
    });
  }, [transactions, timeFilter]);

  // Aggregate metrics
  const { totalExpense, totalIncome, categoryTotals, locationTotals, dailyData } = useMemo(() => {
    let expenseSum = 0;
    let incomeSum = 0;
    const catMap: Partial<Record<ExpenseCategory, number>> = {};
    const locMap: Record<string, { total: number; count: number; category: ExpenseCategory }> = {};
    const dateMap: Record<string, { date: string; expense: number; income: number }> = {};

    filteredTransactions.forEach((t) => {
      if (t.type === "expense") {
        expenseSum += t.amount;
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;

        const loc = t.location || "Unspecified Place";
        if (!locMap[loc]) {
          locMap[loc] = { total: 0, count: 0, category: t.category };
        }
        locMap[loc].total += t.amount;
        locMap[loc].count += 1;
      } else {
        incomeSum += t.amount;
      }

      // Daily trend aggregation
      if (!dateMap[t.date]) {
        dateMap[t.date] = { date: t.date, expense: 0, income: 0 };
      }
      if (t.type === "expense") {
        dateMap[t.date].expense += t.amount;
      } else {
        dateMap[t.date].income += t.amount;
      }
    });

    const sortedDates = Object.values(dateMap).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      totalExpense: expenseSum,
      totalIncome: incomeSum,
      categoryTotals: catMap,
      locationTotals: locMap,
      dailyData: sortedDates,
    };
  }, [filteredTransactions]);

  const netBalance = totalIncome - totalExpense;
  const monthlyBudget = budgetConfig.monthlyBudget || 3000;
  const budgetPercentage = Math.min(100, Math.round((totalExpense / monthlyBudget) * 100));
  const remainingBudget = monthlyBudget - totalExpense;
  const daysInMonth = 31;
  const dailyAverage = totalExpense / (filteredTransactions.length > 0 ? Math.max(1, new Set(filteredTransactions.map(t => t.date)).size) : 1);

  // Prepare Pie Chart Data
  const pieChartData = useMemo(() => {
    return (Object.entries(categoryTotals) as [ExpenseCategory, number][])
      .map(([cat, amount]) => {
        const numAmount = Number(amount) || 0;
        const meta = getCategoryMeta(cat);
        return {
          name: cat,
          value: Number(numAmount.toFixed(2)),
          color: meta.color,
          percentage: totalExpense > 0 ? Math.round((numAmount / totalExpense) * 100) : 0,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [categoryTotals, totalExpense]);

  // Top Category
  const topCategory = pieChartData[0] || null;

  // Prepare Top Merchants / Locations Data (Where I Spend)
  const topLocationsData = useMemo(() => {
    return (Object.entries(locationTotals) as [string, { total: number; count: number; category: ExpenseCategory }][])
      .map(([loc, data]) => ({
        location: loc,
        total: Number(data.total.toFixed(2)),
        count: data.count,
        category: data.category,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [locationTotals]);

  // Filtered recent transactions for list
  const recentTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.paymentMethod.toLowerCase().includes(q)
        );
      })
      .slice(0, 7);
  }, [transactions, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Welcome & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor expenses, exact store visits, and AI spending recommendations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Filter Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              id="filter-this-month"
              onClick={() => setTimeFilter("this-month")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeFilter === "this-month"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              This Month
            </button>
            <button
              id="filter-last-30"
              onClick={() => setTimeFilter("last-30")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeFilter === "last-30"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Last 30 Days
            </button>
            <button
              id="filter-all-time"
              onClick={() => setTimeFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeFilter === "all"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Time
            </button>
          </div>

          {/* Export to Excel */}
          <button
            id="btn-dashboard-export-excel"
            onClick={() => exportTransactionsToExcel(transactions, budgetConfig)}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel (.xlsx)</span>
          </button>

          {/* Quick Add */}
          <button
            id="btn-dashboard-add-expense"
            onClick={openAddModal}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Spent */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Expenses</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(totalExpense, currency)}
            </div>
            <div className="flex items-center space-x-1.5 mt-1">
              <span className="text-[11px] text-slate-500 font-medium">
                {filteredTransactions.filter((t) => t.type === "expense").length} expense records
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Monthly Budget Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Budget Status</span>
            <button
              onClick={openBudgetModal}
              className="text-[11px] text-emerald-600 hover:underline font-semibold cursor-pointer"
            >
              Edit Target
            </button>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900">
                {formatCurrency(remainingBudget, currency)}
              </span>
              <span className="text-xs font-bold text-slate-500">
                {budgetPercentage}% used
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  budgetPercentage > 90
                    ? "bg-rose-500"
                    : budgetPercentage > 75
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, budgetPercentage)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Target: {formatCurrency(monthlyBudget, currency)} / month
            </p>
          </div>
        </div>

        {/* Card 3: Total Income & Net Savings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Cash Flow</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-extrabold ${netBalance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {formatCurrency(netBalance, currency)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Income: {formatCurrency(totalIncome, currency)}
            </p>
          </div>
        </div>

        {/* Card 4: Top Spending Category */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top Category</span>
            {topCategory && (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${topCategory.color}15`, color: topCategory.color }}
              >
                <CategoryIcon category={topCategory.name as ExpenseCategory} className="w-4 h-4" />
              </div>
            )}
          </div>
          <div className="mt-3">
            {topCategory ? (
              <>
                <div className="text-xl font-bold text-slate-900 truncate">{topCategory.name}</div>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                  <span>{formatCurrency(topCategory.value, currency)}</span>
                  <span className="font-bold text-slate-700">{topCategory.percentage}% of total</span>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400">No expenses recorded yet</p>
            )}
          </div>
        </div>
      </div>

      {/* AI Pulse Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-300">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              </span>
              <span className="text-xs font-bold tracking-wider text-emerald-300 uppercase">
                AI Financial Intelligence
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold">
              Personalized Spending Audit & Budget Recommendations
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl">
              Gemini analyzed your recurring subscriptions, rent ratio, and supermarket visits. Tap to review potential savings of up to $245/month.
            </p>
          </div>
          <button
            id="btn-dashboard-view-ai"
            onClick={() => onNavigateTab("ai-analytics")}
            className="flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <span>View Full AI Insights</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Charts Row: Trend Line/Bar Graph & Pie/Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph 1: Spending Trend Over Time (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Spending Timeline & Cash Flow</span>
              </h2>
              <p className="text-xs text-slate-400">Daily breakdown of expenses vs income</p>
            </div>

            {/* Toggle Area vs Bar chart */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold self-start sm:self-auto">
              <button
                onClick={() => setChartViewMode("area")}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  chartViewMode === "area" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                }`}
              >
                Area Graph
              </button>
              <button
                onClick={() => setChartViewMode("bar")}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  chartViewMode === "bar" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                }`}
              >
                Bar Chart
              </button>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            {dailyData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <BarChart3 className="w-8 h-8 mb-2 opacity-40" />
                <span>No expense data for this time period</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {chartViewMode === "area" ? (
                  <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => d.slice(5)}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      formatter={(val: any) => [`$${Number(val).toFixed(2)}`, ""]}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        borderRadius: "10px",
                        border: "none",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      name="Expense"
                      stroke="#e11d48"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#expenseGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      name="Income"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#incomeGrad)"
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => d.slice(5)}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      formatter={(val: any) => [`$${Number(val).toFixed(2)}`, ""]}
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        borderRadius: "10px",
                        border: "none",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                    <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Graph 2: Expense Category Pie / Donut Chart (1 column) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <PieChartIcon className="w-4 h-4 text-purple-600" />
              <span>Category Distribution</span>
            </h2>
            <p className="text-xs text-slate-400">Proportional spending by category</p>
          </div>

          <div className="h-56 w-full relative my-auto">
            {pieChartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <PieChartIcon className="w-8 h-8 mb-2 opacity-40" />
                <span>No category data yet</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`$${Number(val).toFixed(2)}`, "Amount"]}
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderRadius: "10px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Category Mini Legend List */}
          <div className="space-y-2 pt-2 border-t border-slate-100 max-h-36 overflow-y-auto pr-1">
            {pieChartData.slice(0, 5).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 font-medium truncate">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-900 font-bold shrink-0">
                  <span>{formatCurrency(item.value, currency)}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row: "Where I Spend" Top Merchants & Locations Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Store className="w-4 h-4 text-emerald-600" />
              <span>Where I Spend — Top Merchants & Locations</span>
            </h2>
            <p className="text-xs text-slate-400">
              Highest expenditure by specific store, vendor, landlord, or airline
            </p>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto">
            {Object.keys(locationTotals).length} Unique Places Visited
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-4">
          {topLocationsData.map((item, idx) => {
            const meta = getCategoryMeta(item.category);
            return (
              <div
                key={item.location}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate" title={item.location}>
                      {item.location}
                    </p>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${meta.badgeClass}`}>
                        {item.category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.count} {item.count === 1 ? "time" : "times"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-slate-900">
                    {formatCurrency(item.total, currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions List with Quick Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Transactions</h2>
            <p className="text-xs text-slate-400">Latest expenses & income entries</p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="input-dashboard-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search store, title, category..."
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-48 sm:w-64"
            />
            <button
              onClick={() => onNavigateTab("transactions")}
              className="text-xs text-emerald-700 font-bold hover:underline px-2 py-1 cursor-pointer whitespace-nowrap"
            >
              View All →
            </button>
          </div>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No transactions found matching your search.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentTransactions.map((tx) => {
              const meta = getCategoryMeta(tx.category);
              const isIncome = tx.type === "income";

              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                    >
                      <CategoryIcon category={tx.category} className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-xs font-bold text-slate-900 truncate">{tx.title}</p>
                        {tx.recurring && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-medium border border-slate-200 hidden sm:inline">
                            Recurring
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="flex items-center space-x-1 text-slate-600 font-medium">
                          <Store className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[140px] sm:max-w-[220px]">{tx.location || "N/A"}</span>
                        </span>
                        <span>•</span>
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span className="hidden sm:inline text-slate-400">{tx.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs font-bold ${
                        isIncome ? "text-emerald-600" : "text-slate-900"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(tx.amount, currency)}
                    </span>
                    <p className="text-[10px] text-slate-400 capitalize">{tx.category}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
