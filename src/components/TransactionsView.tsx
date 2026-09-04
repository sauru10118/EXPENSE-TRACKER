import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  FileSpreadsheet,
  Trash2,
  Edit2,
  ArrowUpDown,
  Plus,
  Store,
  Calendar,
  CreditCard,
  CheckSquare,
  Square,
  Download,
  Tag,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";
import { Transaction, BudgetConfig, ExpenseCategory, PaymentMethod } from "../types";
import { CATEGORIES, getCategoryMeta } from "../utils/categories";
import { CategoryIcon } from "./CategoryIcon";
import { formatCurrency } from "../utils/storage";
import { exportTransactionsToExcel } from "../utils/excelExport";

interface TransactionsViewProps {
  transactions: Transaction[];
  budgetConfig: BudgetConfig;
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (transaction: Transaction) => void;
  openAddModal: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  budgetConfig,
  onDeleteTransaction,
  onEditTransaction,
  openAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "expense" | "income">("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "location">("date-desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Edit Modal State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const currency = budgetConfig.currency || "$";

  // Filter & Sort
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchLoc = t.location.toLowerCase().includes(q);
          const matchNotes = (t.notes || "").toLowerCase().includes(q);
          const matchCategory = t.category.toLowerCase().includes(q);
          if (!matchTitle && !matchLoc && !matchNotes && !matchCategory) return false;
        }

        // Category filter
        if (selectedCategory !== "all" && t.category !== selectedCategory) {
          return false;
        }

        // Payment method filter
        if (selectedPaymentMethod !== "all" && t.paymentMethod !== selectedPaymentMethod) {
          return false;
        }

