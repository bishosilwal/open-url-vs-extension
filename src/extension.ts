import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('browser.openUrl', async () => {
      const url = await vscode.window.showInputBox({
        prompt: 'Enter URL to open (http, https, localhost, file://)',
        placeHolder: 'https://example.com or http://localhost:3000'
      });

      if (!url) {
        return;
      }

      const panel = vscode.window.createWebviewPanel(
        'webPreview',
        `Preview: ${url}`,
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true
        }
      );

      const htmlPath = path.join(context.extensionPath, 'media', 'webview.html');
      const html = fs.readFileSync(htmlPath, 'utf8');

      panel.webview.html = html + `<script>location.hash = '${encodeURIComponent(url)}'</script>`;
    })
  );
}

export function deactivate() {}
