# Arquitectura y Funcionamiento Interno: Asistente GitSOS

## 1. Visión General de la Arquitectura

El **Asistente GitSOS** es una solución de asistencia técnica en tiempo real diseñada para guiar a desarrolladores en la resolución de emergencias y flujos de trabajo con Git y GitHub.

Su arquitectura sigue el patrón de **Islas de React (Astro Islands)** integrado con una **API Serverless en Astro SSR**, comunicada con los modelos de lenguaje de última generación de Google mediante el **Vercel AI SDK**.

```mermaid
flowchart TD
    subgraph Client ["Frontend (React Island)"]
        UI["GitSOSInterface.tsx"]
        QuickSOS["Quick Actions (Chips)"]
        ChatInput["Input de Chat"]
        CustomHook["useChat + sendMessage"]
        StreamConsumer["Markdown & CodeBlock Renderer"]
    end

    subgraph Server ["Backend (Astro Serverless Route)"]
        API["POST /api/chat (chat.ts)"]
        Normalizer["Data Normalization Layer"]
        StreamEngine["streamText Engine (Vercel AI SDK)"]
    end

    subgraph AI ["AI Provider"]
        Gemini["Google Gemini 3.6 Flash"]
    end

    QuickSOS -->|Texto directo| CustomHook
    ChatInput -->|chatInput State| CustomHook
    CustomHook -->|HTTP POST Request| API
    API --> Normalizer
    Normalizer -->|ModelMessage[] + System Prompt| StreamEngine
    StreamEngine <-->|Bi-directional Stream| Gemini
    StreamEngine -->|toUIMessageStreamResponse| UI
    UI --> StreamConsumer
```

---

## 2. Ciclo de Vida de un Mensaje (Data Flow de Extremo a Extremo)

El flujo de datos desde que el usuario interactúa hasta que se renderiza la respuesta se compone de 6 fases secuenciales:

1. **Disparo de la Interacción (Trigger):**
   * El usuario envía un mensaje manual desde el `<input>` o pulsa uno de los botones rápidos de emergencia (*Quick Actions / Chips SOS*).
   * La UI limpia inmediatamente el estado local del input (`setChatInput('')`) y despacha la acción.

2. **Encapsulamiento y Envío en Cliente:**
   * La función envoltorio `sendMessage` normaliza el argumento (admitiendo tanto un `string` plano como un objeto `{ text }`) y se lo transfiere al método subyacente del hook `useChat`.
   * `useChat` genera un identificador temporal para el mensaje del usuario, lo agrega al array reactivo `messages` y dispara una petición `POST` asíncrona hacia `/api/chat`.

3. **Recepción y Normalización en el Backend Serverless:**
   * El endpoint Astro (`src/pages/api/chat.ts`), configurado bajo demanda con `export const prerender = false`, intercepta la petición HTTP y extrae el cuerpo JSON (`body.messages`).
   * **Capa de Normalización:** Se itera sobre el historial de mensajes para transformar formatos heterogéneos (`parts`, `content`, `text`) en una estructura uniforme compatible con el tipo `ModelMessage` del SDK.

4. **Inferencia y Prompt Orchestration:**
   * Se invoca la función `streamText` de la librería `ai`, configurando como proveedor `@ai-sdk/google` con el modelo `gemini-3.6-flash`.
   * Se inyecta el **System Prompt**, el cual delimita la personalidad del asistente (Senior Developer empático), su base de conocimiento (documentación oficial `git-scm.com`), restricciones de dominio y formato de salida.

5. **Streaming HTTP (Server-Sent Events / UI Data Stream):**
   * El backend no espera a que se complete la respuesta completa del modelo; ejecuta `result.toUIMessageStreamResponse()`.
   * Esta respuesta establece un flujo de datos continuo (*chunk-by-chunk*) con cabeceras `Content-Type: text/plain; charset=utf-8` (o el protocolo de streaming UI del SDK).

6. **Consumo Progresivo y Renderizado Reactivo:**
   * En el frontend, `useChat` lee el flujo de bytes, decodifica los fragmentos entrantes y actualiza progresivamente el último mensaje en la lista `messages`.
   * El componente `ReactMarkdown` con el plugin `remark-gfm` procesa el Markdown en vivo, mientras el hook de auto-scroll asegura que la vista acompañe el flujo de generación sin saltos de layout.

---

## 3. Decisiones Técnicas Clave de Arquitectura

### A. Desacoplamiento del Hook `useChat` y Control Manual del Estado

En implementaciones estándar del Vercel AI SDK, es común desestructurar `input`, `handleInputChange` y `handleSubmit` directamente sobre un `<form>`. En GitSOS se optó deliberadamente por un **control de estado desacoplado**:

```typescript
const [chatInput, setChatInput] = useState('');
const chatState = useChat({ api: '/api/chat' });
const rawSendMessage = chatState?.sendMessage;

const sendMessage = (msg: any) => {
  if (!rawSendMessage) return;
  if (typeof msg === 'string') {
    return rawSendMessage({ text: msg });
  }
  return rawSendMessage(msg);
};
```

