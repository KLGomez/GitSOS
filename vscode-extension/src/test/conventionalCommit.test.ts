import { describe, expect, it } from 'vitest';
import {
  CONVENTIONAL_COMMIT_TYPES,
  buildConventionalCommitMessage,
  escapeDoubleQuotes,
  getConventionalCommitWarnings,
  validateConventionalDescription,
  validateConventionalScope,
} from '../services/conventionalCommit.js';

describe('Conventional Commits en español', () => {
  it('incluye los 7 tipos esperados con descripción en español', () => {
    expect(CONVENTIONAL_COMMIT_TYPES.map((item) => item.type)).toEqual([
      'feat',
      'fix',
      'docs',
      'style',
      'refactor',
      'test',
      'chore',
    ]);

    for (const item of CONVENTIONAL_COMMIT_TYPES) {
      expect(item.description.trim().length).toBeGreaterThan(0);
    }
  });

  it('arma el mensaje con y sin alcance (scope)', () => {
    const withScope = buildConventionalCommitMessage({
      type: 'feat',
      scope: 'login',
      description: 'agregar botón de ingreso',
    });
    expect(withScope.raw).toBe('feat(login): agregar botón de ingreso');
    expect(withScope.escaped).toBe('feat(login): agregar botón de ingreso');
    expect(withScope.warnings).toEqual([]);

    const withoutScope = buildConventionalCommitMessage({
      type: 'fix',
      scope: '',
      description: 'corregir cálculo de envío',
    });
    expect(withoutScope.raw).toBe('fix: corregir cálculo de envío');
    expect(withoutScope.warnings).toEqual([]);

    const blankScope = buildConventionalCommitMessage({
      type: 'docs',
      scope: '   ',
      description: 'actualizar guía de instalación',
    });
    expect(blankScope.raw).toBe('docs: actualizar guía de instalación');
  });

  it('escapa comillas dobles en la descripción sin romper el mensaje', () => {
    expect(escapeDoubleQuotes('agregar botón "Entrar"')).toBe('agregar botón \\"Entrar\\"');

    const built = buildConventionalCommitMessage({
      type: 'feat',
      scope: 'ui',
      description: 'mostrar alerta "Sesión guardada"',
    });
    expect(built.raw).toBe('feat(ui): mostrar alerta "Sesión guardada"');
    expect(built.escaped).toBe('feat(ui): mostrar alerta \\"Sesión guardada\\"');
  });

  it('avisa sin bloquear si empieza con mayúscula, termina en punto o supera 72 caracteres', () => {
    const upper = buildConventionalCommitMessage({
      type: 'feat',
      description: 'Agregar filtro de búsqueda',
    });
    expect(upper.raw).toBe('feat: Agregar filtro de búsqueda');
    expect(upper.warnings).toHaveLength(1);
    expect(upper.warnings[0]).toContain('mayúscula');

    const period = buildConventionalCommitMessage({
      type: 'fix',
      description: 'corregir ruta del logo.',
    });
    expect(period.warnings).toHaveLength(1);
    expect(period.warnings[0]).toContain('punto');

    const longHeader = buildConventionalCommitMessage({
      type: 'refactor',
      scope: 'panel-lateral',
      description: 'reorganizar funciones internas para simplificar el filtrado de comandos',
    });
    expect(longHeader.raw.length).toBeGreaterThan(72);
    expect(longHeader.warnings).toHaveLength(1);
    expect(longHeader.warnings[0]).toContain('72');

    const allThree = getConventionalCommitWarnings(
      'Cambiar todo el texto del encabezado principal con muchas palabras adicionales.',
      'chore: Cambiar todo el texto del encabezado principal con muchas palabras adicionales.'
    );
    expect(allThree).toHaveLength(3);
  });

  it('valida scope y descripción bloqueando solo entradas vacías o inseguras', () => {
    expect(validateConventionalScope('')).toBeUndefined();
    expect(validateConventionalScope('   ')).toBeUndefined();
    expect(validateConventionalScope('auth/login')).toBeUndefined();
    expect(validateConventionalScope('con espacio')).toBeTruthy();
    expect(validateConventionalScope('auth;ls')).toBeTruthy();
    expect(validateConventionalScope('a'.repeat(41))).toBeTruthy();

    expect(validateConventionalDescription('agregar "botón" nuevo')).toBeUndefined();
    expect(validateConventionalDescription('')).toBeTruthy();
    expect(validateConventionalDescription('línea 1\nlínea 2')).toBeTruthy();
    expect(validateConventionalDescription('probar $(whoami)')).toBeTruthy();
    expect(validateConventionalDescription('probar;rm -rf')).toBeTruthy();
  });
});
