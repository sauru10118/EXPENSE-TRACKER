/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { DashboardView } from "./components/DashboardView";
import { TransactionsView } from "./components/TransactionsView";
import { AddTransactionView } from "./components/AddTransactionView";
import { AIAnalyticsView } from "./components/AIAnalyticsView";
import { BudgetModal } from "./components/BudgetModal";
import { LoginView } from "./components/LoginView";
import { Transaction, BudgetConfig, AuthUser } from "./types";
import {
  loadAuthUser,
  saveAuthUser,
  clearAuthUser,
} from "./utils/storage";

import {
  syncAndLoadTransactions,
  persistTransaction,
  removeTransaction,
  updateTransactionInDb,
  syncAndLoadBudget,
  persistBudget,
} from "./utils/dbClient";
import { X, PlusCircle } from "lucide-react";

export default function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => loadAuthUser());
  const [activeTab, setActiveTab] = useState<"dashboard" | "transactions" | "add" | "ai-analytics">("dashboard");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig>({
    monthlyBudget: 3500,
    currency: "$",
    categoryBudgets: {},
  });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Load from Aiven DB / LocalStorage on mount
  useEffect(() => {
    if (authUser) {
      syncAndLoadTransactions().then(({ transactions: loadedTxs }) => {
        setTransactions(loadedTxs);
      });
      syncAndLoadBudget().then((loadedBudget) => {
        setBudgetConfig(loadedBudget);
      });
    }
  }, [authUser]);

  const handleLoginSuccess = (user: AuthUser) => {
    saveAuthUser(user);
    setAuthUser(user);
  };

  const handleLogout = () => {
    clearAuthUser();
    setAuthUser(null);
  };

  // If user is not authenticated, display the login screen at the start
  if (!authUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Transaction mutation handlers (syncs to Aiven Database & local cache)
  const handleAddTransaction = (newTxData: Omit<Transaction, "id" | "createdAt">) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    persistTransaction(newTx);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    removeTransaction(id);
  };

  const handleEditTransaction = (updatedTx: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTx.id ? updatedTx : t))
    );
    updateTransactionInDb(updatedTx);
  };

  const handleSaveBudget = (newBudget: BudgetConfig | ((prev: BudgetConfig) => BudgetConfig)) => {
    setBudgetConfig((prev) => {
      const updated = typeof newBudget === "function" ? newBudget(prev) : newBudget;
      persistBudget(updated);
      return updated;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        transactions={transactions}
        budgetConfig={budgetConfig}
        setBudgetConfig={handleSaveBudget}
        openBudgetModal={() => setIsBudgetModalOpen(true)}
        openAddModal={() => setIsAddModalOpen(true)}
        authUser={authUser}
        onLogout={handleLogout}
      />



      {/* Main Content Area */}
      <main className="flex-1 pb-16 md:pb-12">
        {activeTab === "dashboard" && (
          <DashboardView
            transactions={transactions}
            budgetConfig={budgetConfig}
            onNavigateTab={setActiveTab}
            openAddModal={() => setIsAddModalOpen(true)}
            openBudgetModal={() => setIsBudgetModalOpen(true)}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === "transactions" && (
          <TransactionsView
            transactions={transactions}
            budgetConfig={budgetConfig}
            onDeleteTransaction={handleDeleteTransaction}
            onEditTransaction={handleEditTransaction}
            openAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === "add" && (
          <AddTransactionView
            onAddTransaction={(tx) => {
              handleAddTransaction(tx);
              setActiveTab("dashboard");
            }}
          />
        )}

        {activeTab === "ai-analytics" && (
          <AIAnalyticsView
            transactions={transactions}
            budgetConfig={budgetConfig}
            setBudgetConfig={setBudgetConfig}
          />
        )}
      </main>

      {/* Quick Floating Modal for Adding a Transaction from anywhere */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <AddTransactionView
              isModal={true}
              onCloseModal={() => setIsAddModalOpen(false)}
              onAddTransaction={(tx) => {
                handleAddTransaction(tx);
                setIsAddModalOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Budget Configuration Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        budgetConfig={budgetConfig}
        onSaveBudget={setBudgetConfig}
      />

      {/* Subtle Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <p>
          Expense Tracker • AI Powered Spending & Analytics • Export to Excel (.xlsx) • Gemini 3.7 Flash
        </p>
      </footer>
    </div>
  );
}
