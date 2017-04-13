# TimeLine JSCode - Visual Studio Code Extension
This will link [TimeLine JSCode][tlc] preforming code launches and execution in vscode virtural web enviorment.

The purpose of the extension is to link TimeLine JSCode enabling it to command VSCode enviorment:
- Open a MarkDown file with TimeLine JSCode Library.
- Use `Link TimeLine JSCode`
- Interact with the Timeline and insert actions, sounds, comments or segments,
- The corresponding code for the insert is opened in the active code tab for edit,
- Edit the code and run the Timeline.

![Demo](https://github.com/leroyron/timeline-vscode/raw/master/images/preview.gif)

# How it works

- The extension implements and registers a [`TextDocumentContentProvider`](http://code.visualstudio.com/docs/extensionAPI/vscode-api#TextDocumentContentProvider) for a particular URI scheme.
- The content provider creates a HTML document that contains the <HTML> block of the MarkDown in the active editor.
- The generated HTML document is modified and contains `app.vscode._fileLocal` to link all local reference files in working directory
- The generated HTML document is modified to command vscode and vice versa with use of `vscode.commands.registerCommand`
- The generated HTML document is then opened in an editor in the 2nd Column using the command `vscode.previewHtml`.
- app.js gets opened in an editor in the 1nd Column using the command `vscode.open` the first time and there after TimeLine JSCodes such as the actions, sounds, comments and segments - are opened by inserting or clicking them in the timeline or running the timeline to open/preview code during playback.

# How to run locally

* `npm install`
* `npm run compile` to start the compiler in watch mode
* open this folder in VS Code and press `F5`
* open the [TimeLine JSCode][tlc] working directory from the extention development host

[tlc]: <https://github.com/leroyron/timeline-jscode>

# Development

Debugging:

Debugger for Chrome

    msjsdiag.debugger-for-chrome

Disabling Chrome Cache

Right-click and Inspect Element to open the DevTools. Now click Network in the toolbar. Finally, check the Disable cache checkbox at the top.

![Disable Chrome Debugger](https://i.stack.imgur.com/Grwsc.png)
