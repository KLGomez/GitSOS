import crypto from 'node:crypto';
import type { CommandCategory, GitSosCommandEntry } from '../content/types.js';
import type { Messages, SupportedLocale } from '../i18n/index.js';
import { formatCommandForDisplay } from '../services/commandBuilder.js';
import type { CategoryFilter } from './protocol.js';

export interface GuideHtmlOptions {
  readonly cspSource: string;
  readonly styleUri: string;
  readonly scriptUri: string;
  readonly nonce: string;
  readonly commands: readonly GitSosCommandEntry[];
  readonly messages: Messages;
  readonly locale?: SupportedLocale;
}

const CHEVRON_SVG =
  '<svg class="chevron-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>';

const SEARCH_SVG =
  '<svg class="search-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>';

const CLEAR_SVG =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>';

const WARNING_SVG =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2.2L14.2 13H1.8L8 2.2z"/><path d="M8 6.2v3.3"/><circle cx="8" cy="11.3" r="0.6" fill="currentColor"/></svg>';

const CATEGORY_ICONS: Record<CommandCategory, string> = {
  emergencias:
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="5.8"/><circle cx="8" cy="8" r="2.3"/><path d="M3.9 3.9l2.4 2.4M9.7 9.7l2.4 2.4M12.1 3.9L9.7 6.3M6.3 9.7L3.9 12.1"/></svg>',
  'flujo-diario':
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 5.5h10.5M10.5 3L13 5.5 10.5 8"/><path d="M13.5 10.5H3M5.5 8L3 10.5 5.5 13"/></svg>',
  ramas:
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="3" x2="5" y2="11"/><circle cx="5" cy="12.5" r="1.8"/><circle cx="11.5" cy="5" r="1.8"/><path d="M5 8.5c0-2.5 2-3.5 4.7-3.5"/></svg>',
  remoto:
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 12.5h7.2a2.6 2.6 0 0 0 .4-5.1A3.7 3.7 0 0 0 5 6.4a3 3 0 0 0-.5 6.1z"/></svg>',
};

function getCategoryLabel(category: CommandCategory, messages: Messages): string {
  const labels: Record<CommandCategory, string> = {
    emergencias: messages.categoryEmergencias,
    'flujo-diario': messages.categoryFlujoDiario,
    ramas: messages.categoryRamas,
    remoto: messages.categoryRemoto,
  };
  return labels[category];
}

const ARROW_DOWN_SVG =
  '<svg class="zone-arrow zone-arrow-vertical" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v10M4.5 9.5L8 13l3.5-3.5"/></svg>';

const ARROW_RIGHT_SVG =
  '<svg class="zone-arrow zone-arrow-horizontal" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9.5 4.5L13 8l-3.5 3.5"/></svg>';

/**
 * Genera un nonce aleatorio criptográfico para habilitar exclusivamente el script autorizado.
 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Escapa caracteres especiales HTML para prevenir inyecciones en contenido dinámico.
 */
export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function formatResultsCountText(shown: number, total: number, messages: Messages): string {
  const template = shown === 1 ? messages.resultsSingular : messages.resultsPlural;
  return template.replaceAll('{shown}', String(shown)).replaceAll('{total}', String(total));
}

function renderCategoryButtons(messages: Messages): string {
  const categories: Array<{ id: CategoryFilter; label: string }> = [
    { id: 'todas', label: messages.categoryAll },
    { id: 'emergencias', label: messages.categoryEmergencias },
    { id: 'ramas', label: messages.categoryRamas },
    { id: 'flujo-diario', label: messages.categoryFlujoDiario },
    { id: 'remoto', label: messages.categoryRemoto },
  ];

  return categories
    .map((category, index) => {
      const pressed = index === 0 ? 'true' : 'false';
      return `<button type="button" class="category-pill" data-category="${escapeHtml(category.id)}" aria-pressed="${pressed}">${escapeHtml(category.label)}</button>`;
    })
    .join('');
}

