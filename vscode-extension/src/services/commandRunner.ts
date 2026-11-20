import * as vscode from 'vscode';
import { getAllCommands } from '../content/loader.js';
import type { GitSosCommandEntry } from '../content/types.js';
import { getMessages } from '../i18n/index.js';
import { buildGitCommand, validateInput } from './commandBuilder.js';

interface SituationQuickPickItem extends vscode.QuickPickItem {
  readonly entry: GitSosCommandEntry;
}

/**
 * Formatea la explicación, pasos guía, comando y advertencias para el diálogo modal.
 */
export function formatCommandDetail(entry: GitSosCommandEntry): string {
  const sections: string[] = [
    `Situación: ${entry.situacion}`,
    `Explicación:\n${entry.explicacionSimple}`,
  ];

  if (entry.pasosGuia && entry.pasosGuia.length > 0) {
    sections.push(`Pasos recomendados:\n${entry.pasosGuia.join('\n')}`);
  }

  sections.push(`Comando Git:\n${entry.comandoGit}`);

  if (entry.advertencias.length > 0) {
    sections.push(
      `Advertencias:\n${entry.advertencias.map((warning) => `• ${warning}`).join('\n')}`
    );
  }

  return sections.join('\n\n');
}

function formatDestructiveConfirmationDetail(
  entry: GitSosCommandEntry,
  finalCommand: string
): string {
  const lines: string[] = [`Se ejecutará en tu terminal:\n${finalCommand}`];

  if (entry.advertencias.length > 0) {
    lines.push(
      `Tené en cuenta antes de seguir:\n${entry.advertencias.map((warning) => `• ${warning}`).join('\n')}`
    );
  }

  return lines.join('\n\n');
}

/**
 * Reutiliza la terminal integrada de GitSOS si sigue activa o crea una nueva.
 */
export function getOrCreateGitSosTerminal(cwd: string): vscode.Terminal {
  const messages = getMessages('es');
  const existing = vscode.window.terminals.find(
    (terminal) => terminal.name === messages.terminalName && terminal.exitStatus === undefined
  );

  if (existing) {
    return existing;
  }

  return vscode.window.createTerminal({
    name: messages.terminalName,
    cwd,
  });
}

/**
 * Copia la plantilla o comando Git de la entrada al portapapeles y notifica al usuario.
 */
export async function copyGitSosEntryCommand(entry: GitSosCommandEntry): Promise<void> {
  const messages = getMessages('es');
  await vscode.env.clipboard.writeText(entry.comandoGit);
  void vscode.window.showInformationMessage(messages.commandCopiedInfo);
}

/**
 * Muestra explicación (salvo si se invoca desde el panel), pide parámetros si faltan,
 * solicita confirmación en acciones destructivas y ejecuta el comando en la terminal integrada.
 */
export async function runGitSosEntry(
  entry: GitSosCommandEntry,
  options?: { skipExplanationModal?: boolean }
): Promise<boolean> {
  const messages = getMessages('es');

  if (!options?.skipExplanationModal) {
    const detail = formatCommandDetail(entry);

    const selection = await vscode.window.showInformationMessage(
      `GitSOS — ${entry.titulo}`,
      { modal: true, detail },
      messages.runInTerminalButton,
      messages.copyCommandButton
    );

    if (selection === messages.copyCommandButton) {
      await copyGitSosEntryCommand(entry);
      return false;
    }

    if (selection !== messages.runInTerminalButton) {
      return false;
    }
  }

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    void vscode.window.showWarningMessage(messages.noWorkspaceWarning);
    return false;
  }

  const collectedValues: Record<string, string> = {};
  for (const spec of entry.inputs ?? []) {
    const value = await vscode.window.showInputBox({
      title: `GitSOS — ${entry.titulo}`,
      prompt: spec.prompt,
      placeHolder: spec.placeholder,
      ignoreFocusOut: true,
      validateInput: (candidate) => validateInput(candidate, spec.validation),
    });

    if (value === undefined) {
      return false;
    }

    collectedValues[spec.key] = value;
  }

  const finalCommand = buildGitCommand(entry, collectedValues);

  if (entry.esDestructivo) {
    const confirmed = await vscode.window.showWarningMessage(
      messages.confirmDestructiveTitle,
      {
        modal: true,
        detail: formatDestructiveConfirmationDetail(entry, finalCommand),
      },
      messages.confirmDestructiveButton
    );

    if (confirmed !== messages.confirmDestructiveButton) {
      return false;
    }
  }

  const terminal = getOrCreateGitSosTerminal(workspaceFolder.uri.fsPath);
  terminal.show(true);
  terminal.sendText(finalCommand, true);
  return true;
}

/**
 * Abre el selector rápido "GitSOS: ¿Qué necesito hacer?" con todas las situaciones del catálogo.
 */
export async function openSituationsQuickPick(): Promise<void> {
  const messages = getMessages('es');
  const entries = getAllCommands('es');

  const items: SituationQuickPickItem[] = entries.map((entry) => ({
    label: `${entry.esDestructivo ? '$(warning)' : '$(terminal)'} ${entry.titulo}`,
    description: entry.comandoGit,
    detail: entry.situacion,
    entry,
  }));

  const selected = await vscode.window.showQuickPick(items, {
    title: messages.quickPickTitle,
    placeHolder: messages.quickPickPlaceholder,
    matchOnDescription: true,
    matchOnDetail: true,
  });

  if (!selected) {
    return;
  }

  await runGitSosEntry(selected.entry);
}
