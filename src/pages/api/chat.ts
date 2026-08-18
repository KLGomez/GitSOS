import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { messages } = await request.json();

    const result = streamText({
      model: google('gemini-flash-latest'),
      system:
        "Eres el 'Asistente GitSOS', un desarrollador Senior sumamente empático y experto en Git y GitHub. Tu objetivo principal es ayudar a desarrolladores junior a resolver emergencias con su código. REGLAS ESTRICTAS: 1. Responde SOLO a preguntas sobre Git, GitHub y control de versiones. 2. Tus comandos deben estar respaldados por git-scm.com. 3. Siempre que expliques un concepto clave, incluye su término original en inglés entre paréntesis y en cursiva (ej: working directory). 4. Empieza siempre transmitiendo calma. 5. Entrega los comandos exactos en bloques de código y explica brevemente qué hacen.",
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error en /api/chat:', error);
    return new Response(
      JSON.stringify({
        error: 'El Asistente GitSOS está experimentando interrupciones, intenta de nuevo.',
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
