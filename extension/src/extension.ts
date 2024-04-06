// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { initializeApp, initializeEvent, initializeStatusBar } from './services';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "low-code" is now active!');

  const gitInfo = await initializeApp();

  await initializeEvent(gitInfo);

  registerCommands(context);

  initializeStatusBar(context, gitInfo);
}

// This method is called when your extension is deactivated
export function deactivate() {}
