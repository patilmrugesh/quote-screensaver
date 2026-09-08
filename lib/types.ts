export interface Quote {
  id: number;
  text: string;
  author: string;
  category?: string;
}

export type TextAlignment = "center" | "left" | "card";
export type ClockFormat = "12h" | "24h";
export type AmbientSoundType = "none" | "rain" | "brown-noise" | "binaural" | "campfire";

export interface ThemePreset {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  bgGradient?: boolean;
  fontFamily: string;
  description: string;
}

export interface CustomizationSettings {
  bgColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: number; // in pixels
  shuffleIntervalSeconds: number; // Duration in seconds (e.g. 15, 30, 60, 300, 1200)
  useCustomQuote: boolean;
  customQuoteText: string;
  customQuoteAuthor: string;
  // Extended configuration
  themeId: string;
  bgGradient: boolean;
  ambientParticles: boolean;
  selectedCategory: string; // "all" or specific category
  onlyFavorites: boolean;
  showClock: boolean;
  clockFormat: ClockFormat;
  showProgressBar: boolean;
  textAlignment: TextAlignment;
  ambientSoundType: AmbientSoundType;
  ambientSoundVolume: number; // 0 to 1
}