# 🚀 GitSOS — Guía Interactiva & Asistente de Rescate con IA

[![Astro](https://img.shields.io/badge/Astro-v7.1-BC52EE?style=flat-square&logo=astro&logoColor=white)](https://astro.build/)
[![React](https://img.shields.io/badge/React-v19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-v7-black?style=flat-square&logo=vercel&logoColor=white)](https://sdk.vercel.ai/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.6_Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](LICENSE)

> **GitSOS** es una plataforma interactiva y asistente inteligente diseñada para transformar la curva de aprendizaje de Git y GitHub en una experiencia clara, empática y libre de frustraciones para desarrolladores junior y estudiantes.

---

## 📌 Tabla de Contenidos

- [💡 Visión y Propósito](#-visión-y-propósito)
- [✨ Características Principales](#-características-principales)
- [🛠️ Stack Tecnológico](#️-stack-tecnológico)
- [🏛️ Arquitectura del Sistema](#️-arquitectura-del-sistema)
- [📂 Estructura del Proyecto](#-estructura-del-proyecto)
- [⚡ Instalación y Uso Local](#-instalación-y-uso-local)
- [🧭 Rutas Anti-Frustración (Contenido)](#-rutas-anti-frustración-contenido)
- [👩‍💻 Autora](#-autora)
- [📄 Licencia](#-licencia)

---

## 💡 Visión y Propósito

El control de versiones es una de las competencias más críticas del desarrollo de software moderno, pero también representa una de las mayores fuentes de ansiedad para quienes dan sus primeros pasos en la industria. Conceptos abstractos como el árbol de commits, la disociación entre local y remoto o los temidos *merge conflicts* suelen generar bloqueos y pérdida accidental de trabajo.

**GitSOS** aborda este desafío desde dos frentes complementarios:
1. **Didáctica Visual Basada en Casos Reales:** Documentación modular estructurada en "Rutas Anti-Frustración", enriquecida con diagramas interactivos de las zonas de Git y explicaciones respaldadas por los estándares de [git-scm.com](https://git-scm.com).
2. **Asistencia en Tiempo Real (Senior AI Companion):** Un chatbot contextual alimentado por Google Gemini que diagnostica errores, entrega comandos precisos y ofrece contención técnica paso a paso ante cualquier emergencia en la terminal.

---

## ✨ Características Principales

### 🤖 Asistente de Rescate con IA (Google Gemini + Vercel AI SDK)
- **Streaming de Respuestas en Tiempo Real:** Integración fluida mediante `@ai-sdk/react` (`useChat`) y `@ai-sdk/google` que genera soluciones interactivas sin latencia percibida.
- **System Prompt Riguroso y Empático:** Diseñado para asumir el rol de un *Senior Developer* enfocado en transmitir calma, acotar sus respuestas al ecosistema Git/GitHub y entregar comandos verificables con sus conceptos técnicos en inglés (*working directory*, *staging area*, etc.).
- **Quick Action Chips:** Botones de acceso rápido para resolver las dudas y accidentes más frecuentes con un solo clic (*"Subí un archivo .env"*, *"Commit en la rama equivocada"*, *"Tengo un Merge Conflict"*).

### 📚 Motor de Contenido Dinámico MDX & Content Collections
- **Colecciones Tipadas con Zod:** Configuración moderna en `src/content.config.ts` utilizando el `glob` loader de Astro para garantizar validación de esquema en tiempo de compilación.
- **Componentes React Interactivos Embebidos:** Capacidad de insertar widgets e infografías dinámicas (como el diagrama `GitZonesDiagram`) directamente dentro de los archivos `.mdx`.

### 🍱 Diseño Mobile First con Bento Grid
- **Dashboard Modular:** Disposición visual inspirada en Bento Grid en la vista principal (`index.astro`), organizando módulos de aprendizaje y accesos rápidos mediante tarjetas limpias con alto contraste.
- **Navegación Móvil Adaptativa:** Drawer lateral deslizable con transiciones fluidas, menús táctiles optimizados y overlays de fondo para una experiencia natural en pantallas pequeñas.

### 💻 UI Personalizada con Estilo Terminal macOS
- **Bloques de Código Estilizados:** Componentes de código con cabecera superior y botones *traffic lights* al estilo macOS (rojo, amarillo y verde).
- **Copiado al Portapapeles con un Clic:** Botón interactivo de copia rápida con estado de confirmación visual (`Check` / `Copy`) tanto en el chat de IA como en los artículos de documentación.
- **Paleta Slate & Neón:** Entorno de modo oscuro profundo (`slate-950`), resaltados sintácticos en verde esmeralda e índigo, y tipografía monoespaciada para una lectura técnica cómoda.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Versión | Descripción y Razón de Elección |
| :--- | :--- | :--- | :--- |
| **Framework Base** | [Astro](https://astro.build/) | `v7.1.6` | Motor de generación estática y server-side rendering híbrido con arquitectura de islas. |
| **Integración UI** | [React](https://react.dev/) | `v19.2.8` | Biblioteca para componentes interactivos de alta fidelidad (Chat, diagramas, menús). |
| **Estilos** | [Tailwind CSS](https://tailwindcss.com/) | `v4.3.3` | Motor de utilidades CSS de última generación compilado a través de `@tailwindcss/vite`. |
| **Tipografía** | [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin) | `v0.5.20` | Formato editorial impecable para bloques de lectura `.prose`. |
| **Orquestación IA** | [Vercel AI SDK](https://sdk.vercel.ai/) | `v7.0.67` | Abstracción unificada para streaming y gestión del ciclo de vida del chat en React. |
| **Modelo LLM** | [Google Gemini](https://ai.google.dev/) | `gemini-3.6-flash` | Modelo de lenguaje ultrarrápido con amplia ventana de contexto y bajo costo operativo. |
| **Contenido Técnico** | [@astrojs/mdx](https://docs.astro.build/en/guides/integrations-guide/mdx/) | `v7.0.5` | Extensión de Markdown que permite combinar prosa enriquecida con componentes React. |
| **Iconografía** | [Lucide React](https://lucide.dev/) | `v1.28.0` | Set de iconos vectoriales ligeros, consistentes y altamente personalizables. |
| **Markdown Parser** | [React Markdown](https://github.com/remarkjs/react-markdown) | `v10.1.0` | Renderizado seguro de Markdown y extensiones GFM dentro de los globos del chat. |
| **Despliegue / SSR** | [@astrojs/vercel](https://docs.astro.build/en/guides/integrations-guide/vercel/) | `v11.0.5` | Adaptador serverless para ejecución del endpoint `/api/chat` en la infraestructura de Vercel. |

---

## 🏛️ Arquitectura del Sistema

```
                        ┌─────────────────────────────────────────────────┐
                        │             Navegador / Cliente                 │
                        └───────────────────────┬─────────────────────────┘
                                                │
                 ┌──────────────────────────────┴─────────────────────────────┐
                 ▼                                                           ▼
    ┌──────────────────────────┐                                ┌──────────────────────────┐
    │  Documentación Estática  │                                │  Isla React (client:load)│
    │  Astro SSG (Prerendered) │                                │  src/components/         │
    │  HTML / CSS Ultraligero  │                                │  GitSOSInterface.tsx     │
    └──────────────────────────┘                                └─────────────┬────────────┘
                                                                              │
                                                                       POST /api/chat
                                                                    (Vercel AI SDK Stream)
                                                                              │
                                                                              ▼
                                                                ┌──────────────────────────┐
                                                                │ Endpoint Serverless Astro│
                                                                │  src/pages/api/chat.ts   │
                                                                └─────────────┬────────────┘
                                                                              │
                                                                  Google Generative AI API
                                                                    (Gemini 3.6 Flash)
                                                                              │
                                                                              ▼
                                                                ┌──────────────────────────┐
                                                                │   Stream de Respuestas   │
                                                                │     Modelo "Senior"      │
                                                                └──────────────────────────┘
```

1. **Astro Islands (Hidratación Selectiva):** Las páginas estáticas se sirven con cero JavaScript por defecto. Únicamente la interfaz del chat (`GitSOSInterface`) y los diagramas interactivos se hidratan en el cliente mediante la directiva `client:load`.
2. **Renderizado Híbrido:** La configuración `output: 'server'` en `astro.config.mjs` habilita funciones backend dinámicas para la API de chat, mientras que las páginas de contenido en `src/pages/docs/[...slug].astro` utilizan `export const prerender = true;` para servirse a la velocidad de la luz vía CDN.
3. **Seguridad en la Invocación del Modelo:** La API Key de Google Gemini reside exclusivamente en el entorno del servidor y nunca se expone al frontend.

---

## 📂 Estructura del Proyecto

```text
GitSOS/
├── .env.example                 # Plantilla de variables de entorno requeridas
├── astro.config.mjs             # Configuración de Astro, Tailwind (Vite), React y Vercel
├── package.json                 # Dependencias y scripts de ejecución
├── tsconfig.json                # Configuración de TypeScript
│
├── public/                      # Recursos estáticos servidos directamente
│   └── favicon.svg              # Isotipo oficial de GitSOS
│
└── src/
    ├── components/              # Componentes de UI e Islas de React
    │   ├── GitSOSInterface.tsx  # Layout principal interactivo: Sidebar, Header y Chatbot IA
    │   ├── GitZonesDiagram.tsx  # Diagrama interactivo de las 3 Zonas de Git para MDX
    │   └── Sidebar.astro        # Componente auxiliar de navegación
    │
    ├── content/                 # Colecciones de contenido y documentación técnica
    │   └── docs/                # Artículos en formato MDX estructurados por módulos
    │       ├── modelo-mental.mdx
    │       ├── flujo-diario.mdx
    │       ├── colaboracion-remota.mdx
    │       ├── flujo-ramas-nube.mdx
    │       ├── multiverso-despliegues.mdx
    │       ├── introduccion-cicd.mdx
    │       ├── sala-emergencias.mdx
    │       └── glosario-bibliografia.mdx
    │
    ├── content.config.ts        # Definición de colecciones y validación de esquemas (Zod)
    │
    ├── layouts/                 # Plantillas de envoltura para páginas
    │   └── DocLayout.astro      # Layout base para la renderización de artículos MDX
    │
    ├── pages/                   # Enrutamiento de la aplicación
    │   ├── api/
    │   │   └── chat.ts          # Endpoint SSR para streaming de chat con Gemini
    │   ├── docs/
    │   │   └── [...slug].astro  # Ruta dinámica SSG para servir la documentación MDX
    │   └── index.astro          # Landing page principal con Bento Grid
    │
    └── styles/                  # Estilos globales de la aplicación
        └── global.css           # Directivas y extensiones de Tailwind CSS v4
```

---

## ⚡ Instalación y Uso Local

Sigue estos pasos para clonar y ejecutar GitSOS en tu entorno de desarrollo local:

### 1. Prerrequisitos
- **Node.js:** Versión `>= 22.12.0` recomendada.
- **Gestor de paquetes:** `npm` (incluido con Node) o `pnpm`.
- **API Key de Google Gemini:** Puedes obtener una clave gratuita en [Google AI Studio](https://aistudio.google.com/).

### 2. Clonar el Repositorio
```bash
git clone https://github.com/KLGomez/GitSOS.git
cd GitSOS
```

### 3. Instalar Dependencias
```bash
npm install
```

### 4. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto tomando como base `.env.example`:

```bash
cp .env.example .env
```

Abre `.env` y añade tu clave de API de Google Gemini:
```env
GOOGLE_GENERATIVE_AI_API_KEY=tu_api_key_de_gemini_aqui
```

### 5. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```

La aplicación estará disponible de inmediato en [http://localhost:4321](http://localhost:4321).

> **💡 Tip de Desarrollo:** Si deseas iniciar el servidor de Astro en segundo plano según las directrices del proyecto, utiliza:
> ```bash
> npx astro dev --background
> ```
> Administra el proceso con `npx astro dev status`, `npx astro dev logs` y `npx astro dev stop`.

### 6. Scripts Disponibles

| Comando | Acción |
| :--- | :--- |
| `npm run dev` | Inicia el entorno local de desarrollo con Hot Module Replacement (HMR). |
| `npm run build` | Compila los assets estáticos y empaqueta las funciones serverless en `/dist`. |
| `npm run preview` | Previsualiza localmente el build de producción antes de desplegar. |
| `npm run astro ...` | Ejecuta comandos nativos del CLI de Astro (ej. `astro check`). |

---

## 🧭 Rutas Anti-Frustración (Contenido)

El plan de estudios de GitSOS está estructurado de manera pragmática en 4 módulos progresivos:

1. **El Modelo Mental (`/docs/modelo-mental`):**
   - Diferencia fundamental entre Git (motor local) y GitHub (alojamiento en la nube).
   - Las tres zonas operativas: *Working Directory*, *Staging Area* y *Local Repository*.
   - Configuración inicial de identidad (`user.name` y `user.email`).
2. **El Flujo Diario (`/docs/flujo-diario`):**
   - Diagnóstico continuo con `git status`.
   - Preparación atómica de cambios con `git add`.
   - Buenas prácticas para mensajes de commit profesionales (convenciones *Conventional Commits*).
   - Exploración del historial con `git log`.
3. **Multiverso y Despliegues (`/docs/multiverso-despliegues` & `/docs/flujo-ramas-nube`):**
   - Ciclo de vida de ramas (`git branch`, `git switch`).
   - Sincronización remota segura (`git push`, `git pull`, `git fetch`).
   - Estrategias de integración con `git merge` y flujo de *Pull Requests*.
4. **La Sala de Emergencias (`/docs/sala-emergencias`):**
   - Corrección de commits recientes con `git commit --amend`.
   - Reubicación de cambios y cherry-picking.
   - Resguardo temporal de tareas con `git stash` y `git stash pop`.
   - Protección de credenciales y desindexación con `.gitignore` y `git rm --cached`.
   - Anatomía y resolución guiada de *Merge Conflicts*.
   - El viaje en el tiempo: cuándo usar `git revert` vs. `git reset`.

---

## 👩‍💻 Autora

**Katherine Gomez**  
- Portfolio / GitHub: [@KLGomez](https://github.com/KLGomez)  
- Proyecto: [GitSOS Repository](https://github.com/KLGomez/GitSOS)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<p align="center">
  Hecho con ❤️, Astro y Gemini para que nunca más tengas miedo de abrir una terminal.
</p>
