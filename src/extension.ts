/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    let fs = require('fs')

    let previewUri = vscode.Uri.parse('timeline-code://authority/timeline-code');
    let successDoc

    class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
        private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

        public provideTextDocumentContent(uri: vscode.Uri): string {
            return this.createMarkDownDoc();
        }

        get onDidChange(): vscode.Event<vscode.Uri> {
            return this._onDidChange.event;
        }

        public update(uri: vscode.Uri) {
            this._onDidChange.fire(uri);
        }

        private createMarkDownDoc() {
            let editor = vscode.window.activeTextEditor;
            if (!(editor.document.languageId === 'markdown')) {
                successDoc = false
                return this.errorSnippet("Active editor doesn't show a MarkDown document - no timeline to link.")
                
            }
            return this.extractSnippet();
        }

        private extractSnippet(): string {
            let invalidDependancies = true

            let editor = vscode.window.activeTextEditor;
            let text = editor.document.getText();
            let regx = /<markdown-html>/g;
            let match = text.match(regx);
            if (match) {
                invalidDependancies = false
            }
            
            if (invalidDependancies) {
                successDoc = false
                return this.errorSnippet("This document has no timeline.");
            } else {
                return this.snippet(editor.document);
            }
        }

        private errorSnippet(error: string): string {
            return `
                <body>
                    ${error}
                </body>`;
        }

        private snippet(document: vscode.TextDocument): string {
            let path = document.uri.toString();
            let pathg = path.split('/');
            pathg.pop();
            const pathJoin = pathg.join('/');

            if (!successDoc) {
                let app = pathJoin + '/app.js';
                let appUri = vscode.Uri.parse(app);
                vscode.commands.executeCommand('vscode.open', appUri, vscode.ViewColumn.One);
                vscode.commands.executeCommand('moveActiveEditor', 'first', 'tab');
                successDoc = document.uri.fsPath;
            }

            let fspath = document.uri.path.toString()
            let fspathg = fspath.split('/');
            fspathg.shift();
            fspathg.pop();
            const fspathLoc = fspathg.join('/');

            let markDownDocument = document.getText();
            markDownDocument = markDownDocument.replace(new RegExp(`<markdown-html>`, `g`), ``)
            .replace(new RegExp(`</markdown-html>`, `g`), ``)
            .replace(new RegExp(
                `<script type=\"text/javascript\" src=\"lib/window.app.js\"></script>`, ``), 
                `<script type=\"text/javascript\" src=\"lib/window.app.js\"></script>
                <script>
                app._fileLocal = '${fspathLoc}/';//expose to file references in code
                app._fileLocalUser = '${fspathLoc}/user/';
                app._fileRef = '${pathJoin}/';//expose to file references in code
                app._fileRefUser = '${pathJoin}/user/';//expose to file references in code
                app._vscodeCommandLink = 'expose'//expose to have code aware of vscode
                </script>`
            )
            .replace(new RegExp(`href=\"`, `g`), `href=\"${pathJoin}/`)
            .replace(new RegExp(`src=\"`, `g`), `src=\"${fspathLoc}/`);
            return `<!DOCTYPE html>
                    <html>
                    ${markDownDocument}
                    <script>
                    app._vscodeCommandOpen = 'command:extension.openCodeRule?';
                    app._vscodeCommandSave = 'command:extension.saveCodeRule?';
                    app._vscodeDocOBJ = ${JSON.stringify(document.uri)};
                    app._vscodeDocOBJ.query = app._fileRef + 'app.js';
                    app._vscodeDocURI = encodeURIComponent(JSON.stringify(app._vscodeDocOBJ));
                    app._vscodeRef = app._vscodeCommandOpen + '%5B' + app._vscodeDocURI + '%5D';
                    app._vscodeCommandLink = document.createElement('a');
                    app._vscodeCommandLink.id = 'vscode.command.link';
                    app._vscodeCommandLink.style.display = 'none';
                    app._vscodeCommandLink.href = app._vscodeRef;
                    document.getElementsByTagName('body').item(0).appendChild(app._vscodeCommandLink);
                    </script>
                    //Render
                    </html>`;
        }
    }

    let provider = new TextDocumentContentProvider();
    let registration = vscode.workspace.registerTextDocumentContentProvider('timeline-code', provider);

    vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
        let editDoc = e.document.uri.fsPath
        if (e.document.languageId === 'markdown' && editDoc === successDoc) {
            provider.update(previewUri);
        }
    });

    vscode.window.onDidChangeTextEditorSelection((e: vscode.TextEditorSelectionChangeEvent) => {
        if (e.textEditor.document.languageId === 'markdown' && !successDoc) {
            provider.update(previewUri);
        }
    })

    let disposable = vscode.commands.registerCommand('extension.linkTimeLineCode', () => {
        return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two, 'Timeline Code Preview').then((success) => {
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });
    });

    //let highlight = vscode.window.createTextEditorDecorationType({ backgroundColor: 'rgba(200,200,200,.35)' });

    vscode.commands.registerCommand('extension.openCodeRule', (uri: vscode.Uri) => {
            let code = uri.query;
            let uriCode = vscode.Uri.parse(code);
            let success = vscode.commands.executeCommand('vscode.open', uriCode, vscode.ViewColumn.One);
    });

    vscode.commands.registerCommand('extension.saveCodeRule', (uri: vscode.Uri) => {
        let fspath = uri.query.toString();

        let fspathq = fspath.split('?');
        const fspathFile = fspathq[0];
        fspathq.shift();
        const fsquery = JSON.parse(fspathq.join('?'));
        const logJSON = JSON.parse(fsquery.logJSON);

        let fspathg = fspath.split('/');
        fspathg.pop();
        const fspathLoc = fspathg.join('/');

        // file = (string) filepath of the file to read
        fs.readFile(fspathLoc + `/${fsquery.file}`, 'utf8', function (err, data) {
            
            /// write to file
            fs.writeFile(fspathFile, decodeURIComponent(uri.fragment), function(err) {
                if(err) {
                    return console.log(err);
                }
            }); 
            if (err) {

                /// write to file
                if(err.code == 'ENOENT') {
                    fs.writeFile(fspathLoc + `/${fsquery.file}`, `var authority = ${JSON.stringify(logJSON)}`, function(err) {
                        if(err) {
                            return console.log(err);
                        }
                    });
                }

                return console.log(err);
            } else {
                let logDATA = JSON.parse(data.replace(new RegExp(`var authority = `, `g`), ``))
                for (let obj in logJSON) {
                    logDATA[obj] = {}
                }
                
                fs.writeFile(fspathLoc + `/${fsquery.file}`, `var authority = ${JSON.stringify(logDATA)}`, function(err) {
                    if(err) {
                        return console.log(err);
                    }
                });
            }
        });    
    });

    context.subscriptions.push(disposable, registration);
}

export function deactivate() {
}