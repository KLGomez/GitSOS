import type { GitCommandSpec, GitSosCommandEntry, InputValidationType } from '../content/types.js';

const PLACEHOLDER_REGEX = /\{\{([a-zA-Z0-9_]+)\}\}/g;
const BRANCH_ALLOWED_REGEX = /^[A-Za-z0-9._/-]+$/;
const MESSAGE_FORBIDDEN_REGEX = /["`$\\;|&<>]/;
const FILE_PATH_FORBIDDEN_REGEX = /[;&|$`"'<>()*?]/;
const REPO_URL_FORBIDDEN_REGEX = /[;&|$`"'<>()*?\\]/;
const REPO_URL_HTTP_SSH_REGEX = /^(https?|ssh):\/\/[A-Za-z0-9._~:@/%+-]+$/i;
const REPO_URL_SCP_REGEX = /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+:[A-Za-z0-9._/-]+$/;
const NON_EMPTY_FORBIDDEN_REGEX = /[;&|$`<>]/;

/**
 * Normaliza un comando simple o multi-paso a un arreglo ordenado de líneas ejecutables.
 */
export function getCommandSteps(comandoGit: GitCommandSpec): string[] {
  return typeof comandoGit === 'string' ? [comandoGit] : [...comandoGit];
}

/**
 * Formatea un comando simple o multi-paso para mostrarlo o copiarlo en líneas separadas.
 */
export function formatCommandForDisplay(comandoGit: GitCommandSpec, separator = '\n'): string {
  return getCommandSteps(comandoGit).join(separator);
}

/**
 * Extrae las claves únicas `{{clave}}` declaradas en una plantilla de comando Git (simple o multi-paso).
 */
export function extractPlaceholders(commandTemplate: GitCommandSpec): string[] {
  const keys = new Set<string>();
  for (const step of getCommandSteps(commandTemplate)) {
    for (const match of step.matchAll(PLACEHOLDER_REGEX)) {
      const key = match[1];
      if (key) {
        keys.add(key);
      }
    }
  }
  return [...keys];
}

/**
 * Valida una entrada del usuario antes de insertarla en un comando enviado a la terminal.
 * Devuelve `undefined` si es válida, o un mensaje simple en español si requiere corrección.
 */
export function validateInput(
  rawValue: string,
  validation: InputValidationType
): string | undefined {
  const value = rawValue.trim();
  if (!value) {
    return 'Escribí un valor antes de continuar.';
  }

  if (/[\r\n]/.test(value)) {
    return 'El valor no puede contener saltos de línea.';
  }

  switch (validation) {
    case 'branch': {
      if (/\s/.test(value)) {
        return 'El nombre de la rama no puede tener espacios.';
      }
      if (!BRANCH_ALLOWED_REGEX.test(value)) {
        return 'Usá solo letras, números, puntos, guiones o barras (ej. feat/login).';
      }
      if (
        value.startsWith('-') ||
        value.startsWith('/') ||
        value.endsWith('/') ||
        value.endsWith('.') ||
        value.endsWith('.lock') ||
        value.includes('..') ||
        value.includes('//') ||
        value === '@'
      ) {
        return 'Ese nombre de rama no es válido en Git (ej. usá feat/mi-cambio).';
      }
      return undefined;
    }
    case 'message': {
      if (value.length > 200) {
        return 'El mensaje es muy largo (máximo 200 caracteres).';
      }
      if (MESSAGE_FORBIDDEN_REGEX.test(value)) {
        return 'Evitá comillas dobles y símbolos especiales como $, `, \\, ;, |, &, < o >.';
      }
      return undefined;
    }
    case 'filePath': {
      if (value.startsWith('-')) {
        return 'La ruta del archivo no puede empezar con guion (-).';
      }
      if (FILE_PATH_FORBIDDEN_REGEX.test(value)) {
        return 'La ruta contiene caracteres no permitidos.';
      }
      return undefined;
    }
    case 'repoUrl': {
      if (/\s/.test(value)) {
        return 'La URL del repositorio no puede tener espacios.';
      }
      if (value.startsWith('-')) {
        return 'La URL del repositorio no puede empezar con guion (-).';
      }
      if (REPO_URL_FORBIDDEN_REGEX.test(value)) {
        return 'La URL contiene caracteres no permitidos.';
      }
      if (!REPO_URL_HTTP_SSH_REGEX.test(value) && !REPO_URL_SCP_REGEX.test(value)) {
        return 'Ingresá una URL de Git válida (ej. https://github.com/usuario/repo.git o git@github.com:usuario/repo.git).';
      }
      return undefined;
    }
    case 'nonEmpty': {
      if (NON_EMPTY_FORBIDDEN_REGEX.test(value)) {
        return 'El texto contiene símbolos no permitidos para la terminal.';
      }
      return undefined;
    }
  }
}

/**
 * Construye los pasos finales del comando Git validando cada dato ingresado y evitando metacaracteres peligrosos.
 */
export function buildGitCommandSteps(
  entry: Pick<GitSosCommandEntry, 'comandoGit' | 'inputs'>,
  values: Record<string, string>
): string[] {
  const specs = entry.inputs ?? [];
  const formattedValues: Record<string, string> = {};

  for (const spec of specs) {
    const rawValue = values[spec.key];
    if (rawValue === undefined) {
      throw new Error(`Falta completar el dato "${spec.key}".`);
    }

    const validationError = validateInput(rawValue, spec.validation);
    if (validationError) {
      throw new Error(validationError);
    }

    const trimmed = rawValue.trim();
    formattedValues[spec.key] =
      spec.validation === 'filePath' && /\s/.test(trimmed) ? `"${trimmed}"` : trimmed;
  }

  const steps = getCommandSteps(entry.comandoGit).map((stepTemplate) => {
    let resolved = stepTemplate;
    for (const spec of specs) {
      const val = formattedValues[spec.key];
      if (val !== undefined) {
        resolved = resolved.replaceAll(`{{${spec.key}}}`, val);
      }
    }
    return resolved;
  });

  const remaining = extractPlaceholders(steps);
  if (remaining.length > 0) {
    throw new Error(`Quedaron datos sin completar en el comando: ${remaining.join(', ')}.`);
  }

  return steps;
}

/**
 * Construye el comando Git final como texto unido por saltos de línea.
 */
export function buildGitCommand(
  entry: Pick<GitSosCommandEntry, 'comandoGit' | 'inputs'>,
  values: Record<string, string>
): string {
  return buildGitCommandSteps(entry, values).join('\n');
}
