# Registro de cambios (Changelog)

Todos los cambios relevantes de la extensión **GitSOS** para VS Code se documentan en este archivo siguiendo el formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [0.1.1] - 2026-11-20

### Corregido
- Soporte nativo para comandos de múltiples pasos en `commands.json` (arreglo de líneas ejecutables en orden) evitando operadores dependientes de shell (`&&` y `;`) para asegurar compatibilidad con Windows PowerShell 5.1, CMD, Bash y Zsh.
- Actualizada la situación **Guardar mis cambios (add y commit)** para enviar primero `git add .` y luego `git commit -m "{{mensaje}}"` como líneas separadas en la terminal integrada.
- Al copiar un comando de varios pasos (tanto desde el panel lateral como desde el diálogo modal), se copian todos los pasos uno por línea.
- Validación reforzada en el cargador de `commands.json` y pruebas unitarias para impedir que cualquier comando del catálogo utilice `&&`, `;` o saltos de línea embebidos.

## [0.1.0] - 2026-11-20

### Agregado
- Panel lateral **Guía interactiva** en la Activity Bar con ícono monocromo adaptable (`media/gitsos-activitybar.svg`).
- Buscador de texto sin sensibilidad a mayúsculas ni tildes y filtros por categoría (`Emergencias`, `Flujo diario`, `Ramas`, `Remoto`).
- Diagrama offline colapsable de **Las 3 Zonas de Git** (*Working Directory* → *Staging Area* → *Local Repository*).
- Catálogo local `commands.json` con **16 situaciones** explicadas en español simple para principiantes, pasos guía y advertencias.
- Selector rápido **`GitSOS: ¿Qué necesito hacer?`** (`gitsos.ayuda`) y 5 comandos clave directos en la Paleta de Comandos (`deshacerUltimoCommit`, `crearRama`, `cambiarRama`, `guardarStash`, `resolverConflictos`).
- Solicitud guiada de parámetros (`showInputBox`) con validación segura de ramas, mensajes, rutas de archivo y URLs de repositorios.
- Confirmación modal obligatoria antes de ejecutar acciones delicadas/destructivas en la terminal integrada `GitSOS`.
- Soporte de temas claro, oscuro y alto contraste usando únicamente variables CSS `--vscode-*`, navegación por teclado y CSP estricta con `nonce`.
- Estructura preparada para internacionalización (`ES`/`EN`) y contratos base para futura integración con `vscode.git` y `vscode.lm` (sin IA en esta versión).
