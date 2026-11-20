# Guía de publicación de GitSOS (VS Code Marketplace y Open VSX)

Esta guía documenta paso a paso cómo pasar del paquete local (`gitsos-local`) a la publicación oficial gratuita en **Visual Studio Marketplace** y **Open VSX Registry**.

---

## 1. Preparación previa antes de publicar

1. **Cambiar el identificador de `publisher`:**
   - Abrí [`package.json`](../package.json) dentro de `vscode-extension/`.
   - Reemplazá `"publisher": "gitsos-local"` por tu ID único de publisher registrado (por ejemplo `"klgomez"` o `"gitsos"`).
   - El mismo ID debe existir como **Publisher ID** en Visual Studio Marketplace y como **Namespace** en Open VSX.
2. **Revisar versión y capturas:**
   - Verificá `"version"` en [`package.json`](../package.json) y la entrada correspondiente en [`CHANGELOG.md`](../CHANGELOG.md).
   - Cuando agregues capturas/GIF en [`media/capturas/`](../media/capturas/README.md), quitá `media/capturas/**` de [`.vscodeignore`](../.vscodeignore) (o enlazalas por URL pública HTTPS del repo) y actualizá [`README.md`](../README.md).
3. **Ejecutar todas las verificaciones con `pnpm`:**
   ```bash
   cd vscode-extension
   pnpm install --frozen-lockfile
   pnpm format:check
   pnpm build
   pnpm lint
   pnpm test
   ```

---

## 2. Empaquetado local del `.vsix` (con `pnpm` + `esbuild`)

Como la extensión usa `pnpm` y empaquetado con `esbuild` (sin incluir `node_modules` dentro del `.vsix`), `vsce` requiere el flag `--no-dependencies`:

```bash
cd vscode-extension
pnpm exec vsce ls --no-dependencies
pnpm exec vsce package --no-dependencies
```

Esto genera el archivo `gitsos-<version>.vsix`.

### Prueba en una instalación limpia de VS Code
Podés probar el `.vsix` sin afectar tus extensiones ni configuración actual usando carpetas temporales:

```powershell
$cleanDir = Join-Path $env:TEMP "gitsos-clean-vscode"
code --user-data-dir "$cleanDir\user-data" --extensions-dir "$cleanDir\extensions" --install-extension ".\gitsos-0.2.2.vsix"
code --user-data-dir "$cleanDir\user-data" --extensions-dir "$cleanDir\extensions"
```

*(Al terminar la prueba podés borrar `$cleanDir`).*

---

## 3. Publicar en Visual Studio Marketplace (Microsoft)

### 3.1 Crear organización y Personal Access Token (PAT) en Azure DevOps
1. Ingresá a [https://dev.azure.com](https://dev.azure.com) con tu cuenta Microsoft (o GitHub vinculada) y creá una organización gratuita si aún no tenés una.
2. En el menú superior derecho (*User settings* → **Personal access tokens**), hacé clic en **+ New Token**:
   - **Name:** `vsce-gitsos`
   - **Organization:** **All accessible organizations** *(obligatorio para Marketplace)*
   - **Expiration:** elegí una vigencia cómoda (por ejemplo 90 días).
   - **Scopes:** seleccioná **Show all scopes** → **Marketplace** → marcá **Manage**.
3. Copiá y guardá el token en un lugar seguro (no se vuelve a mostrar).

### 3.2 Crear el Publisher
1. Ingresá a [https://marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage).
2. Hacé clic en **Create publisher**.
3. Completá **Name** (visible, ej. `GitSOS`) y **ID** (único en minúsculas, ej. `klgomez`, que debe coincidir exactamente con `"publisher"` en `vscode-extension/package.json`).

### 3.3 Publicar con `vsce`
Autenticate y publicá desde `vscode-extension/`:

```bash
cd vscode-extension
pnpm exec vsce login <tu-publisher-id>
pnpm exec vsce publish --no-dependencies
```

*(Alternativa para CI sin login interactivo: definir `VSCE_PAT` como variable de entorno y ejecutar `pnpm exec vsce publish --no-dependencies -p $VSCE_PAT`, o `pnpm exec vsce publish --packagePath gitsos-0.2.2.vsix`).*

---

## 4. Publicar en Open VSX Registry (VSCodium, Cursor, Gitpod, etc.)

### 4.1 Crear cuenta, firmar acuerdo y generar token
1. Ingresá a [https://open-vsx.org](https://open-vsx.org) iniciando sesión con tu cuenta de **GitHub**.
2. Abrí tu perfil → **Settings** y aceptá el **Eclipse Open VSX Publisher Agreement**.
3. En **Access Tokens**, generá un nuevo token y guardalo de forma segura.

### 4.2 Crear el Namespace y publicar `.vsix`
Usando el mismo nombre de publisher definido en `package.json`:

```bash
cd vscode-extension
pnpm dlx ovsx create-namespace <tu-publisher-id> -p <TU_OPEN_VSX_TOKEN>
pnpm dlx ovsx publish gitsos-0.2.2.vsix -p <TU_OPEN_VSX_TOKEN>
```

*(Una vez creado el namespace la primera vez, en versiones futuras solo ejecutás `pnpm dlx ovsx publish ...`).*

---

## 5. Checklist rápido de release

- [ ] `"publisher"` actualizado en `vscode-extension/package.json`
- [ ] Versión y fecha actualizadas en `package.json` y `CHANGELOG.md`
- [ ] Capturas reales añadidas y verificadas en `README.md`
- [ ] `pnpm build`, `pnpm lint`, `pnpm format:check` y `pnpm test` en verde
- [ ] `pnpm exec vsce ls --no-dependencies` revisado sin archivos innecesarios
- [ ] `.vsix` instalado y probado en un perfil limpio de VS Code
- [ ] Publicado en Visual Studio Marketplace y Open VSX Registry
