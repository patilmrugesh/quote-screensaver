"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Quote } from "@/lib/types";

interface UseQuoteShuffleProps {
  quotes: Quote[];
  shuffleIntervalSeconds: number;
  lockedQuote?: Quote | null;
  selectedCategory?: string;
  onlyFavorites?: boolean;
  isFavorite?: (id: number) => boolean;
}

export function useQuoteShuffle({
  quotes,
  shuffleIntervalSeconds,
  lockedQuote = null,
  selectedCategory = "All",
  onlyFavorites = false,
  isFavorite,
}: UseQuoteShuffleProps) {
  // Filter quotes based on selected category and favorites filter
  const filteredQuotes = useMemo(() => {
    let result = quotes;
    if (selectedCategory && selectedCategory !== "All") {
      result = result.filter((q) => q.category === selectedCategory);
    }
    if (onlyFavorites && isFavorite) {
      result = result.filter((q) => isFavorite(q.id));
    }
    return result.length > 0 ? result : quotes;
  }, [quotes, selectedCategory, onlyFavorites, isFavorite]);

  // Pure initial state (first quote or null) - satisfies React 19 rules
  const [history, setHistory] = useState<Quote[]>(() => {
    return quotes.length > 0 ? [quotes[0]] : [];
  });
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100

  const isLocked = lockedQuote !== null;

  // Active quote derived from lockedQuote or history[historyIndex]
  const currentQuote = useMemo(() => {
    if (isLocked) return lockedQuote;
    return history[historyIndex] ?? (filteredQuotes[0] ?? null);
  }, [isLocked, lockedQuote, history, historyIndex, filteredQuotes]);

  // Keep refs for interval callback to prevent stale closures
  const filteredQuotesRef = useRef(filteredQuotes);
  useEffect(() => {
    filteredQuotesRef.current = filteredQuotes;
  }, [filteredQuotes]);

  const currentQuoteRef = useRef(currentQuote);
  useEffect(() => {
    currentQuoteRef.current = currentQuote;
  }, [currentQuote]);

  const historyIndexRef = useRef(historyIndex);
  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  const historyRef = useRef(history);
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  // Function to pick a new random quote from filtered list
  const pickNewQuote = useCallback(() => {
    const pool = filteredQuotesRef.current;
    if (pool.length === 0) return;

    if (pool.length === 1) {
      const single = pool[0];
      setHistory((prev) => [...prev.slice(-30), single]);
      setHistoryIndex((prev) => prev + 1);
      return;
    }

    let next: Quote;
    const currentId = currentQuoteRef.current?.id;
    do {
      const idx = Math.floor(Math.random() * pool.length);
      next = pool[idx];
    } while (next.id === currentId && pool.length > 1);

    setHistory((prev) => {
      // Keep up to 50 previous items in memory
      const currentStack = prev.slice(0, historyIndexRef.current + 1);
      return [...currentStack.slice(-50), next];
    });
    setHistoryIndex((prev) => {
      const newStackLen = Math.min(prev + 1, 50);
      return newStackLen;
    });
    setProgress(0);
  }, []);

  // Manual Next / Shuffle
  const nextQuote = useCallback(() => {
    if (isLocked) return;
    if (historyIndexRef.current < historyRef.current.length - 1) {
      // Navigate forward in existing history
      setHistoryIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      // Pick a brand new quote
      pickNewQuote();
    }
  }, [isLocked, pickNewQuote]);

  // Manual Previous
  const previousQuote = useCallback(() => {
    if (isLocked) return;
    if (historyIndexRef.current > 0) {
      setHistoryIndex((prev) => prev - 1);
      setProgress(0);
    }
  }, [isLocked]);

  // Direct select (e.g. from favorites modal)
  const selectQuote = useCallback(
    (quote: Quote) => {
      if (isLocked) return;
      setHistory((prev) => [...prev.slice(0, historyIndexRef.current + 1), quote]);
      setHistoryIndex((prev) => prev + 1);
      setProgress(0);
    },
    [isLocked]
  );

  const togglePause = useCallback(() => {
    if (isLocked) return;
    setIsPaused((prev) => !prev);
  }, [isLocked]);

  // Auto-shuffle timer & progress counter
  useEffect(() => {
    if (isLocked || isPaused || filteredQuotes.length <= 1) {
      return;
    }

    const durationMs = Math.max(5, shuffleIntervalSeconds) * 1000;
    const intervalTickMs = 200; // Update progress every 200ms
    let elapsedMs = 0;

    const progressTimer = setInterval(() => {
      elapsedMs += intervalTickMs;
      const pct = Math.min(100, (elapsedMs / durationMs) * 100);
      setProgress(pct);

      if (elapsedMs >= durationMs) {
        elapsedMs = 0;
        pickNewQuote();
      }
    }, intervalTickMs);

    return () => {
      clearInterval(progressTimer);
    };
  }, [shuffleIntervalSeconds, isPaused, isLocked, filteredQuotes.length, pickNewQuote]);

  return {
    currentQuote,
    nextQuote,
    previousQuote,
    selectQuote,
    isPaused: isLocked ? true : isPaused,
    togglePause,
    isLocked,
    progress,
    hasPrevious: historyIndex > 0 && !isLocked,
    hasNext: !isLocked,
    totalQuotesInFilter: filteredQuotes.length,
  };
}