const { build } = require('./build');
const { spawn } = require('child_process');
const chokidar = require('chokidar');
const { WebSocketServer } = require('ws');
const path = require('path');

async function startDev() {
    console.log('首次全量构建中...');
    await build({ incremental: false, isDev: true });

    // 启动 HTTP 服务器
    const serverProcess = spawn('node', [path.join(__dirname, 'server.js')], {
        stdio: 'inherit'
    });

    // 启动 WebSocket 服务器用于热重载
    const wss = new WebSocketServer({ port: 3001 });
    console.log('WebSocket 热重载服务器运行在 ws://localhost:3001');

    const broadcastReload = () => {
        wss.clients.forEach(client => {
            if (client.readyState === 1) { // WebSocket.OPEN
                client.send('reload');
            }
        });
    };

    let buildTimeout = null;
    
    // 监听 content 和 public 目录的变化
    const watcher = chokidar.watch([
        path.join(__dirname, '../../content'),
        path.join(__dirname, '../../public')
    ], {
        ignored: /(^|[\/\\])\../, // 忽略隐藏文件
        persistent: true,
        ignoreInitial: true
    });

    watcher.on('all', (event, filePath) => {
        // 如果改变的是 dist 或者当前 dev 脚本自身，则忽略
        if (filePath.includes('dist') || filePath.endsWith('dev.js')) return;
        
        // 防抖处理，避免频繁触发构建
        if (buildTimeout) clearTimeout(buildTimeout);
        buildTimeout = setTimeout(async () => {
            console.log(`\n检测到文件变化: ${filePath} (${event})`);
            try {
                // 触发增量构建
                await build({ incremental: true, isDev: true });
                // 通知所有连接的浏览器刷新页面
                broadcastReload();
            } catch (err) {
                console.error('构建失败:', err);
            }
        }, 100); // 100ms 防抖
    });

    // 监听退出信号，清理子进程
    process.on('SIGINT', () => {
        serverProcess.kill();
        process.exit();
    });
}

startDev().catch(console.error);