**Justificación Técnica:**
* **Múltiples Fuentes de Entrada:** El asistente cuenta con dos fuentes de entrada: el campo de texto libre y las opciones rápidas (*"Subí un archivo .env"*, *"Tengo un Merge Conflict"*, etc.). Conectar los botones rápidos a través de eventos sintéticos de formulario hubiera generado código frágil; el wrapper `sendMessage` unifica la vía de despacho.
* **Resiliencia ante Cambios de Firma del SDK:** El wrapper normaliza llamadas con cadenas simples o estructuras de objetos, asegurando compatibilidad fluida entre versiones del cliente y el runtime.
* **Control Determinista del Ciclo de Vida:** Permite limpiar el input, alternar estados de loading y controlar el foco del teclado de forma totalmente predecible.

---

### B. Sistema de Auto-Scroll Inteligente y Bloques de Código Interactivos

La experiencia en chats impulsados por streaming requiere manejar cambios constantes en la altura del contenedor DOM.

```typescript
const messagesEndRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages, isLoading]);
```

**Puntos Destacados de UX/UI:**
* **Ancla DOM (`messagesEndRef`):** Un elemento invisible al final de la lista sirve de referencia para que el navegador recalcule y desplace suavemente la vista cada vez que llega un nuevo token (`messages`) o cambia el estado de carga (`isLoading`).
* **Renderizado Tipográfico Especializado:** La integración de `ReactMarkdown` intercepta los elementos `<pre>` y `<code>` para montar el componente `ChatCodeBlock`:
  * Detecta si el código es *inline* (ej: un comando como `git status`) o un bloque completo.
  * Incorpora un botón de **Copiado al Portapapeles en un clic** con feedback visual instantáneo (`Check` / `Copy`), reduciendo la fricción al ejecutar comandos críticos en la terminal.

---

### C. Backend Serverless con Normalización de Payloads

El endpoint `src/pages/api/chat.ts` opera como una función Serverless / SSR en Astro:

```typescript
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const rawMessages = body?.messages || [];

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
    system: "...",
    messages: formattedMessages,
  });

  return result.toUIMessageStreamResponse();
};
```

**Justificación Técnica:**
* **`prerender = false`:** Habilita el modo dinámico del endpoint en Astro, permitiendo procesar peticiones HTTP `POST` en tiempo de ejecución.
* **Tolerancia a Fallos y Compatibilidad de Esquemas:** Dado que distintos clientes de IA o versiones del SDK pueden enviar arrays de partes multimodales (`parts`) o campos `text`, la función normalizadora aplana el contenido a texto antes de transferirlo al backend de inferencia.
* **Streaming de Baja Latencia (TTFT - Time To First Token):** Mediante `toUIMessageStreamResponse()`, la conexión HTTP se mantiene abierta enviando tokens de forma incremental, minimizando el tiempo percibido de respuesta.

---

### D. Integración de IA y System Prompt Engineering

La capa de inteligencia artificial aprovecha el modelo **`gemini-3.6-flash`** a través del adaptador oficial `@ai-sdk/google`.

**Estrategia del System Prompt:**
* **Definición de Rol y Tono:** Configurado como un desarrollador Senior empático que transmite calma ante situaciones de estrés técnico (pérdida de cambios, conflictos de merge).
* **Delimitación de Dominio (Guardrails):** Restringe las respuestas estrictamente a control de versiones (Git/GitHub), evitando desvíos temáticos o alucinaciones sobre otras tecnologías.
* **Glosario Técnico Bilingüe:** Enseña la terminología en español manteniendo el término estándar en inglés entre paréntesis (*ej: working directory, staging area, commit hash*).
* **Salida Estructurada y Práctica:** Exige entregar comandos exactos en bloques de código ejecutables acompañados de una explicación concisa de su impacto.

---

## 4. Stack Tecnológico Resumido

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework Base** | [Astro](https://astro.build/) (SSR Mode) | Enrutamiento, generación de páginas y hosting de API endpoints. |
| **Componentes de UI** | [React 19](https://react.dev/) | Manejo de estado interactivo del chat y componentes dinámicos. |
| **Estilos e Iconos** | Tailwind CSS + Lucide Icons | Diseño responsivo con estética moderna para entornos de desarrollo. |
| **AI Orchestration** | [Vercel AI SDK](https://sdk.vercel.ai/) (`ai`, `@ai-sdk/react`) | Gestión del ciclo de vida del chat, streaming y hooks de UI. |
| **AI Provider & LLM** | `@ai-sdk/google` / `gemini-3.6-flash` | Inferencia ultrarrápida, razonamiento lógico y generación de comandos Git. |
| **Markdown Parsing** | `react-markdown` + `remark-gfm` | Renderizado seguro de sintaxis Markdown, tablas y bloques de código. |
