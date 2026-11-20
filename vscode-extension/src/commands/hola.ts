import * as vscode from 'vscode';
import { getMessages, type SupportedLocale } from '../i18n/index.js';

export const HOLA_COMMAND_ID = 'gitsos.hola';

export function getHolaMessage(locale: SupportedLocale = 'es'): string {
  return getMessages(locale).holaMessage;
}

export function registerHolaCommand(): vscode.Disposable {
  return vscode.commands.registerCommand(HOLA_COMMAND_ID, () => {
    void vscode.window.showInformationMessage(getHolaMessage('es'));
  });
}
