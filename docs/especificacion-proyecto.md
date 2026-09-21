# **Proyecto: Guía Interactiva de Git y GitHub**

**Autora:** Katherine Gomez

## **1\. Resumen del Proyecto**

---

Aplicación web diseñada como la guía definitiva de Git y GitHub para desarrolladores junior y estudiantes. El objetivo principal es ofrecer documentación fácil de leer, respaldada por fuentes oficiales, y potenciada por un chatbot asistente que resuelva problemas frecuentes en tiempo real.

## **2\. Arquitectura y Stack Tecnológico**

---

La aplicación se dividirá en contenido estático de alta velocidad (documentación) y componentes dinámicos aislados (chatbot).

| Capa | Tecnología Principal | Propósito y Herramientas Adicionales   |
| :---- | :---- | :---- |
| **Frontend y Contenido** | Astro (con Starlight) | Generación estática para máxima velocidad. Uso de **MDX** para incrustar componentes de React en la documentación. |
| **Diseño y UI** | Figma & Antigravity | Bocetado de wireframes y generación rápida de componentes de interfaz (modo oscuro, barras de navegación). |
| **Despliegue (CI/CD)** | Vercel | Despliegue continuo automatizado con cada push a la rama principal. |

## **3\. Integración del Chatbot Asistente**

---

El chatbot actuará como un "Senior Dev" integrado en la plataforma, enfocado exclusivamente en resolver dudas de control de versiones.

> * **Cerebro (LLM):** Google Gemini API (o GPT-4o mini) por su amplia ventana de contexto y bajo costo.  
> * **Orquestación Frontend:** Vercel AI SDK (hook useChat en React) para manejar el estado, historial y streaming de respuestas sin esfuerzo.  
> * **Restricción de Contexto (Fase 1):** Uso de *System Prompts* estrictos para evitar alucinaciones y forzar respuestas basadas en git-scm.com.  
> * **Escalabilidad (Fase 2):** Implementación de RAG (Retrieval-Augmented Generation) usando bases de datos vectoriales.

## **4\. Estructura del Temario: "Rutas Anti-Frustración"**

---

El contenido estará estructurado en casos de uso reales, huyendo del formato de "diccionario técnico".

### **Módulo 1: El Modelo Mental**

> * Diferencia fundamental entre Git (local) y GitHub (nube).  
> * Las tres zonas de Git: Working Directory, Staging Area, Repository.  
> * Configuración inicial (user.name, user.email).

### **Módulo 2: El Flujo Diario**

> * git status: La herramienta de diagnóstico por excelencia.  
> * git add: Especificar archivos vs. añadir todo.  
> * git commit \-m: Convenciones para mensajes profesionales (feat, fix, style).  
> * git log: Lectura básica del historial.

### **Módulo 3: Multiverso y Despliegues**

> * Creación y navegación de ramas (git branch, git switch / checkout).  
> * Flujos orientados a la web: Por qué probar en una rama nueva antes de fusionar a main (especialmente útil si la rama main despliega automáticamente).  
> * Sincronización remota: git push, git pull y git merge.

### **Módulo 4: La Sala de Emergencias**

> * **Error en mensaje de commit:** Corrección con git commit \--amend.  
> * **Commit en rama equivocada:** Reversión y reubicación con git cherry-pick.  
> * **Cambio de contexto urgente:** Guardado temporal con git stash y git stash pop.  
> * **Archivos sensibles subidos (.env):** Uso de .gitignore y git rm \--cached.  
> * **Merge Conflicts:** Cómo leer los marcadores de conflicto y resolverlos en el editor.  
> * **Viaje en el tiempo:** Diferencia crítica entre git revert y git reset.

## **5\. Plan de Acción (Siguientes Pasos)**

> 1. ---

>    Diseñar las vistas principales (Home, Layout de Documentación, UI del Chatbot) en Figma.  
> 2. Inicializar el proyecto base con Astro y Starlight.  
> 3. Redactar el System Prompt del chatbot y construir un MVP de la interfaz con Antigravity.  
> 4. Escribir el primer tutorial en MDX (Módulo 1).