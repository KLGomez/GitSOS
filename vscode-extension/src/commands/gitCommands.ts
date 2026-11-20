import * as vscode from 'vscode';
import { getPaletteCommands } from '../content/loader.js';
import { openSituationsQuickPick, runGitSosEntry } from '../services/commandRunner.js';

export const AYUDA_COMMAND_ID = 'gitsos.ayuda';

/**
 * Registra el QuickPick principal y los comandos clave alimentados desde commands.json.
 */
export function registerGitCommands(): vscode.Disposable[] {
  const disposables: vscode.Disposable[] = [];

  disposables.push(
    vscode.commands.registerCommand(AYUDA_COMMAND_ID, () => {
      void openSituationsQuickPick();
    })
  );

  for (const entry of getPaletteCommands('es')) {
    if (!entry.paletteCommandId) {
      continue;
    }

    disposables.push(
      vscode.commands.registerCommand(entry.paletteCommandId, () => {
        void runGitSosEntry(entry);
      })
    );
  }

  return disposables;
}
