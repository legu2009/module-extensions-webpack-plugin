

const path = require('path');
const fs = require('fs');

class ModuleExtensionsPlugin {
    constructor(opt) {
        this.opt = opt;
    }
    apply(compiler) {
        const extensions = this.opt.extensions;
        const include = this.opt.include || (() => true);
        let checkFileSame = (path1, path2) => {
            if (path.dirname(path1) !== path.dirname(path2)) return false;
            const fileName1 = path.basename(path1);
            const fileName2 = path.basename(path2);
            let parts1 = fileName1.split('.');
            let parts2 = fileName2.split('.');
            let diffLength = parts1.length - parts2.length;
            if (diffLength > 1 || diffLength < -1) return false;
            if (diffLength === 1) {
                parts2.splice(parts2.length - 1, 0, extensions[0]);
            } else if (diffLength === -1) {
                parts1.splice(parts1.length - 1, 0, extensions[0]);
            }
            let length = parts1.length;
            for (let i = 0; i < length; i++) {
                if (i === length - 2) {
                    if (!(extensions.includes(parts1[i]) && extensions.includes(parts2[i]))) return false;
                }
                if (parts1[i] !== parts2[i]) {
                    return false;
                }
            }
            return true;
        }
  
        let getResult = (importFilePath, filePath, result) => {
            const fileName = path.basename(importFilePath);
            let list = fileName.split('.');
            let ext = list[list.length - 2];
            if (!ext || extensions.includes(ext)) return false; //引用路径已扩展
            if (checkFileSame(importFilePath, filePath)) return false; //引用路径和当前路径相同
            list.splice(list.length - 1, 0, '');
            let newFilePath;
            for (let i = 0; i < extensions.length; i++) {
                let ext = extensions[i];
                list[list.length - 2] = ext;
                newFilePath = path.join(importFilePath, '../' + list.join('.'));
                if (newFilePath === filePath) continue;
                if (fs.existsSync(newFilePath)) {
                    const requestPath = result.createData.request;
                    let fileName = path.basename(requestPath);
                    return {
                        resource: newFilePath,
                        request: path.join(requestPath, '../' + path.basename(fileName, path.extname(fileName)) + '.' + ext + path.extname(fileName))
                    }
                }
            }
            return false;
        };

        compiler.hooks.normalModuleFactory.tap(
            "ModuleExtensionsPlugin",
            nmf => {
                nmf.hooks.afterResolve.tap("ModuleExtensionsPlugin", result => {
                    if (extensions?.length === 0) return;
                    const createData = result.createData;
                    if (!result.contextInfo?.issuer) return;
                    let importFilePath = createData.resource;
                    let filePath =  result.contextInfo.issuer;
                    if (include(importFilePath, filePath) !== true) return;
                    let ret = getResult(importFilePath, filePath, result);
                    if (!ret) return;
                    Object.assign(result.createData, ret);
                });
            }
        );
    }
}

module.exports = ModuleExtensionsPlugin;