# GitSOS - Guía Interactiva de Git y GitHub

**Autora:** Katherine Gomez

## 📖 Resumen del Proyecto

**GitSOS** es una aplicación web diseñada como la guía definitiva de Git y GitHub para desarrolladores junior y estudiantes. Nuestro objetivo principal es ofrecer documentación fácil de leer, respaldada por fuentes oficiales, y potenciada por un chatbot asistente impulsado por Inteligencia Artificial que resuelva problemas frecuentes en tiempo real.

## 🚀 Arquitectura y Stack Tecnológico

La aplicación se divide en contenido estático de alta velocidad (documentación) y componentes dinámicos aislados (chatbot).

- **Frontend y Contenido:** Astro (con Starlight) para generación estática. Uso de MDX para incrustar componentes de React.
- **Diseño y UI:** Figma y Antigravity para wireframes y componentes rápidos.
- **Despliegue (CI/CD):** Vercel para despliegue automatizado con cada push.
- **Chatbot Asistente:** Google Gemini API (o GPT-4o mini) integrado con Vercel AI SDK.

## 📚 Temario: "Rutas Anti-Frustración"

El contenido está enfocado en casos de uso reales:

1. **El Modelo Mental:** Diferencia entre Git y GitHub, las tres zonas de Git, y configuración inicial.
2. **El Flujo Diario:** `git status`, `git add`, `git commit -m` y `git log`.
3. **Multiverso y Despliegues:** Manejo de ramas (`branch`, `switch`, `checkout`) y sincronización (`push`, `pull`, `merge`).
4. **La Sala de Emergencias:** Resolviendo desastres con `amend`, `cherry-pick`, `stash`, `rm --cached`, conflictos de merge, y la diferencia entre `revert` y `reset`.

## 🛠️ Reglas de Contribución y Desarrollo

Este proyecto sigue reglas estrictas de control de versiones definidas en el archivo `AGENTS.md`:

1. **Rama de Trabajo:** Antes de modificar código, se debe verificar o crear la rama `develop` a partir de `main`. **Todo el trabajo debe hacerse exclusivamente en `develop`**.
2. **Commits y Pushes:** Los agentes / asistentes no deben ejecutar `git commit` ni `git push` automáticamente. Se deben mostrar los cambios y esperar la **autorización explícita** ("autorizado" o "hacé el commit") del usuario.
