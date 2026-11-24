# Capturas reales de la extensión (`klgomez.gitsos`)

Esta carpeta reúne las capturas reales en formato **PNG** referenciadas desde [`README.md`](../../README.md):

1. **`panel-lateral.png`** (`720×847` px, 86,42 KB):
   - Panel lateral **Guía Interactiva GitSOS** en VS Code con buscador, filtros por categoría y tarjetas con franja y etiqueta visual.
2. **`zone-git.png`** (`700×780` px, 43,20 KB):
   - Diagrama offline de **Las 3 Zonas de Git** (*Working Directory* → *Staging Area* → *Local Repository*) dentro del panel lateral.
3. **`conventional-commits.png`** (`898×370` px, 61,85 KB):
   - Asistente guiado de Conventional Commits en español mostrando los tipos `feat`, `fix`, `docs`, `style`, `refactor`, `test` y `chore`.
4. **`confirmacion-destructiva.png`** (`1612×708` px, 129,71 KB):
   - Diálogo modal de confirmación de una acción delicada (`Deshacer último commit`) junto a la tarjeta expandida en el panel lateral.

## Estrategia de empaquetado (`.vsix` liviano)
- [`media/capturas/**`](../../.vscodeignore) permanece excluido en `.vscodeignore` para no inflar el `.vsix`.
- Al empaquetar con `pnpm run package`, `vsce` aplica `--baseImagesUrl https://raw.githubusercontent.com/KLGomez/GitSOS/main/vscode-extension` y reescribe automáticamente las rutas relativas del `README.md` a URLs HTTPS absolutas del repositorio.
