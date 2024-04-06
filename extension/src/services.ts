import * as vscode from 'vscode';
import simpleGit from 'simple-git';

import { extractURL } from './utils';
import { ChangeReasonMaps } from './maps';
import { COMMAND_NAVIGATE_TO_URL } from './commands';
import axiosRequest, { INJEEST_URL } from './request';
import { DocumentChangePayload, ChangeReason, GitInfo } from './types';

export const initializeApp = async (): Promise<GitInfo> => {
  const workSpaceFolders = vscode.workspace.workspaceFolders;

  if (!workSpaceFolders || !workSpaceFolders.length) {
    console.log('No git repository found.');
    process.exit(1);
  }

  const workspacePath = vscode.workspace.getWorkspaceFolder(workSpaceFolders[0].uri)?.uri.path;
  const initilizedGit = simpleGit(workspacePath);

  const remotes = await initilizedGit.getRemotes(true);
  const repoFullPath = remotes[0].refs.push;

  const getCurrentHead = async () => {
    return await initilizedGit.revparse(['HEAD']);
  };

  const getCurrentBranch = async () => {
    return (await initilizedGit.branch()).current;
  };

  const getUsername = async () => {
    const localUser = await initilizedGit.getConfig('user.name', 'local');
    if (localUser.value) {
      return localUser.value;
    }

    const globalUser = await initilizedGit.getConfig('user.name', 'global');
    if (globalUser.value) {
      return globalUser.value;
    }

    const systemUser = await initilizedGit.getConfig('user.name', 'system');
    if (systemUser.value) {
      return systemUser.value;
    }

    const worktreeUser = await initilizedGit.getConfig('user.name', 'worktree');
    if (worktreeUser.value) {
      return worktreeUser.value;
    }

    return '';
  };

  const getUserEmail = async () => {
    const localUserEmail = await initilizedGit.getConfig('user.email', 'local');
    if (localUserEmail.value) {
      return localUserEmail.value;
    }

    const globalUserEmail = await initilizedGit.getConfig('user.email', 'global');
    if (globalUserEmail.value) {
      return globalUserEmail.value;
    }

    const systemUserEmail = await initilizedGit.getConfig('user.email', 'system');
    if (systemUserEmail.value) {
      return systemUserEmail.value;
    }

    const worktreeUserEmail = await initilizedGit.getConfig('user.email', 'worktree');
    if (worktreeUserEmail.value) {
      return worktreeUserEmail.value;
    }

    return '';
  };

  return { remote: extractURL(repoFullPath), getCurrentBranch, getCurrentHead, getUsername, getUserEmail };
};

/**
 * Main function to initialize event and data workflow.
 *
 * @param {GitInfo} gitInfo
 * @returns {Promise<void>}
 */
export const initializeEvent = async (gitInfo: GitInfo): Promise<void> => {
  const INTERVAL_RATE = 15000;

  let collectedData: DocumentChangePayload[] = [];

  const processEvent = async (e: vscode.TextDocumentChangeEvent) => {
    const { contentChanges, document, reason } = e;

    if (!contentChanges.length) {
      return;
    }

    const data: DocumentChangePayload = {
      repo_url: gitInfo.remote,
      repo_user: await gitInfo.getUsername(),
      repo_user_email: await gitInfo.getUserEmail(),
      repo_branch: await gitInfo.getCurrentBranch(),
      repo_head: await gitInfo.getCurrentHead(),
      change_reason: !!reason ? ChangeReasonMaps[reason] : ChangeReason.NONE,
      changed_file: vscode.workspace.asRelativePath(document.uri),
      range_start_line: contentChanges[0].range.start.line,
      range_end_line: contentChanges[0].range.end.line,
      timestamp: new Date().toISOString(),
      is_dirty: document.isDirty,
    };

    collectedData.push(data);
  };

  /**
   * Pushes data to backend server and clears the collected data.
   * @returns {void}
   */
  const postPush = (): void => {
    collectedData = [];
  };

  /**
   * Pushes data to backend server and clears the collected data.
   *
   * @returns {Promise<void>}
   */
  const pushData = async (): Promise<void> => {
    if (collectedData.length) {
      try {
        console.log(collectedData);
        const res = await axiosRequest.post(INJEEST_URL, collectedData);
        console.log('Response', res);
        postPush();
      } catch (err) {
        console.log('Error', err);
      }
    }
  };

  setInterval(pushData, INTERVAL_RATE);

  vscode.workspace.onDidChangeTextDocument(async (e: vscode.TextDocumentChangeEvent) => {
    await processEvent(e);
  });
};

export const initializeStatusBar = (context: vscode.ExtensionContext, gitInfo: GitInfo) => {
  const { subscriptions } = context;

  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 500);

  const statusBarCommand = {
    title: 'statusBarCommand',
    command: COMMAND_NAVIGATE_TO_URL,
    arguments: ['https://google.com'],
  };

  statusBarItem.text = 'Low Code';
  statusBarItem.command = statusBarCommand;
  subscriptions.push(statusBarItem);
  statusBarItem.show();
};
