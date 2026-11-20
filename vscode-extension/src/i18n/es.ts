export const esMessages = {
  holaMessage: '¡Hola desde GitSOS! Tu guía amigable de Git y GitHub ya está lista en VS Code.',
  holaActionHint: 'Pronto vas a poder resolver dudas y errores de Git paso a paso desde aquí.',
  quickPickTitle: 'GitSOS: ¿Qué necesito hacer?',
  quickPickPlaceholder:
    'Elegí tu situación o escribí qué te pasó (ej. rama, commit, conflicto, stash)...',
  runInTerminalButton: 'Ejecutar en terminal',
  copyCommandButton: 'Copiar comando',
  confirmDestructiveTitle: 'Confirmar acción delicada de Git',
  confirmDestructiveButton: 'Sí, ejecutar comando',
  noWorkspaceWarning:
    'Abrí una carpeta con tu proyecto en VS Code antes de ejecutar comandos de Git.',
  commandCopiedInfo: 'Comando copiado al portapapeles.',
  commandNotFoundError: 'No se encontró el comando solicitado en el catálogo de GitSOS.',
  terminalName: 'GitSOS',
} as const;

export type Messages = {
  readonly [Key in keyof typeof esMessages]: string;
};
