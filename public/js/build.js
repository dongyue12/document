const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const hljs = require('highlight.js');

const CONTENT_DIR = path.join(__dirname, '..', '..', 'content');
const PUBLIC_DIR = path.join(__dirname, '..', '..', 'public');
const DIST_DIR = path.join(__dirname, '..', '..', 'dist');
const DIST_CONTENT_DIR = path.join(DIST_DIR, 'content');

// 递归拷贝目录的函数
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// 配置 marked
marked.setOptions({
    highlight: function(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    },
    gfm: true,
    breaks: true
});

// 生成 HTML 的模板
function generateHtml(title, contentHtml, depth) {
    const rootPath = '../'.repeat(depth);
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
    </script>
</body>
</html>`;
}

// 递归获取文件树结构并转换 Markdown
function processDirectory(dir) {
    const result = [];
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            // 忽略隐藏文件、特殊文件
            if (file.startsWith('.') || file === 'node_modules') continue;

            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            const relativePath = path.relative(CONTENT_DIR, filePath).replace(/\\/g, '/');

            if (stat.isDirectory()) {
                const children = processDirectory(filePath);
                // 只有当不是 img 目录时，才加入到侧边栏导航树中
                if (file.toLowerCase() !== 'img') {
                    result.push({
                        name: file,
                        type: 'directory',
                        path: relativePath,
                        children: children
                    });
                }
            } else if (stat.isFile() && file.endsWith('.md')) {
                // 转换 markdown 为 html
                const markdownContent = fs.readFileSync(filePath, 'utf-8');
                const htmlContent = marked.parse(markdownContent);
                const title = file.replace(/\.md$/, '');
                
                // 计算相对路径深度，用于引入 css 和返回主页
                // relativePath 形如 "Web/HTML/1.md" -> 长度为 3。我们要回到 public 目录，还需要加上 content 目录的 1 层。
                const depth = relativePath.split('/').length;
                
                const finalHtml = generateHtml(title, htmlContent, depth);
                
                // 写入 dist/content 对应的目录
                const outFilePath = path.join(DIST_CONTENT_DIR, relativePath.replace(/\.md$/, '.html'));
                const outDir = path.dirname(outFilePath);
                if (!fs.existsSync(outDir)) {
                    fs.mkdirSync(outDir, { recursive: true });
                }
                fs.writeFileSync(outFilePath, finalHtml, 'utf-8');

                // 树节点中记录 HTML 路径，方便前端直接跳转
                result.push({
                    name: file,
                    type: 'file',
                    path: relativePath.replace(/\.md$/, '.html')
                });
            } else if (stat.isFile() && !file.endsWith('.md')) {
                // 如果是图片或其他非 markdown 文件，直接拷贝到 dist/content 对应的目录
                const outFilePath = path.join(DIST_CONTENT_DIR, relativePath);
                const outDir = path.dirname(outFilePath);
                if (!fs.existsSync(outDir)) {
                    fs.mkdirSync(outDir, { recursive: true });
                }
                fs.copyFileSync(filePath, outFilePath);
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

console.log('开始构建静态文件树并生成 HTML...');

// 每次构建前先清理并重建 dist 目录
if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// 将 public 目录下的基础静态资源 (index.html, css等) 拷贝到 dist
copyDir(PUBLIC_DIR, DIST_DIR);

// 将根目录下的 favicon.ico 拷贝到 dist
const ROOT_DIR = path.join(__dirname, '..', '..');
const faviconPath = path.join(ROOT_DIR, 'favicon.ico');
if (fs.existsSync(faviconPath)) {
    fs.copyFileSync(faviconPath, path.join(DIST_DIR, 'favicon.ico'));
}

// 确保 dist/content 目录存在
if (!fs.existsSync(DIST_CONTENT_DIR)) {
    fs.mkdirSync(DIST_CONTENT_DIR, { recursive: true });
}

const tree = processDirectory(CONTENT_DIR);

// 将文件树数据直接注入 public/index.html 中
const indexHtmlPath = path.join(PUBLIC_DIR, 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
indexHtml = indexHtml.replace(
    /const windowTreeData = \[.*\];/s,
    `const windowTreeData = ${JSON.stringify(tree, null, 4)};`
);

// 写入 dist/index.html
const distIndexHtmlPath = path.join(DIST_DIR, 'index.html');
fs.writeFileSync(distIndexHtmlPath, indexHtml, 'utf-8');

console.log(`构建完成！已生成静态 HTML 和文件树至: ${DIST_DIR}`);