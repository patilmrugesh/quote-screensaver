"use client";

import { useState } from "react";
import { Maximize2, Minimize2, Heart, Copy, Check, Download } from "lucide-react";
import { Quote, CustomizationSettings } from "@/lib/types";

interface QuoteDisplayProps {
  quote: Quote | null;
  settings: CustomizationSettings;
  onManualShuffle: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  isFavorite: boolean;
  onToggleFavorite: (quote: Quote) => void;
  progressPct?: number; // 0 to 100
}

export default function QuoteDisplay({
  quote,
  settings,
  onManualShuffle,
  onToggleFullscreen,
  isFullscreen,
  isFavorite,
  onToggleFavorite,
  progressPct = 0,
}: QuoteDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only shuffle if clicked directly on background
    if (e.target === e.currentTarget) {
      onManualShuffle();
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!quote) return;
    navigator.clipboard.writeText(`"${quote.text}" — ${quote.author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!quote) return;
    setIsExporting(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Background
      if (settings.bgGradient) {
        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          100,
          canvas.width / 2,
          canvas.height / 2,
          canvas.width / 1.2
        );
        gradient.addColorStop(0, settings.bgColor);
        gradient.addColorStop(1, "#000000");
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = settings.bgColor;
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Quote Category Tag
      if (quote.category) {
        ctx.font = "600 24px sans-serif";
        ctx.fillStyle = settings.textColor;
        ctx.globalAlpha = 0.5;
        ctx.textAlign = "center";
        ctx.fillText(quote.category.toUpperCase(), canvas.width / 2, canvas.height / 2 - 200);
      }

      // Quote Text (Word wrapping)
      ctx.globalAlpha = 1;
      ctx.fillStyle = settings.textColor;
      ctx.font = `600 ${Math.max(42, Math.min(64, settings.fontSize * 1.3))}px serif`;
      ctx.textAlign = "center";

      const words = `“${quote.text}”`.split(" ");
      const lines: string[] = [];
      let currentLine = "";
      const maxLineWidth = 1300;

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxLineWidth && i > 0) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);

      const lineHeight = settings.fontSize * 1.8;
      const startY = canvas.height / 2 - (lines.length * lineHeight) / 2 + 20;

      lines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
      });

      // Author Credit
      ctx.font = `italic 34px sans-serif`;
      ctx.globalAlpha = 0.75;
      ctx.fillText(`— ${quote.author}`, canvas.width / 2, startY + lines.length * lineHeight + 50);

      // Download
      const link = document.createElement("a");
      link.download = `quote-${quote.id}-${quote.author.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  if (!quote) {
    return (
      <div
        className="flex h-screen w-screen items-center justify-center"
        style={{ backgroundColor: settings.bgColor, color: settings.textColor }}
      >
        <p className="opacity-60 text-base">No quotes available in this category.</p>
      </div>
    );
  }

  // Determine dynamic background style (gradient or flat)
  const bgStyle = settings.bgGradient
    ? {
        background: `radial-gradient(circle at 50% 40%, ${settings.bgColor} 0%, #030304 90%)`,
      }
    : {
        backgroundColor: settings.bgColor,
      };

  return (
    <div
      onClick={handleBackgroundClick}
      className="screensaver-view relative flex h-screen w-screen cursor-pointer select-none items-center justify-center overflow-hidden px-8 py-14 transition-colors duration-700"
      style={
        {
          ...bgStyle,
          "--quote-text-color": settings.textColor,
          "--quote-font-family": settings.fontFamily,
          "--quote-font-size": `${settings.fontSize}px`,
        } as unknown as React.CSSProperties
      }
    >
      {/* Top Progress Bar */}
      {settings.showProgressBar && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-0 right-0 z-40 h-[2.5px] bg-white/10"
        >
          <div
            className="h-full bg-amber-400/80 transition-all duration-300 ease-linear"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      {/* Top Right Floating Controls: Fullscreen, Image Card Export, Copy */}
      <div className="fixed top-6 right-8 z-30 flex items-center gap-2">
        <button
          type="button"
          aria-label={copied ? "Copied" : "Copy quote"}
          title="Copy quote"
          onClick={handleCopy}
          className="rounded-full border border-white/10 bg-black/30 p-2.5 text-white/80 backdrop-blur-md transition hover:border-white/30 hover:bg-black/50 hover:text-white"
        >
          {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
        </button>

        <button
          type="button"
          aria-label="Export quote card image"
          title="Download quote card wallpaper (PNG)"
          onClick={handleExportImage}
          disabled={isExporting}
          className="rounded-full border border-white/10 bg-black/30 p-2.5 text-white/80 backdrop-blur-md transition hover:border-white/30 hover:bg-black/50 hover:text-white"
        >
          <Download size={18} />
        </button>

        <button
          type="button"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          title={isFullscreen ? "Exit fullscreen (F)" : "Enter fullscreen (F)"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFullscreen();
          }}
          className="rounded-full border border-white/10 bg-black/30 p-2.5 text-white/80 backdrop-blur-md transition hover:border-white/30 hover:bg-black/50 hover:text-white"
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

      {/* Main Quote Container with key-based pure animation */}
      <div
        key={quote.id}
        className={`animate-quote-in flex max-w-5xl flex-col transition-all duration-500 ${
          settings.textAlignment === "left"
            ? "items-start text-left"
            : settings.textAlignment === "card"
            ? "items-center rounded-3xl border border-white/10 bg-black/25 p-8 text-center shadow-2xl backdrop-blur-md sm:p-12"
            : "items-center text-center"
        }`}
      >
        {/* Category Badge */}
        {quote.category && (
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-amber-300/90 backdrop-blur-xs">
            <span>{quote.category}</span>
          </div>
        )}

        {/* Quote Content */}
        <blockquote
          className="leading-snug tracking-normal drop-shadow-sm transition-all duration-300"
          style={{
            color: "var(--quote-text-color)",
            fontFamily: "var(--quote-font-family)",
            fontSize: "var(--quote-font-size)",
          }}
        >
          &ldquo;{quote.text}&rdquo;
        </blockquote>

        {/* Author Credit & Favorite Quick Toggle */}
        <div className="mt-6 flex items-center gap-3">
          <p
            className="font-medium opacity-75"
            style={{
              color: "var(--quote-text-color)",
              fontFamily: "var(--quote-font-family)",
              fontSize: "calc(var(--quote-font-size) * 0.42)",
            }}
          >
            — {quote.author}
          </p>

          <button
            type="button"
            title={isFavorite ? "Remove from favorites (L)" : "Save to favorites (L)"}
            aria-label={isFavorite ? "Unfavorite quote" : "Favorite quote"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(quote);
            }}
            className="rounded-full p-1.5 transition hover:scale-110"
          >
            <Heart
              size={20}
              className={`transition-colors ${
                isFavorite
                  ? "fill-rose-500 text-rose-500"
                  : "text-white/40 hover:text-rose-400"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}