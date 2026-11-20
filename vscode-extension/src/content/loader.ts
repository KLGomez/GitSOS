import type { SupportedLocale } from '../i18n/index.js';
import { extractPlaceholders } from '../services/commandBuilder.js';
import rawCommandsCatalog from './commands.json';
import type {
  CommandCategory,
  CommandInputSpec,
  CommandsCatalog,
  GitCommandSpec,
  GitSosCommandEntry,
  InputValidationType,
} from './types.js';

const VALID_CATEGORIES = new Set<CommandCategory>([
  'emergencias',
  'ramas',
  'flujo-diario',
  'remoto',
]);

const VALID_INPUT_VALIDATIONS = new Set<InputValidationType>([
  'branch',
  'message',
  'conventionalCommit',
  'filePath',
  'repoUrl',
  'nonEmpty',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertNonEmptyString(value: unknown, fieldPath: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Campo inválido en catálogo GitSOS: "${fieldPath}" debe ser texto no vacío.`);
  }
  return value.trim();
}

function assertStringArray(value: unknown, fieldPath: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`Campo inválido en catálogo GitSOS: "${fieldPath}" debe ser un arreglo.`);
  }
  return value.map((item, index) => assertNonEmptyString(item, `${fieldPath}[${index}]`));
}

function assertSingleCommandStep(value: unknown, fieldPath: string): string {
  const step = assertNonEmptyString(value, fieldPath);
  if (/[\r\n]/.test(step)) {
    throw new Error(
      `Campo inválido en catálogo GitSOS: "${fieldPath}" no puede incluir saltos de línea; usá un arreglo de pasos.`
    );
  }
  if (step.includes('&&') || step.includes(';')) {
    throw new Error(
      `Campo inválido en catálogo GitSOS: "${fieldPath}" no debe usar "&&" ni ";"; definí cada paso como un elemento separado del arreglo.`
    );
  }
  return step;
}

function assertGitCommandSpec(value: unknown, fieldPath: string): GitCommandSpec {
  if (typeof value === 'string') {
    return assertSingleCommandStep(value, fieldPath);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      throw new Error(
        `Campo inválido en catálogo GitSOS: "${fieldPath}" debe incluir al menos un paso.`
      );
    }
    return value.map((item, index) => assertSingleCommandStep(item, `${fieldPath}[${index}]`));
  }

  throw new Error(
    `Campo inválido en catálogo GitSOS: "${fieldPath}" debe ser un texto o un arreglo de pasos.`
  );
}

function validateInputSpec(rawInput: unknown, fieldPath: string): CommandInputSpec {
  if (!isRecord(rawInput)) {
    throw new Error(`Entrada inválida en "${fieldPath}": debe ser un objeto.`);
  }

  const key = assertNonEmptyString(rawInput.key, `${fieldPath}.key`);
  const prompt = assertNonEmptyString(rawInput.prompt, `${fieldPath}.prompt`);
  const placeholder = assertNonEmptyString(rawInput.placeholder, `${fieldPath}.placeholder`);
  const validationRaw = assertNonEmptyString(rawInput.validation, `${fieldPath}.validation`);

  if (!VALID_INPUT_VALIDATIONS.has(validationRaw as InputValidationType)) {
    throw new Error(
      `Tipo de validación desconocido en "${fieldPath}.validation": ${validationRaw}`
    );
  }

  return {
    key,
    prompt,
    placeholder,
    validation: validationRaw as InputValidationType,
  };
}

function validateCommandEntry(rawEntry: unknown, index: number): GitSosCommandEntry {
  const prefix = `commands[${index}]`;
  if (!isRecord(rawEntry)) {
    throw new Error(`Entrada inválida en "${prefix}": debe ser un objeto.`);
  }

  const id = assertNonEmptyString(rawEntry.id, `${prefix}.id`);
  const titulo = assertNonEmptyString(rawEntry.titulo, `${prefix}.titulo`);
  const situacion = assertNonEmptyString(rawEntry.situacion, `${prefix}.situacion`);
  const explicacionSimple = assertNonEmptyString(
    rawEntry.explicacionSimple,
    `${prefix}.explicacionSimple`
  );
  const comandoGit = assertGitCommandSpec(rawEntry.comandoGit, `${prefix}.comandoGit`);
  const advertencias = assertStringArray(rawEntry.advertencias, `${prefix}.advertencias`);

  if (typeof rawEntry.esDestructivo !== 'boolean') {
    throw new Error(
      `Campo inválido en catálogo GitSOS: "${prefix}.esDestructivo" debe ser booleano.`
    );
  }

  const categoriaRaw = assertNonEmptyString(rawEntry.categoria, `${prefix}.categoria`);
  if (!VALID_CATEGORIES.has(categoriaRaw as CommandCategory)) {
    throw new Error(`Categoría desconocida en "${prefix}.categoria": ${categoriaRaw}`);
  }

  let pasosGuia: string[] | undefined;
  if (rawEntry.pasosGuia !== undefined) {
    pasosGuia = assertStringArray(rawEntry.pasosGuia, `${prefix}.pasosGuia`);
  }

  let inputs: CommandInputSpec[] | undefined;
  if (rawEntry.inputs !== undefined) {
    if (!Array.isArray(rawEntry.inputs)) {
      throw new Error(`Campo inválido en catálogo GitSOS: "${prefix}.inputs" debe ser un arreglo.`);
    }
    inputs = rawEntry.inputs.map((item, inputIndex) =>
      validateInputSpec(item, `${prefix}.inputs[${inputIndex}]`)
    );
  }

  let paletteCommandId: string | undefined;
  if (rawEntry.paletteCommandId !== undefined) {
    paletteCommandId = assertNonEmptyString(
      rawEntry.paletteCommandId,
      `${prefix}.paletteCommandId`
    );
  }

  const placeholders = extractPlaceholders(comandoGit);
  const inputKeys = new Set((inputs ?? []).map((input) => input.key));

  if ((inputs?.length ?? 0) !== inputKeys.size) {
    throw new Error(`"${prefix}.inputs" contiene claves duplicadas.`);
  }

  for (const placeholder of placeholders) {
    if (!inputKeys.has(placeholder)) {
      throw new Error(
        `El placeholder "{{${placeholder}}}" en "${id}" no tiene definición en "inputs".`
      );
    }
  }

  for (const key of inputKeys) {
    if (!placeholders.includes(key)) {
      throw new Error(`El input "${key}" en "${id}" no se utiliza en "comandoGit".`);
    }
  }

  return {
    id,
    titulo,
    situacion,
    explicacionSimple,
    comandoGit,
    advertencias,
    esDestructivo: rawEntry.esDestructivo,
    categoria: categoriaRaw as CommandCategory,
    ...(pasosGuia ? { pasosGuia } : {}),
    ...(inputs ? { inputs } : {}),
    ...(paletteCommandId ? { paletteCommandId } : {}),
  };
}

/**
 * Valida la estructura completa de un catálogo JSON de comandos GitSOS.
 */
export function validateCommandsCatalog(raw: unknown): CommandsCatalog {
  if (!isRecord(raw)) {
    throw new Error('El catálogo de comandos GitSOS debe ser un objeto JSON.');
  }

  const localeRaw = assertNonEmptyString(raw.locale, 'locale');
  if (localeRaw !== 'es' && localeRaw !== 'en') {
    throw new Error(`Idioma no soportado en catálogo GitSOS: ${localeRaw}`);
  }

  if (typeof raw.version !== 'number' || !Number.isInteger(raw.version) || raw.version < 1) {
    throw new Error('La versión del catálogo GitSOS debe ser un entero positivo.');
  }

  if (!Array.isArray(raw.commands) || raw.commands.length === 0) {
    throw new Error('El catálogo de comandos GitSOS debe incluir al menos un comando.');
  }

  const seenIds = new Set<string>();
  const seenPaletteIds = new Set<string>();
  const commands = raw.commands.map((entry, index) => {
    const validated = validateCommandEntry(entry, index);

    if (seenIds.has(validated.id)) {
      throw new Error(`ID de comando duplicado en catálogo GitSOS: "${validated.id}".`);
    }
    seenIds.add(validated.id);

    if (validated.paletteCommandId) {
      if (seenPaletteIds.has(validated.paletteCommandId)) {
        throw new Error(
          `paletteCommandId duplicado en catálogo GitSOS: "${validated.paletteCommandId}".`
        );
      }
      seenPaletteIds.add(validated.paletteCommandId);
    }

    return validated;
  });

  return {
    locale: localeRaw,
    version: raw.version,
    commands,
  };
}

const cachedSpanishCatalog: CommandsCatalog = validateCommandsCatalog(rawCommandsCatalog);

/**
 * Carga el catálogo validado para el idioma indicado.
 * En el MVP se sirve siempre el catálogo en español; preparado para sumar `en` después.
 */
export function loadCommandsCatalog(_locale: SupportedLocale = 'es'): CommandsCatalog {
  return cachedSpanishCatalog;
}

export function getAllCommands(locale: SupportedLocale = 'es'): readonly GitSosCommandEntry[] {
  return loadCommandsCatalog(locale).commands;
}

export function getCommandById(
  id: string,
  locale: SupportedLocale = 'es'
): GitSosCommandEntry | undefined {
  return loadCommandsCatalog(locale).commands.find((entry) => entry.id === id);
}

export function getPaletteCommands(locale: SupportedLocale = 'es'): readonly GitSosCommandEntry[] {
  return loadCommandsCatalog(locale).commands.filter((entry) => Boolean(entry.paletteCommandId));
}
