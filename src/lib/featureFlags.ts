export interface FeatureFlagEnv {
  SHOW_VSCODE_EXTENSION?: string;
  VERCEL_ENV?: string;
  VSCODE_MARKETPLACE_URL?: string;
  VSCODE_OPENVSX_URL?: string;
}

const DEFAULT_MARKETPLACE_URL = 'https://marketplace.visualstudio.com/vscode';

function readEnv(key: keyof FeatureFlagEnv, env?: FeatureFlagEnv): string | undefined {
  if (env) {
    return env[key];
  }
  const fromProcess = typeof process !== 'undefined' ? process.env[key] : undefined;
  if (fromProcess !== undefined) {
    return fromProcess;
  }
  const importMetaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  return importMetaEnv?.[key];
}

function readValidHttpUrl(key: 'VSCODE_MARKETPLACE_URL' | 'VSCODE_OPENVSX_URL', env?: FeatureFlagEnv): string | undefined {
  const configured = readEnv(key, env)?.trim();
  if (configured && /^https?:\/\//i.test(configured)) {
    return configured;
  }
  return undefined;
}

/**
 * Controla la visibilidad de la sección sobre la extensión de VS Code.
 * Por defecto permanece apagada en producción y activa solo en preview deployments de Vercel,
 * salvo que `SHOW_VSCODE_EXTENSION` la active o desactive explícitamente.
 */
export function isVsCodeExtensionSectionEnabled(env?: FeatureFlagEnv): boolean {
  const explicitFlag = readEnv('SHOW_VSCODE_EXTENSION', env)?.trim().toLowerCase();
  if (explicitFlag === 'false' || explicitFlag === '0') {
    return false;
  }
  if (explicitFlag === 'true' || explicitFlag === '1') {
    return true;
  }

  const vercelEnv = readEnv('VERCEL_ENV', env)?.trim().toLowerCase();
  return vercelEnv === 'preview';
}

/**
 * Devuelve la URL de instalación en Visual Studio Marketplace configurable por entorno.
 */
export function getVsCodeMarketplaceUrl(env?: FeatureFlagEnv): string {
  return readValidHttpUrl('VSCODE_MARKETPLACE_URL', env) ?? DEFAULT_MARKETPLACE_URL;
}

/**
 * Devuelve la URL opcional de Open VSX Registry cuando está configurada y es válida.
 */
export function getVsCodeOpenVsxUrl(env?: FeatureFlagEnv): string | undefined {
  return readValidHttpUrl('VSCODE_OPENVSX_URL', env);
}
