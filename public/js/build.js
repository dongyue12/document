const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const { marked } = require('marked');
const hljs = require('highlight.js');
const yaml = require('js-yaml');

const CONTENT_DIR = path.join(__dirname, '..', '..', 'content');
const PUBLIC_DIR = path.join(__dirname, '..', '..', 'public');
const DIST_DIR = path.join(__dirname, '..', '..', 'dist');
const DIST_CONTENT_DIR = path.join(DIST_DIR, 'content');
const FRIEND_CONFIG_PATH = path.join(CONTENT_DIR, 'friend', 'friend.yml');
const FRIEND_PAGE_RELATIVE_PATH = 'friend/我的好友.html';

// 缓存文件最后修改时间，用于增量构建
const mtimeCache = new Map();

async function copyDirAsync(src, dest) {
    if (!fs.existsSync(dest)) {
        await fsp.mkdir(dest, { recursive: true });
    }
    const entries = await fsp.readdir(src, { withFileTypes: true });
    await Promise.all(entries.map(async entry => {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            await copyDirAsync(srcPath, destPath);
        } else {
            await fsp.copyFile(srcPath, destPath);
        }
    }));
}

marked.setOptions({
    highlight: function(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    },
    gfm: true,
    breaks: true
});

function generateHtml(title, contentHtml, depth, isDev) {
    const rootPath = '../'.repeat(depth);
    let devScript = '';
    if (isDev) {
        devScript = `
    <script>
        const ws = new WebSocket('ws://localhost:3001');
        ws.onmessage = (e) => {
            if (e.data === 'reload') {
                window.location.reload();
            }
        };
    </script>`;
    }
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="${rootPath}css/github.min.css">
    <link rel="stylesheet" href="${rootPath}css/preview.css">
    <link rel="shortcut icon" href="${rootPath}favicon.ico?v=2" type="image/x-icon">
</head>
<body>
    <div class="container">
        <div class="nav-header">
            <a href="${rootPath}index.html" class="back-btn">返回目录</a>
            <span class="title" id="doc-title">${title}</span>
        </div>
        <div id="content" class="markdown-body">
            ${contentHtml}
        </div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const preElements = document.querySelectorAll('pre');
            preElements.forEach(pre => {
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-btn';
                copyBtn.textContent = '复制';
                copyBtn.addEventListener('click', async () => {
                    const codeBlock = pre.querySelector('code');
                    const textToCopy = codeBlock ? codeBlock.innerText : pre.innerText;
                    try {
                        await navigator.clipboard.writeText(textToCopy);
                        copyBtn.textContent = '已复制!';
                        copyBtn.classList.add('copied');
                        setTimeout(() => {
                            copyBtn.textContent = '复制';
                            copyBtn.classList.remove('copied');
                        }, 2000);
                    } catch (err) {
                        console.error('复制失败:', err);
                        copyBtn.textContent = '失败';
                    }
                });
                pre.appendChild(copyBtn);
            });
            
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                img.setAttribute('loading', 'lazy');
            });
        });
    </script>${devScript}
