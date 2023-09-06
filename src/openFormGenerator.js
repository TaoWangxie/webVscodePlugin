const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const previewPanel = require('./panel');

module.exports = function (context) {

    vscode.commands.registerCommand('extension.openFormGenerator', (uri) => {
        console.dir(uri);
        if (uri) {
            let dirPath = uri.fsPath,
                stat = fs.lstatSync(dirPath);
            if (stat.isFile()) dirPath = path.dirname(dirPath);

            vscode.commands.executeCommand(
                'extension.operationGlobalVariable',
                ({ PanelView }) => {
                    let panel = PanelView.formGenerator;

                    if(!panel)
                        PanelView.formGenerator = previewPanel(
                            context,
                            {
                                dirPath,
                                url: vscode.workspace.getConfiguration().get('openFormGenerator.src'), // 'http://localhost:3002/nuwa/demo'
                                title: '🔥 Low Code',
                                identity: 'formGenerator'
                            }
                        );
                    else panel.reveal();
                }
            )
                .then(
                    result => {
                        console.dir(result);
                    },
                    err => console.log(err)
                );
        } else {
            vscode.window.showInformationMessage(`无法获取文件夹路径`);
        }
    });
};