        // Type filter
        if (typeFilter !== "all" && t.type !== typeFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "date-desc") {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === "date-asc") {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === "amount-desc") {
          return b.amount - a.amount;
        }
        if (sortBy === "amount-asc") {
          return a.amount - b.amount;
        }
        if (sortBy === "location") {
          return a.location.localeCompare(b.location);
        }
        return 0;
      });
  }, [transactions, searchQuery, selectedCategory, selectedPaymentMethod, typeFilter, sortBy]);

  // Bulk Selection Handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTransactions.map((t) => t.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.size} transactions?`)) {
      selectedIds.forEach((id) => onDeleteTransaction(id));
      setSelectedIds(new Set());
    }
  };

  const handleExportSelectedToExcel = () => {
    const listToExport =
      selectedIds.size > 0
        ? transactions.filter((t) => selectedIds.has(t.id))
        : filteredTransactions;
    exportTransactionsToExcel(listToExport, budgetConfig, `Filtered_Transactions_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const totalFilteredExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  // Save edit form
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTx) {
      onEditTransaction(editingTx);
      setEditingTx(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Transaction Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Filter by exact location/store, category, payment method & export to Excel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-export-excel-tx-view"
            onClick={handleExportSelectedToExcel}
            className="flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>
              {selectedIds.size > 0 ? `Export Selected (${selectedIds.size})` : "Export All to Excel (.xlsx)"}
            </span>
          </button>

          <button
            id="btn-add-tx-from-view"
            onClick={openAddModal}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Expense</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        {/* Row 1: Search and Type Pills */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-transactions-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by store (e.g. Trader Joe's, Netflix, Delta), description, note..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Type Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                typeFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter("expense")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                typeFilter === "expense" ? "bg-white text-rose-700 shadow-xs font-bold" : "text-slate-600"
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setTypeFilter("income")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                typeFilter === "income" ? "bg-white text-emerald-700 shadow-xs font-bold" : "text-slate-600"
              }`}
            >
              Income
            </button>
          </div>
        </div>

        {/* Row 2: Category Filter Pills / Dropdown */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Category:
          </span>

          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              selectedCategory === "all"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            All Categories
          </button>

          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  isSelected
                    ? `${cat.badgeClass} ring-1 ring-emerald-500 font-bold`
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <CategoryIcon category={cat.id} className="w-3 h-3" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Row 3: Payment Method & Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Payment:
            </span>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All Methods</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer / UPI">Bank Transfer / UPI</option>
              <option value="Digital Wallet (Apple/Google Pay)">Digital Wallet</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <ArrowUpDown className="w-3 h-3" />
              <span>Sort By:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="amount-desc">Amount (Highest First)</option>
              <option value="amount-asc">Amount (Lowest First)</option>
              <option value="location">Merchant / Location Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Filter Banner & Batch Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="text-xs text-slate-500 flex items-center space-x-3">
          <span>
            Showing <strong>{filteredTransactions.length}</strong> of <strong>{transactions.length}</strong> transactions
          </span>
          <span>•</span>
          <span className="text-rose-600 font-bold">
            Total Spent: {formatCurrency(totalFilteredExpense, currency)}
          </span>
          {totalFilteredIncome > 0 && (
            <>
              <span>•</span>
              <span className="text-emerald-600 font-bold">
                Total Income: {formatCurrency(totalFilteredIncome, currency)}
              </span>
            </>
          )}
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl">
            <span className="text-xs text-rose-800 font-bold">{selectedIds.size} selected</span>
            <button
              onClick={handleDeleteSelected}
              className="text-xs text-rose-700 hover:text-rose-900 font-bold underline cursor-pointer"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Main Transactions Table & Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Tag className="w-10 h-10 mx-auto opacity-30" />
            <p className="text-sm font-semibold">No transactions match your current filters.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedPaymentMethod("all");
                setTypeFilter("all");
              }}
              className="text-xs text-emerald-600 hover:underline font-bold cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <button
                      onClick={handleSelectAll}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {selectedIds.size === filteredTransactions.length && filteredTransactions.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Where Spent (Location)</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => {
                  const meta = getCategoryMeta(tx.category);
                  const isIncome = tx.type === "income";
                  const isSelected = selectedIds.has(tx.id);

                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? "bg-emerald-50/40" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleSelect(tx.id)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 max-w-[200px]">
                        <div className="flex items-center space-x-1.5">
                          <span className="truncate" title={tx.title}>
                            {tx.title}
                          </span>
                          {tx.recurring && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded-md font-normal border border-slate-200 shrink-0">
                              Recurring
                            </span>
                          )}
                        </div>
                        {tx.notes && (
                          <p className="text-[11px] text-slate-400 font-normal truncate max-w-[200px]" title={tx.notes}>
                            {tx.notes}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1 text-slate-700 font-semibold max-w-[180px]">
                          <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate" title={tx.location}>
                            {tx.location || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md font-semibold border ${meta.badgeClass}`}>
                          <CategoryIcon category={tx.category} className="w-3 h-3" />
                          <span>{tx.category}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {tx.paymentMethod}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span
                          className={`font-extrabold ${
                            isIncome ? "text-emerald-600" : "text-slate-900"
                          }`}
                        >
                          {isIncome ? "+" : "-"}
                          {formatCurrency(tx.amount, currency)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => setEditingTx(tx)}
                            title="Edit transaction"
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${tx.title}"?`)) {
                                onDeleteTransaction(tx.id);
                              }
                            }}
                            title="Delete transaction"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Transaction</h3>
              <button
                onClick={() => setEditingTx(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={editingTx.title}
                  onChange={(e) => setEditingTx({ ...editingTx, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingTx.amount}
                    onChange={(e) => setEditingTx({ ...editingTx, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={editingTx.date}
                    onChange={(e) => setEditingTx({ ...editingTx, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Where Spent (Store / Location / Airline / Vendor)
                </label>
                <input
                  type="text"
                  value={editingTx.location}
                  onChange={(e) => setEditingTx({ ...editingTx, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingTx.category}
                    onChange={(e) => setEditingTx({ ...editingTx, category: e.target.value as ExpenseCategory })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={editingTx.paymentMethod}
                    onChange={(e) => setEditingTx({ ...editingTx, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer / UPI">Bank Transfer / UPI</option>
                    <option value="Digital Wallet (Apple/Google Pay)">Digital Wallet</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editingTx.notes || ""}
                  onChange={(e) => setEditingTx({ ...editingTx, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
