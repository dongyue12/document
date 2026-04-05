const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, 'content');
const PUBLIC_DIR = path.join(__dirname, 'public');

// 递归获取文件树结构
function getFileTree(dir) {
    const result = [];
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            // 忽略隐藏文件、特殊文件或 img 目录
            if (file.startsWith('.') || file === 'node_modules' || file.toLowerCase() === 'img') continue;

            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                result.push({
                    name: file,
                    type: 'directory',
                    path: path.relative(CONTENT_DIR, filePath).replace(/\\/g, '/'),
                    children: getFileTree(filePath)
                });
            } else if (stat.isFile() && file.endsWith('.md')) {
                result.push({
                    name: file,
                    type: 'file',
                    path: path.relative(CONTENT_DIR, filePath).replace(/\\/g, '/')
                });
            }
        }
    } catch (e) {
        console.error('Error reading directory:', e);
    }
    
    // 排序：文件夹在前，文件在后，并且支持自然排序
    return result.sort((a, b) => {
        if (a.type === b.type) {
            if (a.name.toLowerCase() === 'readme.md') return -1;
            if (b.name.toLowerCase() === 'readme.md') return 1;
            return a.name.localeCompare(b.name, 'zh-CN', { numeric: true });
        }
        return a.type === 'directory' ? -1 : 1;
    });
}

console.log('开始构建静态文件树...');
const tree = getFileTree(CONTENT_DIR);

// 将文件树数据写入 public 目录下的 tree.json 中
const outputFilePath = path.join(PUBLIC_DIR, 'tree.json');
fs.writeFileSync(outputFilePath, JSON.stringify(tree, null, 2), 'utf-8');

console.log(`构建完成！已生成文件树至: ${outputFilePath}`);
