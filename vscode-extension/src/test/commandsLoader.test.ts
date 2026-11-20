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
import type { CommandCategory } from '../content/types.js';
import { extractPlaceholders, getCommandSteps } from '../services/commandBuilder.js';

interface PackageManifest {
  publisher?: string;
  displayName?: string;
  description?: string;
  version?: string;
  license?: string;
  icon?: string;
  galleryBanner?: { color?: string; theme?: string };
  categories?: string[];
  keywords?: string[];
  repository?: { type?: string; url?: string; directory?: string };
  bugs?: { url?: string };
  homepage?: string;
  contributes?: {
    commands?: Array<{ command: string; title: string; category?: string }>;
    viewsContainers?: {
      activitybar?: Array<{ id: string; title: string; icon: string }>;
    };
    views?: Record<string, Array<{ type?: string; id: string; name: string }>>;
  };
}

describe('Catálogo commands.json y loader (Fase 2 y 3)', () => {
  it('carga commands.json con al menos 8 situaciones, las 4 categorías y estructura válida', () => {
    const catalog = loadCommandsCatalog('es');
    expect(catalog.locale).toBe('es');
    expect(catalog.version).toBe(1);
    expect(catalog.commands.length).toBeGreaterThanOrEqual(8);

    const all = getAllCommands('es');
    expect(all.length).toBe(catalog.commands.length);

    const seenIds = new Set<string>();
    const seenCategories = new Set<CommandCategory>();

    for (const entry of all) {
      expect(seenIds.has(entry.id)).toBe(false);
      seenIds.add(entry.id);
      seenCategories.add(entry.categoria);

      expect(entry.titulo.trim().length).toBeGreaterThan(0);
      expect(entry.situacion.trim().length).toBeGreaterThan(0);
      expect(entry.explicacionSimple.trim().length).toBeGreaterThan(0);
      expect(Array.isArray(entry.advertencias)).toBe(true);
      expect(typeof entry.esDestructivo).toBe('boolean');
      const steps = getCommandSteps(entry.comandoGit);
      expect(steps.length).toBeGreaterThan(0);
      for (const step of steps) {
        expect(step.trim().length).toBeGreaterThan(0);
        expect(step).not.toContain('&&');
        expect(step).not.toContain(';');
      }

      const placeholders = extractPlaceholders(entry.comandoGit);
      const inputKeys = (entry.inputs ?? []).map((item) => item.key);
      expect(inputKeys.sort()).toEqual([...placeholders].sort());
    }

    expect(getCommandById('preparar-cambios', 'es')?.comandoGit).toBe('git add .');
    expect(getCommandById('hacer-commit', 'es')?.comandoGit).toBe('git commit -m "{{mensaje}}"');
    expect(getCommandById('guardar-cambios', 'es')?.comandoGit).toEqual([
      'git add .',
      'git commit -m "{{mensaje}}"',
    ]);

    expect(seenCategories).toEqual(new Set(['emergencias', 'ramas', 'flujo-diario', 'remoto']));
    expect(all).toHaveLength(18);

    const byCategory = {
      emergencias: all.filter((entry) => entry.categoria === 'emergencias'),
      'flujo-diario': all.filter((entry) => entry.categoria === 'flujo-diario'),
      ramas: all.filter((entry) => entry.categoria === 'ramas'),
      remoto: all.filter((entry) => entry.categoria === 'remoto'),
    };
    expect(byCategory.emergencias).toHaveLength(5);
    expect(byCategory['flujo-diario']).toHaveLength(8);
    expect(byCategory.ramas).toHaveLength(2);
    expect(byCategory.remoto).toHaveLength(3);

    const destructiveIds = all
      .filter((entry) => entry.esDestructivo)
      .map((entry) => entry.id)
      .sort();
    expect(destructiveIds).toEqual([
      'corregir-mensaje-commit',
      'dejar-de-rastrear-archivo',
      'descartar-cambios-archivo',
      'deshacer-ultimo-commit',
    ]);

    for (const newId of [
      'preparar-cambios',
      'hacer-commit',
      'guardar-cambios',
      'subir-cambios-remoto',
      'clonar-repositorio',
      'ver-historial-commits',
      'ver-diferencias',
    ]) {
      const entry = getCommandById(newId, 'es');
      expect(entry).toBeDefined();
      expect(entry?.esDestructivo).toBe(false);
    }
  });

  it('incluye las 5 situaciones clave, declara vista lateral y elimina gitsos.hola de package.json', () => {
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

    expect(contributedIds.has('gitsos.hola')).toBe(false);
    expect(contributedIds.has('gitsos.ayuda')).toBe(true);

    const paletteCommands = getPaletteCommands('es');
    expect(paletteCommands.length).toBe(5);

    for (const entry of paletteCommands) {
      expect(entry.paletteCommandId).toBeDefined();
      expect(contributedIds.has(entry.paletteCommandId ?? '')).toBe(true);
    }

    const activityContainers = manifest.contributes?.viewsContainers?.activitybar ?? [];
    expect(activityContainers).toContainEqual(
      expect.objectContaining({
        id: 'gitsos-sidebar',
        icon: 'media/gitsos-activitybar.png',
      })
    );
    const activityIcon = activityContainers[0]?.icon ?? '';
    expect(activityIcon.endsWith('.png')).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../../', activityIcon))).toBe(true);

    const sidebarViews = manifest.contributes?.views?.['gitsos-sidebar'] ?? [];
    expect(sidebarViews).toContainEqual(
      expect.objectContaining({
        type: 'webview',
        id: 'gitsos.guideView',
      })
    );

    expect(manifest.publisher).toBe('klgomez');
    expect(manifest.displayName).toBeTruthy();
    expect(manifest.description).toBeTruthy();
    expect(manifest.version).toBe('0.2.2');
    expect(manifest.license).toBe('MIT');
    expect(manifest.icon).toBe('media/icon.png');
    expect(manifest.icon?.endsWith('.png')).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../../', manifest.icon ?? ''))).toBe(true);
    expect(manifest.galleryBanner).toEqual({ color: '#0f172a', theme: 'dark' });
    expect(manifest.keywords).toEqual(
      expect.arrayContaining(['git', 'github', 'principiantes', 'conventional commits', 'español'])
    );
    expect(manifest.repository?.url).toBe('https://github.com/KLGomez/GitSOS');
    expect(manifest.repository?.directory).toBe('vscode-extension');
    expect(manifest.bugs?.url).toBe('https://github.com/KLGomez/GitSOS/issues');
    expect(manifest.homepage).toBe('https://git-sos.vercel.app/');
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

    expect(() =>
      validateCommandsCatalog({
        ...validSample,
        commands: [
          {
            ...validSample.commands[0],
            comandoGit: ['git add .', 'git status'],
          },
        ],
      })
    ).not.toThrow();

    expect(() =>
      validateCommandsCatalog({
        ...validSample,
        commands: [
          {
            ...validSample.commands[0],
            comandoGit: [],
          },
        ],
      })
    ).toThrow(/al menos un paso/);

    expect(() =>
      validateCommandsCatalog({
        ...validSample,
        commands: [
          {
            ...validSample.commands[0],
            comandoGit: 'git add . && git status',
          },
        ],
      })
    ).toThrow(/&&/);

    expect(() =>
      validateCommandsCatalog({
        ...validSample,
        commands: [
          {
            ...validSample.commands[0],
            comandoGit: 'git add .; git status',
          },
        ],
      })
    ).toThrow(/;/);

    expect(() =>
      validateCommandsCatalog({
        ...validSample,
        commands: [
          {
            ...validSample.commands[0],
            comandoGit: 'git add .\ngit status',
          },
        ],
      })
    ).toThrow(/saltos de línea/);
  });
});
