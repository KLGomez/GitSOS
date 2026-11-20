import type { GitSosCommandEntry, InputValidationType } from '../content/types.js';

const PLACEHOLDER_REGEX = /\{\{([a-zA-Z0-9_]+)\}\}/g;
const BRANCH_ALLOWED_REGEX = /^[A-Za-z0-9._/-]+$/;
const MESSAGE_FORBIDDEN_REGEX = /["`$\\;|&<>]/;
const FILE_PATH_FORBIDDEN_REGEX = /[;&|$`"'<>()*?]/;
const REPO_URL_FORBIDDEN_REGEX = /[;&|$`"'<>()*?\\]/;
const REPO_URL_HTTP_SSH_REGEX = /^(https?|ssh):\/\/[A-Za-z0-9._~:@/%+-]+$/i;
const REPO_URL_SCP_REGEX = /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+:[A-Za-z0-9._/-]+$/;
const NON_EMPTY_FORBIDDEN_REGEX = /[;&|$`<>]/;

/**
 * Extrae las claves únicas `{{clave}}` declaradas en una plantilla de comando Git.
 */
export function extractPlaceholders(commandTemplate: string): string[] {
  const keys = new Set<string>();
  for (const match of commandTemplate.matchAll(PLACEHOLDER_REGEX)) {
    const key = match[1];
    if (key) {
      keys.add(key);
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
 * Construye el comando Git final validando cada dato ingresado y evitando metacaracteres peligrosos.
 */
export function buildGitCommand(
  entry: Pick<GitSosCommandEntry, 'comandoGit' | 'inputs'>,
  values: Record<string, string>
): string {
  let result = entry.comandoGit;
  const specs = entry.inputs ?? [];

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
    const formattedValue =
      spec.validation === 'filePath' && /\s/.test(trimmed) ? `"${trimmed}"` : trimmed;

    result = result.replaceAll(`{{${spec.key}}}`, formattedValue);
  }

  const remaining = extractPlaceholders(result);
  if (remaining.length > 0) {
    throw new Error(`Quedaron datos sin completar en el comando: ${remaining.join(', ')}.`);
  }

  return result;
}
