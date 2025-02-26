import * as vscode from "vscode";
import { getRenderByType } from "./utils/column";
import {
  detectJsonType,
  detectObjectInterface,
  toLabelCase,
  toSnakeCase,
} from "./utils/format";

export function activate(context: vscode.ExtensionContext) {
  const labelCaseCommand = vscode.commands.registerCommand(
    "nnt-toolkit.labelCase",
    () => {
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const { selections, document } = editor;

        editor.edit((editBuilder) => {
          for (const selection of selections) {
            const text = document.getText(selection);

            const newText = toLabelCase(text);

            editBuilder.replace(selection, newText);
          }
        });
      } else {
        vscode.window.showInformationMessage("No active text editor.");
      }
    }
  );

  const supperSnakeCaseCommand = vscode.commands.registerCommand(
    "nnt-toolkit.supperSnakeCase",
    () => {
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const { selections, document } = editor;

        editor.edit((editBuilder) => {
          for (const selection of selections) {
            const text = document.getText(selection);

            //@ts-ignore
            const newText = toSnakeCase(text).replaceAll(" ", "_");

            editBuilder.replace(selection, newText);
          }
        });
      } else {
        vscode.window.showInformationMessage("No active text editor.");
      }
    }
  );

  const titleToLocaleCommand = vscode.commands.registerCommand(
    "nnt-toolkit.titleToLocale",
    () => {
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const { selections, document } = editor;

        editor.edit((editBuilder) => {
          for (const selection of selections) {
            const text = document.getText(selection);

            //@ts-ignore
            const newText = `t(${toSnakeCase(text).replaceAll(" ", "_")})`
              .replace(",", "")
              .concat(",");

            editBuilder.replace(selection, newText);
          }
        });
      } else {
        vscode.window.showInformationMessage("No active text editor.");
      }
    }
  );

  const columnFromJsonCommand = vscode.commands.registerCommand(
    "nnt-toolkit.columnFromJson",
    async () => {
      const editor = vscode.window.activeTextEditor;
      const clipboardText = await vscode.env.clipboard.readText();

      const dataJson = JSON.parse(clipboardText);

      const typeJson = detectJsonType(dataJson);
      const dataType = detectObjectInterface(dataJson);

      const jsonObj = typeJson === "array" ? dataJson[0] : dataJson;

      const columns = Object.keys(jsonObj).map((key) => {
        return {
          key: toSnakeCase(key),
          type: dataType[key as keyof typeof dataType],
        };
      });

      const config = vscode.workspace.getConfiguration("nntToolkit");

      if (editor) {
        const { selection } = editor;

        editor.edit((editBuilder) => {
          const newText = `const columns: ColumnsType<any> = useMemo(() =>[${columns
            ?.map((item) => {
              const key = toSnakeCase(item.key);
              return `{
            key: '${key}',
            title: "${toLabelCase(key)}",
            dataIndex: '${key}',${
                item.type === "number" ? '\nalign: "right"' : ""
              }
            width: 160,
            ${
              getRenderByType(config, item.type)
                ? `render: (value) => ${getRenderByType(config, item.type)}`
                : ""
            }}`;
            })
            .join("").concat(`{
              title: 'Actions',
              fixed: screen.md && 'right',
              align: 'center',
              width: 90,
              render: (_, record) => (
                <TableAction record={record}  onView={handlePageRedirect} onUpdate={handleUpdate} onDelete={handleDelete} />
              ),
            }`)}
            ],
            [screen.md,handlePageRedirect,handleUpdate,handleDelete],
            );`;

          editBuilder.insert(selection.active, newText);
        });
      } else {
        vscode.window.showInformationMessage("No active text editor.");
      }
    }
  );

  context.subscriptions.push(
    labelCaseCommand,
    supperSnakeCaseCommand,
    columnFromJsonCommand,
    titleToLocaleCommand
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
