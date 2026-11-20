export interface FeatureFlagEnv {
  SHOW_VSCODE_EXTENSION?: string;
  VERCEL_ENV?: string;
  VSCODE_MARKETPLACE_URL?: string;
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
  const configured = readEnv('VSCODE_MARKETPLACE_URL', env)?.trim();
  if (configured && /^https?:\/\//i.test(configured)) {
    return configured;
  }
  return DEFAULT_MARKETPLACE_URL;
}
