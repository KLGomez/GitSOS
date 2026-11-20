# Capturas y GIFs para el README de la extensión

Antes de publicar en el Marketplace de VS Code y Open VSX, agregá acá las capturas reales tomadas desde el Extension Development Host (F5):

1. `panel-lateral.png` (sugerido `420x760` o similar): vista del panel lateral **Guía Interactiva GitSOS** abierto con una tarjeta expandida y el diagrama de **Las 3 Zonas de Git**.
2. `quickpick-ayuda.png` (sugerido `800x480`): Paleta de comandos mostrando **`GitSOS: ¿Qué necesito hacer?`** con las situaciones filtrables.
3. `demo-flujo.gif` (opcional, 8–12 segundos, < 2 MB): flujo completo buscando una situación, completando un dato en `showInputBox` y ejecutando el comando en la terminal integrada `GitSOS`.

## Al sumar las capturas reales
1. Eliminá o comentá la línea `media/capturas/**` en `vscode-extension/.vscodeignore` (o subilas al repositorio y referencialas por URL HTTPS en `vscode-extension/README.md`).
2. Reemplazá los bloques de placeholder en `vscode-extension/README.md` por las etiquetas Markdown con las rutas de cada imagen.
