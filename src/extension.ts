import * as vscode from "vscode";
import { getRenderByType } from "./utils/column";
import {
  detectJsonType,
  detectObjectInterface,
  toLabelCase,
  toSnakeCase,
} from "./utils/format";
import axios from "axios";

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

  const translateWithGeminiCommand = vscode.commands.registerCommand(
    "nnt-toolkit.translateWithGemini",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("No active text editor.");
        return;
      }

      const config = vscode.workspace.getConfiguration("nntToolkit");
      const geminiApiKey = config.get<string>("geminiApiKey");
      const targetLanguage = config.get<string[]>("targetLanguage", [
        "vietnamese",
      ]);

      if (!geminiApiKey) {
        vscode.window.showErrorMessage("Gemini API key is not configured.");
        return;
      }

      const url =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
        geminiApiKey;
      const { selections } = editor;

      for (const selection of selections) {
        const text = editor.document.getText(selection);

        try {
          const prompt = `Dịch câu sau sang ngôn ngữ ${targetLanguage}: "${text}". Chỉ trả về bản dịch duy nhất, không giải thích, không thêm thông tin khác.`;
          const data = {
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          };
          const response = await axios.post<any>(url, data, {
            headers: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              "Content-Type": "application/json",
            },
          });

          const result =
            response?.data?.candidates?.[0]?.content?.parts[0]?.text;

          if (result) {
            const newText = result.replace(/\n/g, ""); // Process text before calling edit

            await editor.edit((editBuilder) => {
              editBuilder.replace(selection, newText);
            });
          } else {
            vscode.window.showErrorMessage("Translation result is empty.");
          }
        } catch (error) {
          vscode.window.showErrorMessage(
            "Failed to translate text: " + (error as Error).message
          );
        }
      }
    }
  );

  context.subscriptions.push(
    labelCaseCommand,
    supperSnakeCaseCommand,
    columnFromJsonCommand,
    titleToLocaleCommand,
    translateWithGeminiCommand
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
