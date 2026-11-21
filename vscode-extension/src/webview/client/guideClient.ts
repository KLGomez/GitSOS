import type { GitSosCommandEntry } from '../../content/types.js';
import { filterCommands } from '../filter.js';
import type {
  CategoryFilter,
  ExtensionToWebviewMessage,
  WebviewToExtensionMessage,
} from '../protocol.js';

interface WebviewPersistedState {
  query: string;
  category: CategoryFilter;
  expandedIds: string[];
  zonesExpanded: boolean;
}

interface VsCodeWebviewApi {
  postMessage(message: WebviewToExtensionMessage): void;
  getState(): Partial<WebviewPersistedState> | undefined;
  setState(state: WebviewPersistedState): void;
}

declare function acquireVsCodeApi(): VsCodeWebviewApi;

const VALID_CATEGORIES = new Set<CategoryFilter>([
  'todas',
  'emergencias',
  'ramas',
  'flujo-diario',
  'remoto',
]);

function isInitMessage(raw: unknown): raw is ExtensionToWebviewMessage {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return false;
  }
  const candidate = raw as Partial<ExtensionToWebviewMessage>;
  return (
    candidate.type === 'init' && Array.isArray(candidate.commands) && Boolean(candidate.strings)
  );
}

function bootstrapGuideClient(): void {
  const vscodeApi = acquireVsCodeApi();

  const searchInput = document.getElementById('gitsos-search') as HTMLInputElement | null;
  const clearSearchButton = document.getElementById(
    'gitsos-clear-search'
  ) as HTMLButtonElement | null;
  const resultsStatus = document.getElementById('gitsos-results-status');
  const emptyState = document.getElementById('gitsos-empty-state');
  const zonesToggle = document.getElementById('gitsos-zones-toggle') as HTMLButtonElement | null;
  const zonesBody = document.getElementById('gitsos-zones-body');

  const categoryButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('.category-pill[data-category]')
  );
  const cardElements = Array.from(
    document.querySelectorAll<HTMLElement>('.command-card[data-command-id]')
  );

  const saved = vscodeApi.getState();
  let query = typeof saved?.query === 'string' ? saved.query : '';
  let activeCategory: CategoryFilter =
    saved?.category && VALID_CATEGORIES.has(saved.category) ? saved.category : 'todas';
  const expandedIds = new Set<string>(
    Array.isArray(saved?.expandedIds)
      ? saved.expandedIds.filter((id): id is string => typeof id === 'string')
      : []
  );
  let zonesExpanded = typeof saved?.zonesExpanded === 'boolean' ? saved.zonesExpanded : true;

  let catalogCommands: readonly GitSosCommandEntry[] = [];
  let statusStrings = {
    resultsSingular: 'Mostrando 1 de {total} situaciones',
    resultsPlural: 'Mostrando {shown} de {total} situaciones',
  };

  function persistState(): void {
    vscodeApi.setState({
      query,
      category: activeCategory,
      expandedIds: [...expandedIds],
      zonesExpanded,
    });
  }

  function syncZonesState(): void {
    if (zonesToggle && zonesBody) {
      zonesToggle.setAttribute('aria-expanded', String(zonesExpanded));
      zonesBody.hidden = !zonesExpanded;
    }
  }

  function syncExpandedCards(): void {
    for (const card of cardElements) {
      const commandId = card.dataset.commandId;
      if (!commandId) {
        continue;
      }
      const trigger = card.querySelector<HTMLButtonElement>('.card-trigger');
      const panel = card.querySelector<HTMLElement>('.card-panel');
      const isExpanded = expandedIds.has(commandId);
      if (trigger && panel) {
        trigger.setAttribute('aria-expanded', String(isExpanded));
        panel.hidden = !isExpanded;
      }
    }
  }

  function syncCategoryButtons(): void {
    for (const button of categoryButtons) {
      const category = button.dataset.category as CategoryFilter | undefined;
      button.setAttribute('aria-pressed', String(category === activeCategory));
    }
  }

  function syncClearButton(): void {
    if (clearSearchButton) {
      clearSearchButton.hidden = query.length === 0;
    }
  }

  function applyFilter(): void {
    if (catalogCommands.length === 0) {
      return;
    }

    const matching = filterCommands(catalogCommands, query, activeCategory);
    const matchingIds = new Set(matching.map((entry) => entry.id));

    for (const card of cardElements) {
      const commandId = card.dataset.commandId ?? '';
      card.hidden = !matchingIds.has(commandId);
    }

    if (emptyState) {
      emptyState.hidden = matching.length > 0;
    }

    if (resultsStatus) {
      const template =
        matching.length === 1 ? statusStrings.resultsSingular : statusStrings.resultsPlural;
      resultsStatus.textContent = template
        .replaceAll('{shown}', String(matching.length))
        .replaceAll('{total}', String(catalogCommands.length));
    }
  }

  if (searchInput) {
    searchInput.value = query;
    searchInput.addEventListener('input', () => {
      query = searchInput.value;
      syncClearButton();
      persistState();
      applyFilter();
    });

    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && query.length > 0) {
        event.preventDefault();
        query = '';
        searchInput.value = '';
        syncClearButton();
        persistState();
        applyFilter();
      }
    });
  }

  if (clearSearchButton && searchInput) {
    clearSearchButton.addEventListener('click', () => {
      query = '';
      searchInput.value = '';
      syncClearButton();
      persistState();
      applyFilter();
      searchInput.focus();
    });
  }

  for (const button of categoryButtons) {
    button.addEventListener('click', () => {
      const selectedCategory = button.dataset.category as CategoryFilter | undefined;
      if (!selectedCategory || !VALID_CATEGORIES.has(selectedCategory)) {
        return;
      }
      activeCategory = selectedCategory;
      syncCategoryButtons();
      persistState();
      applyFilter();
    });
  }

  if (zonesToggle) {
    zonesToggle.addEventListener('click', () => {
      zonesExpanded = !zonesExpanded;
      syncZonesState();
      persistState();
    });
  }

  for (const card of cardElements) {
    const commandId = card.dataset.commandId;
    if (!commandId) {
      continue;
    }

    const trigger = card.querySelector<HTMLButtonElement>('.card-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        if (expandedIds.has(commandId)) {
          expandedIds.delete(commandId);
        } else {
          expandedIds.add(commandId);
        }
        syncExpandedCards();
        persistState();
      });
    }

    const actionButtons = card.querySelectorAll<HTMLButtonElement>('.action-btn[data-action]');
    for (const actionButton of actionButtons) {
      actionButton.addEventListener('click', () => {
        const action = actionButton.dataset.action;
        if (action === 'run') {
          vscodeApi.postMessage({ type: 'runCommand', commandId });
        } else if (action === 'copy') {
          vscodeApi.postMessage({ type: 'copyCommand', commandId });
        }
      });
    }
  }

  window.addEventListener('message', (event: MessageEvent<unknown>) => {
    if (!isInitMessage(event.data)) {
      return;
    }
    catalogCommands = event.data.commands;
    statusStrings = event.data.strings;
    applyFilter();
  });

  syncClearButton();
  syncCategoryButtons();
  syncExpandedCards();
  syncZonesState();
  vscodeApi.postMessage({ type: 'ready' });
}

bootstrapGuideClient();
