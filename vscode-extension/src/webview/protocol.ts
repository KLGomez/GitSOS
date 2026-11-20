import type { CommandCategory, GitSosCommandEntry } from '../content/types.js';

export type CategoryFilter = 'todas' | CommandCategory;

export type WebviewToExtensionMessage =
  | { readonly type: 'ready' }
  | { readonly type: 'runCommand'; readonly commandId: string }
  | { readonly type: 'copyCommand'; readonly commandId: string };

export interface ExtensionToWebviewMessage {
  readonly type: 'init';
  readonly commands: readonly GitSosCommandEntry[];
  readonly strings: {
    readonly resultsSingular: string;
    readonly resultsPlural: string;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Valida mensajes entrantes desde el Webview para evitar comandos arbitrarios o payloads malformados.
 */
export function parseWebviewMessage(raw: unknown): WebviewToExtensionMessage | undefined {
  if (!isRecord(raw) || typeof raw.type !== 'string') {
    return undefined;
  }

  if (raw.type === 'ready') {
    return { type: 'ready' };
  }

  if (raw.type === 'runCommand' || raw.type === 'copyCommand') {
    if (typeof raw.commandId !== 'string') {
      return undefined;
    }

    const commandId = raw.commandId.trim();
    if (!commandId || !/^[a-z0-9-]+$/i.test(commandId)) {
      return undefined;
    }

    return {
      type: raw.type,
      commandId,
    };
  }

  return undefined;
}