</body>
</html>`;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function safeHttpUrl(value) {
    if (!value) return null;
    try {
        const u = new URL(String(value));
        if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
        return u.toString();
    } catch {
        return null;
    }
}

function normalizeFriendConfig(raw) {
    if (Array.isArray(raw)) {
        return { title: '友链', links: raw };
    }
    if (raw && typeof raw === 'object') {
        const title = typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : '友链';
        const links = Array.isArray(raw.links) ? raw.links : [];
        return { title, links };
    }
    return { title: '友链', links: [] };
}

function renderFriendLinksHtml(config) {
    const title = typeof config.title === 'string' && config.title.trim() ? config.title.trim() : '我的好友';
    const cards = (config.links || [])
        .filter(item => item && typeof item === 'object')
        .map(item => {
            const name = typeof item.title === 'string' ? item.title.trim() : (typeof item.name === 'string' ? item.name.trim() : '');
            const url = safeHttpUrl(item.url);
            if (!name || !url) return '';

            const desc = typeof item.desc === 'string' ? item.desc.trim() : '';
            const avatar = safeHttpUrl(item.img || item.avatar);

            const avatarHtml = avatar
                ? `<img class="friend-avatar" src="${escapeHtml(avatar)}" alt="${escapeHtml(name)}" loading="lazy" />`
                : `<div class="friend-avatar friend-avatar-fallback"></div>`;

            const descHtml = desc ? `<div class="friend-desc">${escapeHtml(desc)}</div>` : '';

            return `
                <a class="friend-card" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
                    ${avatarHtml}
                    <div class="friend-meta">
                        <div class="friend-name">${escapeHtml(name)}</div>
                        ${descHtml}
                    </div>
                </a>
            `;
        })
        .filter(Boolean)
        .join('');

    const contentHtml = `
        <style>
            .friend-list { display: flex; flex-wrap: wrap; gap: 16px; }
            .friend-card { display: flex; gap: 12px; padding: 14px; border: 1px solid #eaecef; border-radius: 10px; text-decoration: none; color: inherit; background: #fff; transition: box-shadow .15s ease, transform .15s ease, border-color .15s ease; flex: 1 0 calc(50% - 8px); min-width: 280px; }
            .friend-card:hover { border-color: rgba(66,185,131,.55); box-shadow: 0 8px 24px rgba(0,0,0,.06); transform: translateY(-1px); }
            .friend-avatar { width: 44px; height: 44px; border-radius: 10px; flex: 0 0 auto; object-fit: cover; background: #f3f4f5; }
            .friend-avatar-fallback { border: 1px solid #eaecef; }
            .friend-meta { min-width: 0; }
            .friend-name { font-weight: 600; font-size: 16px; line-height: 1.2; margin-top: 2px; }
            .friend-desc { margin-top: 6px; font-size: 13px; line-height: 1.35; color: #57606a; }
        </style>
        <h1>${escapeHtml(title)}</h1>
        ${cards ? `<div class="friend-list">${cards}</div>` : '<p>暂无好友链接。</p>'}
    `;

    return { pageTitle: title, contentHtml };
}

async function buildFriendLinksPage(routes, incremental, isDev) {
    if (!fs.existsSync(FRIEND_CONFIG_PATH)) {
        return null;
    }

    const stat = await fsp.stat(FRIEND_CONFIG_PATH);
    const lastMtime = mtimeCache.get(FRIEND_CONFIG_PATH);
    const currentMtime = stat.mtimeMs;
    const outFilePath = path.join(DIST_DIR, FRIEND_PAGE_RELATIVE_PATH);

    if (incremental && lastMtime === currentMtime && fs.existsSync(outFilePath)) {
        return {
            name: '我的好友.md',
            type: 'file',
            path: FRIEND_PAGE_RELATIVE_PATH
        };
    }
    mtimeCache.set(FRIEND_CONFIG_PATH, currentMtime);

    const rawText = await fsp.readFile(FRIEND_CONFIG_PATH, 'utf-8');
    const rawConfig = yaml.load(rawText);
    const config = normalizeFriendConfig(rawConfig);
    const rendered = renderFriendLinksHtml(config);
    const finalHtml = generateHtml(rendered.pageTitle, rendered.contentHtml, 1, isDev);

    await fsp.mkdir(path.dirname(outFilePath), { recursive: true });
    await fsp.writeFile(outFilePath, finalHtml, 'utf-8');

    const shortLink = `/${path.basename(FRIEND_PAGE_RELATIVE_PATH)}`;
    routes[shortLink] = `/${FRIEND_PAGE_RELATIVE_PATH}`;

    return {
        name: '我的好友.md',
        type: 'file',
        path: FRIEND_PAGE_RELATIVE_PATH
    };
}

async function processDirectoryAsync(dir, routes, incremental, isDev) {
    const result = [];
    try {
        const files = await fsp.readdir(dir);
        
        const tasks = files.map(async file => {
            if (file.startsWith('.') || file === 'node_modules') return null;

            const filePath = path.join(dir, file);
            const stat = await fsp.stat(filePath);
            const relativePath = path.relative(CONTENT_DIR, filePath).replace(/\\/g, '/');

            if (stat.isDirectory()) {
                const children = await processDirectoryAsync(filePath, routes, incremental, isDev);
                if (relativePath === 'friend') {
                    const friendLinksPageNode = await buildFriendLinksPage(routes, incremental, isDev);
                    let friendChildren = children;
                    if (friendLinksPageNode) {
                        friendChildren = [friendLinksPageNode, ...children];
                    }
                    const formatIndex = friendChildren.findIndex(n => n && n.type === 'file' && n.name === '我的友链格式.md');
                    if (formatIndex > 0) {
                        const [formatNode] = friendChildren.splice(formatIndex, 1);
                        friendChildren.unshift(formatNode);
                    }
                    return {
                        name: file,
                        type: 'directory',
                        path: relativePath,
                        children: friendChildren
                    };
                }
                if (file.toLowerCase() !== 'img') {
                    return {
                        name: file,
                        type: 'directory',
                        path: relativePath,
                        children: children
                    };
                }
                return null;
            } else if (stat.isFile() && file.endsWith('.md')) {
                const outFileName = file.replace(/\.md$/, '.html');
                const outContentFilePath = path.join(DIST_CONTENT_DIR, relativePath.replace(/\.md$/, '.html'));
                
                routes[`/${outFileName}`] = `/content/${relativePath.replace(/\.md$/, '.html')}`;

                const treeNode = {
                    name: file,
                    type: 'file',
                    path: outFileName
                };

                const lastMtime = mtimeCache.get(filePath);
                const currentMtime = stat.mtimeMs;

                // 增量构建逻辑，判断 dist 根目录下的产物是否存在
                const outFilePathCheck = path.join(DIST_DIR, outFileName);
                if (incremental && lastMtime === currentMtime && fs.existsSync(outFilePathCheck)) {
                    return treeNode;
                }
                mtimeCache.set(filePath, currentMtime);

                const markdownContent = await fsp.readFile(filePath, 'utf-8');
                const renderer = new marked.Renderer();
                
                const originalImage = renderer.image.bind(renderer);
                renderer.image = (href, title, text) => {
                    let newHref = href;
                    if (href && !href.startsWith('http') && !href.startsWith('/')) {
                        const dirPath = path.dirname(relativePath).replace(/\\/g, '/');
                        if (dirPath === '.') {
                            newHref = `/content/${href}`;
                        } else {
                            newHref = `/content/${dirPath}/${href}`;
                        }
                    }
                    return originalImage(newHref, title, text);
                };
                
                const originalLink = renderer.link.bind(renderer);
                renderer.link = (href, title, text) => {
                    let newHref = href;
                    if (href && !href.startsWith('http') && !href.startsWith('/')) {
                        const [urlPath, hash] = href.split('#');
                        if (urlPath.endsWith('.md')) {
                            const newUrlPath = path.basename(urlPath).replace(/\.md$/, '.html');
                            // 保证链接的 URL 编码，避免中文等特殊字符引起的问题
                            const encodedUrlPath = encodeURIComponent(newUrlPath);
                            newHref = hash ? `${encodedUrlPath}#${hash}` : encodedUrlPath;
                        }
                    }
                    return originalLink(newHref, title, text);
                };

                const htmlContent = marked.parse(markdownContent, { renderer });
                const title = file.replace(/\.md$/, '');
                // 深度用于引入 CSS 和返回首页，因为 HTML 生成在 dist 根目录，所以深度固定为 0
                const depth = 0;
                const finalHtml = generateHtml(title, htmlContent, depth, isDev);
                
                // 将文件写入 dist 根目录
                const outFilePath = path.join(DIST_DIR, outFileName);
                await fsp.writeFile(outFilePath, finalHtml, 'utf-8');
                return treeNode;
            } else if (stat.isFile() && !file.endsWith('.md')) {
                if (file.endsWith('.yml') || file.endsWith('.yaml')) {
                    return null;
                }
                const outFilePath = path.join(DIST_CONTENT_DIR, relativePath);
                
                const lastMtime = mtimeCache.get(filePath);
                const currentMtime = stat.mtimeMs;
                
                if (incremental && lastMtime === currentMtime && fs.existsSync(outFilePath)) {
                    return null;
                }
                mtimeCache.set(filePath, currentMtime);

                const outDir = path.dirname(outFilePath);
                if (!fs.existsSync(outDir)) {
                    await fsp.mkdir(outDir, { recursive: true });
                }
                await fsp.copyFile(filePath, outFilePath);
                return null;
            }
        });
        
        const results = await Promise.all(tasks);
        for (const item of results) {
            if (item) result.push(item);
        }
        
    } catch (e) {
        console.error('Error reading directory:', e);
    }
    
    return result.sort((a, b) => {
        if (a.type === b.type) {
            if (a.name.toLowerCase() === 'readme.md') return -1;
            if (b.name.toLowerCase() === 'readme.md') return 1;
            return a.name.localeCompare(b.name, 'zh-CN', { numeric: true });
        }
        return a.type === 'directory' ? -1 : 1;
    });
}

