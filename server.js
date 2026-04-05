const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
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
            } else if (stat.isFile() && file.endsWith('.md')) { // 只处理markdown文件
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
    
    // 排序：文件夹在前，文件在后，并且支持自然排序（如 1.md, 2.md, 10.md）
    return result.sort((a, b) => {
        if (a.type === b.type) {
            // README.md 排在最前面
            if (a.name.toLowerCase() === 'readme.md') return -1;
            if (b.name.toLowerCase() === 'readme.md') return 1;
            
            // 自然排序：正确处理数字前缀（1, 2, 10）
            return a.name.localeCompare(b.name, 'zh-CN', { numeric: true });
        }
        return a.type === 'directory' ? -1 : 1;
    });
}

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.md': 'text/markdown',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    let url = req.url;
    // 移除查询参数
    const queryIndex = url.indexOf('?');
    if (queryIndex !== -1) {
        url = url.substring(0, queryIndex);
    }

    // 处理 /api/tree 接口
    if (url === '/api/tree') {
        const tree = getFileTree(CONTENT_DIR);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(tree));
        return;
    }

    // 处理根路径
    if (url === '/') {
        url = '/index.html';
    }

    // 确定文件的真实路径
    let filePath;
    if (url.startsWith('/content/')) {
        // 请求content目录下的文件（如markdown文件或图片）
        filePath = path.join(__dirname, decodeURIComponent(url));
    } else {
        // 请求public目录下的静态文件（HTML, CSS, JS）
        filePath = path.join(PUBLIC_DIR, decodeURIComponent(url));
    }

    const extname = path.extname(filePath).toLowerCase();
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';

    // 尝试获取文件状态，以便设置缓存
    fs.stat(filePath, (err, stat) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end(`Server Error: ${err.code}`);
            }
            return;
        }

        // 协商缓存：检查 If-Modified-Since
        const lastModified = stat.mtime.toUTCString();
        const reqModDate = req.headers['if-modified-since'];

        if (reqModDate && reqModDate === lastModified) {
            // 文件未修改，返回 304
            res.writeHead(304);
            res.end();
            return;
        }

        // 设置缓存相关的 Header
        const headers = {
            'Content-Type': contentType,
            'Last-Modified': lastModified,
        };

        // 对图片等静态资源开启强缓存 (例如 1 天)
        if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ttc'].includes(extname)) {
            headers['Cache-Control'] = 'public, max-age=86400';
        } else {
            // 对 HTML, JS, Markdown 文件开启协商缓存，强制每次去服务端验证
            headers['Cache-Control'] = 'no-cache';
        }

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end(`Server Error: ${err.code}`);
            } else {
                res.writeHead(200, headers);
                res.end(content, 'utf-8');
            }
        });
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
