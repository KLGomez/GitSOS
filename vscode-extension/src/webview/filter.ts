import type { GitSosCommandEntry } from '../content/types.js';
import type { CategoryFilter } from './protocol.js';

/**
 * Normaliza texto para búsquedas amigables sin sensibilidad a mayúsculas ni tildes.
 */
export function normalizeSearchText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Filtra entradas del catálogo por categoría y coincidencia en título, situación o comando Git.
 */
export function filterCommands(
  commands: readonly GitSosCommandEntry[],
  query: string,
  category: CategoryFilter
): GitSosCommandEntry[] {
  const normalizedQuery = normalizeSearchText(query);

  return commands.filter((entry) => {
    if (category !== 'todas' && entry.categoria !== category) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [entry.titulo, entry.situacion, entry.comandoGit]
      .map(normalizeSearchText)
      .join(' ');

    return haystack.includes(normalizedQuery);
  });
}
