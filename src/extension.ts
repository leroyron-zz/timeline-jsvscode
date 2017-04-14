/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

import * as vscode from 'vscode';
import * as templateCODE from './templateCODE';

export function activate(context: vscode.ExtensionContext) {

    let fs = require('fs')
    let successDoc
    let prevSelect
    let prevdirectoryChange
    let docChangeTimer
    let preUri

    function previewUri(bool) {
        let update = Math.floor(Date.now() / 1000);
        if (bool)
            preUri = vscode.Uri.parse('timeline-code://Authority/timeline-code?' + update);
        return preUri
    }

    class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
        private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

        public provideTextDocumentContent(uri: vscode.Uri): string {
            
            return this.createMarkDownDoc(function (string) {
                return string
            });
        }

        get onDidChange(): vscode.Event<vscode.Uri> {
            return this._onDidChange.event;
        }

        public update(uri: vscode.Uri) {
            this._onDidChange.fire(uri);
        }

        private createMarkDownDoc(callback) {
            let editor = vscode.window.activeTextEditor;
            if (!(editor.document.languageId === 'markdown')) {
                successDoc = false
                return this.errorSnippet("Active editor doesn't show a MarkDown document - no timeline to link.")
                
            }
            return this.extractSnippet(callback);
        }

        private extractSnippet(callback): string {
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
                return this.snippet(editor.document, callback);
            }
        }

        private errorSnippet(error: string): string {
            return `
                <body>
                    ${error}
                </body>`;
        }

        private snippet(document: vscode.TextDocument, callback): string {
            let path = document.uri.toString();
            let pathg = path.split('/');
            pathg.pop();
            const pathJoin = pathg.join('/');

            let fspath = document.uri.path.toString()
            let fspathg = fspath.split('/');
            fspathg.shift();
            fspathg.pop();
            const fspathLoc = fspathg.join('/');

            let saveMarkDownDocument, markDownDocument;
            saveMarkDownDocument = markDownDocument = document.getText();
            let _select = /var select = {([^]*)(}\/\/ !end \/\/ don't remove\/modify!)\n?\s/g.exec(markDownDocument);
            let selectString = _select[1].replace(new RegExp(`\n`, `g`), ``)
                .replace(new RegExp(` `, `g`), ``)
                .replace(new RegExp(`mode`, `g`), `"mode"`)
                .replace(new RegExp(`duration`, `g`), `"duration"`)
                .replace(new RegExp(`preload`, `g`), `"preload"`)
            selectString = "{" + selectString + "}"
            let selectJSON = JSON.parse(selectString)
            // even if app.codesetting has been commented out
            //let _appSetting = /(\/\/.*|\/.*|\/\*.*)?app.codesetting = '([^]*)'\n?\s/g.exec(markDownDocument);
            // even if app.codesetting has been commented out
            let _appSetting = /app.codesetting = \'([^]*)\'\n?\s/g.exec(markDownDocument);
            const appSettingReg = /^[A-Za-z]*[A-Za-z][A-Za-z0-9-. _]*$/g.exec(_appSetting[1])// valid characters only
            console.log(_appSetting)
            console.log(appSettingReg)
            let appSetting = ''

            console.log(appSettingReg.length, _appSetting[1].length)
            if (appSettingReg)
                if (appSettingReg.length > 0 && (typeof _appSetting[1] == 'undefined' || _appSetting[1].length == 0))
                    appSettingReg[0] = ''
                else
                    appSetting = appSettingReg[0] + '/';

            console.log(_appSetting)
            console.log(appSettingReg)
            let userFileExists = function (url, callback) {
                fs.stat(url, function (err, stats) {
                    //Check if error defined and the error code is "not exists"
                    if (err) {
                        if (err.code == 'ENOENT') {
                            if (callback)
                                callback(false)
                        }
                    } else {
                        if (callback)
                            callback(true)
                    }
                });
            }

            let writeUserFile = function (url, content, callback) {
                fs.writeFile(url, content, function (err) {
                    if (err) {
                        return console.log(err);
                    } else {
                        if (callback)
                            callback(url)
                    }
                });
            }

            let openUserFile = function (url) {
                console.log(url)
                let appUri = vscode.Uri.parse(url);
                vscode.commands.executeCommand('vscode.open', appUri, vscode.ViewColumn.One);
            }

            let app = pathJoin + '/user/' + appSetting + 'app.js';
            const localApp = `${fspathLoc}/user/${appSetting}app.js`
            const localComment = `${fspathLoc}/user/${appSetting}comment`
            const localSegment = `${fspathLoc}/user/${appSetting}segment`
            const localAction = `${fspathLoc}/user/${appSetting}action`
            const localSound = `${fspathLoc}/user/${appSetting}sound`
            let appTemplate = pathJoin + '/lib/pipeline/app.template.js';
            if (!successDoc) {
                successDoc = document.uri.fsPath;
            }

            const directory = `${fspathLoc}/user/${appSettingReg[0]}`
            const select = `${appSettingReg[0]}`
            prevSelect = prevSelect || select
            prevdirectoryChange = prevdirectoryChange || directory

            var writeOutFilesUpdateJSON = function () {
                if (!selectJSON[prevSelect]) {
                    if (prevSelect != select) {
                        selectJSON[select] = selectJSON[prevSelect]
                    }
                } else {
                    if(!selectJSON[select])
                        selectJSON[select] = { mode: "2d", duration: 2000, preload: [] }
                }
                prevSelect = select
                fs.stat(directory, function (err, stats) {
                    //Check if error defined and the error code is "not exists"
                    if (err) {
                        if (err.code == 'ENOENT') {
                            //Create the directory, call the callback.
                            fs.readdir(prevdirectoryChange, function (err, stats) {
                                if (err || stats) {
                                    if (stats) {
                                        if (stats.length > 0) {
                                            fs.renameSync(prevdirectoryChange, directory)
                                        } else {
                                            fs.mkdirSync(directory);
                                            userFileExists(localApp, function (found) {
                                                if (!found) {
                                                    // Make defaults when there's no app.js
                                                    writeUserFile(localApp, templateCODE.basic.app, function (url) {
                                                        openUserFile(app)
                                                        fs.mkdirSync(directory + '/assets')
                                                        writeUserFile(localComment, templateCODE.basic.comment, undefined);
                                                        writeUserFile(localSegment, templateCODE.basic.segment, undefined);
                                                        writeUserFile(localAction, templateCODE.basic.action, undefined);
                                                        writeUserFile(localSound, templateCODE.basic.sound, undefined);
                                                    });
                                                } else {
                                                    openUserFile(app)
                                                }
                                            })
                                        }
                                    } else if (err) {
                                        if (err.code == 'ENOTEMPTY' || err.code == 'ENOENT') {
                                            fs.mkdirSync(directory);
                                            writeUserFile(localApp, templateCODE.basic.app, function (url) {
                                                openUserFile(app)
                                                fs.mkdirSync(directory + '/assets')
                                                writeUserFile(localComment, templateCODE.basic.comment, undefined);
                                                writeUserFile(localSegment, templateCODE.basic.segment, undefined);
                                                writeUserFile(localAction, templateCODE.basic.action, undefined);
                                                writeUserFile(localSound, templateCODE.basic.sound, undefined);
                                            });
                                        }
                                    }
                                }
                                prevdirectoryChange = directory
                            })
                        }
                    }
                });
            }

            var docrewrite = function (writeOutFilesUpdateJSON) {
                writeOutFilesUpdateJSON()
                let rephraseMarkDown = JSON.stringify(selectJSON)
                    .replace(new RegExp(`"mode":`, `g`), `mode: `)
                    .replace(new RegExp(`"duration":`, `g`), ` duration: `)
                    .replace(new RegExp(`"preload":`, `g`), `\n                        preload: `)
                    .replace(new RegExp(`{"`, `g`), `{\n                    "`)
                    .replace(new RegExp(`]},`, `g`), `]\n                    },\n                    `)
                    .replace(new RegExp(`]}`, `g`), `]\n                    }`)
                    .replace(new RegExp(`}}`, `g`), `}\n                    }`)
                    .replace(new RegExp(`:{`, `g`), `: {`)
                    //.replace(new RegExp(_appSetting[0], `g`), `app.codesetting = '${appSettingReg[0]}'\n`)
                //rephraseMarkDown = '\n                    '+rephraseMarkDown

                saveMarkDownDocument = saveMarkDownDocument.replace(_select[0], 'var select = ' + rephraseMarkDown + '\/\/ !end \/\/ don\'t remove\/modify!\n')

                fs.writeFile(fspathLoc + '/timeline.vscode.md', decodeURIComponent(saveMarkDownDocument), function (err) {
                    if (err) {
                        return console.log(err);
                    }
                });

                markDownDocument = saveMarkDownDocument.replace(new RegExp(`<markdown-html>`, `g`), ``)
                    .replace(new RegExp(`</markdown-html>`, `g`), ``)
                    .replace(new RegExp(
                        `<!-- !VSCode command association goes here // don't remove\/modify! -->`, ``),
                    `<!-- !VSCode command association goes here // don't remove\/modify! -->
                    <script>
                    var authority = {};
                    authority._fileLocal = '${fspathLoc}/';//expose to file references in code
                    authority._fileLocalUser = '${fspathLoc}/user/${appSetting}';
                    authority._fileRef = '${pathJoin}/';//expose to file references in code
                    authority._fileRefUser = '${pathJoin}/user/${appSetting}';//expose to file references in code
                    authority._CommandLink = 'expose'//expose to have code aware of vscode
                    authority._CommandOpen = 'command:extension.openCodeRule?';
                    authority._CommandSave = 'command:extension.saveCodeRule?';
                    authority._DocOBJ = ${JSON.stringify(document.uri)};
                    authority._DocOBJ.query = authority._fileRef + 'app.js';
                    authority._DocURI = encodeURIComponent(JSON.stringify(authority._DocOBJ));
                    authority._Ref = authority._CommandOpen + '%5B' + authority._DocURI + '%5D';
                    authority._CommandLink = document.createElement('a');
                    authority._CommandLink.id = 'vscode.command.link';
                    authority._CommandLink.style.display = 'none';
                    authority._CommandLink.href = authority._Ref;
                    authority.codesetting = '${appSettingReg[0]}'
                    authority.select = ${JSON.stringify(selectJSON)}
                    document.getElementsByTagName('body').item(0).appendChild(authority._CommandLink);
                    </script>`
                    )
                    //.replace(new RegExp(`${_select[1]}`, `g`), `src=\"${'var select = '+JSON.stringify(selectJSON)}/`)
                    //.replace(new RegExp(`\"app.js\"`, `g`), `\"user/${appSetting}app.js\"`)
                    .replace(new RegExp(`script.src = \"`, `g`), `script.src = \"${fspathLoc}/`)
                    .replace(new RegExp(`href=\"`, `g`), `href=\"${pathJoin}/`)
                    .replace(new RegExp(`src=\"`, `g`), `src=\"${fspathLoc}/`)

                    return markDownDocument
            }

            markDownDocument = docrewrite(writeOutFilesUpdateJSON)

            return callback(`<!DOCTYPE html>
                                <html>${markDownDocument}</html>`);
        }
    }

    let provider = new TextDocumentContentProvider();
    let registration = vscode.workspace.registerTextDocumentContentProvider('timeline-code', provider);

    vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
        let editDoc = e.document.uri.fsPath
        if (e.document.languageId === 'markdown' && editDoc === successDoc) {
            clearTimeout(docChangeTimer)
            docChangeTimer = setTimeout(function () {
                vscode.commands.executeCommand('_webview.closeDevTools')
                provider.update(previewUri(false));
                setTimeout(
                function () {
                    vscode.commands.executeCommand('_webview.openDevTools')
                }, 2000);
            }, 2000)
        }
    });

    vscode.window.onDidChangeTextEditorSelection((e: vscode.TextEditorSelectionChangeEvent) => {
        if (e.textEditor.document.languageId === 'markdown' && !successDoc) {
            clearTimeout(docChangeTimer)
            docChangeTimer = setTimeout(function () {
                vscode.commands.executeCommand('_webview.closeDevTools')
                provider.update(previewUri(false));
                setTimeout(
                function () {
                    console.log(vscode.commands.executeCommand('_webview.openDevTools'))
                }, 2000);
            }, 2000)
        }
    })

    let disposable = vscode.commands.registerCommand('extension.linkTimeLineJSCode', () => {
        return vscode.commands.executeCommand('vscode.previewHtml', previewUri(true), vscode.ViewColumn.Two, 'TimeLine JSCode Preview').then((success) => {
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
                    fs.writeFile(fspathLoc + `/${fsquery.file}`, `var Authority = ${JSON.stringify(logJSON)}`, function(err) {
                        if(err) {
                            return console.log(err);
                        }
                    });
                }

                return console.log(err);
            } else {
                let logDATA = JSON.parse(data.replace(new RegExp(`var Authority = `, `g`), ``))
                for (let obj in logJSON) {
                    logDATA[obj] = {}
                }
                
                fs.writeFile(fspathLoc + `/${fsquery.file}`, `var Authority = ${JSON.stringify(logDATA)}`, function(err) {
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