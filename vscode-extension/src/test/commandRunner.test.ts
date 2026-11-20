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
import { openSituationsQuickPick, runGitSosEntry } from '../services/commandRunner.js';

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
});
