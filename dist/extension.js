"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
function activate(context) {
    const openWebview = (url) => {
        const panel = vscode.window.createWebviewPanel("webPreview", `Preview: ${url}`, vscode.ViewColumn.One, {
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
        });
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
    // const defaultUrl = "https://www.wikipedia.org";
    const defaultUrl = "http://localhost:8081";
    openWebview(defaultUrl);
    // Register the command for user input
    const disposable = vscode.commands.registerCommand("openWebPreview.openUrl", async () => {
        const url = await vscode.window.showInputBox({
            prompt: "Enter URL to open",
            placeHolder: "https://example.com or http://localhost:3000",
            validateInput: (text) => {
                try {
                    new URL(text);
                    return null;
                }
                catch {
                    return "Invalid URL format";
                }
            },
        });
        if (url) {
            openWebview(url);
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
