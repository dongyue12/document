# 个人资料库 (Personal Knowledge Base)

这是一个基于 Node.js 构建的轻量级 Markdown 文档站点。主要用于管理和展示个人的学习笔记与资料（目前包含 Web 前端基础、Git 命令等）。

项目没有引入复杂的第三方框架，而是利用原生的 Node.js 脚本实现了目录结构的自动解析、本地 HTTP 预览服务器，并通过 GitHub Actions 实现了自动化部署。

## 目录结构

```text
.
├── .github/workflows/   # CI/CD 配置文件目录 (deploy.yml)
├── content/             # 核心内容目录：存放所有 Markdown 文档及图片
│   ├── Web/             # 分类文件夹 (例如 HTML, CSS)
│   └── git/             # 分类文件夹 (Git 笔记)
├── public/              # 静态网页资源目录
│   ├── css/             # 样式文件
│   ├── fonts/           # 字体文件
│   ├── js/              # 构建和服务器脚本
│   │   ├── build.js     # 构建脚本，用于将 Markdown 转换为静态 HTML 站点
│   │   └── server.js    # 本地静态文件服务器 (代理 dist 目录)
│   └── index.html       # 网站前端主页面
```

## 核心特性

- **自动化文档树**：能够递归遍历 `content` 目录，自动忽略隐藏文件及特定文件夹，生成结构化的导航数据并注入到首页。
- **智能排序**：支持文件名自然排序（正确处理 `1.md`, `2.md`, `10.md` 的顺序），并默认将 `README.md` 置顶展示。
- **静态站点生成 (SSG)**：通过 `build.js` 将 Markdown 转换为纯静态的 HTML 页面，配合代码高亮和样式，提供极速的访问体验。
- **内置本地服务器**：`server.js` 提供了一个轻量的 HTTP 服务，用于在本地预览 `dist` 目录下的静态构建产物，并配置了基础的缓存策略。
- **自动化部署 (CI/CD)**：代码推送到 `main` 或 `master` 分支后，GitHub Actions 会自动打包并发布至 GitHub Pages。

## 本地运行与开发

项目使用了 `marked` 和 `highlight.js` 进行静态页面的构建。

### 1. 安装依赖

在首次运行前，请先安装必要的构建依赖：

```bash
npm install
```

### 2. 启动本地服务 (推荐)

在项目根目录下执行以下命令，会自动构建并启动本地预览服务器：

```bash
npm run build && npm server
```

随后在浏览器中访问：<http://localhost:3000>

### 3. 手动构建静态目录树

如果你只需要生成最新的静态 HTML 文件，可以运行：

```bash
npm run build
```

## 内容管理规范

1. **添加文章**：直接在 `content` 目录下新建文件夹或 `.md` 文件即可，页面会自动读取并生成侧边栏。
2. **文件排序**：
   - `README.md` 永远排在同级最前面。
   - 其他文件推荐使用数字前缀（如 `1-网页基础信息.md`、`10-表格标签.md`），系统会自动按照数字大小自然排序。
3. **资源引用**：Markdown 文件中使用的图片请就近放在对应的 `img/` 目录下，并使用相对路径引用。

## 部署上线

本项目已配置 GitHub Pages 自动部署。当你完成文档更新并推送到远程仓库的 `main` 或 `master` 分支时，GitHub Actions 将会自动执行构建，把文档更新发布到线上。
