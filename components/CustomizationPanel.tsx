"use client";

import { useState } from "react";
import { X, RotateCcw, Palette, Clock, Sliders, Pin, Sparkles } from "lucide-react";
import { CustomizationSettings, ThemePreset, TextAlignment, ClockFormat, AmbientSoundType } from "@/lib/types";
import {
  FONT_OPTIONS,
  THEME_PRESETS,
  INTERVAL_OPTIONS,
  QUOTE_CATEGORIES,
} from "@/lib/constants";

interface CustomizationPanelProps {
  settings: CustomizationSettings;
  onUpdateSetting: <K extends keyof CustomizationSettings>(
    key: K,
    value: CustomizationSettings[K]
  ) => void;
  onApplyTheme: (theme: ThemePreset) => void;
  onClose: () => void;
  onResetToDefaults: () => void;
  isOpen: boolean;
}

type TabType = "appearance" | "timing" | "categories" | "pinned";

export default function CustomizationPanel({
  settings,
  onUpdateSetting,
  onApplyTheme,
  onClose,
  onResetToDefaults,
  isOpen,
}: CustomizationPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("appearance");

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

      {/* Drawer Panel */}
      <aside
        role="dialog"
        aria-label="Screensaver Customization"
        aria-hidden={!isOpen}
        className={`fixed right-0 top-0 z-50 flex h-screen w-full sm:w-[420px] max-w-full sm:max-w-[92vw] flex-col border-l border-white/10 bg-neutral-900 text-neutral-100 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 sm:px-6 py-3.5 sm:py-4">
          <div className="flex items-center gap-2">
            <Sparkles size={19} className="text-amber-400" />
            <h2 className="text-sm sm:text-base font-semibold tracking-wide">Customization</h2>
          </div>
          <button
            type="button"
            aria-label="Close settings"
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-neutral-950/40 px-2 sm:px-4 text-xs font-medium overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("appearance")}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-3 transition ${
              activeTab === "appearance"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Palette size={14} />
            <span>Theme</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("timing")}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-3 transition ${
              activeTab === "timing"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Clock size={14} />
            <span>Timing</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-3 transition ${
              activeTab === "categories"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Sliders size={14} />
            <span>Focus</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pinned")}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-3 transition ${
              activeTab === "pinned"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Pin size={14} />
            <span>Pin</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {/* TAB 1: APPEARANCE & THEMES */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              {/* Preset Theme Grid */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Curated Themes
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {THEME_PRESETS.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => onApplyTheme(theme)}
                      className={`flex flex-col rounded-xl border p-3 text-left transition-all ${
                        settings.themeId === theme.id
                          ? "border-amber-400 bg-white/10 ring-1 ring-amber-400"
                          : "border-white/10 bg-neutral-800/60 hover:border-white/20 hover:bg-neutral-800"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div
                          className="h-4 w-4 rounded-full border border-white/20 shadow-xs"
                          style={{ backgroundColor: theme.bgColor }}
                        />
                        <div
                          className="h-2 w-8 rounded-full"
                          style={{ backgroundColor: theme.accentColor }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-neutral-100">
                        {theme.name}
                      </span>
                      <span className="mt-0.5 text-[10px] text-neutral-400 line-clamp-1">
                        {theme.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background & Text Colors */}
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-white/10 bg-neutral-800/40 p-4">
                <div>
                  <label htmlFor="bg-color" className="mb-1.5 block text-xs font-medium text-neutral-300">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="bg-color"
                      type="color"
                      value={settings.bgColor}
                      onChange={(e) => {
                        onUpdateSetting("bgColor", e.target.value);
                        onUpdateSetting("themeId", "custom");
                      }}
                      className="h-8 w-12 cursor-pointer rounded border border-white/10 bg-transparent p-0"
                    />
                    <span className="font-mono text-xs text-neutral-400">
                      {settings.bgColor}
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="text-color" className="mb-1.5 block text-xs font-medium text-neutral-300">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="text-color"
                      type="color"
                      value={settings.textColor}
                      onChange={(e) => {
                        onUpdateSetting("textColor", e.target.value);
                        onUpdateSetting("themeId", "custom");
                      }}
                      className="h-8 w-12 cursor-pointer rounded border border-white/10 bg-transparent p-0"
                    />
                    <span className="font-mono text-xs text-neutral-400">
                      {settings.textColor}
                    </span>
                  </div>
                </div>
              </div>

              {/* Background Gradient & Ambient Particles */}
              <div className="space-y-3 rounded-xl border border-white/10 bg-neutral-800/40 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-medium text-neutral-200">
                      Ambient Mesh Gradient
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Soft radial lighting around quote center
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.bgGradient}
                    onClick={() => onUpdateSetting("bgGradient", !settings.bgGradient)}
                    className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                      settings.bgGradient ? "bg-amber-400" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-neutral-900 transition-transform ${
                        settings.bgGradient ? "translate-x-4.5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div>
                    <span className="block text-xs font-medium text-neutral-200">
                      Floating Ambient Particles
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Subtle drifting stardust & embers
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.ambientParticles}
                    onClick={() =>
                      onUpdateSetting("ambientParticles", !settings.ambientParticles)
                    }
                    className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                      settings.ambientParticles ? "bg-amber-400" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-neutral-900 transition-transform ${
                        settings.ambientParticles ? "translate-x-4.5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Font Family */}
              <div>
                <label htmlFor="font-family" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Typography Style
                </label>
                <select
                  id="font-family"
                  value={settings.fontFamily}
                  onChange={(e) => onUpdateSetting("fontFamily", e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2.5 text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Size */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="font-size" className="text-xs font-medium text-neutral-300">
                    Quote Size
                  </label>
                  <span className="font-mono text-xs text-amber-300">
                    {settings.fontSize}px
                  </span>
                </div>
                <input
                  id="font-size"
                  type="range"
                  min={28}
                  max={72}
                  step={2}
                  value={settings.fontSize}
                  onChange={(e) => onUpdateSetting("fontSize", Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              {/* Layout Alignment */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Layout Alignment
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: "center", label: "Center" },
                      { id: "left", label: "Editorial Left" },
                      { id: "card", label: "Glass Card" },
                    ] as { id: TextAlignment; label: string }[]
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onUpdateSetting("textAlignment", item.id)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                        settings.textAlignment === item.id
                          ? "border-amber-400 bg-white/10 text-amber-300"
                          : "border-white/10 bg-neutral-800 text-neutral-300 hover:bg-neutral-750"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIMING & CLOCK */}
          {activeTab === "timing" && (
            <div className="space-y-6">
              {/* Shuffle Interval */}
              <div>
                <label htmlFor="shuffle-interval-select" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Auto-Shuffle Interval
                </label>
                <select
                  id="shuffle-interval-select"
                  value={settings.shuffleIntervalSeconds}
                  onChange={(e) =>
                    onUpdateSetting("shuffleIntervalSeconds", Number(e.target.value))
                  }
                  className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2.5 text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  {INTERVAL_OPTIONS.map((opt) => (
                    <option key={opt.seconds} value={opt.seconds}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Progress Bar Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-neutral-800/40 p-4">
                <div>
                  <span className="block text-xs font-medium text-neutral-200">
                    Countdown Progress Bar
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Subtle indicator bar along the top edge
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.showProgressBar}
                  onClick={() =>
                    onUpdateSetting("showProgressBar", !settings.showProgressBar)
                  }
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                    settings.showProgressBar ? "bg-amber-400" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-neutral-900 transition-transform ${
                      settings.showProgressBar ? "translate-x-4.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Live Clock Toggle */}
              <div className="space-y-3 rounded-xl border border-white/10 bg-neutral-800/40 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-medium text-neutral-200">
                      Live Clock & Date
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Non-intrusive desk clock overlay
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.showClock}
                    onClick={() => onUpdateSetting("showClock", !settings.showClock)}
                    className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                      settings.showClock ? "bg-amber-400" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-neutral-900 transition-transform ${
                        settings.showClock ? "translate-x-4.5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {settings.showClock && (
                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <span className="text-xs text-neutral-300">Clock Format</span>
                    <div className="flex gap-1.5">
                      {(["12h", "24h"] as ClockFormat[]).map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => onUpdateSetting("clockFormat", fmt)}
                          className={`rounded-md px-2.5 py-1 text-[11px] font-mono transition ${
                            settings.clockFormat === fmt
                              ? "bg-amber-400 text-neutral-950 font-bold"
                              : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                          }`}
                        >
                          {fmt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Ambient Audio Section */}
              <div className="space-y-3 rounded-xl border border-white/10 bg-neutral-800/40 p-4">
                <label className="block text-xs font-medium text-neutral-200">
                  Ambient Study Soundscape
                </label>
                <select
                  value={settings.ambientSoundType}
                  onChange={(e) =>
                    onUpdateSetting("ambientSoundType", e.target.value as AmbientSoundType)
                  }
                  className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option value="none">None (Muted)</option>
                  <option value="rain">Gentle Rain</option>
                  <option value="brown-noise">Deep Focus (Brown Noise)</option>
                  <option value="binaural">Alpha Wave Drone (Binaural)</option>
                  <option value="campfire">Campfire Crackle</option>
                </select>

                {settings.ambientSoundType !== "none" && (
                  <div className="pt-2">
                    <div className="mb-1 flex justify-between text-[11px] text-neutral-400">
                      <span>Sound Volume</span>
                      <span>{Math.round(settings.ambientSoundVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={settings.ambientSoundVolume}
                      onChange={(e) =>
                        onUpdateSetting("ambientSoundVolume", parseFloat(e.target.value))
                      }
                      className="w-full accent-amber-400"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES & FOCUS */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Category Filter
                </label>
                <div className="flex flex-wrap gap-2">
                  {QUOTE_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => onUpdateSetting("selectedCategory", cat)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        settings.selectedCategory === cat
                          ? "border-amber-400 bg-amber-400/20 text-amber-300 font-semibold"
                          : "border-white/10 bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Only favorites toggle */}
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-neutral-800/40 p-4">
                <div>
                  <span className="block text-xs font-medium text-neutral-200">
                    Shuffle Only Starred Quotes
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Cycle exclusively through your bookmarked quotes
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.onlyFavorites}
                  onClick={() =>
                    onUpdateSetting("onlyFavorites", !settings.onlyFavorites)
                  }
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                    settings.onlyFavorites ? "bg-rose-500" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                      settings.onlyFavorites ? "translate-x-4.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: PIN CUSTOM QUOTE */}
          {activeTab === "pinned" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-neutral-800/40 p-4">
                <div>
                  <span className="block text-xs font-medium text-neutral-200">
                    Pin a Custom Quote
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Keep a specific mantra or reminder locked on screen
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.useCustomQuote}
                  onClick={() =>
                    onUpdateSetting("useCustomQuote", !settings.useCustomQuote)
                  }
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                    settings.useCustomQuote ? "bg-amber-400" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-neutral-900 transition-transform ${
                      settings.useCustomQuote ? "translate-x-4.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div>
                <label
                  htmlFor="custom-quote-text"
                  className="mb-1.5 block text-xs font-medium text-neutral-400"
                >
                  Custom Quote Text
                </label>
                <textarea
                  id="custom-quote-text"
                  value={settings.customQuoteText}
                  onChange={(e) => onUpdateSetting("customQuoteText", e.target.value)}
                  rows={4}
                  placeholder="Type your personal mission statement or reminder..."
                  className="w-full resize-none rounded-lg border border-white/10 bg-neutral-800 px-3 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label
                  htmlFor="custom-quote-author"
                  className="mb-1.5 block text-xs font-medium text-neutral-400"
                >
                  Author / Attribution (optional)
                </label>
                <input
                  id="custom-quote-author"
                  type="text"
                  value={settings.customQuoteAuthor}
                  onChange={(e) =>
                    onUpdateSetting("customQuoteAuthor", e.target.value)
                  }
                  placeholder="e.g. Marcus Aurelius, or My Mantra"
                  className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer with Reset Button */}
        <div className="border-t border-white/10 bg-neutral-950/50 p-4">
          <button
            type="button"
            onClick={onResetToDefaults}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-2.5 text-xs font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white"
          >
            <RotateCcw size={14} />
            <span>Reset All to Defaults</span>
          </button>
        </div>
      </aside>
    </>
  );
}