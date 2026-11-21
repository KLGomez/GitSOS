import { enMessages } from './en.js';
import { esMessages, type Messages } from './es.js';

export type SupportedLocale = 'es' | 'en';
export type { Messages };

const MESSAGES_BY_LOCALE: Record<SupportedLocale, Messages> = {
  es: esMessages,
  en: enMessages,
};

/**
 * Resuelve el idioma activo para GitSOS.
 * En el MVP se mantiene español por defecto y la estructura queda lista para habilitar inglés.
 */
export function resolveLocale(language?: string, enableMultiLocale = false): SupportedLocale {
  if (!enableMultiLocale || !language) {
    return 'es';
  }

  const normalized = language.trim().toLowerCase();
  if (normalized.startsWith('en')) {
    return 'en';
  }

  return 'es';
}

export function getMessages(locale: SupportedLocale = 'es'): Messages {
  return MESSAGES_BY_LOCALE[locale];
}
