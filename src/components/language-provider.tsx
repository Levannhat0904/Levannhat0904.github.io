"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { dictionary, locales, type Locale } from "@/i18n/dictionary";

const STORAGE_KEY = "locale";
const CHANGE_EVENT = "locale-change";

// Picks the saved locale first, then the browser language, falling back to English.
function readLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && locales.includes(saved as Locale)) return saved as Locale;
  } catch {
    // Storage can be unavailable (private mode); ignore and fall through.
  }
  return navigator.language.toLowerCase().startsWith("vi") ? "vi" : "en";
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function writeLocale(next: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Persisting is a convenience only; the event below still updates this tab.
    sessionLocale = next;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// Fallback when localStorage throws, so switching still works for this page view.
let sessionLocale: Locale | null = null;

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (typeof dictionary)[Locale];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Server render (static export) is always English; the client then switches to the detected locale.
  const locale = useSyncExternalStore(
    subscribe,
    () => sessionLocale ?? readLocale(),
    () => "en" as Locale,
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale: writeLocale, t: dictionary[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
