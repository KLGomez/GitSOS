# Guía de publicación de GitSOS (`klgomez.gitsos`)

Esta guía documenta paso a paso cómo publicar **`klgomez.gitsos`** en **Visual Studio Marketplace** y **Open VSX Registry**.

---

## 1. Preparación previa antes de publicar

1. **Identificador de `publisher` ya configurado:**
   - [`package.json`](../package.json) tiene configurado `"publisher": "klgomez"` (ID final: `klgomez.gitsos`).
   - El nombre visible *"Katherine Gomez"* se configura al dar de alta el publisher en el portal de Visual Studio Marketplace.
2. **Capturas PNG reales incorporadas:**
   - Ya se incluyen 4 capturas reales en [`media/capturas/`](../media/capturas/README.md) (`panel-lateral.png`, `zone-git.png`, `conventional-commits.png` y `confirmacion-destructiva.png`), enlazadas con rutas relativas desde [`README.md`](../README.md).
   - Permanecen excluidas de `.vsix` en [`.vscodeignore`](../.vscodeignore) (`media/capturas/**`) para mantener el paquete liviano; `pnpm run package` las reescribe automáticamente con `--baseImagesUrl`.
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

Como la extensión usa `pnpm` y empaquetado con `esbuild` (sin incluir `node_modules` dentro del `.vsix`), `vsce` requiere el flag `--no-dependencies`. Además, como `vscode-extension/` vive dentro de un monorepo (`repository.directory`), `vsce` necesita `--baseContentUrl` y `--baseImagesUrl` apuntando explícitamente a `main/vscode-extension` para que las rutas relativas de `README.md` (ícono, capturas y enlaces como `LICENSE`) no devuelvan `404` en el Marketplace ni en Open VSX.

El script `"package"` en [`package.json`](../package.json) ya incluye ambos parámetros:

```bash
cd vscode-extension
pnpm exec vsce ls --no-dependencies
pnpm run package
```

Equivalente explícito con `vsce`:

```bash
pnpm exec vsce package --no-dependencies --baseContentUrl https://github.com/KLGomez/GitSOS/blob/main/vscode-extension --baseImagesUrl https://raw.githubusercontent.com/KLGomez/GitSOS/main/vscode-extension
```

Esto genera el archivo `gitsos-0.2.3.vsix` (sin ningún archivo `.svg` dentro del paquete y con las URLs de `README.md` reescritas correctamente para el monorepo).

### Prueba en una instalación limpia de VS Code
Podés probar el `.vsix` sin afectar tus extensiones ni configuración actual usando carpetas temporales:

```powershell
$cleanDir = Join-Path $env:TEMP "gitsos-clean-vscode"
code --user-data-dir "$cleanDir\user-data" --extensions-dir "$cleanDir\extensions" --install-extension ".\gitsos-0.2.3.vsix"
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

### 3.2 Crear el Publisher `klgomez`
1. Ingresá a [https://marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage).
2. Hacé clic en **Create publisher**.
3. Completá:
   - **Name:** `Katherine Gomez` *(nombre visible en la ficha del Marketplace)*
   - **ID:** `klgomez` *(debe coincidir exactamente con `"publisher"` en `vscode-extension/package.json`)*

### 3.3 Publicar con `vsce`
Se recomienda empaquetar primero con `pnpm run package` (para que `gitsos-0.2.3.vsix` ya incluya `--baseContentUrl` y `--baseImagesUrl` aplicados al `README.md`) y luego publicar ese artefacto verificado con `--packagePath`:

```bash
cd vscode-extension
pnpm run package
pnpm exec vsce login klgomez
pnpm exec vsce publish --packagePath gitsos-0.2.3.vsix
```

*(Alternativas sin login interactivo definiendo `VSCE_PAT` como variable de entorno:*
- *Publicar el `.vsix` ya empaquetado con `pnpm run package`: `pnpm exec vsce publish --packagePath gitsos-0.2.3.vsix -p $VSCE_PAT`*
- *O empaquetar y publicar en un paso pasando ambos flags del monorepo: `pnpm exec vsce publish --no-dependencies --baseContentUrl https://github.com/KLGomez/GitSOS/blob/main/vscode-extension --baseImagesUrl https://raw.githubusercontent.com/KLGomez/GitSOS/main/vscode-extension -p $VSCE_PAT`.)*

---

## 4. Publicar en Open VSX Registry (VSCodium, Cursor, Gitpod, etc.)

### 4.1 Crear cuenta, firmar acuerdo y generar token
1. Ingresá a [https://open-vsx.org](https://open-vsx.org) iniciando sesión con tu cuenta de **GitHub**.
2. Abrí tu perfil → **Settings** y aceptá el **Eclipse Open VSX Publisher Agreement**.
3. En **Access Tokens**, generá un nuevo token y guardalo en un gestor seguro (nunca lo escribas en archivos del repositorio ni en comandos literales).

### 4.2 Cargar `$env:OVSX_PAT`, verificar, crear namespace y publicar `.vsix`
Cargá el token solo en memoria dentro de tu sesión actual de PowerShell usando `$env:OVSX_PAT`:

```powershell
# PowerShell 7+
$env:OVSX_PAT = Read-Host "Open VSX PAT" -MaskInput

# Alternativa para Windows PowerShell 5.1 (donde no existe -MaskInput)
# $sec = Read-Host "Open VSX PAT" -AsSecureString
# $env:OVSX_PAT = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
```

Luego verificá el token, creá el namespace `klgomez` (solo la primera vez) y publicá `gitsos-0.2.3.vsix` leyendo siempre desde `$env:OVSX_PAT`:

```powershell
cd vscode-extension
pnpm dlx ovsx verify-pat klgomez -p $env:OVSX_PAT
pnpm dlx ovsx create-namespace klgomez -p $env:OVSX_PAT
pnpm dlx ovsx publish gitsos-0.2.3.vsix -p $env:OVSX_PAT
Remove-Item Env:OVSX_PAT
```

*(Nota: `ovsx` también toma automáticamente `OVSX_PAT` del entorno si omitís `-p $env:OVSX_PAT`. Una vez creado el namespace `klgomez`, en futuras versiones solo ejecutás `pnpm dlx ovsx publish gitsos-0.2.3.vsix -p $env:OVSX_PAT` y limpiás la variable con `Remove-Item Env:OVSX_PAT`.)*

---

## 5. Checklist rápido de release

- [x] `"publisher": "klgomez"` configurado en `vscode-extension/package.json`
- [x] Ícono `128×128` PNG (`media/icon.png`) y cero archivos `.svg` en el paquete
- [x] Metadatos (`repository`, `bugs`, `homepage`, `license: MIT`, `categories`, `keywords`) completos
- [x] `pnpm build`, `pnpm lint`, `pnpm format:check` y `pnpm test` en verde
- [x] `pnpm exec vsce ls --no-dependencies` y `gitsos-0.2.3.vsix` verificados
- [x] Capturas PNG reales en `media/capturas/` enlazadas en `README.md` y excluidas del `.vsix`
- [x] Publicar v0.2.3 en Visual Studio Marketplace (`klgomez.gitsos`)
- [ ] Crear namespace `klgomez` y publicar `gitsos-0.2.3.vsix` en Open VSX usando `$env:OVSX_PAT`
