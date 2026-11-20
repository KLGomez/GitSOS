import { describe, expect, it } from 'vitest';
import { getAllCommands } from '../content/loader.js';
import { filterCommands, normalizeSearchText } from '../webview/filter.js';

describe('Buscador y filtro por categoría del panel (Fase 3)', () => {
  const allCommands = getAllCommands('es');

  it('normaliza mayúsculas y tildes al buscar', () => {
    expect(normalizeSearchText('  Último Fusión  ')).toBe('ultimo fusion');
  });

  it('filtra por título, situación y comando Git sin sensibilidad a tildes', () => {
    const byTitleWithoutAccents = filterCommands(allCommands, 'ultimo commit', 'todas');
    expect(byTitleWithoutAccents.map((entry) => entry.id)).toContain('deshacer-ultimo-commit');

    const byCommand = filterCommands(allCommands, 'stash', 'todas');
    expect(byCommand.map((entry) => entry.id)).toEqual(
      expect.arrayContaining(['guardar-stash', 'recuperar-stash'])
    );

    const bySituation = filterCommands(allCommands, 'cajon', 'todas');
    expect(bySituation).toHaveLength(0);

    const bySituationWord = filterCommands(allCommands, 'archivo privado', 'todas');
    expect(bySituationWord.map((entry) => entry.id)).toContain('dejar-de-rastrear-archivo');

    for (const [query, expectedId] of [
      ['git push', 'subir-cambios-remoto'],
      ['git clone', 'clonar-repositorio'],
      ['git log', 'ver-historial-commits'],
      ['git diff', 'ver-diferencias'],
      ['git add', 'guardar-cambios'],
    ] as const) {
      const found = filterCommands(allCommands, query, 'todas');
      expect(found.map((entry) => entry.id)).toContain(expectedId);
    }
  });

  it('filtra correctamente por cada categoría y en combinación con búsqueda', () => {
    expect(filterCommands(allCommands, '', 'todas')).toHaveLength(allCommands.length);

    const branches = filterCommands(allCommands, '', 'ramas');
    expect(branches.length).toBeGreaterThan(0);
    expect(branches.every((entry) => entry.categoria === 'ramas')).toBe(true);

    const daily = filterCommands(allCommands, '', 'flujo-diario');
    expect(daily.length).toBe(6);
    expect(daily.every((entry) => entry.categoria === 'flujo-diario')).toBe(true);
    expect(daily.map((entry) => entry.id)).toEqual(
      expect.arrayContaining([
        'guardar-stash',
        'recuperar-stash',
        'guardar-cambios',
        'ver-estado-actual',
        'ver-diferencias',
        'ver-historial-commits',
      ])
    );

    const remote = filterCommands(allCommands, '', 'remoto');
    expect(remote.length).toBe(3);
    expect(remote.every((entry) => entry.categoria === 'remoto')).toBe(true);
    expect(remote.map((entry) => entry.id)).toEqual(
      expect.arrayContaining([
        'subir-cambios-remoto',
        'traer-cambios-remotos',
        'clonar-repositorio',
      ])
    );

    const emergencies = filterCommands(allCommands, '', 'emergencias');
    expect(emergencies.length).toBe(5);
    expect(emergencies.every((entry) => entry.categoria === 'emergencias')).toBe(true);
    expect(emergencies.map((entry) => entry.id)).not.toContain('guardar-stash');
    expect(emergencies.map((entry) => entry.id)).not.toContain('recuperar-stash');

    const combined = filterCommands(allCommands, 'switch', 'ramas');
    expect(combined.map((entry) => entry.id)).toEqual(
      expect.arrayContaining(['crear-rama', 'cambiar-rama'])
    );

    const empty = filterCommands(allCommands, 'zzzz-inexistente', 'remoto');
    expect(empty).toHaveLength(0);
  });
});
