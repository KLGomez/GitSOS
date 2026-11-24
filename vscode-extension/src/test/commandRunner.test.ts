import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockTerminals,
  workspaceState,
  showInformationMessageMock,
  showWarningMessageMock,
  showInputBoxMock,
  showQuickPickMock,
  createTerminalMock,
  writeTextMock,
  registerCommandMock,
} = vi.hoisted(() => ({
  mockTerminals: [] as Array<{
    name: string;
    exitStatus: undefined | { code: number };
    show: ReturnType<typeof vi.fn>;
    sendText: ReturnType<typeof vi.fn>;
  }>,
  workspaceState: {
    workspaceFolders: [{ uri: { fsPath: 'c:\\repo-ejemplo' } }] as
      Array<{ uri: { fsPath: string } }> | undefined,
  },
  showInformationMessageMock: vi.fn(),
  showWarningMessageMock: vi.fn(),
  showInputBoxMock: vi.fn(),
  showQuickPickMock: vi.fn(),
  createTerminalMock: vi.fn(),
  writeTextMock: vi.fn(),
  registerCommandMock: vi.fn(),
}));

vi.mock('vscode', () => ({
  InputBoxValidationSeverity: {
    Info: 1,
    Warning: 2,
    Error: 3,
  },
  commands: {
    registerCommand: registerCommandMock,
  },
  env: {
    clipboard: {
      writeText: writeTextMock,
    },
  },
  workspace: {
    get workspaceFolders() {
      return workspaceState.workspaceFolders;
    },
  },
  window: {
    get terminals() {
      return mockTerminals;
    },
    showInformationMessage: showInformationMessageMock,
    showWarningMessage: showWarningMessageMock,
    showInputBox: showInputBoxMock,
    showQuickPick: showQuickPickMock,
    createTerminal: createTerminalMock,
  },
}));

import { AYUDA_COMMAND_ID, registerGitCommands } from '../commands/gitCommands.js';
import { getCommandById } from '../content/loader.js';
import { getMessages } from '../i18n/index.js';
import {
  copyGitSosEntryCommand,
  openSituationsQuickPick,
  runGitSosEntry,
} from '../services/commandRunner.js';

