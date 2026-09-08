"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { Quote } from "@/lib/types";
import { FAVORITES_STORAGE_KEY } from "@/lib/constants";

let cachedFavorites: Quote[] | null = null;
let cachedRaw: string | null = null;

function getCachedFavorites(): Quote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (raw === cachedRaw && cachedFavorites) {
      return cachedFavorites;
    }
    cachedRaw = raw;
    if (raw) {
      cachedFavorites = JSON.parse(raw) as Quote[];
    } else {
      cachedFavorites = [];
    }
    return cachedFavorites;
  } catch {
    return [];
  }
}

function saveFavorites(favorites: Quote[]) {
  if (typeof window === "undefined") return;
  cachedFavorites = favorites;
  const serialized = JSON.stringify(favorites);
  cachedRaw = serialized;
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, serialized);
    setTimeout(() => {
      window.dispatchEvent(new Event("local-favorites-changed"));
    }, 0);
  } catch {
    setTimeout(() => {
      window.dispatchEvent(new Event("local-favorites-changed"));
    }, 0);
  }
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("local-favorites-changed", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("local-favorites-changed", callback);
  };
}

const SERVER_EMPTY_FAVORITES: Quote[] = [];
const getServerFavorites = () => SERVER_EMPTY_FAVORITES;

export function useFavorites() {
  const favorites = useSyncExternalStore(
    subscribe,
    getCachedFavorites,
    getServerFavorites
  );

  const favoriteIdSet = useMemo(() => {
    return new Set(favorites.map((q) => q.id));
  }, [favorites]);

  const isFavorite = useCallback(
    (quoteId: number | undefined) => {
      if (quoteId === undefined) return false;
      return favoriteIdSet.has(quoteId);
    },
    [favoriteIdSet]
  );

  const toggleFavorite = useCallback(
    (quote: Quote) => {
      const current = getCachedFavorites();
      const exists = current.some((q) => q.id === quote.id);
      if (exists) {
        saveFavorites(current.filter((q) => q.id !== quote.id));
      } else {
        saveFavorites([quote, ...current]);
      }
    },
    []
  );

  const removeFavorite = useCallback((quoteId: number) => {
    const current = getCachedFavorites();
    saveFavorites(current.filter((q) => q.id !== quoteId));
  }, []);

  const clearFavorites = useCallback(() => {
    saveFavorites([]);
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    clearFavorites,
  };
}
