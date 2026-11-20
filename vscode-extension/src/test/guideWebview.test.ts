import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { runGitSosEntryMock, copyGitSosEntryCommandMock } = vi.hoisted(() => ({
  runGitSosEntryMock: vi.fn(),
  copyGitSosEntryCommandMock: vi.fn(),
}));

vi.mock('vscode', () => ({
  Uri: {
    joinPath: (base: { path: string }, ...segments: string[]) => ({
      path: [base.path, ...segments].join('/'),
    }),
  },
}));

vi.mock('../services/commandRunner.js', () => ({
  runGitSosEntry: runGitSosEntryMock,
  copyGitSosEntryCommand: copyGitSosEntryCommandMock,
}));

import { getAllCommands } from '../content/loader.js';
import type { GitSosCommandEntry } from '../content/types.js';
import { getMessages } from '../i18n/index.js';
import { buildGuideHtml, escapeHtml, generateNonce } from '../webview/guideHtml.js';
import { GuideViewProvider } from '../webview/guideViewProvider.js';
import { parseWebviewMessage } from '../webview/protocol.js';

describe('Webview de la guía lateral (Fase 3)', () => {
  const messages = getMessages('es');
  const commands = getAllCommands('es');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('genera HTML offline con CSP estricta, nonce único, accesibilidad y sin scripts inline sin nonce', () => {
    const nonce = generateNonce();
    const html = buildGuideHtml({
      cspSource: 'vscode-webview://123',
      styleUri: 'vscode-webview://123/media/guide.css',
      scriptUri: 'vscode-webview://123/dist/webview/guide.js',
      nonce,
      commands,
      messages,
      locale: 'es',
    });

    expect(html).toContain(
      `default-src 'none'; style-src vscode-webview://123; script-src 'nonce-${nonce}'; img-src vscode-webview://123; font-src vscode-webview://123;`
    );
    expect(html).not.toContain('unsafe-inline');
    expect(html).not.toContain('unsafe-eval');
    expect(html).not.toMatch(/https?:\/\//i);
    expect(html).not.toMatch(/\sonclick=/i);

    const scriptTags = html.match(/<script\b[^>]*>/gi) ?? [];
    expect(scriptTags).toHaveLength(1);
    expect(scriptTags[0]).toContain(`nonce="${nonce}"`);
    expect(scriptTags[0]).toContain('src="vscode-webview://123/dist/webview/guide.js"');

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-label="Ejecutar en terminal:');
    expect(html).toContain('Working Directory');
    expect(html).toContain('Staging Area');
    expect(html).toContain('Local Repository');
    expect(html).toContain(messages.cardDestructiveBadge);
    expect(html).toContain(
      '<pre class="command-code-block"><code>git add .\ngit commit -m &quot;{{mensaje}}&quot;</code></pre>'
    );
    expect(html).not.toContain('git add . &amp;&amp;');

    const cardCount = commands.length;
    expect(html.match(/class="category-badge"/g)).toHaveLength(cardCount);
    expect(html.match(/class="action-btn action-btn-primary"/g)).toHaveLength(cardCount);
    expect(html.match(/class="action-btn action-btn-secondary"/g)).toHaveLength(cardCount);
    expect(html).toContain(`<span>${messages.categoryEmergencias}</span>`);
    expect(html).toContain(`<span>${messages.categoryFlujoDiario}</span>`);
    expect(html).toContain(`<span>${messages.categoryRamas}</span>`);
    expect(html).toContain(`<span>${messages.categoryRemoto}</span>`);
    expect(html).toContain('data-destructive="true"');
    expect(html).toContain('data-destructive="false"');

    const badgeMatches = [
      ...html.matchAll(
        /<span class="category-badge">(<svg[^>]*aria-hidden="true"[^>]*>.*?<\/svg>)<span>([^<]+)<\/span><\/span>/g
      ),
    ];
    expect(badgeMatches).toHaveLength(cardCount);

    const iconByLabel = new Map<string, string>();
    for (const match of badgeMatches) {
      const svg = match[1];
      const label = match[2];
      if (svg && label) {
        if (iconByLabel.has(label)) {
          expect(iconByLabel.get(label)).toBe(svg);
        } else {
          iconByLabel.set(label, svg);
        }
      }
    }

    expect(iconByLabel.size).toBe(4);
    expect(new Set(iconByLabel.values()).size).toBe(4);
  });

  it('escapa contenido dinámico para prevenir XSS', () => {
    const xssEntry: GitSosCommandEntry = {
      id: 'xss-test',
      titulo: '<script>alert("xss")</script>',
      situacion: '"><img src=x onerror=alert(1)>',
      explicacionSimple: "Texto con 'comillas' & <tags>",
      comandoGit: 'git status && <script>',
      advertencias: ['<b>alerta</b>'],
      esDestructivo: false,
      categoria: 'emergencias',
      pasosGuia: ['<svg onload=alert(1)>'],
    };

    const html = buildGuideHtml({
      cspSource: 'vscode-webview://123',
      styleUri: 'vscode-webview://123/media/guide.css',
      scriptUri: 'vscode-webview://123/dist/webview/guide.js',
      nonce: 'test-nonce',
      commands: [xssEntry],
      messages,
    });

    expect(html).not.toContain('<script>alert("xss")</script>');
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('<svg onload=alert(1)>');
    expect(html).toContain(escapeHtml(xssEntry.titulo));
    expect(html).toContain(escapeHtml(xssEntry.situacion));
  });

  it('usa únicamente variables de tema --vscode-* en media/guide.css sin colores fijos', () => {
    const cssPath = path.resolve(__dirname, '../../media/guide.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    expect(css).toContain('--vscode-foreground');
    expect(css).toContain('--vscode-sideBar-background');
    expect(css).toContain('--vscode-focusBorder');
    expect(css).toContain('--vscode-contrastBorder');
    expect(css).toContain('--gitsos-cat-flujo-diario');
    expect(css).toContain('--gitsos-cat-ramas');
    expect(css).toContain('--gitsos-cat-remoto');
    expect(css).toContain('--gitsos-cat-emergencias');
    expect(css).toContain('--vscode-charts-blue');
    expect(css).toContain('--vscode-charts-purple');
    expect(css).toContain('--vscode-charts-green');
    expect(css).toContain('--vscode-charts-yellow');
    expect(css).toContain('--gitsos-destructive-accent');
    expect(css).toContain('border-left: 4px solid var(--card-accent);');
    expect(css).toMatch(/\.category-badge\s*\{[^}]*color:\s*var\(--vscode-foreground\)/);

    const categoryVars = [...css.matchAll(/(--gitsos-cat-[a-z-]+)\s*:\s*([^;]+);/g)].map((match) =>
      match[2]?.replace(/\s+/g, ' ').trim()
    );
    expect(categoryVars).toHaveLength(4);
    expect(new Set(categoryVars).size).toBe(4);

    expect(css).not.toMatch(/--gitsos-cat-[^;]*(editorError|charts-red|charts-orange)/);
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(css).not.toMatch(/\brgba?\s*\(/i);
    expect(css).not.toMatch(/\bhsla?\s*\(/i);
  });

  it('valida estrictamente los mensajes entrantes del Webview', () => {
    expect(parseWebviewMessage(null)).toBeUndefined();
    expect(parseWebviewMessage('ready')).toBeUndefined();
    expect(parseWebviewMessage({ type: 'eval', code: '1+1' })).toBeUndefined();
    expect(parseWebviewMessage({ type: 'runCommand', commandId: '' })).toBeUndefined();
    expect(
      parseWebviewMessage({ type: 'runCommand', commandId: 'git status; rm -rf' })
    ).toBeUndefined();

    expect(parseWebviewMessage({ type: 'ready' })).toEqual({ type: 'ready' });
    expect(parseWebviewMessage({ type: 'runCommand', commandId: 'crear-rama' })).toEqual({
      type: 'runCommand',
      commandId: 'crear-rama',
    });
    expect(parseWebviewMessage({ type: 'copyCommand', commandId: 'guardar-stash' })).toEqual({
      type: 'copyCommand',
      commandId: 'guardar-stash',
    });
  });

  it('responde al protocolo postMessage delegando a runGitSosEntry y copyGitSosEntryCommand', async () => {
    const provider = new GuideViewProvider({ path: 'c:/ext' } as never);
    const postMessageMock = vi.fn().mockResolvedValue(true);
    const fakeWebview = { postMessage: postMessageMock };

    await expect(provider.handleMessage({ type: 'unknown' }, fakeWebview)).resolves.toBe(false);
    await expect(
      provider.handleMessage({ type: 'runCommand', commandId: 'comando-inexistente' }, fakeWebview)
    ).resolves.toBe(false);
    expect(runGitSosEntryMock).not.toHaveBeenCalled();

    await expect(provider.handleMessage({ type: 'ready' }, fakeWebview)).resolves.toBe(true);
    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'init',
        commands: expect.any(Array),
        strings: expect.objectContaining({
          resultsSingular: messages.resultsSingular,
          resultsPlural: messages.resultsPlural,
        }),
      })
    );

    await expect(
      provider.handleMessage(
        { type: 'runCommand', commandId: 'deshacer-ultimo-commit' },
        fakeWebview
      )
    ).resolves.toBe(true);
    expect(runGitSosEntryMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'deshacer-ultimo-commit', esDestructivo: true }),
      { skipExplanationModal: true }
    );

    await expect(
      provider.handleMessage({ type: 'copyCommand', commandId: 'guardar-stash' }, fakeWebview)
    ).resolves.toBe(true);
    expect(copyGitSosEntryCommandMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'guardar-stash' })
    );
  });
});
