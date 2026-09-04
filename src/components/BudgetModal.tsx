import React, { useState } from "react";
import { Settings, Check, DollarSign, X } from "lucide-react";
import { BudgetConfig, ExpenseCategory } from "../types";
import { CATEGORIES } from "../utils/categories";
import { CategoryIcon } from "./CategoryIcon";
import { formatCurrency } from "../utils/storage";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetConfig: BudgetConfig;
  onSaveBudget: (config: BudgetConfig) => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  budgetConfig,
  onSaveBudget,
}) => {
  const [monthlyBudget, setMonthlyBudget] = useState(String(budgetConfig.monthlyBudget || 3000));
  const [categoryBudgets, setCategoryBudgets] = useState<Partial<Record<ExpenseCategory, number>>>(
    budgetConfig.categoryBudgets || {}
  );

  if (!isOpen) return null;

  const handleCategoryChange = (category: ExpenseCategory, val: string) => {
    const num = parseFloat(val);
    setCategoryBudgets((prev) => ({
      ...prev,
      [category]: isNaN(num) ? 0 : num,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTotal = parseFloat(monthlyBudget) || 3000;
    onSaveBudget({
      ...budgetConfig,
      monthlyBudget: parsedTotal,
      categoryBudgets,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Configure Monthly Budgets</h3>
              <p className="text-xs text-slate-400">Set total monthly target & category limits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Overall Monthly Budget */}
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80">
            <label className="block text-xs font-bold text-emerald-900 mb-1.5">
              Overall Total Monthly Budget Target ($)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-700 font-bold">
                $
              </span>
              <input
                type="number"
                step="10"
                min="0"
                required
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                className="w-full bg-white border border-emerald-300 rounded-xl pl-8 pr-3 py-2 text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">
              Used to calculate remaining balance & overspending alerts across all expenses.
            </p>
          </div>

          {/* Category Budgets Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Category Specific Budget Limits ($)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CATEGORIES.filter((c) => c.id !== "Salary / Income").map((cat) => {
                const currentVal = categoryBudgets[cat.id] ?? "";
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/70"
                  >
                    <div className="flex items-center space-x-2 min-w-0 mr-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                      >
                        <CategoryIcon category={cat.id} className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 truncate">{cat.label}</span>
                    </div>

                    <div className="w-24 shrink-0 relative">
                      <span className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-slate-400 text-xs font-bold">
                        $
                      </span>
                      <input
                        type="number"
                        step="10"
                        min="0"
                        placeholder="Limit"
                        value={currentVal}
                        onChange={(e) => handleCategoryChange(cat.id, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-5 pr-2 py-1 text-xs font-bold text-slate-900 text-right focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Budget Targets</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
