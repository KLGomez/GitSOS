# Capturas pendientes para el README de la extensión (`klgomez.gitsos`)

Todavía no se incluyeron capturas reales en esta carpeta para no publicar imágenes falsas ni placeholders en el Marketplace. Cuando tomes las capturas reales desde VS Code (con **F5** o el `.vsix` instalado), agregalas acá en formato **PNG**:

1. **`panel-lateral.png`** (sugerido `440×780` px):
   - Mostrar el panel lateral **Guía Interactiva GitSOS** abierto desde la Activity Bar, con el buscador, los filtros de categoría, al menos una tarjeta expandida mostrando la franja izquierda de color y etiqueta de categoría, y la sección **Las 3 Zonas de Git**.
2. **`conventional-commits.png`** (sugerido `760×420` px):
   - Mostrar el asistente guiado de Conventional Commits en español (`showQuickPick` con los tipos `feat`, `fix`, `docs`, etc. o el paso de descripción).
3. **`quickpick-ayuda.png`** (sugerido `780×460` px):
   - Mostrar la Paleta de Comandos con **`GitSOS: ¿Qué necesito hacer?`** listando las situaciones disponibles.
4. **`confirmacion-destructiva.png`** (sugerido `620×360` px):
   - Mostrar el diálogo modal de confirmación de una acción delicada (`Deshacer último commit`) antes de enviar el comando a la terminal.

## Al agregar las capturas reales
1. Verificá que todas sean `.png` (sin `.svg`) y actualizá [`.vscodeignore`](../../.vscodeignore) para incluir `media/capturas/*.png` (o enlazalas con URL absoluta `https://raw.githubusercontent.com/KLGomez/GitSOS/main/vscode-extension/media/capturas/...`).
2. Agregá la sección de capturas en [`README.md`](../../README.md) usando las rutas PNG válidas para el Marketplace.
