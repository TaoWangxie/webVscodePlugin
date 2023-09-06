const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const open = require('open');

const DB_PATH = path.join(__dirname, './data/db.json');


/**
 * @param {*} context 上下文
 * @param {*} relativePath
 */
function getExtensionFileAbsolutePath(context, relativePath) {
    return path.join(context.extensionPath, relativePath);
}

/**
 * 从某个HTML文件读取能被Webview加载的HTML内容
 * @param {*} context 上下文
 * @param {*} templatePath 相对于插件根目录的html文件相对路径
 */
function getWebViewContent(context, templatePath) {
    const resourcePath = getExtensionFileAbsolutePath(context, templatePath);
    const dirPath = path.dirname(resourcePath);
    let html = fs.readFileSync(resourcePath, 'utf-8');
    // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
    html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
        return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
    });
    return html;
}

const methods = {
    test: function (message, vscode, dirPath) {
        console.dir(message.data);
        vscode.window.showInformationMessage(message.data);
    },
    openUrl: function (message, vscode, dirPath) {
        open(message.data.url);
    },
    setStorageItem: function (message, vscode, dirPath) {
        const { key, val } = message.data;
        const str = fs.readFileSync(DB_PATH).toString();
        let json = {};
        if (str) {
            json = JSON.parse(str);
        }
        json[key] = val;
        fs.writeFileSync(DB_PATH, JSON.stringify(json));
    },
};




// const PanelWebView
function previewPanel(context, { dirPath, url, title, identity } = { dirPath: null, url: null, title: null, identity: null }){
    if(!url) return;

    //vscode下面的蓝色文字标注模块
    let pClintBar = vscode.window.createStatusBarItem();
    pClintBar.text = `目标文件夹11：${ dirPath || '🎊' }`; 
    pClintBar.show();

    const panel = vscode.window.createWebviewPanel(
        identity || null,
        title || null,
        vscode.ViewColumn.One,
        {
            enableScripts: true, // 启用JS，默认禁用
            retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置,
            enableCommandUris: true
        }
    );
    panel.onDidChangeViewState(e => {
        console.dir(panel);
        if (panel.visible) {
            pClintBar.show();
        } else {
            pClintBar.hide();
            panel.webview.postMessage({
                cmd: 'getWebViewData',
                data: {}
            });
        }
    });
    panel.webview.html = getWebViewContent(context, 'src/view/index.html');
    panel.webview.postMessage({
        cmd: 'setSrc',
        data: {
            src: url,
            db: JSON.parse(fs.readFileSync(DB_PATH).toString() || '{}'),
            dirPath: dirPath || null
        }
    });
    panel.webview.onDidReceiveMessage(message => {
        console.dir(message);
        if (message.cmd && message.data) {
            let method = methods[ message.cmd ];
            if (method) method(message, vscode, dirPath);
        } else {
            vscode.window.showInformationMessage(`没有与消息对应的方法`);
        }
    }, undefined, context.subscriptions);
    panel.onDidDispose(() => {
        // 是一个 async
        console.dir('dispose');
        vscode.commands.executeCommand(
            'extension.operationGlobalVariable',
            ({ PanelView }) => delete PanelView[identity]
        )
            .then(
                result => {
                    console.dir(result);
                },
                err => console.log(err)
            );
        pClintBar.dispose();
    }, null, context.subscriptions);

    return panel;
}

module.exports = previewPanel;