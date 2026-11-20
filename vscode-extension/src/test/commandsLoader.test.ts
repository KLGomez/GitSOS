import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  getAllCommands,
  getCommandById,
  getPaletteCommands,
  loadCommandsCatalog,
  validateCommandsCatalog,
} from '../content/loader.js';
import { extractPlaceholders } from '../services/commandBuilder.js';

interface PackageManifest {
  contributes?: {
    commands?: Array<{ command: string; title: string; category?: string }>;
  };
}

describe('Catálogo commands.json y loader (Fase 2)', () => {
  it('carga commands.json con al menos 8 situaciones y estructura válida', () => {
    const catalog = loadCommandsCatalog('es');
    expect(catalog.locale).toBe('es');
    expect(catalog.version).toBe(1);
    expect(catalog.commands.length).toBeGreaterThanOrEqual(8);

    const all = getAllCommands('es');
    expect(all.length).toBe(catalog.commands.length);

    const seenIds = new Set<string>();
    for (const entry of all) {
      expect(seenIds.has(entry.id)).toBe(false);
      seenIds.add(entry.id);

      expect(entry.titulo.trim().length).toBeGreaterThan(0);
      expect(entry.situacion.trim().length).toBeGreaterThan(0);
      expect(entry.explicacionSimple.trim().length).toBeGreaterThan(0);
      expect(entry.comandoGit.trim().length).toBeGreaterThan(0);
      expect(Array.isArray(entry.advertencias)).toBe(true);
      expect(typeof entry.esDestructivo).toBe('boolean');

      const placeholders = extractPlaceholders(entry.comandoGit);
      const inputKeys = (entry.inputs ?? []).map((item) => item.key);
      expect(inputKeys.sort()).toEqual([...placeholders].sort());
    }
  });

  it('incluye las 5 situaciones clave y las alinea con package.json', () => {
    const requiredIds = [
      'deshacer-ultimo-commit',
      'crear-rama',
      'cambiar-rama',
      'guardar-stash',
      'resolver-conflictos',
    ];

    for (const id of requiredIds) {
      const entry = getCommandById(id, 'es');
      expect(entry).toBeDefined();
      expect(entry?.paletteCommandId).toBeTruthy();
    }

    expect(getCommandById('no-existe', 'es')).toBeUndefined();

    const packageJsonPath = path.resolve(__dirname, '../../package.json');
    const manifest = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as PackageManifest;
    const contributedIds = new Set(
      (manifest.contributes?.commands ?? []).map((command) => command.command)
    );

    expect(contributedIds.has('gitsos.ayuda')).toBe(true);

    const paletteCommands = getPaletteCommands('es');
    expect(paletteCommands.length).toBe(5);

    for (const entry of paletteCommands) {
      expect(entry.paletteCommandId).toBeDefined();
      expect(contributedIds.has(entry.paletteCommandId ?? '')).toBe(true);
    }
  });

  it('rechaza catálogos con errores de esquema o inconsistencias', () => {
    const validSample = {
      locale: 'es',
      version: 1,
      commands: [
        {
          id: 'cmd-1',
          titulo: 'Ver estado',
          situacion: 'Quiero ver el estado',
          explicacionSimple: 'Muestra cambios pendientes.',
          comandoGit: 'git status',
          advertencias: [],
          esDestructivo: false,
          categoria: 'flujo-diario',
        },
      ],
    };

    expect(() => validateCommandsCatalog(validSample)).not.toThrow();

    expect(() =>
      validateCommandsCatalog({
        ...validSample,
        commands: [],
      })
    ).toThrow(/al menos un comando/);

    expect(() =>
      validateCommandsCatalog({
        ...validSample,
        commands: [validSample.commands[0], validSample.commands[0]],
      })
    ).toThrow(/duplicado/);

    expect(() =>
      validateCommandsCatalog({
        ...validSample,
        commands: [
          {
            ...validSample.commands[0],
            titulo: '   ',
          },
        ],
      })
    ).toThrow(/texto no vacío/);

    expect(() =>
      validateCommandsCatalog({
        ...validSample,
        commands: [
          {
            ...validSample.commands[0],
            comandoGit: 'git switch {{rama}}',
          },
        ],
      })
    ).toThrow(/no tiene definición en "inputs"/);

    expect(() =>
      validateCommandsCatalog({
        ...validSample,
        commands: [
          {
            ...validSample.commands[0],
            categoria: 'inexistente',
          },
        ],
      })
    ).toThrow(/Categoría desconocida/);
  });
});
