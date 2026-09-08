import { CustomizationSettings, ThemePreset } from "./types";

// localStorage key used by useCustomization
export const SETTINGS_STORAGE_KEY = "quote-screensaver-settings";
export const FAVORITES_STORAGE_KEY = "quote-screensaver-favorites";

// Fonts chosen for readability + mood on a fullscreen quote display.
// `value` must match the CSS variable name exposed in app/layout.tsx
export interface FontOptionItem {
  label: string;
  value: string;
}

export const FONT_OPTIONS: FontOptionItem[] = [
  { label: "Playfair Display (Serif)", value: "var(--font-playfair)" },
  { label: "Merriweather (Editorial)", value: "var(--font-merriweather)" },
  { label: "Lora (Literary)", value: "var(--font-lora)" },
  { label: "Cormorant Garamond (Classic)", value: "var(--font-cormorant)" },
  { label: "Poppins (Modern Sans)", value: "var(--font-poppins)" },
  { label: "Montserrat (Clean Bold)", value: "var(--font-montserrat)" },
  { label: "Inter (Neutral Tech)", value: "var(--font-inter)" },
  { label: "Raleway (Elegant Light)", value: "var(--font-raleway)" },
];

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "midnight-oled",
    name: "Midnight OLED",
    bgColor: "#09090b",
    textColor: "#fafafa",
    accentColor: "#a1a1aa",
    bgGradient: false,
    fontFamily: "var(--font-playfair)",
    description: "Deep, pure minimalist dark with high-contrast typography.",
  },
  {
    id: "warm-sunset",
    name: "Warm Sunset",
    bgColor: "#1a0f0a",
    textColor: "#ffedd5",
    accentColor: "#f97316",
    bgGradient: true,
    fontFamily: "var(--font-cormorant)",
    description: "Golden hour glow with cozy amber and peach undertones.",
  },
  {
    id: "cyberpunk-dark",
    name: "Neon Horizon",
    bgColor: "#090d16",
    textColor: "#e0f2fe",
    accentColor: "#38bdf8",
    bgGradient: true,
    fontFamily: "var(--font-montserrat)",
    description: "Deep atmospheric space-indigo with an electric cyan aura.",
  },
  {
    id: "forest-zen",
    name: "Forest Sanctuary",
    bgColor: "#071611",
    textColor: "#ecfdf5",
    accentColor: "#34d399",
    bgGradient: true,
    fontFamily: "var(--font-lora)",
    description: "Serene deep moss green evoking quiet woodland walks.",
  },
  {
    id: "nordic-glacier",
    name: "Nordic Slate",
    bgColor: "#0f172a",
    textColor: "#f1f5f9",
    accentColor: "#94a3b8",
    bgGradient: true,
    fontFamily: "var(--font-inter)",
    description: "Crisp Scandinavian cool gray with clean modern focus.",
  },
  {
    id: "matcha-cream",
    name: "Tea House & Cedar",
    bgColor: "#171412",
    textColor: "#fef3c7",
    accentColor: "#d97706",
    bgGradient: true,
    fontFamily: "var(--font-merriweather)",
    description: "Warm roasted tea tones for calm reading and reflection.",
  },
  {
    id: "paper-ink",
    name: "Editorial Paper",
    bgColor: "#fbf9f5",
    textColor: "#18181b",
    accentColor: "#71717a",
    bgGradient: false,
    fontFamily: "var(--font-cormorant)",
    description: "Warm tactile paper stock with sharp dark archival ink.",
  },
  {
    id: "lavender-twilight",
    name: "Lavender Dusk",
    bgColor: "#130e24",
    textColor: "#ede9fe",
    accentColor: "#a78bfa",
    bgGradient: true,
    fontFamily: "var(--font-raleway)",
    description: "Dreamy evening violet with gentle celestial luminescence.",
  },
];

export interface IntervalOption {
  label: string;
  seconds: number;
}

export const INTERVAL_OPTIONS: IntervalOption[] = [
  { label: "15 seconds (Demo)", seconds: 15 },
  { label: "30 seconds", seconds: 30 },
  { label: "1 minute", seconds: 60 },
  { label: "3 minutes", seconds: 180 },
  { label: "5 minutes", seconds: 300 },
  { label: "10 minutes", seconds: 600 },
  { label: "15 minutes", seconds: 900 },
  { label: "20 minutes (Standard)", seconds: 1200 },
  { label: "25 minutes", seconds: 1500 },
  { label: "30 minutes", seconds: 1800 },
  { label: "1 hour", seconds: 3600 },
];

export const QUOTE_CATEGORIES = [
  "All",
  "Motivation",
  "Discipline & Focus",
  "Wisdom & Philosophy",
  "Success & Ambition",
  "Mindfulness & Peace",
  "Courage & Resilience",
  "Creativity & Art",
] as const;

export const DEFAULT_SETTINGS: CustomizationSettings = {
  bgColor: "#09090b",
  textColor: "#fafafa",
  fontFamily: FONT_OPTIONS[0].value, // Playfair Display
  fontSize: 46,
  shuffleIntervalSeconds: 1200, // 20 minutes default
  useCustomQuote: false,
  customQuoteText: "",
  customQuoteAuthor: "",
  themeId: "midnight-oled",
  bgGradient: true,
  ambientParticles: true,
  selectedCategory: "All",
  onlyFavorites: false,
  showClock: true,
  clockFormat: "12h",
  showProgressBar: true,
  textAlignment: "center",
  ambientSoundType: "none",
  ambientSoundVolume: 0.5,
};