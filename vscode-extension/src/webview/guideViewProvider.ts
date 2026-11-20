import * as vscode from 'vscode';
import { getAllCommands, getCommandById } from '../content/loader.js';
import { getMessages } from '../i18n/index.js';
import { copyGitSosEntryCommand, runGitSosEntry } from '../services/commandRunner.js';
import { buildGuideHtml, generateNonce } from './guideHtml.js';
import { parseWebviewMessage, type ExtensionToWebviewMessage } from './protocol.js';

export const GUIDE_VIEW_ID = 'gitsos.guideView';

/**
 * Proveedor del panel lateral interactivo de GitSOS en la Activity Bar.
 */
export class GuideViewProvider implements vscode.WebviewViewProvider {
  public constructor(private readonly extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView): void {
    const { webview } = webviewView;
    const messages = getMessages('es');

    webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.extensionUri, 'media'),
        vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview'),
      ],
    };

    const styleUri = webview
      .asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'guide.css'))
      .toString();
    const scriptUri = webview
      .asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview', 'guide.js'))
      .toString();

    webview.html = buildGuideHtml({
      cspSource: webview.cspSource,
      styleUri,
      scriptUri,
      nonce: generateNonce(),
      commands: getAllCommands('es'),
      messages,
      locale: 'es',
    });

    webview.onDidReceiveMessage((rawMessage: unknown) => {
      void this.handleMessage(rawMessage, webview);
    });
  }

  /**
   * Procesa y valida mensajes recibidos desde el Webview contra el catálogo local.
   */
  public async handleMessage(
    rawMessage: unknown,
    webview: Pick<vscode.Webview, 'postMessage'>
  ): Promise<boolean> {
    const message = parseWebviewMessage(rawMessage);
    if (!message) {
      return false;
    }

    if (message.type === 'ready') {
      const messages = getMessages('es');
      const initPayload: ExtensionToWebviewMessage = {
        type: 'init',
        commands: getAllCommands('es'),
        strings: {
          resultsSingular: messages.resultsSingular,
          resultsPlural: messages.resultsPlural,
        },
      };
      await webview.postMessage(initPayload);
      return true;
    }

    const entry = getCommandById(message.commandId, 'es');
    if (!entry) {
      return false;
    }

    if (message.type === 'runCommand') {
      await runGitSosEntry(entry, { skipExplanationModal: true });
      return true;
    }

    await copyGitSosEntryCommand(entry);
    return true;
  }
}
