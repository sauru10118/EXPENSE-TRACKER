import React from "react";
import {
  LayoutDashboard,
  ReceiptText,
  PlusCircle,
  Sparkles,
  FileSpreadsheet,
  Settings,
  Wallet,
  LogOut,
  UserCheck,
} from "lucide-react";
import { BudgetConfig, Transaction, AuthUser } from "../types";
import { exportTransactionsToExcel } from "../utils/excelExport";
import { DbStatusBadge } from "./DbStatusBadge";


interface NavbarProps {
  activeTab: "dashboard" | "transactions" | "add" | "ai-analytics";
  setActiveTab: (tab: "dashboard" | "transactions" | "add" | "ai-analytics") => void;
  transactions: Transaction[];
  budgetConfig: BudgetConfig;
  setBudgetConfig: React.Dispatch<React.SetStateAction<BudgetConfig>>;
  openBudgetModal: () => void;
  openAddModal: () => void;
  authUser?: AuthUser | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  transactions,
  budgetConfig,
  setBudgetConfig,
  openBudgetModal,
  openAddModal,
  authUser,
  onLogout,
}) => {
  const currencies = ["$", "€", "£", "₹", "¥", "C$"];


  const handleExcelExport = () => {
    exportTransactionsToExcel(transactions, budgetConfig);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">Expense Tracker</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                  AI Powered
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Smart spending, exact locations & analytics</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "dashboard"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-600" />
              <span>Dashboard</span>
            </button>

            <button
              id="nav-tab-transactions"
              onClick={() => setActiveTab("transactions")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "transactions"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <ReceiptText className="w-4 h-4 text-blue-600" />
              <span>Transactions</span>
              <span className="text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full font-semibold">
                {transactions.length}
              </span>
            </button>

            <button
              id="nav-tab-add"
              onClick={() => setActiveTab("add")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "add"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <PlusCircle className="w-4 h-4 text-purple-600" />
              <span>Add Expense</span>
            </button>

            <button
              id="nav-tab-ai"
              onClick={() => setActiveTab("ai-analytics")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "ai-analytics"
                  ? "bg-white text-emerald-700 shadow-xs border border-emerald-200 font-semibold"
                  : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50"
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>AI Analysis</span>
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Aiven Cloud DB Status Badge */}
            <DbStatusBadge />

            {/* Currency Selector */}
            <div className="relative">

              <select
                id="currency-selector"
                aria-label="Select Currency"
                value={budgetConfig.currency}
                onChange={(e) =>
                  setBudgetConfig((prev) => ({ ...prev, currency: e.target.value }))
                }
                className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c} Currency
                  </option>
                ))}
              </select>
            </div>

            {/* Export to Excel */}
            <button
              id="btn-export-excel-header"
              onClick={handleExcelExport}
              title="Export all transactions to formatted Excel (.xlsx)"
              className="flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>

            {/* Budget Settings */}
            <button
              id="btn-open-budget-modal"
              onClick={openBudgetModal}
              title="Configure Monthly Budgets"
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Quick Add Button */}
            <button
              id="btn-quick-add-transaction"
              onClick={openAddModal}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="font-medium">New Entry</span>
            </button>

            {/* Authenticated User & Logout */}
            {authUser && (
              <div className="flex items-center pl-1 border-l border-slate-200 ml-1 space-x-2">
                <div
                  className="hidden xl:flex items-center space-x-2 bg-slate-100/80 border border-slate-200/80 px-2.5 py-1 rounded-lg"
                  title={`Logged in as ${authUser.name || authUser.username}`}
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {(authUser.name || authUser.username || "S")[0].toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-slate-700 max-w-[80px] truncate">
                    {authUser.username}
                  </span>
                </div>

                <button
                  id="btn-logout"
                  onClick={onLogout}
                  title="Log out of session"
                  className="flex items-center space-x-1 p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer text-xs font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden border-t border-slate-200 bg-white px-3 py-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center text-xs font-medium ${
            activeTab === "dashboard" ? "text-emerald-600" : "text-slate-500"
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`flex flex-col items-center text-xs font-medium ${
            activeTab === "transactions" ? "text-blue-600" : "text-slate-500"
          }`}
        >
          <ReceiptText className="w-5 h-5 mb-0.5" />
          <span>Transactions</span>
        </button>
        <button
          onClick={() => setActiveTab("add")}
          className={`flex flex-col items-center text-xs font-medium ${
            activeTab === "add" ? "text-purple-600" : "text-slate-500"
          }`}
        >
          <PlusCircle className="w-5 h-5 mb-0.5" />
          <span>Add</span>
        </button>
        <button
          onClick={() => setActiveTab("ai-analytics")}
          className={`flex flex-col items-center text-xs font-medium ${
            activeTab === "ai-analytics" ? "text-emerald-600 font-bold" : "text-slate-500"
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5 text-emerald-500" />
          <span>AI</span>
        </button>
        {onLogout && (
          <button
            onClick={onLogout}
            title="Log out"
            className="flex flex-col items-center text-xs font-medium text-slate-500 hover:text-rose-600"
          >
            <LogOut className="w-5 h-5 mb-0.5" />
            <span>Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};
