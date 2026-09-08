"use client";

import { useState, useMemo } from "react";
import { X, Heart, Trash2, Copy, Check, ExternalLink, Search } from "lucide-react";
import { Quote } from "@/lib/types";

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Quote[];
  onSelectQuote: (quote: Quote) => void;
  onRemoveFavorite: (id: number) => void;
  onlyFavorites: boolean;
  onToggleOnlyFavorites: (enabled: boolean) => void;
}

export default function FavoritesModal({
  isOpen,
  onClose,
  favorites,
  onSelectQuote,
  onRemoveFavorite,
  onlyFavorites,
  onToggleOnlyFavorites,
}: FavoritesModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return favorites;
    const q = searchQuery.toLowerCase();
    return favorites.filter(
      (item) =>
        item.text.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
    );
  }, [favorites, searchQuery]);

  const handleCopy = (quote: Quote) => {
    navigator.clipboard.writeText(`"${quote.text}" — ${quote.author}`);
    setCopiedId(quote.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Favorite Quotes"
        aria-hidden={!isOpen}
        className={`fixed left-0 top-0 z-50 flex h-screen w-full sm:w-96 max-w-full sm:max-w-[90vw] flex-col border-r border-white/10 bg-neutral-900 px-4 sm:px-6 py-4 sm:py-6 text-neutral-100 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart size={20} className="fill-rose-500 text-rose-500" />
            <h2 className="text-lg font-semibold tracking-wide">
              Favorites ({favorites.length})
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close favorites"
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter only favorites toggle */}
        <div className="mb-4 flex items-center justify-between rounded-lg border border-white/10 bg-neutral-800/80 p-3">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-neutral-200">
              Shuffle Only Favorites
            </span>
            <span className="text-[11px] text-neutral-400">
              Screensaver will only rotate starred quotes
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={onlyFavorites}
            disabled={favorites.length === 0}
            onClick={() => onToggleOnlyFavorites(!onlyFavorites)}
            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-40 ${
              onlyFavorites ? "bg-rose-500" : "bg-white/20"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                onlyFavorites ? "translate-x-4.5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Search bar */}
        {favorites.length > 0 && (
          <div className="relative mb-4">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved quotes..."
              className="w-full rounded-md border border-white/10 bg-neutral-800/90 py-2 pl-9 pr-3 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
          </div>
        )}

        {/* Quote list */}
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {favorites.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center text-neutral-400">
              <Heart size={36} className="mb-3 opacity-30" />
              <p className="text-sm font-medium">No saved quotes yet</p>
              <p className="mt-1 text-xs text-neutral-500">
                Click the heart icon on any quote or press &lsquo;L&rsquo; to save it to your collection.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-xs text-neutral-500">
              No quotes match &ldquo;{searchQuery}&rdquo;
            </p>
          ) : (
            filtered.map((quote) => (
              <div
                key={quote.id}
                className="group relative rounded-xl border border-white/10 bg-neutral-800/60 p-3.5 transition hover:border-white/20 hover:bg-neutral-800"
              >
                {quote.category && (
                  <span className="mb-1.5 inline-block rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-300/90">
                    {quote.category}
                  </span>
                )}
                <p className="text-xs leading-relaxed text-neutral-200">
                  &ldquo;{quote.text}&rdquo;
                </p>
                <p className="mt-1 text-right text-[11px] font-medium text-neutral-400">
                  — {quote.author}
                </p>

                <div className="mt-3 flex items-center justify-end gap-1.5 border-t border-white/5 pt-2">
                  <button
                    type="button"
                    title="Jump to this quote on screen"
                    onClick={() => {
                      onSelectQuote(quote);
                      onClose();
                    }}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-neutral-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <ExternalLink size={13} />
                    <span>View</span>
                  </button>
                  <button
                    type="button"
                    title="Copy quote"
                    onClick={() => handleCopy(quote)}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-neutral-300 transition hover:bg-white/10 hover:text-white"
                  >
                    {copiedId === quote.id ? (
                      <>
                        <Check size={13} className="text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    title="Remove from favorites"
                    onClick={() => onRemoveFavorite(quote.id)}
                    className="rounded-md p-1 text-neutral-400 transition hover:bg-rose-500/20 hover:text-rose-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
