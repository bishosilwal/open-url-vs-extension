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
    // Function to create and show the webview with the provided URL
    const openWebview = (url) => {
        const panel = vscode.window.createWebviewPanel("webPreview", `Preview: ${url}`, vscode.ViewColumn.Active, {
            enableScripts: true,
            retainContextWhenHidden: true,
        });
        panel.webview.html = getWebviewContent(url, panel.webview.cspSource);
    };
    // Command to ask user for a URL and open it
    const disposable = vscode.commands.registerCommand("openUrlPreview.openUrl", async () => {
        const input = await vscode.window.showInputBox({
            prompt: "Enter URL to open",
            placeHolder: "https://example.com or http://localhost:3000",
            validateInput: (text) => {
                if (!text)
                    return "URL is required";
                try {
                    const parsed = new URL(text.startsWith("http") ? text : `https://${text}`);
                    return null;
                }
                catch {
                    return "Invalid URL format";
                }
            },
        });
        if (input) {
            // Add protocol if missing
            const validUrl = input.startsWith("http://") || input.startsWith("https://")
                ? input
                : `https://${input}`;
            openWebview(validUrl);
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
// Generates the HTML content for the webview
function getWebviewContent(url, cspSource) {
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
