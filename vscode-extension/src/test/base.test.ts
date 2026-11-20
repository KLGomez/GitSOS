import { describe, expect, it, vi } from 'vitest';

const { registerCommandMock, showInformationMessageMock } = vi.hoisted(() => ({
  registerCommandMock: vi.fn(),
  showInformationMessageMock: vi.fn(),
}));

vi.mock('vscode', () => ({
  commands: {
    registerCommand: registerCommandMock,
  },
  window: {
    showInformationMessage: showInformationMessageMock,
  },
}));

import { HOLA_COMMAND_ID, getHolaMessage, registerHolaCommand } from '../commands/hola.js';
import { getMessages, resolveLocale, type Messages } from '../i18n/index.js';
import { DisabledAssistantProvider } from '../services/assistant/types.js';

describe('GitSOS Base (Fase 1)', () => {
  it('mantiene claves completas y no vacías para español e inglés', () => {
    const es = getMessages('es');
    const en = getMessages('en');
    const expectedKeys: (keyof Messages)[] = ['holaMessage', 'holaActionHint'];

    for (const key of expectedKeys) {
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

  it('expone el identificador y saludo del comando GitSOS: Hola', () => {
    expect(HOLA_COMMAND_ID).toBe('gitsos.hola');
    expect(getHolaMessage('es')).toContain('GitSOS');

    const fakeDisposable = { dispose: vi.fn() };
    registerCommandMock.mockReturnValueOnce(fakeDisposable);

    const disposable = registerHolaCommand();
    expect(disposable).toBe(fakeDisposable);
    expect(registerCommandMock).toHaveBeenCalledWith('gitsos.hola', expect.any(Function));

    const handler = registerCommandMock.mock.calls[0]?.[1] as (() => void) | undefined;
    expect(handler).toBeDefined();
    handler?.();
    expect(showInformationMessageMock).toHaveBeenCalledWith(getHolaMessage('es'));
  });

  it('mantiene el proveedor de IA deshabilitado en el MVP', async () => {
    const provider = new DisabledAssistantProvider();
    await expect(provider.isAvailable()).resolves.toBe(false);
    await expect(
      provider.ask({ prompt: '¿Cómo deshago un commit?', locale: 'es' })
    ).rejects.toThrow();
  });
});