function renderCommandCard(entry: GitSosCommandEntry, messages: Messages): string {
  const safeId = escapeHtml(entry.id);
  const triggerId = `trigger-${safeId}`;
  const panelId = `panel-${safeId}`;
  const categoryLabel = getCategoryLabel(entry.categoria, messages);
  const categoryBadge = `<span class="category-badge">${CATEGORY_ICONS[entry.categoria]}<span>${escapeHtml(categoryLabel)}</span></span>`;

  const destructiveBadge = entry.esDestructivo
    ? `<span class="destructive-badge">${WARNING_SVG}<span>${escapeHtml(messages.cardDestructiveBadge)}</span></span>`
    : '';

  const stepsHtml =
    entry.pasosGuia && entry.pasosGuia.length > 0
      ? `<div class="card-subsection">
          <h4 class="card-subheading">${escapeHtml(messages.cardStepsHeading)}</h4>
          <ol class="card-steps">
            ${entry.pasosGuia.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}
          </ol>
        </div>`
      : '';

  const warningsHtml =
    entry.advertencias.length > 0
      ? `<div class="card-subsection">
          <h4 class="card-subheading">${escapeHtml(messages.cardWarningsHeading)}</h4>
          <ul class="card-warnings">
            ${entry.advertencias.map((warning) => `<li>${escapeHtml(warning)}</li>`).join('')}
          </ul>
        </div>`
      : '';

  return `<article class="command-card" data-command-id="${safeId}" data-category="${escapeHtml(entry.categoria)}" data-destructive="${entry.esDestructivo ? 'true' : 'false'}">
    <h3 class="card-heading">
      <button type="button" class="card-trigger" id="${triggerId}" aria-expanded="false" aria-controls="${panelId}">
        <span class="card-trigger-content">
          <span class="card-title-row">
            <span class="card-title-text">${escapeHtml(entry.titulo)}</span>
            ${categoryBadge}
            ${destructiveBadge}
          </span>
          <span class="card-situation">${escapeHtml(entry.situacion)}</span>
        </span>
        ${CHEVRON_SVG}
      </button>
    </h3>
    <div class="card-panel" id="${panelId}" role="region" aria-labelledby="${triggerId}" hidden>
      <p class="card-explanation">${escapeHtml(entry.explicacionSimple)}</p>
      ${stepsHtml}
      <div class="card-subsection">
        <h4 class="card-subheading">${escapeHtml(messages.cardCommandHeading)}</h4>
        <pre class="command-code-block"><code>${escapeHtml(formatCommandForDisplay(entry.comandoGit))}</code></pre>
      </div>
      ${warningsHtml}
      <div class="card-actions">
        <button type="button" class="action-btn action-btn-primary" data-action="run" data-command-id="${safeId}" aria-label="${escapeHtml(`${messages.cardRunAriaPrefix} ${entry.titulo}`)}">${escapeHtml(messages.cardRunButton)}</button>
        <button type="button" class="action-btn action-btn-secondary" data-action="copy" data-command-id="${safeId}" aria-label="${escapeHtml(`${messages.cardCopyAriaPrefix} ${entry.titulo}`)}">${escapeHtml(messages.cardCopyButton)}</button>
      </div>
    </div>
  </article>`;
}

