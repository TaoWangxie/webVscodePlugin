const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */

 /**
  * 全局变量
  */
const GlobalVariable = {
    PanelView: {}
};

exports.activate = function(context) {
    console.log('恭喜，您的扩展“vscode-plugin-demo”已被激活！');
    require('./src/openFormGenerator')(context);
    vscode.commands.registerCommand(
        "extension.operationGlobalVariable", 
        function(fn = () => {}) { return fn && fn(this) }, 
        GlobalVariable
    );
};

/**
 * 插件被释放时触发
 */
exports.deactivate = function() {
    console.log('您的扩展“vscode-plugin-demo”已被释放！');
};
