import * as vscode from 'vscode';

import { COMMAND_NAVIGATE_TO_URL } from './constants';

export const registerCommands = (context: vscode.ExtensionContext) => {
  const { subscriptions } = context;

  subscriptions.push(
    vscode.commands.registerCommand(COMMAND_NAVIGATE_TO_URL, (url: string) => {
      vscode.env.openExternal(vscode.Uri.parse(url));
    })
  );
};
