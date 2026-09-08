"use client";

import { useCallback, useSyncExternalStore } from "react";
import { CustomizationSettings, ThemePreset } from "@/lib/types";
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from "@/lib/constants";

let cachedSettings: CustomizationSettings | null = null;
let cachedRaw: string | null = null;

function getCachedSettings(): CustomizationSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw === cachedRaw && cachedSettings) {
      return cachedSettings;
    }
    cachedRaw = raw;
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CustomizationSettings>;
      cachedSettings = { ...DEFAULT_SETTINGS, ...parsed };
    } else {
      cachedSettings = DEFAULT_SETTINGS;
    }
    return cachedSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(newSettings: CustomizationSettings) {
  if (typeof window === "undefined") return;
  cachedSettings = newSettings;
  const serialized = JSON.stringify(newSettings);
  cachedRaw = serialized;
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, serialized);
    setTimeout(() => {
      window.dispatchEvent(new Event("local-settings-changed"));
    }, 0);
  } catch {
    // In private browsing or storage full, still trigger update
    setTimeout(() => {
      window.dispatchEvent(new Event("local-settings-changed"));
    }, 0);
  }
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("local-settings-changed", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("local-settings-changed", callback);
  };
}

const getServerSettings = () => DEFAULT_SETTINGS;

export function useCustomization() {
  const settings = useSyncExternalStore(
    subscribe,
    getCachedSettings,
    getServerSettings
  );

  const updateSetting = useCallback(
    <K extends keyof CustomizationSettings>(
      key: K,
      value: CustomizationSettings[K]
    ) => {
      const current = getCachedSettings();
      saveSettings({ ...current, [key]: value });
    },
    []
  );

  const applyTheme = useCallback((theme: ThemePreset) => {
    const current = getCachedSettings();
    saveSettings({
      ...current,
      themeId: theme.id,
      bgColor: theme.bgColor,
      textColor: theme.textColor,
      fontFamily: theme.fontFamily,
      bgGradient: theme.bgGradient ?? current.bgGradient,
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    saveSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    updateSetting,
    applyTheme,
    resetToDefaults,
  };
}