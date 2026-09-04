import React, { useState, useEffect } from "react";
import { Database, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, X, Shield } from "lucide-react";
import { checkDbStatus, DbStatus } from "../utils/dbClient";

export const DbStatusBadge: React.FC = () => {
  const [status, setStatus] = useState<DbStatus>({
    connected: false,
    configured: false,
    provider: "Aiven for PostgreSQL",
    error: null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const fetchStatus = async () => {
    setIsChecking(true);
    const res = await checkDbStatus();
    setStatus(res);
    setIsChecking(false);
  };

  useEffect(() => {
    fetchStatus();
    // Poll status every 30s
    const timer = setInterval(fetchStatus, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Navbar Status Badge Button */}
      <button
        id="btn-db-status-badge"
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
          status.connected
            ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
            : status.configured
            ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
            : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
        }`}
        title="Click to view Aiven Cloud Database status and configuration"
      >
        <span className="relative flex h-2 w-2">
          {status.connected && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              status.connected
                ? "bg-emerald-500"
                : status.configured
                ? "bg-amber-500"
                : "bg-slate-400"
            }`}
          ></span>
        </span>
        <Database className="w-3.5 h-3.5" />
        <span className="hidden xl:inline">
          {status.connected
            ? "Aiven DB: Connected"
            : status.configured
            ? "Aiven DB: Connecting..."
            : "Aiven DB: Setup"}
        </span>
      </button>

      {/* Info Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div
                className={`p-2.5 rounded-xl ${
                  status.connected
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Aiven PostgreSQL Database
                </h3>
                <p className="text-xs text-slate-500">
                  Managed Cloud Database for Expense Tracker
                </p>
              </div>
            </div>

            {/* Current State Alert */}
            <div
              className={`p-4 rounded-xl mb-4 border ${
                status.connected
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <div className="flex items-center space-x-2 font-bold text-sm mb-1">
                {status.connected ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Database Online & Syncing</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>
                      {status.configured
                        ? "Connection in Progress or Error"
                        : "No DATABASE_URL Configured"}
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs leading-relaxed">
                {status.connected
                  ? "All transactions, categories, and monthly budget settings are live synchronized with your cloud PostgreSQL database on Aiven."
                  : status.error
                  ? `Notice: ${status.error}. Currently using browser LocalStorage as safe fallback.`
                  : "Currently operating in offline LocalStorage mode. Follow the instructions below to link your free Aiven cloud database."}
              </p>
            </div>

            {/* How to configure on Aiven */}
            <div className="space-y-3 text-xs text-slate-600 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                How to Connect Aiven PostgreSQL
              </h4>
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>
                  Sign up or log in at{" "}
                  <a
                    href="https://aiven.io"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-0.5"
                  >
                    aiven.io <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>Create a <strong>PostgreSQL</strong> service (Free tier available).</li>
                <li>
                  In service overview, copy the <strong>Service URI</strong>:
                  <div className="mt-1 p-2 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-lg break-all select-all">
                    postgres://avnadmin:PASSWORD@HOST.aivencloud.com:PORT/defaultdb?sslmode=require
                  </div>
                </li>
                <li>
                  Paste it as <strong>DATABASE_URL</strong> in your local <code className="bg-slate-200 px-1 rounded">.env</code> or in <strong>Render.com Environment Variables</strong>.
                </li>
              </ol>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                id="btn-recheck-db"
                onClick={fetchStatus}
                disabled={isChecking}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`} />
                <span>{isChecking ? "Checking..." : "Re-check Connection"}</span>
              </button>

              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
