import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const openWebview = (url: string) => {
    const panel = vscode.window.createWebviewPanel(
      "webPreview",
      `Preview: ${url}`,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        portMapping: [
          {
            webviewPort: new URL(url).port ? parseInt(new URL(url).port) : 80,
            extensionHostPort: new URL(url).port
              ? parseInt(new URL(url).port)
              : 80,
          },
        ],
      }
    );

    const csp = `
      default-src 'none';
      img-src ${panel.webview.cspSource} https:;
      script-src 'unsafe-inline' ${panel.webview.cspSource};
      style-src 'unsafe-inline' ${panel.webview.cspSource};
      frame-src ${url};
    `;

    panel.webview.html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <style>
    html, body, iframe {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      border: none;
    }
  </style>
</head>
<body>
  <iframe
    src="${url}"
    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    allow="clipboard-read; clipboard-write"
  ></iframe>
</body>
</html>`;
  };

  // ✅ Open Wikipedia by default on extension activation
  const defaultUrl = "https://www.wikipedia.org";
  // const defaultUrl = "http://localhost:8081";
  openWebview(defaultUrl);

  // Register the command for user input
  const disposable = vscode.commands.registerCommand(
    "openWebPreview.openUrl",
    async () => {
      const url = await vscode.window.showInputBox({
        prompt: "Enter URL to open",
        placeHolder: "https://example.com or http://localhost:3000",
        validateInput: (text) => {
          try {
            new URL(text);
            return null;
          } catch {
            return "Invalid URL format";
          }
        },
      });

      if (url) {
        openWebview(url);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