function renderZonesDiagram(messages: Messages): string {
  return `<section class="zones-section" aria-labelledby="gitsos-zones-heading">
    <h2 id="gitsos-zones-heading" class="sr-only">${escapeHtml(messages.zonesTitle)}</h2>
    <button type="button" id="gitsos-zones-toggle" class="zones-toggle" aria-expanded="true" aria-controls="gitsos-zones-body" aria-label="${escapeHtml(messages.zonesToggleAriaLabel)}">
      <span class="zones-toggle-title-wrap">
        <span>${escapeHtml(messages.zonesTitle)}</span>
        <span class="zones-local-badge">${escapeHtml(messages.zonesBadgeLocal)}</span>
      </span>
      ${CHEVRON_SVG}
    </button>
    <div id="gitsos-zones-body" class="zones-body">
      <div class="zones-grid">
        <div class="zone-card">
          <span class="zone-label">${escapeHtml(messages.zone1Label)}</span>
          <h3 class="zone-title">${escapeHtml(messages.zone1Title)}</h3>
          <p class="zone-description">${escapeHtml(messages.zone1Description)}</p>
          <span class="zone-status">${escapeHtml(messages.zone1Status)}</span>
        </div>
        <div class="zone-connector">
          <span class="zone-connector-cmd">${escapeHtml(messages.zonesConnectorAdd)}</span>
          ${ARROW_DOWN_SVG}
          ${ARROW_RIGHT_SVG}
        </div>
        <div class="zone-card">
          <span class="zone-label">${escapeHtml(messages.zone2Label)}</span>
          <h3 class="zone-title">${escapeHtml(messages.zone2Title)}</h3>
          <p class="zone-description">${escapeHtml(messages.zone2Description)}</p>
          <span class="zone-status">${escapeHtml(messages.zone2Status)}</span>
        </div>
        <div class="zone-connector">
          <span class="zone-connector-cmd">${escapeHtml(messages.zonesConnectorCommit)}</span>
          ${ARROW_DOWN_SVG}
          ${ARROW_RIGHT_SVG}
        </div>
        <div class="zone-card">
          <span class="zone-label">${escapeHtml(messages.zone3Label)}</span>
          <h3 class="zone-title">${escapeHtml(messages.zone3Title)}</h3>
          <p class="zone-description">${escapeHtml(messages.zone3Description)}</p>
          <span class="zone-status">${escapeHtml(messages.zone3Status)}</span>
        </div>
      </div>
      <div class="zones-revert-note">
        <span>${escapeHtml(messages.zonesRevertHint)}</span>
        <code class="zones-revert-code">${escapeHtml(messages.zonesRevertCommand)}</code>
      </div>
    </div>
  </section>`;
}

/**
 * Construye el documento HTML completo del Webview lateral con CSP estricta y carga 100% offline.
 */
export function buildGuideHtml(options: GuideHtmlOptions): string {
  const { commands, messages } = options;
  const locale = options.locale ?? 'es';
  const safeCspSource = escapeHtml(options.cspSource);
  const safeNonce = escapeHtml(options.nonce);
  const safeStyleUri = escapeHtml(options.styleUri);
  const safeScriptUri = escapeHtml(options.scriptUri);
  const totalCount = commands.length;
  const initialStatusText = formatResultsCountText(totalCount, totalCount, messages);

  return `<!DOCTYPE html>
<html lang="${escapeHtml(locale)}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${safeCspSource}; script-src 'nonce-${safeNonce}'; img-src ${safeCspSource}; font-src ${safeCspSource};" />
  <title>${escapeHtml(messages.guideTitle)}</title>
  <link rel="stylesheet" href="${safeStyleUri}" />
</head>
<body>
  <main class="guide-root">
    <header class="guide-header">
      <h1 class="guide-title">${escapeHtml(messages.guideTitle)}</h1>
      <p class="guide-subtitle">${escapeHtml(messages.guideSubtitle)}</p>
    </header>

    <section class="controls-section" aria-label="${escapeHtml(messages.searchLabel)}">
      <div class="search-wrapper">
        <label class="sr-only" for="gitsos-search">${escapeHtml(messages.searchLabel)}</label>
        ${SEARCH_SVG}
        <input id="gitsos-search" class="search-input" type="search" placeholder="${escapeHtml(messages.searchPlaceholder)}" autocomplete="off" />
        <button id="gitsos-clear-search" class="clear-search-btn" type="button" aria-label="${escapeHtml(messages.clearSearchAriaLabel)}" hidden>${CLEAR_SVG}</button>
      </div>

      <div class="category-filters" role="group" aria-label="${escapeHtml(messages.categoryFilterAriaLabel)}">
        ${renderCategoryButtons(messages)}
      </div>

      <p id="gitsos-results-status" class="results-status" role="status" aria-live="polite">${escapeHtml(initialStatusText)}</p>
    </section>

    <section class="cards-section" aria-labelledby="gitsos-situations-heading">
      <h2 id="gitsos-situations-heading" class="section-heading">${escapeHtml(messages.situationsHeading)}</h2>
      <div id="gitsos-cards-list" class="cards-list">
        ${commands.map((entry) => renderCommandCard(entry, messages)).join('')}
      </div>
      <p id="gitsos-empty-state" class="empty-state" hidden>${escapeHtml(messages.noResultsMessage)}</p>
    </section>

    ${renderZonesDiagram(messages)}
  </main>

  <script nonce="${safeNonce}" src="${safeScriptUri}"></script>
</body>
</html>`;
}
