import type * as vscode from 'vscode';
import { registerHolaCommand } from './commands/hola.js';

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(registerHolaCommand());
}

export function deactivate(): void {
  // Sin recursos pendientes por liberar en la Fase 1.
}
