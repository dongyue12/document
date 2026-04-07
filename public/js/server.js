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
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.ttc': 'font/collection' // 添加了 ttc 字体类型
};

const server = http.createServer((req, res) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
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

    // 尝试读取路由表
    let routes = {};
    try {
        const routesPath = path.join(DIST_DIR, 'routes.json');
        if (fs.existsSync(routesPath)) {
            routes = JSON.parse(fs.readFileSync(routesPath, 'utf-8'));
        }
    } catch (e) {
        console.error('Failed to load routes.json:', e);
    }

    // 如果请求的是通过短链接访问的 HTML，将其映射到真实的 content 路径
    let targetUrl = url;
    // 需要多次 decode，防止浏览器传递类似 %25E7%25BC%2596 的二次编码导致匹配不上
    let decodedUrl = decodeURIComponent(url);
    try {
        decodedUrl = decodeURIComponent(decodedUrl);
    } catch(e) {}

    if (routes[decodedUrl]) {
        targetUrl = routes[decodedUrl];
    } else if (routes[url]) {
        targetUrl = routes[url];
    }

    // 所有请求都在 dist 目录下查找
    let filePath = path.join(DIST_DIR, decodeURIComponent(targetUrl));

    const extname = path.extname(filePath).toLowerCase();
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';
    const isText = ['.html', '.css', '.js', '.json', '.svg'].includes(extname);
    if (isText && !contentType.includes('charset=')) {
        contentType = `${contentType}; charset=utf-8`;
    }

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
        if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ttc', '.ico'].includes(extname)) {
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
                if (isText) {
                    res.end(content, 'utf-8');
                } else {
                    res.end(content);
                }
            }
        });
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
