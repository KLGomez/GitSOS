import type { SupportedLocale } from '../i18n/index.js';

export type CommandCategory = 'emergencias' | 'ramas' | 'flujo-diario' | 'remoto';

export type InputValidationType = 'branch' | 'message' | 'filePath' | 'repoUrl' | 'nonEmpty';

export interface CommandInputSpec {
  readonly key: string;
  readonly prompt: string;
  readonly placeholder: string;
  readonly validation: InputValidationType;
}

export interface GitSosCommandEntry {
  readonly id: string;
  readonly titulo: string;
  readonly situacion: string;
  readonly explicacionSimple: string;
  readonly comandoGit: string;
  readonly advertencias: readonly string[];
  readonly esDestructivo: boolean;
  readonly categoria: CommandCategory;
  readonly pasosGuia?: readonly string[];
  readonly inputs?: readonly CommandInputSpec[];
  readonly paletteCommandId?: string;
}

export interface CommandsCatalog {
  readonly locale: SupportedLocale;
  readonly version: number;
  readonly commands: readonly GitSosCommandEntry[];
}
