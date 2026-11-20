import { describe, expect, it } from 'vitest';
import { buildGitCommand, extractPlaceholders, validateInput } from '../services/commandBuilder.js';

describe('Constructor y validador de comandos (Fase 2)', () => {
  it('extrae placeholders únicos de la plantilla', () => {
    expect(extractPlaceholders('git status')).toEqual([]);
    expect(extractPlaceholders('git switch -c {{rama}}')).toEqual(['rama']);
    expect(extractPlaceholders('git diff {{rama}} {{rama}} {{archivo}}')).toEqual([
      'rama',
      'archivo',
    ]);
  });

  it('valida nombres de rama de forma segura', () => {
    expect(validateInput('feat/login-2', 'branch')).toBeUndefined();
    expect(validateInput('  fix/boton  ', 'branch')).toBeUndefined();

    expect(validateInput('', 'branch')).toBeTruthy();
    expect(validateInput('mi rama', 'branch')).toBeTruthy();
    expect(validateInput('-rf', 'branch')).toBeTruthy();
    expect(validateInput('feat..login', 'branch')).toBeTruthy();
    expect(validateInput('main.lock', 'branch')).toBeTruthy();
    expect(validateInput('feat;rm -rf', 'branch')).toBeTruthy();
  });

  it('valida mensajes de commit y rutas de archivo', () => {
    expect(validateInput('fix: corregir validacion', 'message')).toBeUndefined();
    expect(validateInput('fix: "comillas"', 'message')).toBeTruthy();
    expect(validateInput('fix: $(whoami)', 'message')).toBeTruthy();
    expect(validateInput('a'.repeat(201), 'message')).toBeTruthy();

    expect(validateInput('.env', 'filePath')).toBeUndefined();
    expect(validateInput('src/mi carpeta/app.ts', 'filePath')).toBeUndefined();
    expect(validateInput('-rf', 'filePath')).toBeTruthy();
    expect(validateInput('src/app.ts;ls', 'filePath')).toBeTruthy();
    expect(validateInput('src/*.ts', 'filePath')).toBeTruthy();

    expect(validateInput('origin', 'nonEmpty')).toBeUndefined();
    expect(validateInput('origin|cat', 'nonEmpty')).toBeTruthy();
  });

  it('arma comandos reemplazando valores y entrecomillando rutas con espacios', () => {
    const branchCommand = buildGitCommand(
      {
        comandoGit: 'git switch -c {{rama}}',
        inputs: [
          {
            key: 'rama',
            prompt: 'Rama',
            placeholder: 'feat/x',
            validation: 'branch',
          },
        ],
      },
      { rama: '  feat/nueva-vista  ' }
    );
    expect(branchCommand).toBe('git switch -c feat/nueva-vista');

    const spacedPathCommand = buildGitCommand(
      {
        comandoGit: 'git restore -- {{archivo}}',
        inputs: [
          {
            key: 'archivo',
            prompt: 'Archivo',
            placeholder: 'src/index.ts',
            validation: 'filePath',
          },
        ],
      },
      { archivo: 'docs/mi archivo.md' }
    );
    expect(spacedPathCommand).toBe('git restore -- "docs/mi archivo.md"');

    expect(() =>
      buildGitCommand(
        {
          comandoGit: 'git switch -c {{rama}}',
          inputs: [
            {
              key: 'rama',
              prompt: 'Rama',
              placeholder: 'feat/x',
              validation: 'branch',
            },
          ],
        },
        {}
      )
    ).toThrow(/Falta completar/);
  });
});
