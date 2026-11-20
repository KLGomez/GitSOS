export type ConventionalCommitType =
  'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore';

export interface ConventionalCommitTypeOption {
  readonly type: ConventionalCommitType;
  readonly description: string;
}

export const CONVENTIONAL_COMMIT_TYPES: readonly ConventionalCommitTypeOption[] = [
  {
    type: 'feat',
    description: 'Nueva funcionalidad o mejora visible para quien usa el proyecto',
  },
  {
    type: 'fix',
    description: 'Corrección de un error o fallo (bug)',
  },
  {
    type: 'docs',
    description: 'Cambios solo en documentación (README, guías o comentarios)',
  },
  {
    type: 'style',
    description: 'Formato o estilo del código sin cambiar cómo funciona',
  },
  {
    type: 'refactor',
    description: 'Reorganización o mejora interna sin cambiar el comportamiento',
  },
  {
    type: 'test',
    description: 'Agregar o corregir pruebas automatizadas',
  },
  {
    type: 'chore',
    description: 'Tareas de mantenimiento, configuración o dependencias',
  },
];

export const CONVENTIONAL_COMMIT_MAX_LENGTH = 72;

const SCOPE_ALLOWED_REGEX = /^[\p{L}\p{N}._/-]+$/u;
const DESCRIPTION_FORBIDDEN_REGEX = /[`$\\;|&<>]/;
const STARTS_WITH_UPPERCASE_REGEX = /^\p{Lu}/u;

export interface ConventionalCommitInput {
  readonly type: ConventionalCommitType;
  readonly scope?: string;
  readonly description: string;
}

export interface BuiltConventionalCommit {
  readonly raw: string;
  readonly escaped: string;
  readonly warnings: readonly string[];
}

/**
 * Escapa comillas dobles para enviar el mensaje entrecomillado sin romper la terminal.
 */
export function escapeDoubleQuotes(value: string): string {
  return value.replaceAll('"', '\\"');
}

/**
 * Valida el alcance opcional (scope) de un Conventional Commit.
 * Si queda vacío o con espacios, es válido y se omite al armar el mensaje.
 */
export function validateConventionalScope(rawScope: string): string | undefined {
  const scope = rawScope.trim();
  if (!scope) {
    return undefined;
  }

  if (/[\r\n]/.test(scope)) {
    return 'El alcance no puede contener saltos de línea.';
  }

  if (/\s/.test(scope)) {
    return 'El alcance no puede tener espacios (ej. auth, ui, api).';
  }

  if (scope.length > 40) {
    return 'El alcance es muy largo (máximo 40 caracteres).';
  }

  if (!SCOPE_ALLOWED_REGEX.test(scope)) {
    return 'Usá solo letras, números, puntos, guiones o barras en el alcance.';
  }

  return undefined;
}

/**
 * Valida la descripción de un commit permitiendo comillas dobles (se escapan al ejecutar)
 * y bloqueando caracteres peligrosos de shell.
 */
export function validateConventionalDescription(rawDescription: string): string | undefined {
  const description = rawDescription.trim();
  if (!description) {
    return 'Escribí una descripción breve antes de continuar.';
  }

  if (/[\r\n]/.test(description)) {
    return 'La descripción no puede contener saltos de línea.';
  }

  if (DESCRIPTION_FORBIDDEN_REGEX.test(description)) {
    return 'Evitá símbolos especiales de terminal como `, $, \\, ;, |, &, < o >.';
  }

  return undefined;
}

/**
 * Genera advertencias de estilo (sin bloquear) según las convenciones recomendadas.
 */
export function getConventionalCommitWarnings(
  description: string,
  formattedHeader: string
): string[] {
  const warnings: string[] = [];
  const trimmedDescription = description.trim();

  if (STARTS_WITH_UPPERCASE_REGEX.test(trimmedDescription)) {
    warnings.push('empieza con mayúscula (se recomienda minúscula)');
  }

  if (trimmedDescription.endsWith('.')) {
    warnings.push('termina con punto final (se recomienda omitirlo)');
  }

  if (formattedHeader.length > CONVENTIONAL_COMMIT_MAX_LENGTH) {
    warnings.push(
      `supera ${CONVENTIONAL_COMMIT_MAX_LENGTH} caracteres (${formattedHeader.length})`
    );
  }

  return warnings;
}

/**
 * Arma el mensaje Conventional Commit en formato `tipo(scope): mensaje` o `tipo: mensaje`.
 */
export function buildConventionalCommitMessage(
  input: ConventionalCommitInput
): BuiltConventionalCommit {
  const cleanScope = (input.scope ?? '').trim();
  const scopeError = validateConventionalScope(cleanScope);
  if (scopeError) {
    throw new Error(scopeError);
  }

  const cleanDescription = input.description.trim();
  const descriptionError = validateConventionalDescription(cleanDescription);
  if (descriptionError) {
    throw new Error(descriptionError);
  }

  const prefix = cleanScope ? `${input.type}(${cleanScope})` : input.type;
  const raw = `${prefix}: ${cleanDescription}`;
  const escaped = `${prefix}: ${escapeDoubleQuotes(cleanDescription)}`;
  const warnings = getConventionalCommitWarnings(cleanDescription, raw);

  return {
    raw,
    escaped,
    warnings,
  };
}