async function build(options = {}) {
    const incremental = options.incremental || false;
    const isDev = options.isDev || false;

    console.log(incremental ? '开始增量并行构建...' : '开始全量并行构建...');

    if (!incremental) {
        if (fs.existsSync(DIST_DIR)) {
            fs.rmSync(DIST_DIR, { recursive: true, force: true });
        }
        fs.mkdirSync(DIST_DIR, { recursive: true });
        mtimeCache.clear();
    }

    // 将 public 目录下的基础静态资源拷贝到 dist
    await copyDirAsync(PUBLIC_DIR, DIST_DIR);

    const ROOT_DIR = path.join(__dirname, '..', '..');
    const faviconPath = path.join(ROOT_DIR, 'favicon.ico');
    if (fs.existsSync(faviconPath)) {
        await fsp.copyFile(faviconPath, path.join(DIST_DIR, 'favicon.ico'));
    }

    if (!fs.existsSync(DIST_CONTENT_DIR)) {
        fs.mkdirSync(DIST_CONTENT_DIR, { recursive: true });
    }

    const routesPath = path.join(DIST_DIR, 'routes.json');
    let routes = {};
    if (incremental && fs.existsSync(routesPath)) {
        try {
            routes = JSON.parse(await fsp.readFile(routesPath, 'utf-8'));
        } catch (e) {
            routes = {};
        }
    }

    const tree = await processDirectoryAsync(CONTENT_DIR, routes, incremental, isDev);

    await fsp.writeFile(path.join(DIST_DIR, 'routes.json'), JSON.stringify(routes, null, 2), 'utf-8');

    const indexHtmlPath = path.join(PUBLIC_DIR, 'index.html');
    let indexHtml = await fsp.readFile(indexHtmlPath, 'utf-8');
    indexHtml = indexHtml.replace(
        /const windowTreeData = \[[\s\S]*?\];/,
        `const windowTreeData = ${JSON.stringify(tree, null, 4)};`
    );

    if (isDev) {
        indexHtml = indexHtml.replace(
            '</body>',
            `    <script>
        const ws = new WebSocket('ws://localhost:3001');
        ws.onmessage = (e) => {
            if (e.data === 'reload') {
                window.location.reload();
            }
        };
    </script>\n</body>`
        );
    }

    const distIndexHtmlPath = path.join(DIST_DIR, 'index.html');
    await fsp.writeFile(distIndexHtmlPath, indexHtml, 'utf-8');

    console.log(`构建完成！已生成静态 HTML 和文件树至: ${DIST_DIR}`);
}

if (require.main === module) {
    build().catch(console.error);
}

module.exports = { build };
