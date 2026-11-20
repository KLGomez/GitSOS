import { describe, expect, it } from 'vitest';
import { getMessages, resolveLocale, type Messages } from '../i18n/index.js';
import { DisabledAssistantProvider } from '../services/assistant/types.js';

describe('GitSOS Base e i18n', () => {
  it('mantiene claves completas, equivalentes y no vacías para español e inglés', () => {
    const es = getMessages('es');
    const en = getMessages('en');

    const esKeys = Object.keys(es).sort();
    const enKeys = Object.keys(en).sort();
    expect(esKeys).toEqual(enKeys);

    for (const key of esKeys as (keyof Messages)[]) {
      expect(es[key].trim().length).toBeGreaterThan(0);
      expect(en[key].trim().length).toBeGreaterThan(0);
    }
  });

  it('usa español por defecto en el MVP y deja preparada la resolución multi-idioma', () => {
    expect(resolveLocale('en-US')).toBe('es');
    expect(resolveLocale('en-US', true)).toBe('en');
    expect(resolveLocale('es-AR', true)).toBe('es');
    expect(resolveLocale(undefined, true)).toBe('es');
  });

  it('mantiene el proveedor de IA deshabilitado en el MVP', async () => {
    const provider = new DisabledAssistantProvider();
    await expect(provider.isAvailable()).resolves.toBe(false);
    await expect(
      provider.ask({ prompt: '¿Cómo deshago un commit?', locale: 'es' })
    ).rejects.toThrow();
  });
});
