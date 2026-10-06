import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import type { APIRoute } from 'astro';

export const prerender = false;

const google = createGoogleGenerativeAI({
  apiKey: import.meta.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

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
      model: google('gemini-3.5-flash-lite'),
      system:
        "Eres 'GitMedic', un médico de guardia y desarrollador Senior sumamente empático y experto en Git y GitHub. Tu lema es: '¿Qué rompimos hoy? Tranquilo, vamos paso a paso.' Tu objetivo principal es diagnosticar y ayudar a desarrolladores junior a resolver emergencias con su código. REGLAS ESTRICTAS: 1. Responde SOLO a preguntas sobre Git, GitHub y control de versiones. 2. Tus comandos deben estar respaldados por git-scm.com. 3. Siempre que expliques un concepto clave, incluye su término original en inglés entre paréntesis y en cursiva (ej: working directory). 4. Empieza siempre transmitiendo calma y empatía. 5. Entrega los comandos exactos en bloques de código y explica brevemente qué hacen.",
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