describe('Ejecución de comandos y QuickPick (Fase 2)', () => {
  const messages = getMessages('es');

  beforeEach(() => {
    vi.clearAllMocks();
    mockTerminals.length = 0;
    workspaceState.workspaceFolders = [{ uri: { fsPath: 'c:\\repo-ejemplo' } }];
  });

  it('ejecuta un comando seguro en la terminal integrada y la reutiliza', async () => {
    const stashEntry = getCommandById('guardar-stash', 'es');
    expect(stashEntry).toBeDefined();
    if (!stashEntry) {
      return;
    }

    const fakeTerminal = {
      name: 'GitSOS',
      exitStatus: undefined,
      show: vi.fn(),
      sendText: vi.fn(),
    };
    createTerminalMock.mockReturnValue(fakeTerminal);
    showInformationMessageMock.mockResolvedValue(messages.runInTerminalButton);

    const executed = await runGitSosEntry(stashEntry);
    expect(executed).toBe(true);
    expect(showWarningMessageMock).not.toHaveBeenCalled();
    expect(createTerminalMock).toHaveBeenCalledWith({
      name: 'GitSOS',
      cwd: 'c:\\repo-ejemplo',
    });
    expect(fakeTerminal.show).toHaveBeenCalledWith(true);
    expect(fakeTerminal.sendText).toHaveBeenCalledWith('git stash', true);

    mockTerminals.push(fakeTerminal);
    const executedAgain = await runGitSosEntry(stashEntry);
    expect(executedAgain).toBe(true);
    expect(createTerminalMock).toHaveBeenCalledTimes(1);
    expect(fakeTerminal.sendText).toHaveBeenCalledTimes(2);
  });

  it('pide parámetros con showInputBox y aborta si el usuario cancela', async () => {
    const createBranchEntry = getCommandById('crear-rama', 'es');
    expect(createBranchEntry).toBeDefined();
    if (!createBranchEntry) {
      return;
    }

    const fakeTerminal = {
      name: 'GitSOS',
      exitStatus: undefined,
      show: vi.fn(),
      sendText: vi.fn(),
    };
    createTerminalMock.mockReturnValue(fakeTerminal);

    showInformationMessageMock.mockResolvedValueOnce(messages.runInTerminalButton);
    showInputBoxMock.mockResolvedValueOnce(undefined);

    const cancelled = await runGitSosEntry(createBranchEntry);
    expect(cancelled).toBe(false);
    expect(fakeTerminal.sendText).not.toHaveBeenCalled();

    showInformationMessageMock.mockResolvedValueOnce(messages.runInTerminalButton);
    showInputBoxMock.mockResolvedValueOnce('feat/login');

    const executed = await runGitSosEntry(createBranchEntry);
    expect(executed).toBe(true);
    expect(fakeTerminal.sendText).toHaveBeenCalledWith('git switch -c feat/login', true);
  });

  it('exige confirmación modal antes de ejecutar comandos destructivos', async () => {
    const undoCommitEntry = getCommandById('deshacer-ultimo-commit', 'es');
    expect(undoCommitEntry).toBeDefined();
    if (!undoCommitEntry) {
      return;
    }

    const fakeTerminal = {
      name: 'GitSOS',
      exitStatus: undefined,
      show: vi.fn(),
      sendText: vi.fn(),
    };
    createTerminalMock.mockReturnValue(fakeTerminal);

    showInformationMessageMock.mockResolvedValueOnce(messages.runInTerminalButton);
    showWarningMessageMock.mockResolvedValueOnce(undefined);

    const aborted = await runGitSosEntry(undoCommitEntry);
    expect(aborted).toBe(false);
    expect(showWarningMessageMock).toHaveBeenCalledWith(
      messages.confirmDestructiveTitle,
      expect.objectContaining({ modal: true }),
      messages.confirmDestructiveButton
    );
    expect(fakeTerminal.sendText).not.toHaveBeenCalled();

    showInformationMessageMock.mockResolvedValueOnce(messages.runInTerminalButton);
    showWarningMessageMock.mockResolvedValueOnce(messages.confirmDestructiveButton);

    const confirmed = await runGitSosEntry(undoCommitEntry);
    expect(confirmed).toBe(true);
    expect(fakeTerminal.sendText).toHaveBeenCalledWith('git reset --soft HEAD~1', true);
  });

  it('permite copiar el comando al portapapeles y avisa si falta workspace', async () => {
    const stashEntry = getCommandById('guardar-stash', 'es');
    expect(stashEntry).toBeDefined();
    if (!stashEntry) {
      return;
    }

    showInformationMessageMock.mockResolvedValueOnce(messages.copyCommandButton);
    const copied = await runGitSosEntry(stashEntry);
    expect(copied).toBe(false);
    expect(writeTextMock).toHaveBeenCalledWith('git stash');

    workspaceState.workspaceFolders = undefined;
    showInformationMessageMock.mockResolvedValueOnce(messages.runInTerminalButton);

    const noWorkspace = await runGitSosEntry(stashEntry);
    expect(noWorkspace).toBe(false);
    expect(showWarningMessageMock).toHaveBeenCalledWith(messages.noWorkspaceWarning);
    expect(createTerminalMock).not.toHaveBeenCalled();
  });

  it('abre el QuickPick con todas las situaciones y registra los comandos clave', async () => {
    const fakeTerminal = {
      name: 'GitSOS',
      exitStatus: undefined,
      show: vi.fn(),
      sendText: vi.fn(),
    };
    createTerminalMock.mockReturnValue(fakeTerminal);
    showQuickPickMock.mockImplementationOnce(async (items: Array<{ entry: { id: string } }>) => {
      expect(items.length).toBeGreaterThanOrEqual(8);
      return items.find((item) => item.entry.id === 'ver-estado-actual');
    });
    showInformationMessageMock.mockResolvedValueOnce(messages.runInTerminalButton);

    await openSituationsQuickPick();
    expect(fakeTerminal.sendText).toHaveBeenCalledWith('git status', true);

    registerCommandMock.mockImplementation((_id: string, _cb: () => void) => ({
      dispose: vi.fn(),
    }));
    const disposables = registerGitCommands();
    expect(disposables).toHaveLength(6);

    const registeredIds = registerCommandMock.mock.calls.map((call) => call[0] as string);
    expect(registeredIds).toEqual([
      AYUDA_COMMAND_ID,
      'gitsos.deshacerUltimoCommit',
      'gitsos.crearRama',
      'gitsos.cambiarRama',
      'gitsos.guardarStash',
      'gitsos.resolverConflictos',
    ]);
  });

  it('reutiliza runGitSosEntry desde el webview saltando el modal inicial pero exigiendo inputs y confirmación destructiva', async () => {
    const createBranchEntry = getCommandById('crear-rama', 'es');
    const undoCommitEntry = getCommandById('deshacer-ultimo-commit', 'es');
    const stashEntry = getCommandById('guardar-stash', 'es');
    expect(createBranchEntry).toBeDefined();
    expect(undoCommitEntry).toBeDefined();
    expect(stashEntry).toBeDefined();
    if (!createBranchEntry || !undoCommitEntry || !stashEntry) {
      return;
    }

    const fakeTerminal = {
      name: 'GitSOS',
      exitStatus: undefined,
      show: vi.fn(),
      sendText: vi.fn(),
    };
    createTerminalMock.mockReturnValue(fakeTerminal);

    await copyGitSosEntryCommand(stashEntry);
    expect(writeTextMock).toHaveBeenCalledWith('git stash');
    expect(showInformationMessageMock).toHaveBeenCalledWith(messages.commandCopiedInfo);

    vi.clearAllMocks();

    showInputBoxMock.mockResolvedValueOnce('feat/panel');
    const created = await runGitSosEntry(createBranchEntry, { skipExplanationModal: true });
    expect(created).toBe(true);
    expect(showInformationMessageMock).not.toHaveBeenCalled();
    expect(showInputBoxMock).toHaveBeenCalledTimes(1);
    expect(fakeTerminal.sendText).toHaveBeenCalledWith('git switch -c feat/panel', true);

    vi.clearAllMocks();

    showWarningMessageMock.mockResolvedValueOnce(undefined);
    const cancelledDestructive = await runGitSosEntry(undoCommitEntry, {
      skipExplanationModal: true,
    });
    expect(cancelledDestructive).toBe(false);
    expect(showInformationMessageMock).not.toHaveBeenCalled();
    expect(showWarningMessageMock).toHaveBeenCalledWith(
      messages.confirmDestructiveTitle,
      expect.objectContaining({ modal: true }),
      messages.confirmDestructiveButton
    );
    expect(fakeTerminal.sendText).not.toHaveBeenCalled();

    showWarningMessageMock.mockResolvedValueOnce(messages.confirmDestructiveButton);
    const confirmedDestructive = await runGitSosEntry(undoCommitEntry, {
      skipExplanationModal: true,
    });
    expect(confirmedDestructive).toBe(true);
    expect(fakeTerminal.sendText).toHaveBeenCalledWith('git reset --soft HEAD~1', true);
  });

  it('envía comandos multi-paso línea por línea, los copia uno por línea y mantiene confirmación modal en destructivos', async () => {
    const saveChangesEntry = getCommandById('guardar-cambios', 'es');
    expect(saveChangesEntry).toBeDefined();
    if (!saveChangesEntry) {
      return;
    }

    const fakeTerminal = {
      name: 'GitSOS',
      exitStatus: undefined,
      show: vi.fn(),
      sendText: vi.fn(),
    };
    createTerminalMock.mockReturnValue(fakeTerminal);

    await copyGitSosEntryCommand(saveChangesEntry);
    expect(writeTextMock).toHaveBeenCalledWith('git add .\ngit commit -m "{{mensaje}}"');

    vi.clearAllMocks();

    showInformationMessageMock.mockResolvedValueOnce(messages.copyCommandButton);
    const copiedFromModal = await runGitSosEntry(saveChangesEntry);
    expect(copiedFromModal).toBe(false);
    expect(writeTextMock).toHaveBeenCalledWith('git add .\ngit commit -m "{{mensaje}}"');

    vi.clearAllMocks();

    showInformationMessageMock.mockResolvedValueOnce(messages.runInTerminalButton);
    showQuickPickMock.mockResolvedValueOnce({ label: 'feat', commitType: 'feat' });
    showInputBoxMock.mockResolvedValueOnce('').mockResolvedValueOnce('primer commit');
    const executed = await runGitSosEntry(saveChangesEntry);
    expect(executed).toBe(true);
    expect(showWarningMessageMock).not.toHaveBeenCalled();
    expect(fakeTerminal.sendText).toHaveBeenNthCalledWith(1, 'git add .', true);
    expect(fakeTerminal.sendText).toHaveBeenNthCalledWith(
      2,
      'git commit -m "feat: primer commit"',
      true
    );

    vi.clearAllMocks();

    const destructiveMultiStep = {
      ...saveChangesEntry,
      id: 'destructivo-multipaso',
      esDestructivo: true,
      inputs: [
        {
          key: 'mensaje',
          prompt: 'Mensaje',
          placeholder: 'fix: prueba delicada',
          validation: 'message' as const,
        },
      ],
    };
    showInputBoxMock.mockResolvedValueOnce('fix: prueba delicada');
    showWarningMessageMock.mockResolvedValueOnce(undefined);
    const cancelledDestructive = await runGitSosEntry(destructiveMultiStep, {
      skipExplanationModal: true,
    });
    expect(cancelledDestructive).toBe(false);
    expect(showWarningMessageMock).toHaveBeenCalledWith(
      messages.confirmDestructiveTitle,
      expect.objectContaining({
        modal: true,
        detail: expect.stringContaining('git add .\ngit commit -m "fix: prueba delicada"'),
      }),
      messages.confirmDestructiveButton
    );
    expect(fakeTerminal.sendText).not.toHaveBeenCalled();

    showInputBoxMock.mockResolvedValueOnce('fix: prueba delicada');
    showWarningMessageMock.mockResolvedValueOnce(messages.confirmDestructiveButton);
    const confirmedDestructive = await runGitSosEntry(destructiveMultiStep, {
      skipExplanationModal: true,
    });
    expect(confirmedDestructive).toBe(true);
    expect(fakeTerminal.sendText).toHaveBeenNthCalledWith(1, 'git add .', true);
    expect(fakeTerminal.sendText).toHaveBeenNthCalledWith(
      2,
      'git commit -m "fix: prueba delicada"',
      true
    );
  });

  it('arma Conventional Commits con y sin scope, escapa comillas, avisa sin bloquear y cancela con Escape', async () => {
    const commitEntry = getCommandById('hacer-commit', 'es');
    const saveChangesEntry = getCommandById('guardar-cambios', 'es');
    const prepareEntry = getCommandById('preparar-cambios', 'es');
    expect(commitEntry).toBeDefined();
    expect(saveChangesEntry).toBeDefined();
    expect(prepareEntry).toBeDefined();
    if (!commitEntry || !saveChangesEntry || !prepareEntry) {
      return;
    }

    const fakeTerminal = {
      name: 'GitSOS',
      exitStatus: undefined,
      show: vi.fn(),
      sendText: vi.fn(),
    };
    createTerminalMock.mockReturnValue(fakeTerminal);

    expect(await runGitSosEntry(prepareEntry, { skipExplanationModal: true })).toBe(true);
    expect(fakeTerminal.sendText).toHaveBeenCalledWith('git add .', true);

    vi.clearAllMocks();

    // Con scope y comillas dobles escapadas
    showQuickPickMock.mockResolvedValueOnce({ label: 'feat', commitType: 'feat' });
    showInputBoxMock.mockResolvedValueOnce('ui').mockResolvedValueOnce('agregar botón "Entrar"');
    const withScopeOk = await runGitSosEntry(commitEntry, { skipExplanationModal: true });
    expect(withScopeOk).toBe(true);
    expect(showQuickPickMock).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        title: 'Hacer commit — Paso 1 de 3 — Elegí el tipo de cambio',
      })
    );
    expect(showInputBoxMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ title: 'GitSOS — Hacer commit' })
    );
    expect(showInputBoxMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ title: 'GitSOS — Hacer commit' })
    );
    expect(showWarningMessageMock).not.toHaveBeenCalled();
    expect(fakeTerminal.sendText).toHaveBeenCalledWith(
      'git commit -m "feat(ui): agregar botón \\"Entrar\\""',
      true
    );

    vi.clearAllMocks();

    // Sin scope y con advertencias de estilo (mayúscula, punto final y >72 chars) sin bloquear
    showQuickPickMock.mockResolvedValueOnce({ label: 'fix', commitType: 'fix' });
    showInputBoxMock
      .mockResolvedValueOnce('')
      .mockResolvedValueOnce(
        'Corregir texto demasiado largo para probar que avisa sin bloquear cuando supera el límite.'
      );
    const withWarningsOk = await runGitSosEntry(saveChangesEntry, { skipExplanationModal: true });
    expect(withWarningsOk).toBe(true);
    expect(showQuickPickMock).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        title: 'Guardar mis cambios (atajo add + commit) — Paso 1 de 3 — Elegí el tipo de cambio',
      })
    );
    expect(fakeTerminal.sendText).toHaveBeenNthCalledWith(1, 'git add .', true);
    expect(fakeTerminal.sendText).toHaveBeenNthCalledWith(
      2,
      'git commit -m "fix: Corregir texto demasiado largo para probar que avisa sin bloquear cuando supera el límite."',
      true
    );
    expect(showWarningMessageMock).toHaveBeenCalledWith(
      expect.stringContaining(messages.commitStyleWarningPrefix)
    );

    // Validación en vivo del InputBox devuelve Warning sin bloquear
    const descInputOpts = showInputBoxMock.mock.calls[1]?.[0] as {
      validateInput: (val: string) => unknown;
    };
    expect(descInputOpts.validateInput('Corregir.')).toEqual({
      message: expect.stringContaining('mayúscula'),
      severity: 2,
    });

    vi.clearAllMocks();

    // Cancelación en paso 1 (tipo)
    showQuickPickMock.mockResolvedValueOnce(undefined);
    expect(await runGitSosEntry(commitEntry, { skipExplanationModal: true })).toBe(false);
    expect(showInputBoxMock).not.toHaveBeenCalled();
    expect(fakeTerminal.sendText).not.toHaveBeenCalled();

    // Cancelación en paso 2 (scope)
    showQuickPickMock.mockResolvedValueOnce({ label: 'docs', commitType: 'docs' });
    showInputBoxMock.mockResolvedValueOnce(undefined);
    expect(await runGitSosEntry(commitEntry, { skipExplanationModal: true })).toBe(false);
    expect(showInputBoxMock).toHaveBeenCalledTimes(1);
    expect(fakeTerminal.sendText).not.toHaveBeenCalled();

    vi.clearAllMocks();

    // Cancelación en paso 3 (descripción)
    showQuickPickMock.mockResolvedValueOnce({ label: 'chore', commitType: 'chore' });
    showInputBoxMock.mockResolvedValueOnce('deps').mockResolvedValueOnce(undefined);
    expect(await runGitSosEntry(saveChangesEntry, { skipExplanationModal: true })).toBe(false);
    expect(showInputBoxMock).toHaveBeenCalledTimes(2);
    expect(fakeTerminal.sendText).not.toHaveBeenCalled();
  });
});
