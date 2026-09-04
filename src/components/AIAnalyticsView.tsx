import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  Send,
  Bot,
  User,
  ShieldCheck,
  Zap,
  DollarSign,
  ArrowRight,
  Loader2,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { Transaction, BudgetConfig, AIAnalysisResult, ChatMessage } from "../types";
import { formatCurrency } from "../utils/storage";

interface AIAnalyticsViewProps {
  transactions: Transaction[];
  budgetConfig: BudgetConfig;
  setBudgetConfig: React.Dispatch<React.SetStateAction<BudgetConfig>>;
}

export const AIAnalyticsView: React.FC<AIAnalyticsViewProps> = ({
  transactions,
  budgetConfig,
  setBudgetConfig,
}) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Chat Assistant State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "ai",
      text: "Hello! I'm your Gemini AI financial advisor. Ask me anything about where you spent money, how to optimize your groceries, rent, travel, subscriptions, or shopping budgets!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const currency = budgetConfig.currency || "$";

  // Fetch AI Analysis
  const fetchAnalysis = async () => {
    setIsLoadingAnalysis(true);
    setAnalysisError(null);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactions,
          budgetConfig,
          timeRange: "August 2026",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate AI financial analysis");
      }

      const data: AIAnalysisResult = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || "Failed to load AI analysis");
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Handle Send Chat
  const handleSendChat = async (questionText?: string) => {
    const q = (questionText || chatInput).trim();
    if (!q || isSendingChat) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsSendingChat(true);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          transactions,
          budgetConfig,
        }),
      });

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.answer || "I reviewed your transaction logs. What else would you like to know?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "ai",
        text: "Sorry, I encountered an issue analyzing your query. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const samplePromptChips = [
    "Where did I spend the most money this month?",
    "How can I cut $150 from my grocery & shopping expenses?",
    "Audit all my recurring subscriptions",
    "Which store did I visit most frequently?",
    "Is my rent taking too much of my income?",
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              AI Financial Analysis & Advisor
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Powered by Gemini 3.7 Flash: deep audit of your exact store spending, recurring charges & customized budget plans.
          </p>
        </div>

        <button
          id="btn-refresh-ai-analysis"
          onClick={fetchAnalysis}
          disabled={isLoadingAnalysis}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAnalysis ? "animate-spin" : ""}`} />
          <span>{isLoadingAnalysis ? "Analyzing Spending..." : "Re-Analyze Finances"}</span>
        </button>
      </div>

      {isLoadingAnalysis && !analysis && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-800">Gemini is auditing your transactions...</p>
          <p className="text-xs text-slate-400">
            Checking location frequency, category ratios, subscriptions, and saving opportunities.
          </p>
        </div>
      )}

      {analysis && (
        <>
          {/* Top Row: Spending Health Score & Executive Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Financial Health Score</span>
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    {analysis.healthScore >= 80 ? "Excellent" : analysis.healthScore >= 65 ? "Good" : "Needs Attention"}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline space-x-3">
                  <span className="text-5xl font-extrabold text-white">{analysis.healthScore}</span>
                  <span className="text-sm text-slate-400 font-semibold">/ 100 points</span>
                </div>

                <div className="w-full bg-slate-700/60 h-2.5 rounded-full mt-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                    style={{ width: `${analysis.healthScore}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/60 text-xs text-slate-300">
                <p>
                  <strong>Projection:</strong> Estimated monthly expenditure around{" "}
                  <span className="text-emerald-400 font-bold">
                    {formatCurrency(analysis.monthlyForecast?.projectedSpend || 0, currency)}
                  </span>
                  .
                </p>
              </div>
            </div>

            {/* Executive Summary & Advice */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-base mb-2">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span>AI Spending Assessment</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {analysis.summary}
                </p>
              </div>

              {analysis.monthlyForecast?.advice && (
                <div className="mt-4 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                  <strong className="font-bold">Next 30 Days Forecast: </strong>
                  <span>{analysis.monthlyForecast.advice}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actionable Insights Grid */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Tailored Spending Observations & Saving Opportunities</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.insights?.map((item, idx) => {
                const isWarning = item.type === "warning";
                const isPositive = item.type === "positive";

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isWarning
                        ? "bg-amber-50/60 border-amber-200/80 text-amber-950"
                        : isPositive
                        ? "bg-emerald-50/60 border-emerald-200/80 text-emerald-950"
                        : "bg-white border-slate-200 text-slate-900 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        {isWarning ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : isPositive ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-blue-600 shrink-0" />
                        )}
                        <h4 className="text-xs font-bold">{item.title}</h4>
                      </div>

                      {item.estimatedSaving && (
                        <span className="text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full shrink-0">
                          Save ~${item.estimatedSaving}/mo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Suggested Budget Adjustments */}
          {analysis.actionableBudgetAdjustments?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>AI Recommended Budget Target Adjustments</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {analysis.actionableBudgetAdjustments.map((adj, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{adj.category}</span>
                      <span className="text-xs text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-md">
                        Target: {formatCurrency(adj.suggestedBudget, currency)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{adj.reason}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setBudgetConfig((prev) => ({
                          ...prev,
                          categoryBudgets: {
                            ...prev.categoryBudgets,
                            [adj.category]: adj.suggestedBudget,
                          },
                        }));
                        alert(`Updated budget target for ${adj.category} to ${formatCurrency(adj.suggestedBudget, currency)}!`);
                      }}
                      className="w-full text-center text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-white hover:bg-emerald-50 border border-emerald-200 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Apply Target Limit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Interactive AI Chat Assistant */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[520px]">
        {/* Chat Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold">Ask Gemini About Your Spending</h3>
              <p className="text-[10px] text-slate-400">
                Ask questions about your transactions, store frequency, and savings
              </p>
            </div>
          </div>
          <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30">
            Live AI
          </span>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center space-x-1.5 overflow-x-auto text-[11px] scrollbar-none">
          <span className="text-slate-400 font-semibold px-1 shrink-0 flex items-center space-x-1">
            <HelpCircle className="w-3 h-3" />
            <span>Try:</span>
          </span>
          {samplePromptChips.map((chip, i) => (
            <button
              key={i}
              onClick={() => handleSendChat(chip)}
              className="bg-white hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer font-medium"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Message History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
          {chatMessages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-2.5 ${
                  isUser ? "flex-row-reverse space-x-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser ? "bg-slate-800 text-white" : "bg-emerald-600 text-white"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                    isUser
                      ? "bg-slate-900 text-white rounded-tr-xs"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs whitespace-pre-wrap"
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      isUser ? "text-slate-400" : "text-slate-400"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isSendingChat && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 p-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Gemini is calculating your spending figures...</span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Chat Input */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="flex items-center space-x-2"
          >
            <input
              id="input-ai-chat"
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="e.g. How much did I spend at Trader Joe's and Costco combined?"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              id="btn-send-ai-chat"
              disabled={isSendingChat || !chatInput.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
