import { useState } from "react";
import { X, Cloud, CloudCheck, User, LogOut, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import type { AuthUser, SyncPayload } from "@/hooks/useAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  error: string | null;
  onLogin: (identifier: string, pass: string) => Promise<boolean>;
  onRegister: (username: string, email: string, pass: string) => Promise<boolean>;
  onLogout: () => Promise<void>;
  onSync: (payload: SyncPayload) => Promise<unknown>;
  getLocalPayload: () => SyncPayload;
  onApplySyncedData: (data: unknown) => void;
  clearError: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  user,
  isLoading,
  isSyncing,
  lastSyncedAt,
  error,
  onLogin,
  onRegister,
  onLogout,
  onSync,
  getLocalPayload,
  onApplySyncedData,
  clearError,
}: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;
    const ok = await onLogin(identifier, password);
    if (ok) {
      setIdentifier("");
      setPassword("");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) return;
    const ok = await onRegister(username, email, password);
    if (ok) {
      setUsername("");
      setEmail("");
      setPassword("");
    }
  };

  const handleSyncClick = async () => {
    setSyncSuccessMsg(null);
    clearError();
    const payload = getLocalPayload();
    const result = await onSync(payload);
    if (result) {
      onApplySyncedData(result);
      setSyncSuccessMsg("All habits, tasks, pomodoro stats, and favorites successfully synchronized with Cloud Database!");
      setTimeout(() => setSyncSuccessMsg(null), 5000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-neutral-900/95 border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-7 text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white">
                {user ? "Cloud Account & Sync" : "Account & Cloud Sync"}
              </h2>
              <p className="text-xs text-neutral-400">
                {user ? "Connected to backend database" : "Save and sync habits across devices"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={clearError} className="text-red-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {syncSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncSuccessMsg}</span>
          </div>
        )}

        {/* Content Body */}
        {user ? (
          /* Logged In View */
          <div className="mt-5 space-y-5 relative z-10">
            {/* User Profile Card */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-base">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    @{user.username}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Cloud Connected
                    </span>
                  </div>
                  <div className="text-xs text-neutral-400">{user.email}</div>
                </div>
              </div>
            </div>

            {/* Sync Card */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-indigo-400" />
                  Database Status
                </span>
                <span className="text-xs text-neutral-400">
                  {lastSyncedAt ? `Last synced: ${new Date(lastSyncedAt).toLocaleTimeString()}` : "Ready to sync"}
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Your habits, to-do tasks, Pomodoro XP, streaks, and quote favorites can be backed up directly to the SQLite backend.
              </p>
              <button
                type="button"
                onClick={handleSyncClick}
                disabled={isSyncing}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Syncing with Cloud...
                  </>
                ) : (
                  <>
                    <CloudCheck className="w-4 h-4" />
                    Sync Local Data to Cloud Database
                  </>
                )}
              </button>
            </div>

            {/* Sign out */}
            <button
              type="button"
              onClick={onLogout}
              disabled={isLoading}
              className="w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        ) : (
          /* Guest / Auth View */
          <div className="mt-5 space-y-4 relative z-10">
            {/* Tabs */}
            <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setTab("login");
                  clearError();
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  tab === "login"
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("register");
                  clearError();
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  tab === "register"
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Mode Banner */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1" />
              <div>
                <strong>Guest Mode (Offline-First):</strong> You can use all features offline. Creating an account will sync your existing habits and Pomodoro streaks to the backend database!
              </div>
            </div>

            {tab === "login" ? (
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. zenmaster or you@example.com"
                    className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In to Cloud"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. zenmaster"
                    className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account & Sync"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
