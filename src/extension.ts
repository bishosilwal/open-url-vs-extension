import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  // Function to create and show the webview with the provided URL
  const openWebview = (url: string) => {
    const panel = vscode.window.createWebviewPanel(
      "webPreview",
      `Preview: ${url}`,
      vscode.ViewColumn.Active,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    panel.webview.html = getWebviewContent(url, panel.webview.cspSource);
  };

  // Command to ask user for a URL and open it
  const disposable = vscode.commands.registerCommand(
    "openUrlPreview.openUrl",
    async () => {
      const input = await vscode.window.showInputBox({
        prompt: "Enter URL to open",
        placeHolder: "https://example.com or http://localhost:3000",
        validateInput: (text) => {
          if (!text) return "URL is required";
          try {
            const parsed = new URL(
              text.startsWith("http") ? text : `https://${text}`
            );
            return null;
          } catch {
            return "Invalid URL format";
          }
        },
      });

      if (input) {
        // Add protocol if missing
        const validUrl =
          input.startsWith("http://") || input.startsWith("https://")
            ? input
            : `https://${input}`;
        openWebview(validUrl);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}

// Generates the HTML content for the webview
function getWebviewContent(url: string, cspSource: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="Content-Security-Policy"
        content="default-src 'none'; img-src ${cspSource} https: data:; script-src 'none'; style-src ${cspSource} 'unsafe-inline'; frame-src http: https:;">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Web Preview</title>
      <style>
        html, body, iframe {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          border: none;
        }
      </style>
    </head>
    <body>
      <iframe src="${url}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
    </body>
    </html>
  `;
}
