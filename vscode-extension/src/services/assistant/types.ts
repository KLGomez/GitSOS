import type { SupportedLocale } from '../../i18n/index.js';
import type { GitRepositorySnapshot } from '../git/types.js';

/**
 * Pregunta enviada al futuro asistente de GitSOS (Fase 5).
 */
export interface AssistantQuestion {
  prompt: string;
  locale: SupportedLocale;
  gitContext?: GitRepositorySnapshot;
}

/**
 * Respuesta estructurada devuelta por el futuro asistente de GitSOS (Fase 5).
 */
export interface AssistantAnswer {
  explanation: string;
  suggestedCommand?: string;
  warning?: string;
}

/**
 * Puerto de extensión para integrar un chatbot con `vscode.lm` en la Fase 5.
 * El MVP no incluye llamadas a modelos de IA ni servicios externos.
 */
export interface AssistantProvider {
  isAvailable(): Promise<boolean>;
  ask(question: AssistantQuestion): Promise<AssistantAnswer>;
}

/**
 * Implementación nula usada durante el MVP sin IA.
 */
export class DisabledAssistantProvider implements AssistantProvider {
  public async isAvailable(): Promise<boolean> {
    return false;
  }

  public async ask(_question: AssistantQuestion): Promise<AssistantAnswer> {
    throw new Error('El asistente con IA no está habilitado en el MVP de GitSOS.');
  }
}
