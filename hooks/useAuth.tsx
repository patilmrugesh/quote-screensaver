import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { HabitItem, TaskItem } from "@/lib/todoHabitTypes";
import type { PomodoroSession, GamificationProfile } from "@/lib/pomodoroTypes";
import type { Quote, CustomizationSettings } from "@/lib/types";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  createdAt: number;
}

export interface SyncPayload {
  habits?: HabitItem[];
  tasks?: TaskItem[];
  sessions?: PomodoroSession[];
  gamification?: GamificationProfile;
  favorites?: Quote[];
  settings?: CustomizationSettings;
}

export interface SyncResponseData {
  habits: HabitItem[];
  tasks: TaskItem[];
  sessions: PomodoroSession[];
  gamification: GamificationProfile | null;
  favorites: Quote[];
  settings: CustomizationSettings | null;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  error: string | null;
}

let authSnapshot: AuthState = {
  user: null,
  isLoading: true,
  isSyncing: false,
  lastSyncedAt: null,
  error: null,
};

const SERVER_AUTH_STATE: AuthState = {
  user: null,
  isLoading: true,
  isSyncing: false,
  lastSyncedAt: null,
  error: null,
};

function getCachedAuth() {
  return authSnapshot;
}

const getServerAuth = () => SERVER_AUTH_STATE;

function emitAuthChange(next: Partial<AuthState>) {
  authSnapshot = { ...authSnapshot, ...next };
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth-changed"));
  }
}

function subscribeAuth(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("auth-changed", callback);
  return () => {
    window.removeEventListener("auth-changed", callback);
  };
}

let checkSessionPromise: Promise<void> | null = null;
function initAuthCheck() {
  if (typeof window === "undefined" || checkSessionPromise) return;
  checkSessionPromise = fetch("/api/auth/me")
    .then((r) => r.json() as Promise<{ user: AuthUser | null }>)
    .then((d) => {
      emitAuthChange({ user: d.user, isLoading: false });
    })
    .catch(() => {
      emitAuthChange({ isLoading: false });
    });
}

export function useAuth() {
  const state = useSyncExternalStore(subscribeAuth, getCachedAuth, getServerAuth);

  useEffect(() => {
    initAuthCheck();
  }, []);

  const login = useCallback(async (identifier: string, pass: string): Promise<boolean> => {
    emitAuthChange({ error: null, isLoading: true });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password: pass }),
      });
      const data = await res.json() as { error?: string; user?: AuthUser };
      if (!res.ok || data.error) {
        emitAuthChange({ error: data.error || "Login failed", isLoading: false });
        return false;
      }
      if (data.user) {
        emitAuthChange({ user: data.user, isLoading: false, error: null });
        return true;
      }
      emitAuthChange({ isLoading: false });
      return false;
    } catch (err: unknown) {
      emitAuthChange({
        error: err instanceof Error ? err.message : "Connection failed",
        isLoading: false,
      });
      return false;
    }
  }, []);

  const register = useCallback(async (username: string, email: string, pass: string): Promise<boolean> => {
    emitAuthChange({ error: null, isLoading: true });
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password: pass }),
      });
      const data = await res.json() as { error?: string; user?: AuthUser };
      if (!res.ok || data.error) {
        emitAuthChange({ error: data.error || "Registration failed", isLoading: false });
        return false;
      }
      if (data.user) {
        emitAuthChange({ user: data.user, isLoading: false, error: null });
        return true;
      }
      emitAuthChange({ isLoading: false });
      return false;
    } catch (err: unknown) {
      emitAuthChange({
        error: err instanceof Error ? err.message : "Connection failed",
        isLoading: false,
      });
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    emitAuthChange({ isLoading: true });
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    emitAuthChange({ user: null, isLoading: false });
  }, []);

  const syncToCloud = useCallback(async (payload: SyncPayload): Promise<SyncResponseData | null> => {
    if (!authSnapshot.user) return null;
    emitAuthChange({ isSyncing: true, error: null });
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to sync");
      }
      const data = await res.json() as { success: boolean; syncedAt: number; data: SyncResponseData };
      emitAuthChange({ isSyncing: false, lastSyncedAt: data.syncedAt });
      return data.data;
    } catch (err: unknown) {
      emitAuthChange({
        isSyncing: false,
        error: err instanceof Error ? err.message : "Sync error",
      });
      return null;
    }
  }, []);

  return {
    user: state.user,
    isLoading: state.isLoading,
    isSyncing: state.isSyncing,
    lastSyncedAt: state.lastSyncedAt,
    error: state.error,
    login,
    register,
    logout,
    syncToCloud,
    clearError: () => emitAuthChange({ error: null }),
  };
}
