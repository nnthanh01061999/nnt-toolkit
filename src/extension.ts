import * as vscode from "vscode";
import { generateMessageFromJson } from "./function/generate-code-from-json";

export function activate(context: vscode.ExtensionContext) {
  let removeConsoleLog = vscode.commands.registerCommand(
    "nnt-toolkit.removeConsoleLog",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        const newText = selectedText.replace(/console\.log\([^)]*\);?/g, "");

        editor.edit((editBuilder) => {
          editBuilder.replace(selection, newText);
        });
      } else {
        vscode.window.showInformationMessage("No active text editor.");
      }
    }
  );

  let generateMessage = vscode.commands.registerCommand(
    "nnt-toolkit.generateMessageFromJson",
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const userInput = await vscode.window.showInputBox({
          prompt: "Enter title: ",
          placeHolder: "e.g. user, post",
        });

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);

        const newText = generateMessageFromJson(selectedText, userInput);

        editor.edit((editBuilder) => {
          editBuilder.replace(selection, newText);
        });
      } else {
        vscode.window.showInformationMessage("No active text editor.");
      }
    }
  );

  context.subscriptions.push(removeConsoleLog, generateMessage);
}

// This method is called when your extension is deactivated
export function deactivate() {}
