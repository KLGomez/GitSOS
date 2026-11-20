export const esMessages = {
  holaMessage: '¡Hola desde GitSOS! Tu guía amigable de Git y GitHub ya está lista en VS Code.',
  holaActionHint: 'Pronto vas a poder resolver dudas y errores de Git paso a paso desde aquí.',
} as const;

export type Messages = {
  readonly [Key in keyof typeof esMessages]: string;
};
