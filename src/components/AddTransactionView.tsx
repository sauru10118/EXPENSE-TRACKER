import React, { useState } from "react";
import {
  PlusCircle,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  RotateCcw,
  Store,
  Tag,
  Loader2,
} from "lucide-react";
import { Transaction, ExpenseCategory, PaymentMethod, TransactionType } from "../types";
import { CATEGORIES, getCategoryMeta } from "../utils/categories";
import { CategoryIcon } from "./CategoryIcon";

interface AddTransactionViewProps {
  onAddTransaction: (transaction: Omit<Transaction, "id" | "createdAt">) => void;
  onCloseModal?: () => void;
  isModal?: boolean;
}

export const AddTransactionView: React.FC<AddTransactionViewProps> = ({
  onAddTransaction,
  onCloseModal,
  isModal = false,
}) => {
  const [type, setType] = useState<TransactionType>("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Groceries");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Credit Card");
  const [notes, setNotes] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // AI Quick Parse state
  const [aiInputText, setAiInputText] = useState("");
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [aiError, setAiError] = useState("");

  const currentCategoryMeta = getCategoryMeta(category);

  // Handle smart AI text fill
  const handleAiSmartParse = async () => {
    if (!aiInputText.trim()) return;
    setIsAiParsing(true);
    setAiError("");

    try {
      const response = await fetch("/api/ai/smart-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiInputText }),
      });

      if (!response.ok) {
        throw new Error("Failed to parse text");
      }

      const data = await response.json();
      if (data.title) setTitle(data.title);
      if (data.amount) setAmount(String(data.amount));
      if (data.location) setLocation(data.location);
      if (data.category && CATEGORIES.some((c) => c.id === data.category)) {
        setCategory(data.category as ExpenseCategory);
      }
      if (data.type) setType(data.type);
      if (data.date) setDate(data.date);
      if (data.paymentMethod) setPaymentMethod(data.paymentMethod);
      if (data.notes) setNotes(data.notes);
      setAiInputText("");
    } catch (err: any) {
      setAiError("Could not auto-parse. Please enter details manually.");
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }

    if (!title.trim()) {
      alert("Please enter a description for the transaction");
      return;
    }

    onAddTransaction({
      title: title.trim(),
      location: location.trim() || "Unspecified Place",
      amount: numAmount,
      category,
      type,
      date,
      paymentMethod,
      notes: notes.trim() || undefined,
      recurring,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      // Reset form
      setTitle("");
      setAmount("");
      setLocation("");
      setNotes("");
      if (onCloseModal) {
        onCloseModal();
      }
    }, 900);
  };

  return (
    <div className={`${isModal ? "p-0" : "max-w-4xl mx-auto py-6 px-4 sm:px-6"}`}>
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <PlusCircle className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Add New Transaction</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Record where you spent, categorize clearly (Travel, Rent, Groceries, Shopping, Subscriptions) & organize your finances.
            </p>
          </div>

          {/* Income vs Expense Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button
              type="button"
              id="btn-type-expense"
              onClick={() => {
                setType("expense");
                if (category === "Salary / Income") setCategory("Groceries");
              }}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                type === "expense"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Expense</span>
            </button>
            <button
              type="button"
              id="btn-type-income"
              onClick={() => {
                setType("income");
                setCategory("Salary / Income");
              }}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                type === "income"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Income</span>
            </button>
          </div>
        </div>

        {/* Smart AI Auto-Fill Helper Box */}
        <div className="mt-5 p-3.5 bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-blue-50/70 rounded-xl border border-emerald-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>AI Quick Fill Assistant</span>
            </div>
            <span className="text-[11px] text-emerald-700">Type or paste natural sentence / receipt snippet</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="input-ai-quick-fill"
              type="text"
              value={aiInputText}
              onChange={(e) => setAiInputText(e.target.value)}
              placeholder="e.g. Spent $65.40 at Trader Joe's for weekly groceries with credit card"
              className="flex-1 bg-white border border-emerald-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAiSmartParse();
                }
              }}
            />
            <button
              type="button"
              id="btn-ai-auto-parse"
              onClick={handleAiSmartParse}
              disabled={isAiParsing || !aiInputText.trim()}
              className="flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap"
            >
              {isAiParsing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Parsing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Fill Form</span>
                </>
              )}
            </button>
          </div>
          {aiError && <p className="text-xs text-rose-600 mt-1.5">{aiError}</p>}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection Grid */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <Tag className="w-4 h-4 text-emerald-600" />
              <span>Choose Category</span>
            </label>
            <span className="text-xs text-slate-500">
              Selected: <strong className="text-slate-800">{category}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {CATEGORIES.filter((c) => (type === "income" ? c.id === "Salary / Income" || c.id === "Investments" || c.id === "Other" : c.id !== "Salary / Income")).map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  id={`cat-select-${cat.id.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? `${cat.bgLight} ${cat.borderColor} ring-2 ring-emerald-500/40 shadow-xs`
                      : "bg-slate-50/50 hover:bg-slate-100/80 border-slate-200 text-slate-700"
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                  >
                    <CategoryIcon category={cat.id} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${isSelected ? "text-slate-900" : "text-slate-700"}`}>
                      {cat.label}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate hidden sm:block">
                      {cat.id === "Rent"
                        ? "Apartment rent"
                        : cat.id === "Groceries"
                        ? "Supermarkets"
                        : cat.id === "Travel"
                        ? "Flights & hotels"
                        : cat.id === "Shopping"
                        ? "Retail goods"
                        : cat.id === "Subscriptions"
                        ? "Monthly apps"
                        : cat.id === "Housing"
                        ? "Home repairs"
                        : cat.id}
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Details & Location Grid */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Transaction Details</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title / Description */}
            <div>
              <label htmlFor="tx-title-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description / Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="tx-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Monthly Rent, Flight to Seattle, Weekly Grocery run"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="tx-amount-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Amount <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold">
                  $
                </span>
                <input
                  id="tx-amount-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* WHERE I SPEND / LOCATION (Requested explicitly by user) */}
            <div className="md:col-span-2">
              <label htmlFor="tx-location-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Where Did You Spend? (Merchant, Store, Landlord, Airline, Vendor)</span>
                </span>
              </label>
              <input
                id="tx-location-input"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Trader Joe's, Delta Airlines, Highland Residences, Netflix, Whole Foods, Airbnb"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-colors"
              />

              {/* Quick Location Suggestion Pills based on active category */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <Store className="w-3 h-3" />
                  <span>Suggestions:</span>
                </span>
                {currentCategoryMeta.defaultLocationSuggestions.slice(0, 6).map((suggestedLoc) => (
                  <button
                    type="button"
                    key={suggestedLoc}
                    onClick={() => setLocation(suggestedLoc)}
                    className="text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                  >
                    {suggestedLoc}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Picker */}
            <div>
              <label htmlFor="tx-date-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Date</span>
                </span>
              </label>
              <input
                id="tx-date-input"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer"
              />
              <div className="flex items-center space-x-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => setDate(new Date().toISOString().split("T")[0])}
                  className="text-[11px] text-slate-500 hover:text-emerald-700 cursor-pointer"
                >
                  Today
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 1);
                    setDate(d.toISOString().split("T")[0]);
                  }}
                  className="text-[11px] text-slate-500 hover:text-emerald-700 cursor-pointer"
                >
                  Yesterday
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label htmlFor="tx-payment-method" className="block text-xs font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center space-x-1">
                  <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                  <span>Payment Method</span>
                </span>
              </label>
              <select
                id="tx-payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer / UPI">Bank Transfer / UPI</option>
                <option value="Digital Wallet (Apple/Google Pay)">Digital Wallet (Apple/Google Pay)</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Notes / Details */}
            <div className="md:col-span-2">
              <label htmlFor="tx-notes-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Notes & Purchased Items (Optional)
              </label>
              <textarea
                id="tx-notes-input"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Items bought, receipt invoice #, split with roommate, etc."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
            </div>

            {/* Recurring toggle */}
            <div className="md:col-span-2 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Recurring Monthly Expense</p>
                  <p className="text-[11px] text-slate-500">Enable for monthly rent, subscriptions, or fixed utility bills</p>
                </div>
              </div>
              <input
                id="tx-recurring-toggle"
                type="checkbox"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          {onCloseModal && (
            <button
              type="button"
              id="btn-cancel-tx"
              onClick={onCloseModal}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            id="btn-submit-transaction"
            disabled={isSuccess}
            className={`flex items-center space-x-2 px-7 py-2.5 rounded-xl text-white text-sm font-bold shadow-md transition-all cursor-pointer ${
              isSuccess
                ? "bg-emerald-600 ring-2 ring-emerald-400 scale-95"
                : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg active:scale-95"
            }`}
          >
            {isSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Save {type === "expense" ? "Expense" : "Income"} Entry</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
