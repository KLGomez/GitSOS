/**
 * Instantánea del estado actual del repositorio Git del usuario (Fase 5).
 */
export interface GitRepositorySnapshot {
  branchName?: string;
  hasUncommittedChanges: boolean;
  hasMergeConflicts: boolean;
}

/**
 * Puerto de extensión para detectar el estado del repositorio usando la API de `vscode.git` en Fase 5.
 */
export interface GitContextProvider {
  isGitExtensionAvailable(): Promise<boolean>;
  getRepositorySnapshot(): Promise<GitRepositorySnapshot | undefined>;
}
