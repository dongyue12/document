const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DIST_DIR = path.join(__dirname, '..', '..', 'dist');

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
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

    // 处理根路径
    if (url === '/') {
        url = '/index.html';
    }

    // 所有请求都在 dist 目录下查找
    let filePath = path.join(DIST_DIR, decodeURIComponent(url));

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
