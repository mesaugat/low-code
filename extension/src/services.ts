import * as vscode from 'vscode';
import simpleGit from 'simple-git';

import { extractURL } from './utils';
import { ChangeReasonMaps } from './maps';
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

  console.log('Config');

  return { remote: extractURL(repoFullPath), getCurrentBranch, getCurrentHead, getUsername };
};

export const initializeEvent = async (gitInfo: GitInfo) => {
  let collectedData: DocumentChangePayload[] = [];

  const processEvent = async (e: vscode.TextDocumentChangeEvent) => {
    const { contentChanges, document, reason } = e;

    if (!contentChanges.length) {
      return;
    }

    const data: DocumentChangePayload = {
      repo_url: gitInfo.remote,
      repo_user: await gitInfo.getUsername(),
      repo_branch: await gitInfo.getCurrentBranch(),
      repo_head: await gitInfo.getCurrentHead(),
      chang_reason: !!reason ? ChangeReasonMaps[reason] : ChangeReason.NONE,
      changed_file: vscode.workspace.asRelativePath(document.uri),
      range_start_line: contentChanges[0].range.start.line,
      range_end_line: contentChanges[0].range.end.line,
      timestamp: new Date().toISOString(),
      is_dirty: document.isDirty,
    };

    console.log(e, data);
  };

  vscode.workspace.onDidChangeTextDocument(async (e: vscode.TextDocumentChangeEvent) => {
    await processEvent(e);
  });

  const clearCollectedData = () => {
    collectedData = [];
  };
};
