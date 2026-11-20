import * as vscode from 'vscode';
import { registerGitCommands } from './commands/gitCommands.js';
import { GUIDE_VIEW_ID, GuideViewProvider } from './webview/guideViewProvider.js';

export function activate(context: vscode.ExtensionContext): void {
  const guideProvider = new GuideViewProvider(context.extensionUri);

  context.subscriptions.push(
    ...registerGitCommands(),
    vscode.window.registerWebviewViewProvider(GUIDE_VIEW_ID, guideProvider, {
      webviewOptions: { retainContextWhenHidden: true },
    })
  );
}

export function deactivate(): void {
  // Sin recursos pendientes por liberar en la Fase 3.
}
