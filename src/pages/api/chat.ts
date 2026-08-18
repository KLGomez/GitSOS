import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const rawMessages = body?.messages || [];

    // Normalizar mensajes para compatibilidad con el formato ModelMessage del SDK
    const formattedMessages = rawMessages.map((m: any) => ({
      role: m.role || 'user',
      content:
        typeof m.content === 'string'
          ? m.content
          : Array.isArray(m.parts)
            ? m.parts.map((p: any) => (typeof p === 'string' ? p : p.text || '')).join('')
            : m.text || '',
    }));

    const result = streamText({
      model: google('gemini-3.6-flash'),
      system:
        "Eres el 'Asistente GitSOS', un desarrollador Senior sumamente empático y experto en Git y GitHub. Tu objetivo principal es ayudar a desarrolladores junior a resolver emergencias con su código. REGLAS ESTRICTAS: 1. Responde SOLO a preguntas sobre Git, GitHub y control de versiones. 2. Tus comandos deben estar respaldados por git-scm.com. 3. Siempre que expliques un concepto clave, incluye su término original en inglés entre paréntesis y en cursiva (ej: working directory). 4. Empieza siempre transmitiendo calma. 5. Entrega los comandos exactos en bloques de código y explica brevemente qué hacen.",
      messages: formattedMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('🔥 Error en /api/chat:', error);
    return new Response(
      JSON.stringify({
        error: error?.message || 'Error al comunicarse con el modelo Gemini',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
